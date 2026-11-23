// Edge Function "calendario": conecta Google Calendar a la cuenta del usuario y hace las llamadas al calendario.
// La app nunca ve el token de Google: se guarda en public.google_tokens y solo esta función lo usa.
// Acciones (POST JSON { accion, ... }):
//   estado       (con sesión)  -> { conectado, correo }
//   iniciar      (con sesión)  -> { url }  dirección de Google para dar permiso
//   terminar     (sin sesión)  -> { ok }   recibe code + estado de la vuelta de Google
//   desconectar  (con sesión)  -> { ok }
//   llamar       (con sesión)  -> { payload } | { error: { code, message } }
//                tool: create_event | update_event | delete_event | list_calendars
import { createClient } from 'npm:@supabase/supabase-js@2';

const ORIGENES = ['https://josepayva.github.io', 'http://localhost:8765'];
const REDIRECT = 'https://josepayva.github.io/cuentas-produccion/';
const SCOPES = [
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/calendar.calendarlist.readonly',
].join(' ');
const API = 'https://www.googleapis.com/calendar/v3';

const URL_SB = Deno.env.get('SUPABASE_URL')!;
const secretas = (() => { try { return JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS') || '{}'); } catch { return {}; } })();
const CLAVE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || secretas['default'];
const admin = createClient(URL_SB, CLAVE, { auth: { persistSession: false, autoRefreshToken: false } });

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
const fallo = (req: Request, code: string, message: string, status = 200) => json(req, { error: { code, message } }, status);

async function usuarioDe(req: Request) {
  const t = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (!t || t.startsWith('sb_')) return null;
  const { data, error } = await admin.auth.getUser(t);
  return error ? null : data.user;
}

function credenciales() {
  const id = Deno.env.get('GOOGLE_CLIENT_ID'), secreto = Deno.env.get('GOOGLE_CLIENT_SECRET');
  if (!id || !secreto) throw Object.assign(new Error('Faltan GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET en los secretos de Supabase.'), { code: 'server_not_configured' });
  return { id, secreto };
}

async function token(uid: string): Promise<string> {
  const { data: fila } = await admin.from('google_tokens').select('*').eq('usuario', uid).maybeSingle();
  if (!fila) throw Object.assign(new Error('Google Calendar no está conectado.'), { code: 'server_not_connected' });
  if (fila.access_token && fila.expira && new Date(fila.expira).getTime() - Date.now() > 60_000) return fila.access_token;
  const { id, secreto } = credenciales();
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: id, client_secret: secreto, refresh_token: fila.refresh_token, grant_type: 'refresh_token' }),
  });
  const d = await r.json();
  if (!r.ok) {
    if (d.error === 'invalid_grant') {
      await admin.from('google_tokens').delete().eq('usuario', uid);
      throw Object.assign(new Error('El permiso de Google venció o se quitó.'), { code: 'needs_reauth' });
    }
    throw Object.assign(new Error('Google no respondió al renovar el permiso.'), { code: 'error' });
  }
  await admin.from('google_tokens').update({
    access_token: d.access_token,
    expira: new Date(Date.now() + (d.expires_in || 3600) * 1000).toISOString(),
    actualizado: new Date().toISOString(),
  }).eq('usuario', uid);
  return d.access_token;
}

async function google(uid: string, metodo: string, ruta: string, cuerpo?: unknown) {
  const at = await token(uid);
  const r = await fetch(API + ruta, {
    method: metodo,
    headers: { Authorization: 'Bearer ' + at, ...(cuerpo ? { 'Content-Type': 'application/json' } : {}) },
    body: cuerpo ? JSON.stringify(cuerpo) : undefined,
  });
  if (r.status === 204) return {};
  const d = await r.json().catch(() => ({}));
  if (r.status === 404 || r.status === 410) throw Object.assign(new Error('El evento ya no existe.'), { code: 'tool_error' });
  if (r.status === 401) throw Object.assign(new Error('Permiso de Google no válido.'), { code: 'needs_reauth' });
  if (r.status === 403) throw Object.assign(new Error((d.error && d.error.message) || 'Google rechazó la operación.'), { code: 'approval_required' });
  if (!r.ok) throw Object.assign(new Error((d.error && d.error.message) || 'Error de Google Calendar.'), { code: 'error' });
  return d;
}

type Entrada = Record<string, any>;
const calId = (i: Entrada) => encodeURIComponent(i.calendarId || 'primary');
const envio = (i: Entrada) => (i.notificationLevel === 'NONE' ? 'none' : 'all');
function tiempos(i: Entrada) {
  if (!i.startTime) return {};
  if (i.allDay) return { start: { date: String(i.startTime).slice(0, 10) }, end: { date: String(i.endTime || i.startTime).slice(0, 10) } };
  const zona = i.zona || 'America/Lima';
  return { start: { dateTime: i.startTime, timeZone: zona }, end: { dateTime: i.endTime || i.startTime, timeZone: zona } };
}
function campos(i: Entrada) {
  const ev: Entrada = { ...tiempos(i) };
  for (const k of ['summary', 'description', 'location', 'colorId']) if (k in i) ev[k] = i[k] === '' && k === 'colorId' ? null : i[k];
  return ev;
}

async function llamar(uid: string, tool: string, i: Entrada) {
  if (tool === 'list_calendars') {
    const d = await google(uid, 'GET', '/users/me/calendarList?minAccessRole=writer&maxResults=250');
    return { calendars: (d.items || []).map((c: Entrada) => ({ id: c.id, summary: c.summaryOverride || c.summary, primary: !!c.primary })) };
  }
  if (tool === 'create_event') {
    const ev = { ...campos(i), attendees: (i.attendees || []).filter((a: Entrada) => a && a.email) };
    const d = await google(uid, 'POST', `/calendars/${calId(i)}/events?sendUpdates=${envio(i)}`, ev);
    return { id: d.id, htmlLink: d.htmlLink };
  }
  if (tool === 'update_event') {
    if (!i.eventId) throw Object.assign(new Error('Falta el evento.'), { code: 'tool_error' });
    const ev = campos(i);
    const mas: string[] = (i.addedAttendees || []).map((a: Entrada) => a && a.email).filter(Boolean);
    const menos: string[] = (i.removedAttendeeEmails || []).map((e: string) => String(e).toLowerCase());
    if (mas.length || menos.length) {
      const actual = await google(uid, 'GET', `/calendars/${calId(i)}/events/${encodeURIComponent(i.eventId)}`);
      const lista = (actual.attendees || []).filter((a: Entrada) => !menos.includes(String(a.email).toLowerCase()));
      for (const e of mas) if (!lista.some((a: Entrada) => String(a.email).toLowerCase() === e.toLowerCase())) lista.push({ email: e });
      ev.attendees = lista;
    }
    const d = await google(uid, 'PATCH', `/calendars/${calId(i)}/events/${encodeURIComponent(i.eventId)}?sendUpdates=${envio(i)}`, ev);
    return { id: d.id, htmlLink: d.htmlLink };
  }
  if (tool === 'delete_event') {
    if (!i.eventId) throw Object.assign(new Error('Falta el evento.'), { code: 'tool_error' });
    await google(uid, 'DELETE', `/calendars/${calId(i)}/events/${encodeURIComponent(i.eventId)}?sendUpdates=${envio(i)}`);
    return { ok: true };
  }
  throw Object.assign(new Error('Acción de calendario desconocida.'), { code: 'not_in_manifest' });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors(req) });
  if (req.method !== 'POST') return fallo(req, 'error', 'Usa POST.', 405);
  let b: Entrada;
  try { b = await req.json(); } catch { return fallo(req, 'error', 'Cuerpo no válido.', 400); }

  try {
    if (b.accion === 'terminar') {
      const { id, secreto } = credenciales();
      if (!b.code || !b.estado) return fallo(req, 'error', 'Faltan datos de Google.', 400);
      const { data: est, error: eEst } = await admin.from('oauth_estados').select('*').eq('estado', b.estado).maybeSingle();
      if (eEst) console.error('No se pudo leer el estado OAuth:', eEst.message);
      await admin.from('oauth_estados').delete().eq('estado', b.estado);
      await admin.from('oauth_estados').delete().lt('creado', new Date(Date.now() - 15 * 60_000).toISOString());
      if (!est || Date.now() - new Date(est.creado).getTime() > 15 * 60_000) { console.error('Estado OAuth no encontrado o vencido'); return fallo(req, 'expired', 'El enlace de conexión venció. Vuelve a tocar “Conectar Google Calendar”.'); }
      const r = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ code: b.code, client_id: id, client_secret: secreto, redirect_uri: REDIRECT, grant_type: 'authorization_code' }),
      });
      const d = await r.json();
      if (!r.ok) {
        console.error('Intercambio de código rechazado por Google:', d.error, d.error_description);
        const motivo = d.error === 'invalid_client' || d.error === 'unauthorized_client'
          ? 'Google no reconoce el ID o el secreto del cliente. Revisa GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET en Supabase (copiados con el botón de copiar, sin espacios) y vuelve a conectar.'
          : d.error === 'redirect_uri_mismatch'
          ? 'La dirección de regreso no coincide. En Google Cloud, el cliente debe tener exactamente https://josepayva.github.io/cuentas-produccion/ como URI de redireccionamiento.'
          : d.error === 'invalid_grant'
          ? 'El permiso de Google ya se usó o venció. Vuelve a tocar “Conectar Google Calendar”.'
          : 'Google no aceptó la conexión (' + (d.error || 'error') + '). Inténtalo otra vez.';
        return fallo(req, 'error', motivo);
      }
      const { data: previo } = await admin.from('google_tokens').select('refresh_token').eq('usuario', est.usuario).maybeSingle();
      const refresh = d.refresh_token || (previo && previo.refresh_token);
      if (!refresh) return fallo(req, 'error', 'Google no entregó un permiso permanente. Quita el acceso de “Cuentas” en tu cuenta de Google y vuelve a conectar.');
      // correo de la cuenta de Google (el id del calendario principal es el correo)
      let correo = '';
      try {
        const c = await fetch(API + '/users/me/calendarList/primary', { headers: { Authorization: 'Bearer ' + d.access_token } });
        if (c.ok) correo = (await c.json()).id || '';
      } catch { /* sin correo */ }
      const { error: eTok } = await admin.from('google_tokens').upsert({
        usuario: est.usuario, refresh_token: refresh, access_token: d.access_token,
        expira: new Date(Date.now() + (d.expires_in || 3600) * 1000).toISOString(), correo, actualizado: new Date().toISOString(),
      });
      if (eTok) { console.error('No se pudo guardar el permiso de Google:', eTok.message); return fallo(req, 'error', 'Google aceptó, pero no se pudo guardar el permiso. Avísale a Claude.'); }
      return json(req, { ok: true, correo });
    }

    const u = await usuarioDe(req);
    if (!u) return fallo(req, 'unauthenticated', 'Inicia sesión otra vez.', 401);

    if (b.accion === 'estado') {
      const { data } = await admin.from('google_tokens').select('correo').eq('usuario', u.id).maybeSingle();
      let configurado = true;
      try { credenciales(); } catch { configurado = false; }
      return json(req, { conectado: !!data, correo: data ? data.correo : '', configurado });
    }
    if (b.accion === 'iniciar') {
      const { id } = credenciales();
      const estado = crypto.randomUUID() + crypto.randomUUID().replace(/-/g, '');
      const { error: eIns } = await admin.from('oauth_estados').insert({ estado, usuario: u.id });
      if (eIns) { console.error('No se pudo guardar el estado OAuth:', eIns.message); throw Object.assign(new Error('No se pudo iniciar la conexión (base de datos).'), { code: 'error' }); }
      const p = new URLSearchParams({
        client_id: id, redirect_uri: REDIRECT, response_type: 'code', scope: SCOPES,
        access_type: 'offline', prompt: 'consent', include_granted_scopes: 'true', state: estado,
      });
      if (u.email) p.set('login_hint', u.email);
      return json(req, { url: 'https://accounts.google.com/o/oauth2/v2/auth?' + p.toString() });
    }
    if (b.accion === 'desconectar') {
      const { data } = await admin.from('google_tokens').select('refresh_token').eq('usuario', u.id).maybeSingle();
      if (data) {
        await fetch('https://oauth2.googleapis.com/revoke?token=' + encodeURIComponent(data.refresh_token), { method: 'POST' }).catch(() => {});
        await admin.from('google_tokens').delete().eq('usuario', u.id);
      }
      return json(req, { ok: true });
    }
    if (b.accion === 'llamar') {
      const payload = await llamar(u.id, String(b.tool || ''), b.input || {});
      return json(req, { payload });
    }
    return fallo(req, 'error', 'Acción desconocida.', 400);
  } catch (e) {
    const err = e as Error & { code?: string };
    return fallo(req, err.code || 'error', err.message || 'Error');
  }
});
