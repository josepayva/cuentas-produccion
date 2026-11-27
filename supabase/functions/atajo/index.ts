// Edge Function "atajo": para Atajos del iPhone y Siri. Responde en texto para que Siri lo lea.
// Se llama con POST JSON y la cabecera  x-clave: <clave personal creada en Ajustes>.
//   { accion: 'gasto', monto, detalle?, categoria?, trabajo? }  -> agrega un gasto (al trabajo con rodaje hoy, o general)
//   { accion: 'pendientes' }                                    -> lista de trabajos con saldo, una línea por trabajo
//   { accion: 'pago', monto, trabajo?, metodo? }                -> registra un pago
//   { accion: 'resumen' }                                       -> cuánto te deben y qué hay hoy
import { createClient } from 'npm:@supabase/supabase-js@2';
import * as L from './logica.ts';

const URL_SB = Deno.env.get('SUPABASE_URL')!;
const secretas = (() => { try { return JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS') || '{}'); } catch { return {}; } })();
const CLAVE = secretas['default'] || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const admin = createClient(URL_SB, CLAVE, { auth: { persistSession: false, autoRefreshToken: false } });

const texto = (t: string, status = 200) => new Response(t, { status, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
const METODOS = ['Yape', 'Plin', 'Transferencia', 'Efectivo', 'Depósito', 'Tarjeta', 'Otro'];

async function huella(clave: string) {
  const b = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(clave)));
  return [...b].map(x => x.toString(16).padStart(2, '0')).join('');
}

type Fila = { id: string; datos: L.Doc; version: number };
async function leer(usuario: string, col: string): Promise<Fila[]> {
  const { data, error } = await admin.from('documentos').select('id, datos, version').eq('usuario', usuario).eq('coleccion', col);
  if (error) throw new Error(error.message);
  return (data || []) as Fila[];
}
// Cambia un trabajo sin pisar cambios hechos al mismo tiempo desde la app (compara la versión)
async function cambiarTrabajo(usuario: string, id: string, fn: (t: L.Doc) => void) {
  for (let intento = 0; intento < 3; intento++) {
    const { data: f } = await admin.from('documentos').select('datos, version').eq('usuario', usuario).eq('coleccion', 'trabajos').eq('id', id).maybeSingle();
    if (!f) throw new Error('El trabajo ya no existe.');
    const t = JSON.parse(JSON.stringify(f.datos)); fn(t); t.mod = Date.now();
    const { data: hecho, error } = await admin.from('documentos').update({ datos: t }).eq('usuario', usuario).eq('coleccion', 'trabajos').eq('id', id).eq('version', f.version).select('id');
    if (error) throw new Error(error.message);
    if (hecho && hecho.length) return t;
  }
  throw new Error('No se pudo guardar; inténtalo otra vez.');
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return texto('Usa POST.', 405);
  let b: Record<string, any> = {};
  try { b = await req.json(); } catch { return texto('No entendí el pedido.', 400); }
  const clave = (req.headers.get('x-clave') || String(b.clave || '')).trim();
  if (!/^cp_[A-Za-z0-9_-]{30,}$/.test(clave)) return texto('Falta tu clave de Atajos. Créala en la app: Ajustes → Atajos y Siri.', 401);
  const h = await huella(clave);
  const { data: k } = await admin.from('atajo_claves').select('usuario').eq('huella', h).maybeSingle();
  if (!k) return texto('Esa clave de Atajos no es válida o se borró. Crea otra en la app: Ajustes → Atajos y Siri.', 401);
  const usuario = k.usuario as string;
  admin.from('atajo_claves').update({ usado: new Date().toISOString() }).eq('huella', h).then(() => {});

  try {
    const hoy = L.hoyLima();
    const trabajos: L.Doc[] = (await leer(usuario, 'trabajos')).map(f => ({ ...f.datos, id: f.id }));
    const artistas: L.Doc[] = (await leer(usuario, 'artistas')).map(f => ({ ...f.datos, id: f.id }));
    const nomArt = (t: L.Doc) => { const a = artistas.find(x => x.id === t.artistaId); return a ? String(a.nombre || '') : ''; };
    const accion = String(b.accion || '').toLowerCase();

    if (accion === 'gasto') {
      const monto = L.r2(L.num(b.monto));
      if (!(monto > 0)) return texto('No entendí el monto del gasto.');
      const det = String(b.detalle || b.det || '').trim().slice(0, 140);
      let t: L.Doc | null = null;
      if (b.trabajo) { const r = L.buscarTrabajo(trabajos.filter(x => x.estadoProd !== 'cancelado'), String(b.trabajo), nomArt); if (r.length === 1) t = r[0]; }
      if (!t && !b.general) t = L.trabajoParaGasto(trabajos, hoy);
      if (t) {
        const g = { id: L.uid(), cat: L.categoria(det, b.categoria), det, monto, fecha: hoy, por: '', reemb: false, dev: false, foto: false, origen: 'atajo' };
        await cambiarTrabajo(usuario, t.id, n => { n.gastos = n.gastos || []; n.gastos.push(g); });
        return texto(`Listo: gasto de ${L.dinero(monto, t.moneda || 'PEN')}${det ? ' (' + det + ')' : ''} en «${t.titulo}», categoría ${g.cat}.`);
      }
      const { data: aj } = await admin.from('documentos').select('datos').eq('usuario', usuario).eq('coleccion', 'ajustes').eq('id', 'general').maybeSingle();
      const mon = (aj && aj.datos && aj.datos.moneda) || 'PEN';
      const g = { cat: 'Otros', det, monto, moneda: mon, fecha: hoy, foto: false, origen: 'atajo' };
      const id = L.uid();
      const { error } = await admin.from('documentos').insert({ usuario, coleccion: 'gastosGen', id, datos: g });
      if (error) throw new Error(error.message);
      return texto(`Listo: gasto general de ${L.dinero(monto, mon)}${det ? ' (' + det + ')' : ''}. Hoy no hay rodaje, así que no lo puse en ningún trabajo.`);
    }

    if (accion === 'pendientes') {
      const ps = L.conSaldo(trabajos);
      if (!ps.length) return texto('No hay trabajos con saldo pendiente.');
      return texto(ps.map(t => L.linea(t, nomArt)).join('\n'));
    }

    if (accion === 'pago') {
      const monto = L.r2(L.num(b.monto));
      if (!(monto > 0)) return texto('No entendí el monto del pago.');
      const ps = L.conSaldo(trabajos);
      let cands = b.trabajo ? L.buscarTrabajo(ps, String(b.trabajo), nomArt) : ps;
      if (b.trabajo && !cands.length) cands = L.buscarTrabajo(trabajos.filter(x => x.estadoProd !== 'cancelado'), String(b.trabajo), nomArt);
      if (!cands.length) return texto(b.trabajo ? `No encontré un trabajo que se llame «${b.trabajo}».` : 'No hay trabajos con saldo pendiente.');
      if (cands.length > 1) return texto('¿De cuál trabajo? ' + cands.slice(0, 6).map(t => L.linea(t, nomArt)).join(' · '));
      const t = cands[0];
      const met = METODOS.find(m => L.nrm(m) === L.nrm(b.metodo)) || (b.metodo ? 'Otro' : 'Otro');
      const p = { id: L.uid(), monto, fecha: hoy, metodo: met, nota: 'Registrado con Atajos' };
      const eraCot = t.estadoProd === 'cotizado';
      // Un pago confirma la cotización: pasa a producción y el calendario avisará a los invitados (la app actualiza el evento)
      const n = await cambiarTrabajo(usuario, t.id, x => { x.pagos = x.pagos || []; x.pagos.push(p); if (x.estadoProd === 'cotizado') { x.estadoProd = 'produccion'; if (x.cal) x.cal = { ...x.cal, notif: true }; } });
      const queda = L.saldo(n);
      return texto(`Listo: pago de ${L.dinero(monto, t.moneda || 'PEN')} en «${t.titulo}». ${queda > 0.004 ? 'Queda ' + L.dinero(queda, t.moneda || 'PEN') + '.' : '¡Trabajo cobrado completo!'}${eraCot ? ' La cotización pasó a En producción.' : ''}`);
    }

    if (accion === 'resumen') {
      const ps = L.conSaldo(trabajos);
      const porMon: Record<string, number> = {};
      for (const t of ps) porMon[t.moneda || 'PEN'] = (porMon[t.moneda || 'PEN'] || 0) + L.saldo(t);
      const deben = Object.entries(porMon).map(([m, v]) => L.dinero(L.r2(v), m)).join(' y ');
      const rod = trabajos.filter(t => t.estadoProd !== 'cancelado' && L.diasRodaje(t).includes(hoy)).map(t => '«' + t.titulo + '»');
      const ent = trabajos.filter(t => t.estadoProd === 'produccion' && t.entrega === hoy).map(t => '«' + t.titulo + '»');
      return texto([
        ps.length ? `Te deben ${deben} en ${ps.length} ${ps.length === 1 ? 'trabajo' : 'trabajos'}.` : 'No te deben nada.',
        rod.length ? `Hoy hay rodaje de ${rod.join(', ')}.` : '',
        ent.length ? `Hoy entregas ${ent.join(', ')}.` : '',
      ].filter(Boolean).join(' '));
    }
    return texto('No conozco esa acción. Usa gasto, pago, pendientes o resumen.', 400);
  } catch (e) {
    console.error('Error en atajo:', (e as Error).message);
    return texto('No se pudo completar: ' + (e as Error).message);
  }
});
