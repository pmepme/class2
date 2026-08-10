import { createSupabaseServerClient, getSupabaseConfig, rejectMethod, sendJson } from '../_supabase.js';

export default async function handler(req, res) {
  if (rejectMethod(req, res)) return;
  try {
    getSupabaseConfig();
    const supabase = createSupabaseServerClient(req, res);
    await supabase.auth.signOut();
    sendJson(res, 200, { ok: true });
  } catch (error) {
    sendJson(res, error?.message === 'SUPABASE_CONFIG_MISSING' ? 503 : 500, { error: 'logout_failed', message: '로그아웃하지 못했습니다.' });
  }
}
