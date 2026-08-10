import {
  createSupabaseServerClient,
  getSafeUser,
  getSupabaseConfig,
  isHanyangEmail,
  normalizeEmail,
  rejectMethod,
  sendJson,
} from '../_supabase.js';

export default async function handler(req, res) {
  if (rejectMethod(req, res)) return;
  try {
    getSupabaseConfig();
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const email = normalizeEmail(body.email);
    const password = String(body.password || '');
    if (!isHanyangEmail(email) || !password) {
      sendJson(res, 400, { error: 'invalid_credentials', message: '이메일 또는 비밀번호를 확인해 주세요.' });
      return;
    }

    const supabase = createSupabaseServerClient(req, res);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data?.user) {
      sendJson(res, 401, { error: 'login_failed', message: '이메일 또는 비밀번호를 확인해 주세요.' });
      return;
    }

    const user = await getSafeUser(supabase);
    if (!user) {
      await supabase.auth.signOut();
      sendJson(res, 403, { error: 'profile_unavailable', message: '계정 정보를 확인하지 못했습니다. 관리자에게 문의해 주세요.' });
      return;
    }
    sendJson(res, 200, { authenticated: true, user });
  } catch (error) {
    sendJson(res, error?.message === 'SUPABASE_CONFIG_MISSING' ? 503 : 500, { error: 'auth_unavailable', message: '로그인 설정을 확인하지 못했습니다. 잠시 후 다시 시도해 주세요.' });
  }
}
