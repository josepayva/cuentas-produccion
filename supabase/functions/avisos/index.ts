// Edge Function "avisos": manda notificaciones (Web Push) al iPhone.
//   enviar  (cron, cabecera x-avisos-token) -> manda los avisos de hoy del plan que arma la app
//   probar  (con sesión)                    -> manda un aviso de prueba a los equipos del usuario
// El plan vive en documentos (coleccion 'sistema', id 'avisos'): { plan: [{ id, fecha, titulo, cuerpo, url }] }.
// Las claves VAPID y el token del cron están en Supabase Vault (función config_avisos, solo service_role).
import { createClient } from 'npm:@supabase/supabase-js@2';
import webpush from 'npm:web-push@3.6.7';

const ORIGENES = ['https://josepayva.github.io'];
const URL_SB = Deno.env.get('SUPABASE_URL')!;
const secretas = (() => { try { return JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS') || '{}'); } catch { return {}; } })();
const CLAVE = secretas['default'] || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const admin = createClient(URL_SB, CLAVE, { auth: { persistSession: false, autoRefreshToken: false } });
const APP = 'https://josepayva.github.io/cuentas-produccion/';

const cors = (req: Request) => {
  const o = req.headers.get('origin') || '';
  return {
    'Access-Control-Allow-Origin': ORIGENES.includes(o) ? o : ORIGENES[0],
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
  };
};
const json = (req: Request, body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors(req), 'Content-Type': 'application/json' } });

type Msg = { titulo: string; cuerpo?: string; url?: string; tag?: string };
type Cfg = { vapid_privada: string; vapid_publica: string; avisos_token: string };
let cfg: Cfg | null = null;
async function config(): Promise<Cfg> {
  if (cfg) return cfg;
  const { data, error } = await admin.rpc('config_avisos');
  if (error || !data) throw new Error('No se pudo leer la configuración de avisos: ' + (error && error.message));
  cfg = data as Cfg;
  webpush.setVapidDetails('mailto:avisos@emotionstudios.pe', cfg.vapid_publica, cfg.vapid_privada);
  return cfg;
}

const hoyLima = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Lima' }).format(new Date());
function igual(a: string, b: string) {
  if (!a || !b || a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

async function enviarA(usuario: string, msgs: Msg[]) {
  const { data: subs } = await admin.from('push_subs').select('*').eq('usuario', usuario);
  let enviados = 0, fallos = 0;
  for (const s of subs || []) {
    for (const m of msgs) {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          JSON.stringify({ titulo: m.titulo, cuerpo: m.cuerpo || '', url: m.url ? APP + m.url : APP, tag: m.tag || '' }),
          { TTL: 12 * 3600, urgency: 'normal' },
        );
        enviados++;
      } catch (e) {
        const st = (e as { statusCode?: number }).statusCode;
        if (st === 404 || st === 410) { await admin.from('push_subs').delete().eq('endpoint', s.endpoint); break; }
        console.error('Aviso no enviado:', st, (e as Error).message);
        fallos++;
      }
    }
  }
  return { equipos: (subs || []).length, enviados, fallos };
}

// Si un día hay muchos avisos, se juntan para no llenar la pantalla
function agrupar(items: Msg[]): Msg[] {
  if (items.length <= 3) return items;
  return [...items.slice(0, 2), { titulo: `Y ${items.length - 2} avisos más para hoy`, cuerpo: items.slice(2).map(x => x.titulo).join(' · ').slice(0, 180), url: '#resumen', tag: 'resumen' }];
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors(req) });
  if (req.method !== 'POST') return json(req, { error: 'Usa POST.' }, 405);
  let b: Record<string, unknown> = {};
  try { b = await req.json(); } catch { /* sin cuerpo */ }
  try {
    const c = await config();
    if (b.accion === 'enviar') {
      if (!igual(req.headers.get('x-avisos-token') || '', c.avisos_token)) return json(req, { error: 'No autorizado.' }, 401);
      const hoy = hoyLima();
      const { data: filas, error } = await admin.from('documentos').select('usuario, datos').eq('coleccion', 'sistema').eq('id', 'avisos');
      if (error) throw new Error(error.message);
      const res: unknown[] = [];
      for (const f of filas || []) {
        const plan = (((f.datos || {}) as { plan?: (Msg & { fecha?: string; id?: string })[] }).plan || []);
        const deHoy = plan.filter(x => x && x.fecha === hoy && x.titulo).map(x => ({ ...x, tag: x.id }));
        if (deHoy.length) res.push(await enviarA(f.usuario, agrupar(deHoy)));
      }
      console.log('Avisos del', hoy, JSON.stringify(res));
      return json(req, { ok: true, hoy, res });
    }
    const t = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
    const { data: u } = t && !t.startsWith('sb_') ? await admin.auth.getUser(t) : { data: { user: null } };
    if (!u || !u.user) return json(req, { error: 'Inicia sesión otra vez.' }, 401);
    if (b.accion === 'probar') {
      const r = await enviarA(u.user.id, [{ titulo: 'Avisos activados ✓', cuerpo: 'Así te llegarán los cobros, entregas y rodajes, cada día a las 8 a.m.', url: '#resumen', tag: 'prueba' }]);
      return json(req, { ok: true, ...r });
    }
    return json(req, { error: 'Acción desconocida.' }, 400);
  } catch (e) {
    console.error('Error en avisos:', (e as Error).message);
    return json(req, { error: 'No se pudieron mandar los avisos.' }, 500);
  }
});
