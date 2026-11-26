// Lógica de los atajos (sin base de datos), para poder probarla aparte.
export type Doc = Record<string, any>;

export const nrm = (x: unknown) => String(x ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase().replace(/\s+/g, ' ');
export const num = (x: unknown) => { const n = parseFloat(String(x ?? '').replace(/[^\d.,-]/g, '').replace(/,(?=\d{3}\b)/g, '').replace(',', '.')); return isFinite(n) ? n : 0; };
export const r2 = (n: number) => Math.round(n * 100) / 100;
export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
export const hoyLima = (d = new Date()) => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Lima' }).format(d);
export const sumarDias = (s: string, n: number) => { const d = new Date(s + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const difDias = (a: string, b: string) => Math.round((new Date(b + 'T12:00:00Z').getTime() - new Date(a + 'T12:00:00Z').getTime()) / 86400000);
export function dinero(n: number, mon = 'PEN') {
  try { return new Intl.NumberFormat('es-PE', { style: 'currency', currency: mon, minimumFractionDigits: 2 }).format(n).replace(/ /g, ' '); }
  catch { return mon + ' ' + n.toFixed(2); }
}

// Igual que la app: días de rodaje de un trabajo
export function diasRodaje(t: Doc): string[] {
  if (!t.fecha) return [];
  const bs = [{ fecha: t.fecha, hasta: t.fechaFin || '' }, ...((t.diasExtra || []) as Doc[]).filter(d => d && d.fecha)];
  const out: string[] = [];
  for (const b of bs) {
    const fin = b.hasta && b.hasta > b.fecha ? b.hasta : b.fecha;
    for (let f = b.fecha, i = 0; f <= fin && i < 60; f = sumarDias(f, 1), i++) out.push(f);
  }
  return [...new Set(out)].sort();
}
const pagado = (t: Doc) => r2(((t.pagos || []) as Doc[]).reduce((a, p) => a + num(p.monto), 0));
const reemb = (t: Doc) => r2(((t.gastos || []) as Doc[]).filter(g => g.reemb).reduce((a, g) => a + num(g.monto), 0));
export const saldo = (t: Doc) => Math.max(0, r2(num(t.total) + reemb(t) - (t.retencion ? r2(num(t.total) * 0.08) : 0) - pagado(t)));
export const cuenta = (t: Doc) => !['cotizado', 'cancelado'].includes(t.estadoProd);
export const conSaldo = (ts: Doc[]) => ts.filter(t => cuenta(t) && saldo(t) > 0.004).sort((a, b) => String(a.fecha || '9').localeCompare(String(b.fecha || '9')));
export const linea = (t: Doc, nomArt: (t: Doc) => string) => { const a = nomArt(t), ti = t.titulo || 'Trabajo'; return ti + (a && nrm(a) !== nrm(ti) ? ' — ' + a : ''); };

// Trabajo para un gasto: el que tiene rodaje hoy; si no, el en producción con rodaje más cercano (±3 días)
export function trabajoParaGasto(ts: Doc[], hoy: string): Doc | null {
  const vivos = ts.filter(t => t.estadoProd !== 'cancelado');
  const hoyR = vivos.filter(t => diasRodaje(t).includes(hoy)).sort((a, b) => (a.estadoProd === 'produccion' ? 0 : 1) - (b.estadoProd === 'produccion' ? 0 : 1))[0];
  if (hoyR) return hoyR;
  let mejor: { t: Doc; d: number } | null = null;
  for (const t of vivos.filter(t => t.estadoProd === 'produccion')) for (const f of diasRodaje(t)) {
    const d = Math.abs(difDias(f, hoy));
    if (d <= 3 && (!mejor || d < mejor.d)) mejor = { t, d };
  }
  return mejor ? mejor.t : null;
}

// Busca un trabajo por lo que dijo/eligió la persona
export function buscarTrabajo(ts: Doc[], q: string, nomArt: (t: Doc) => string): Doc[] {
  const w = nrm(q).replace(/ — .*/, ''); if (!w) return [];
  const exactos = ts.filter(t => nrm(linea(t, nomArt)) === nrm(q) || nrm(t.titulo) === w);
  if (exactos.length) return exactos;
  const pal = w.split(' ').filter(x => x.length > 1);
  return ts.filter(t => { const n = nrm(linea(t, nomArt)); return pal.every(p => n.includes(p)); });
}

const CAT_PAL: [string, RegExp][] = [
  ['Transporte', /taxi|uber|cabify|indriver|didi|gasolina|combustible|peaje|pasaje|bus|movilidad|estacionamiento|cochera|grifo|colectivo/],
  ['Hospedaje', /hotel|hostal|hospedaje|airbnb|alojamiento/],
  ['Viáticos y alimentación', /almuerzo|comida|desayuno|cena|menu|catering|agua|snack|refrigerio|viatico|bebida|cafe|pollo|pizza|chifa|cevich/],
  ['Alquiler de equipo', /alquiler|camara|lente|luces|luz|dron|drone|gimbal|equipo|grua|steady/],
  ['Personal / freelancers', /asistente|maquill|vestuarista|camarografo|editor|foquista|gaffer|freelance|pago a|bailarin|modelo|extra/],
  ['Locación', /locacion|local|permiso|casa|terreno/],
  ['Licencias y música', /licencia|musica|cancion|stock|plugin/],
];
export function categoria(det: string, cat?: string): string {
  const CATS = ['Transporte', 'Hospedaje', 'Viáticos y alimentación', 'Alquiler de equipo', 'Personal / freelancers', 'Locación', 'Licencias y música', 'Otros'];
  if (cat) { const c = CATS.find(x => nrm(x) === nrm(cat) || nrm(x).startsWith(nrm(cat))); if (c) return c; }
  const n = nrm(det);
  for (const [c, re] of CAT_PAL) if (re.test(n)) return c;
  return 'Otros';
}
