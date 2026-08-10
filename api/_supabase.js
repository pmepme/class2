import { createServerClient } from '@supabase/ssr';

export const HANYANG_DOMAIN = 'hanyang.ac.kr';
export const ADMIN_EMAIL = 'belief@hanyang.ac.kr';
export const OTP_LENGTH = 8;

export function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

export function isHanyangEmail(value) {
  const email = normalizeEmail(value);
  const atIndex = email.lastIndexOf('@');
  return atIndex > 0 && email.slice(atIndex + 1) === HANYANG_DOMAIN;
}

export function isAdminEmail(value) {
  return normalizeEmail(value) === ADMIN_EMAIL;
}

export function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error('SUPABASE_CONFIG_MISSING');
  return { url, key };
}

function parseCookies(header = '') {
  return header.split(';').reduce((result, part) => {
    const separator = part.indexOf('=');
    if (separator < 0) return result;
    const name = part.slice(0, separator).trim();
    const value = part.slice(separator + 1).trim();
    if (name) result[name] = decodeURIComponent(value);
    return result;
  }, {});
}

function serializeCookie(name, value, options = {}) {
  const parts = [`${name}=${encodeURIComponent(value)}`];
  if (options.maxAge !== undefined) parts.push(`Max-Age=${Math.max(0, Number(options.maxAge) || 0)}`);
  if (options.domain) parts.push(`Domain=${options.domain}`);
  parts.push(`Path=${options.path || '/'}`);
  if (options.expires) parts.push(`Expires=${new Date(options.expires).toUTCString()}`);
  if (options.httpOnly) parts.push('HttpOnly');
  if (options.secure ?? (process.env.NODE_ENV === 'production' || process.env.VERCEL === '1')) parts.push('Secure');
  if (options.sameSite) parts.push(`SameSite=${String(options.sameSite).replace(/^./, (letter) => letter.toUpperCase())}`);
  return parts.join('; ');
}

export function createSupabaseServerClient(req, res) {
  const { url, key } = getSupabaseConfig();
  const requestCookies = parseCookies(req.headers.cookie || '');
  const responseCookies = new Map();
  const existingCookies = res.getHeader('Set-Cookie');
  if (Array.isArray(existingCookies)) {
    existingCookies.forEach((cookie) => responseCookies.set(cookie.split('=')[0], cookie));
  }
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return Object.entries(requestCookies).map(([name, value]) => ({ name, value }));
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          responseCookies.set(name, serializeCookie(name, value, {
            ...options,
            httpOnly: true,
            path: options?.path || '/',
            sameSite: options?.sameSite || 'lax',
          }));
        });
        res.setHeader('Set-Cookie', [...responseCookies.values()]);
      },
    },
  });
  return supabase;
}

export function sendJson(res, status, payload) {
  res.status(status).json(payload);
}

export function rejectMethod(req, res, method = 'POST') {
  if (req.method === method) return false;
  res.setHeader('Allow', method);
  sendJson(res, 405, { error: 'method_not_allowed', message: '지원하지 않는 요청 방식입니다.' });
  return true;
}

export async function getSafeUser(supabase) {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user?.email) return null;
  const authUser = data.user;
  const email = normalizeEmail(authUser.email);
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, email, display_name, role, active, onboarding_completed')
    .eq('id', authUser.id)
    .maybeSingle();
  if (profileError && profileError.code !== 'PGRST116') throw profileError;
  if (profile?.active === false) return null;
  // 관리자 권한의 기준은 클라이언트 입력이 아니라 인증된 이메일 주소 하나입니다.
  const role = isAdminEmail(email) ? 'admin' : 'student';
  return {
    userId: authUser.id,
    email,
    displayName: email,
    role,
    onboardingCompleted: Boolean(profile?.onboarding_completed),
  };
}
