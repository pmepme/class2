import {
  createSupabaseServerClient,
  getSafeUser,
  getSupabaseConfig,
  isHanyangEmail,
  normalizeEmail,
  rejectMethod,
  sendJson,
} from '../_supabase.js';

function cleanText(value, maxLength) {
  return String(value || '').trim().replace(/\s+/g, ' ').slice(0, maxLength);
}

export default async function handler(req, res) {
  if (rejectMethod(req, res)) return;
  try {
    getSupabaseConfig();
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const password = String(body.password || '');
    const displayName = cleanText(body.displayName, 50);
    const studentId = cleanText(body.studentId, 30);
    if (password.length < 8 || password.length > 72) {
      sendJson(res, 400, { error: 'invalid_password', message: '비밀번호는 8자 이상 72자 이하로 입력해 주세요.' });
      return;
    }
    if (displayName.length < 1) {
      sendJson(res, 400, { error: 'invalid_name', message: '이름을 입력해 주세요.' });
      return;
    }
    if (studentId.length < 2) {
      sendJson(res, 400, { error: 'invalid_student_id', message: '학번을 입력해 주세요.' });
      return;
    }

    const supabase = createSupabaseServerClient(req, res);
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData?.user) {
      sendJson(res, 401, { error: 'auth_required', message: '이메일 인증을 먼저 완료해 주세요.' });
      return;
    }
    const email = normalizeEmail(authData.user.email);
    if (!isHanyangEmail(email)) {
      sendJson(res, 403, { error: 'hanyang_email_required', message: '한양대학교 이메일 계정만 사용할 수 있습니다.' });
      return;
    }
    const { error: passwordError } = await supabase.auth.updateUser({
      password,
      data: { display_name: displayName, student_id: studentId },
    });
    if (passwordError) {
      sendJson(res, 400, { error: 'password_setup_failed', message: '비밀번호를 설정하지 못했습니다. 입력값을 확인해 주세요.' });
      return;
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .update({ display_name: displayName, student_id: studentId, onboarding_completed: true })
      .eq('id', authData.user.id);
    if (profileError) {
      if (profileError.code === '23505') {
        sendJson(res, 409, { error: 'student_id_taken', message: '이미 사용 중인 학번입니다.' });
        return;
      }
      sendJson(res, 400, { error: 'profile_setup_failed', message: '회원 정보를 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.' });
      return;
    }

    const user = await getSafeUser(supabase);
    if (!user) {
      sendJson(res, 403, { error: 'profile_unavailable', message: '회원 정보를 확인하지 못했습니다. 관리자에게 문의해 주세요.' });
      return;
    }
    sendJson(res, 200, { approved: true, user });
  } catch (error) {
    sendJson(res, error?.message === 'SUPABASE_CONFIG_MISSING' ? 503 : 500, { error: 'auth_unavailable', message: '회원가입 설정을 확인하지 못했습니다. 잠시 후 다시 시도해 주세요.' });
  }
}
