import * as L from './logica.ts';
const ok = (c: boolean, m: string) => { if (!c) throw new Error('Falla: ' + m); console.log('✓', m); };
const ts = [
  { id: 'a', titulo: 'Videoclip Ñañez', artistaId: 'x', fecha: '2026-11-25', fechaFin: '2026-11-27', estadoProd: 'produccion', total: 3000, pagos: [{ monto: 1000 }] },
  { id: 'b', titulo: 'Spot Río', fecha: '2026-11-29', estadoProd: 'produccion', total: 1500, pagos: [], retencion: true },
  { id: 'c', titulo: 'Cotización X', fecha: '2026-11-26', estadoProd: 'cotizado', total: 900 },
];
const art = (t: any) => t.artistaId === 'x' ? 'Los Pávidos' : '';
ok(L.trabajoParaGasto(ts, '2026-11-26')!.id === 'c' || L.trabajoParaGasto(ts, '2026-11-26')!.id === 'a', 'rodaje de varios días cuenta hoy');
ok(L.trabajoParaGasto(ts.filter(t => t.id !== 'c'), '2026-11-26')!.id === 'a', 'elige el trabajo con rodaje hoy');
ok(L.trabajoParaGasto(ts, '2026-11-30')!.id === 'b', 'si no hay rodaje hoy, el más cercano en producción');
ok(L.trabajoParaGasto(ts, '2026-12-15') === null, 'lejos de todo rodaje: gasto general');
ok(L.saldo(ts[1]) === 1380, 'saldo con retención del 8%');
ok(L.conSaldo(ts).map(t => t.id).join() === 'a,b', 'pendientes sin cotizaciones');
ok(L.buscarTrabajo(ts, 'Videoclip Ñañez — Los Pávidos', art)[0].id === 'a', 'encuentra por la línea elegida');
ok(L.buscarTrabajo(ts, 'nanez', art)[0].id === 'a', 'encuentra por una palabra dicha a Siri');
ok(L.categoria('taxi al set') === 'Transporte' && L.categoria('almuerzo equipo') === 'Viáticos y alimentación' && L.categoria('algo raro') === 'Otros', 'adivina la categoría');
ok(L.num('S/ 1,250.50') === 1250.5 && L.num('35,5') === 35.5 && L.num('50') === 50, 'entiende montos');
ok(L.dinero(50) === 'S/ 50.00', 'formato de soles: ' + L.dinero(50));
