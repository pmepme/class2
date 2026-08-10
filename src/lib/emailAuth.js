export const HANYANG_DOMAIN = 'hanyang.ac.kr';
export const ADMIN_EMAIL = 'belief@hanyang.ac.kr';
export const OTP_LENGTH = 8;

export function normalizeHanyangEmail(value) {
  return String(value || '').trim().toLowerCase();
}

export function isHanyangEmail(value) {
  const email = normalizeHanyangEmail(value);
  const atIndex = email.lastIndexOf('@');
  return atIndex > 0 && email.slice(atIndex + 1) === HANYANG_DOMAIN;
}

export function isAdminEmail(value) {
  return normalizeHanyangEmail(value) === ADMIN_EMAIL;
}

async function postAuth(path, payload = {}) {
  const response = await fetch(path, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(payload),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || result.error) {
    throw new Error(result.message || '인증 요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.');
  }
  return result;
}

export function requestEmailOtp({ email, purpose = 'student' }) {
  const normalizedEmail = normalizeHanyangEmail(email);
  if (!isHanyangEmail(normalizedEmail)) {
    return Promise.reject(new Error('한양대학교 이메일(@hanyang.ac.kr)만 사용할 수 있습니다.'));
  }
  if (purpose === 'admin' && !isAdminEmail(normalizedEmail)) {
    return Promise.reject(new Error(`관리자 인증은 ${ADMIN_EMAIL} 계정만 사용할 수 있습니다.`));
  }
  return postAuth('/api/auth/request-otp', { email: normalizedEmail, purpose });
}

export function verifyEmailOtp({ email, token, purpose = 'student' }) {
  return postAuth('/api/auth/verify-otp', {
    email: normalizeHanyangEmail(email),
    token: String(token || '').replace(/\D/g, '').slice(0, OTP_LENGTH),
    purpose,
  });
}

export async function getAuthSession() {
  const response = await fetch('/api/auth/session', { credentials: 'include', headers: { Accept: 'application/json' } });
  if (!response.ok) return null;
  const result = await response.json().catch(() => ({}));
  return result.authenticated ? result.user : null;
}

export async function signOut() {
  const response = await fetch('/api/auth/logout', { method: 'POST', credentials: 'include', headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error('로그아웃하지 못했습니다. 잠시 후 다시 시도해 주세요.');
}

export function isAdminSession(session) {
  return session?.role === 'admin' && isAdminEmail(session.email);
}
