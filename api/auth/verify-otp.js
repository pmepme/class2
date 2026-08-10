import {
  createSupabaseServerClient,
  getSafeUser,
  getSupabaseConfig,
  isAdminEmail,
  isHanyangEmail,
  normalizeEmail,
  OTP_LENGTH,
  rejectMethod,
  sendJson,
} from '../_supabase.js';

export default async function handler(req, res) {
  if (rejectMethod(req, res)) return;
  try {
    getSupabaseConfig();
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const email = normalizeEmail(body.email);
    const token = String(body.token || '').replace(/\D/g, '');
    const purpose = body.purpose === 'admin' ? 'admin' : 'student';
    if (!isHanyangEmail(email) || token.length !== OTP_LENGTH) {
      sendJson(res, 400, { error: 'invalid_otp', message: '인증번호가 올바르지 않거나 만료되었습니다.' });
      return;
    }
    if (purpose === 'admin' && !isAdminEmail(email)) {
      sendJson(res, 403, { error: 'admin_email_required', message: '관리자 인증은 지정된 관리자 계정만 사용할 수 있습니다.' });
      return;
    }
    const supabase = createSupabaseServerClient(req, res);
    const { data, error } = await supabase.auth.verifyOtp({ email, token, type: 'email' });
    if (error || !data?.user) {
      sendJson(res, 400, { error: 'otp_verification_failed', message: '인증번호가 올바르지 않거나 만료되었습니다.' });
      return;
    }
    const user = await getSafeUser(supabase);
    if (!user) {
      await supabase.auth.signOut();
      sendJson(res, 403, { error: 'profile_unavailable', message: '계정 정보를 확인하지 못했습니다. 관리자에게 문의해 주세요.' });
      return;
    }
    if (purpose === 'admin' && user.role !== 'admin') {
      await supabase.auth.signOut();
      sendJson(res, 403, { error: 'admin_required', message: '관리자 권한이 있는 계정만 접근할 수 있습니다.' });
      return;
    }
    sendJson(res, 200, { approved: true, user });
  } catch (error) {
    sendJson(res, error?.message === 'SUPABASE_CONFIG_MISSING' ? 503 : 500, { error: 'auth_unavailable', message: '이메일 인증 설정이 준비되지 않았습니다.' });
  }
}
