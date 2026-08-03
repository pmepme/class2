const DEFAULT_ENDPOINT = 'https://script.google.com/macros/s/AKfycbxjIv35uqVY0UA3WXXmXciobj9zXw8fcdg-qDtWml0rCH8xOILVU8b6JrzQgvm5SzG5fQ/exec';
const endpoint = import.meta.env.VITE_APPS_SCRIPT_ADMIN_AUTH_URL || DEFAULT_ENDPOINT;
const apiSecret = import.meta.env.VITE_APPS_SCRIPT_API_SECRET;

function clean(value) {
  return String(value || '').trim();
}

function isGoogleLoginPage(text) {
  return /ServiceLogin|AccountChooser|<title>Sign in - Google Accounts/i.test(text);
}

function parsePayload(text) {
  try {
    return JSON.parse(text);
  } catch {
    return text.trim().toLowerCase();
  }
}

function getNested(payload, key) {
  if (!payload || typeof payload !== 'object') return undefined;
  return payload[key] ?? payload.user?.[key] ?? payload.data?.[key];
}

async function fetchWithTimeout(resource, options) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);
  try {
    return await fetch(resource, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function normalizeResponse(text, input) {
  if (isGoogleLoginPage(text)) {
    throw new Error('Apps Script가 한양대 Google 계정 로그인을 요구합니다. 인증 배포 설정을 확인해 주세요.');
  }

  const payload = parsePayload(text);
  const rawStatus = typeof payload === 'string' ? payload : String(payload?.status || payload?.result || '').toLowerCase();
  const approved = typeof payload === 'boolean'
    ? payload
    : typeof payload === 'string'
      ? ['true', 'approved', 'authorized', 'valid'].includes(payload)
      : payload?.approved === true
        || payload?.authorized === true
        || payload?.isAdmin === true
        || payload?.valid === true
        || ['approved', 'authorized'].includes(rawStatus)
        || (payload?.success === true && String(payload?.role || '').toLowerCase() === 'admin');
  const isHealthResponse = typeof payload === 'object' && payload?.service === 'student-verification-api' && payload?.status === 'ok';

  return {
    approved,
    userId: getNested(payload, 'userId') || getNested(payload, 'id') || `${input.action === 'verify_admin' ? 'admin' : 'user'}-${input.identifier}`,
    displayName: getNested(payload, 'displayName') || getNested(payload, 'name') || input.name,
    message: getNested(payload, 'message') || getNested(payload, 'error') || (isHealthResponse ? '인증 API 상태만 확인되었습니다. 이름·학번 승인 응답이 필요합니다.' : undefined),
  };
}

async function readResponse(response, input) {
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`관리자 인증 서버 오류 (${response.status})`);
  }
  return normalizeResponse(text, input);
}

async function verifyAccess({ name, identifier, action }) {
  const input = { name: clean(name), identifier: clean(identifier), action };
  if (!input.name || !input.identifier) return { approved: false, message: '이름과 학번/사번을 모두 입력해 주세요.' };
  if (!apiSecret) throw new Error('인증 설정이 없습니다. VITE_APPS_SCRIPT_API_SECRET을 확인해 주세요.');

  // Apps Script의 parseRequestBody_는 JSON 본문과 apiKey/studentOrEmployeeNo 필드를 요구한다.
  // text/plain은 브라우저의 불필요한 CORS preflight를 피하면서 JSON 본문을 그대로 전달한다.
  const body = JSON.stringify({
    action: input.action,
    name: input.name,
    studentOrEmployeeNo: input.identifier,
    apiKey: apiSecret,
  });

  try {
    const response = await fetchWithTimeout(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=UTF-8', Accept: 'application/json' },
      body,
    });
    if (response.status === 405) throw new Error('Apps Script의 doPost(e)가 배포되지 않았습니다. 새 버전으로 재배포해 주세요.');
    return readResponse(response, input);
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw new Error('인증 서버 응답이 지연되고 있습니다. 잠시 후 다시 시도해 주세요.');
    }
    if (error instanceof TypeError) {
      throw new Error('인증 서버에 연결할 수 없습니다. Apps Script 배포 권한과 CORS 설정을 확인해 주세요.');
    }
    throw error;
  }
}

export function verifyStudentAccess(input) {
  return verifyAccess({ ...input, action: 'verify_student' });
}

export function verifyAdminAccess(input) {
  return verifyAccess({ ...input, action: 'verify_admin' });
}

export function isAdminSession(session) {
  return session?.role === 'admin'
    && session?.authProvider === 'apps-script'
    && Number(session?.expiresAt) > Date.now();
}
