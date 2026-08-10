import { createSupabaseServerClient, getSafeUser, getSupabaseConfig, rejectMethod, sendJson } from '../_supabase.js';

export default async function handler(req, res) {
  if (rejectMethod(req, res, 'GET')) return;
  try {
    getSupabaseConfig();
    const supabase = createSupabaseServerClient(req, res);
    const user = await getSafeUser(supabase);
    sendJson(res, 200, user ? { authenticated: true, user } : { authenticated: false, user: null });
  } catch (error) {
    sendJson(res, error?.message === 'SUPABASE_CONFIG_MISSING' ? 503 : 500, { error: 'auth_unavailable', message: '세션을 확인하지 못했습니다.' });
  }
}
