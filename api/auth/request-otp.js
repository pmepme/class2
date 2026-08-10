import {
  createSupabaseServerClient,
  getSupabaseConfig,
  isAdminEmail,
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
    const purpose = body.purpose === 'admin' ? 'admin' : 'student';
    if (!isHanyangEmail(email)) {
      sendJson(res, 400, { error: 'invalid_email', message: '한양대학교 이메일(@hanyang.ac.kr)만 사용할 수 있습니다.' });
      return;
    }
    if (purpose === 'admin' && !isAdminEmail(email)) {
      sendJson(res, 403, { error: 'admin_email_required', message: '관리자 인증은 지정된 관리자 계정만 사용할 수 있습니다.' });
      return;
    }
    const supabase = createSupabaseServerClient(req, res);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });
    if (error) {
      sendJson(res, 400, { error: 'otp_request_failed', message: '인증번호를 보내지 못했습니다. 잠시 후 다시 시도해 주세요.' });
      return;
    }
    sendJson(res, 200, { ok: true });
  } catch (error) {
    sendJson(res, error?.message === 'SUPABASE_CONFIG_MISSING' ? 503 : 500, { error: 'auth_unavailable', message: '이메일 인증 설정이 준비되지 않았습니다.' });
  }
}
