{
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);
const okId=s=>typeof s==='string'&&/^[A-Za-z0-9_\-~:@+]{1,80}$/.test(s);
const r2=n=>Math.round((+n||0)*100)/100;
const hoy=()=>{const d=new Date();d.setMinutes(d.getMinutes()-d.getTimezoneOffset());return d.toISOString().slice(0,10)};
const sumarDias=(s,n)=>{const d=new Date(s+'T12:00:00');d.setDate(d.getDate()+n);return d.toISOString().slice(0,10)};
const dias=(a,b)=>Math.round((Date.parse(b+'T12:00:00')-Date.parse(a+'T12:00:00'))/864e5);
const num=v=>{if(typeof v==='number')return isFinite(v)?r2(v):0;let s=String(v||'').replace(/[^\d.,-]/g,'');if(s.includes(',')&&s.includes('.'))s=s.replace(/,/g,'');else if(s.includes(','))s=(/,\d{3}$/.test(s)&&!/,\d{1,2}$/.test(s))?s.replace(/,/g,''):s.replace(',','.');const n=parseFloat(s);return isFinite(n)?r2(n):0};
const NF={};
const fmtR=(n,c)=>{c=c||'PEN';try{NF[c]=NF[c]||new Intl.NumberFormat('es-PE',{style:'currency',currency:c,minimumFractionDigits:2,maximumFractionDigits:2});return NF[c].format(n||0)}catch(e){return c+' '+(n||0).toFixed(2)}};
const fmt=(n,c)=>S.oculto?fmtR(0,c).replace(/[\d.,\s\u00a0]+$/,'').trim()+' •••••':fmtR(n,c);
const MES=['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
const MESL=['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
const fd=s=>{if(!s)return'';const p=s.split('-');return `${+p[2]} ${MES[+p[1]-1]} ${p[0]}`};
const rel=d=>{const n=dias(hoy(),d);return n===0?'hoy':n===1?'mañana':n===-1?'ayer':n>1?(n<=14?`en ${n} días`:'el '+fd(d)):`hace ${-n} días`};
const PROD={cotizado:'Cotización',produccion:'En producción',entregado:'Entregado',cancelado:'Cancelado'};
const METODOS=['Yape','Plin','Transferencia','Efectivo','Depósito','Tarjeta','Otro'];
const TIPOS=['Videoclip','Spot publicitario','Video corporativo','Contenido para redes','Boda','Evento','Documental','Cobertura en vivo','Fotografía','Edición / postproducción','Animación','Otro'];
const CATSG=['Equipo y accesorios','Software y suscripciones','Mantenimiento y reparaciones','Movilidad','Publicidad y redes','Internet y teléfono','Impuestos y trámites','Estudio / alquiler','Otros'];
const CATM={'Transporte':['Transporte','bus','#F3AF58'],'Hospedaje':['Hospedaje','bed','#62C5D8'],'Viáticos y alimentación':['Viáticos','fork','#E14060'],'Alquiler de equipo':['Equipo','cam','#5BA4F0'],'Personal / freelancers':['Personal','user','#7854F5'],'Locación':['Locación','pin','#5FAC9C'],'Licencias y música':['Licencias','music','#E8789A'],'Otros':['Otros','dots','#9F9F9F']};
const CATS=['Transporte','Hospedaje','Viáticos y alimentación','Alquiler de equipo','Personal / freelancers','Locación','Licencias y música','Otros'];
const MONEDAS={PEN:'Soles (S/)',USD:'Dólares (US$)',EUR:'Euros (€)'};
const OLD_TPL='Hola {cliente}, ¿cómo estás? Te escribo para recordarte el saldo pendiente de {saldo} por "{trabajo}". Quedo atento a tu confirmación. ¡Gracias!';
const TPL={
 tplAdelanto:'Hola {cliente}, ¿cómo estás? Para dejar confirmada la fecha de "{trabajo}" ({fecha}) quedaría pendiente el adelanto de {monto}. Me avisas cuando lo realices. ¡Gracias!',
 tplCuota:'Hola {cliente}, ¿cómo estás? Te recuerdo el pago de {cuota} por {monto} del proyecto "{trabajo}". Quedo atento. ¡Gracias!',
 tplCancel:'Hola {cliente}, ¿cómo estás? Te escribo por "{trabajo}": quedaría pendiente la cancelación de {monto}. Quedo atento a tu confirmación. ¡Gracias!'
};
const TERM_DEF='• Precios en la moneda indicada; no incluyen IGV salvo que se diga lo contrario.\n• Para separar la fecha se pide el adelanto indicado en la forma de pago.\n• El saldo se paga a la entrega del material final.\n• Incluye hasta 2 rondas de cambios en edición; cambios adicionales se cotizan aparte.\n• Cambios de fecha con al menos 72 horas de aviso; el adelanto no es reembolsable.';
const DEF_AJ={cotValidez:15,cotTerminos:TERM_DEF,cotContacto:'',negocio:'',moneda:'PEN',gracia:3,equipo:'',invFrec:'',tipoDef:'Videoclip',colRodaje:'4',colEntrega:'4',calId:'',calNom:'',...TPL};
const GCOL=[['1','Lavanda','#7986cb'],['2','Salvia','#33b679'],['3','Uva','#8e24aa'],['4','Flamenco','#e67c73'],['5','Plátano','#f6bf26'],['6','Mandarina','#f4511e'],['7','Pavo real','#039be5'],['8','Grafito','#616161'],['9','Arándano','#3f51b5'],['10','Albahaca','#0b8043'],['11','Tomate','#d50000']];
const colHex=id=>{const c=GCOL.find(x=>x[0]===String(id));return c?c[2]:''};
const colNom=id=>{const c=GCOL.find(x=>x[0]===String(id));return c?c[1]:(S.aj.calId?'Color del calendario '+(S.aj.calNom||''):'Predeterminado')};
const colT=t=>t.color||S.aj.colRodaje||'';
const ROSA='#d81b60';
const colApp=id=>!id?ROSA:colHex(id);
const swatches=(name,sel,conDef,defTxt)=>`<div class="sws">${conDef?`<label title="${esc(defTxt)}"><input type="radio" name="${name}" value=""${!sel?' checked':''}><span class="swd"><i style="background:${ROSA}"></i>${name==='color'?'Auto':'Del calendario'}</span></label>`:''}${GCOL.map(([v,n,hx])=>`<label title="${n}"><input type="radio" name="${name}" value="${v}"${sel===v?' checked':''} aria-label="${n}"><span style="background:${hx}"></span></label>`).join('')}</div>`;
const ETQ_BASE=['Urgente','Cliente frecuente','Requiere factura','Viaje','Drone'];
const S={oculto:false,gastosGen:[],clientes:[],artistas:[],vc:'clientes',qa:'',noPicker:false,trabajos:[],aj:{...DEF_AJ},modo:'cargando',aviso:'',f:'cobrar',q:'',qc:'',anio:null,mon:null,tag:'',tv:'lista',mes:'',dia:''};
function normAj(d){const a={...DEF_AJ,...(d||{})};if(!a.tc||typeof a.tc!=='object')a.tc={};if(d&&d.plantilla&&!d.tplCancel&&d.plantilla!==OLD_TPL)a.tplCancel=d.plantilla;const g=parseInt(a.gracia,10);a.gracia=isFinite(g)?Math.max(0,Math.min(60,g)):3;return a}
const normT=d=>({modoPago:'adelanto',adelantoReq:0,cuotas:[],presupuesto:{},pagos:[],gastos:[],etiquetas:[],invitados:[],...d,entrega:d.entrega!==undefined?d.entrega:(d.vence||'')});

/* ---------- cálculos ---------- */
const cli=id=>S.clientes.find(c=>c.id===id);
const art=id=>id?S.artistas.find(a=>a.id===id):null;
const nrm=x=>String(x||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase().replace(/\s+/g,' ');
const porNombre=(arr,n)=>arr.find(x=>nrm(x.nombre)===nrm(n));
const nomArt=t=>{const a=art(t.artistaId);return a?a.nombre:''};
const quien=t=>{const a=nomArt(t),c=cli(t.clienteId);if(a&&c&&nrm(a)!==nrm(c.nombre))return a+' · '+c.nombre;return a||(c?c.nombre:'Sin cliente')};
const temasTxt=t=>{const n=parseInt(t.temas,10)||0;return n>0?n+(n===1?' tema':' temas'):''};
const nomCli=t=>{const c=cli(t.clienteId);return c?c.nombre:'Sin cliente'};
const pagado=t=>r2((t.pagos||[]).reduce((a,p)=>a+num(p.monto),0));
const gastosT=t=>r2((t.gastos||[]).reduce((a,g)=>a+num(g.monto),0));
const reembT=t=>r2((t.gastos||[]).filter(g=>g.reemb).reduce((a,g)=>a+num(g.monto),0));
const propiosT=t=>r2(gastosT(t)-reembT(t));
const retT=t=>t.retencion?r2(num(t.total)*0.08):0;
const cobrarT=t=>r2(num(t.total)+reembT(t)-retT(t));
const saldo=t=>Math.max(0,r2(cobrarT(t)-pagado(t)));
const eqAcordado=t=>r2(((t.equipo)||[]).reduce((a,e)=>a+num(e.acordado),0));
const eqPagadoP=e=>r2((e.pagos||[]).reduce((a,p)=>a+num(p.monto),0));
const eqFalta=e=>Math.max(0,r2(num(e.acordado)-eqPagadoP(e)));
const gananciaT=t=>r2(num(t.total)-propiosT(t)-eqAcordado(t));
const cuenta=t=>!['cotizado','cancelado'].includes(t.estadoProd);
const baseEntrega=t=>t.entregadoEl||t.entrega||'';
const G=()=>S.aj.gracia??3;
function cuotas(t){
 const tot=num(t.total),cob=cobrarT(t);let L=[];
 if(t.modoPago==='plan'&&Array.isArray(t.cuotas)&&t.cuotas.length){
  L=t.cuotas.filter(c=>num(c.monto)>0).map(c=>({id:c.id,concepto:c.concepto||'Cuota',monto:num(c.monto),vence:c.fecha||'',tipo:/adelanto|separ/i.test(c.concepto||'')?'adelanto':'cuota'}));
 }else{const a=Math.min(num(t.adelantoReq),tot);if(a>0)L=[{id:'adelanto',concepto:'Adelanto del trabajo',monto:a,vence:t.fecha||'',tipo:'adelanto'}]}
 const usado=L.reduce((s,c)=>s+c.monto,0);
 const fin=Math.max(0,r2(cob-usado));
 if(fin>0||!L.length)L.push({id:'final',concepto:L.length?'Cancelación al entregar':'Pago al entregar',monto:fin,vence:baseEntrega(t),tipo:'entrega'});
 let pg=pagado(t);
 for(const c of L){const ap=Math.min(pg,c.monto);c.pagado=r2(ap);c.falta=r2(c.monto-ap);pg=r2(pg-ap)}
 return L;
}
const vencidas=t=>{const h=hoy();return cuotas(t).filter(c=>c.falta>0.004&&c.vence&&sumarDias(c.vence,G())<h)};
const montoVencido=t=>r2(vencidas(t).reduce((a,c)=>a+c.falta,0));
const proxima=t=>cuotas(t).find(c=>c.falta>0.004);
function estado(t){
 if(t.estadoProd==='cotizado')return'cotizado';
 if(t.estadoProd==='cancelado')return'cancelado';
 if(cobrarT(t)<=0)return'sinmonto';
 const nx=proxima(t);if(!nx)return'pagado';
 if(vencidas(t).length)return'vencido';
 if(nx.tipo==='adelanto')return'adelanto';
 if(nx.tipo==='entrega'&&(t.estadoProd==='entregado'||(nx.vence&&nx.vence<=hoy())))return'porcobrar';
 return'separado';
}
const activos=()=>S.trabajos.filter(t=>cuenta(t)&&saldo(t)>0.004);
function etiqueta(t){
 const e=estado(t),nx=proxima(t);
 if(e==='vencido'){const v=vencidas(t)[0];const d=dias(v.vence,hoy());return `Vencido · ${d} ${d===1?'día':'días'}`}
 if(e==='adelanto'){if(!nx.vence)return'Falta adelanto';return 'Falta adelanto · '+(t.modoPago==='plan'?'vence ':'rodaje ')+rel(nx.vence)}
 if(e==='porcobrar'){const lim=sumarDias(nx.vence||hoy(),G());const d=dias(hoy(),lim);const plazo=d<=0?'hoy':d===1?'mañana':`en ${d} días`;return t.estadoProd==='entregado'?`Entregado · cobrar ${plazo}`:`Entrega ${rel(nx.vence)} · cobrar`}
 if(e==='separado'){
  if(nx.tipo==='cuota')return nx.concepto+(nx.vence?' · '+rel(nx.vence):'');
  const conAd=cuotas(t).some(c=>c.tipo==='adelanto');
  return (conAd?'Separado':'Cobrar al entregar')+(nx.vence?' · entrega '+rel(nx.vence):'');
 }
 return {cotizado:'Cotización',cancelado:'Cancelado',sinmonto:'Sin monto',pagado:'Pagado ✓'}[e];
}
const chip=t=>`<span class="st ${estado(t)}">${esc(etiqueta(t))}</span>`;
const barra=(t,cls='')=>{const tot=cobrarT(t);const p=tot>0?Math.min(100,pagado(t)/tot*100):0;return `<div class="bar ${cls} ${estado(t)}"><i style="width:${p.toFixed(1)}%"></i></div>`};
function aCobrar(t){const e=estado(t),nx=proxima(t);if(e==='vencido')return montoVencido(t);if(nx&&(e==='adelanto'||nx.tipo==='cuota'))return nx.falta;return saldo(t)}
const allPagos=()=>S.trabajos.flatMap(t=>(t.pagos||[]).map(p=>({...p,t,moneda:t.moneda||'PEN'})));
function sumMon(list,fn){const o={};for(const x of list){const m=x.moneda||(x.t&&x.t.moneda)||'PEN';o[m]=(o[m]||0)+fn(x)}return o}
/* tipo de cambio: soles por cada unidad de la otra moneda (S.aj.tc = {USD:3.75, EUR:4.05}) */
const tcDe=mon=>!mon||mon==='PEN'?1:num((S.aj.tc||{})[mon])||0;
const aSoles=(v,mon,tc)=>r2(num(v)*(mon&&mon!=='PEN'?(num(tc)||tcDe(mon)):1));
const otrasMonedas=()=>[...new Set([...S.trabajos.map(t=>t.moneda||'PEN'),...S.gastosGen.map(g=>g.moneda||'PEN')])].filter(x=>x!=='PEN');
// Copia de un trabajo en soles: pagos con su propio tipo de cambio (si se guardó), lo demás con el de hoy
function enSoles(t){const mon=t.moneda||'PEN';if(mon==='PEN')return t;const k=tcDe(mon),c=v=>r2(num(v)*k);
 return {...t,moneda:'PEN',total:c(t.total),adelantoReq:c(t.adelantoReq),cuotas:(t.cuotas||[]).map(q=>({...q,monto:c(q.monto)})),
  pagos:(t.pagos||[]).map(p=>({...p,monto:aSoles(p.monto,mon,p.tc)})),gastos:(t.gastos||[]).map(g=>({...g,monto:c(g.monto)})),
  equipo:(t.equipo||[]).map(e=>({...e,acordado:c(e.acordado),pagos:(e.pagos||[]).map(p=>({...p,monto:c(p.monto)}))})),presupuesto:Object.fromEntries(Object.entries(t.presupuesto||{}).map(([kk,v])=>[kk,c(v)]))}}
const gEnSoles=g=>(g.moneda||'PEN')==='PEN'?g:{...g,monto:aSoles(g.monto,g.moneda),moneda:'PEN'};
async function actualizarTC(forzar){
 if(!forzar&&(S.aj.tcAuto===false||S.aj.tcFecha===hoy()||!otrasMonedas().length))return false;
 try{const r=await fetch('https://open.er-api.com/v6/latest/USD',{cache:'no-store'});const d=await r.json();const R=d&&d.rates;if(!R||!R.PEN)throw 0;
  const tc={...(S.aj.tc||{}),USD:r2(R.PEN*1000)/1000};if(R.EUR)tc.EUR=Math.round(R.PEN/R.EUR*1000)/1000;
  S.aj={...S.aj,tc,tcFecha:hoy()};guardarAj();return true}catch(e){return false}
}
function monto(o,real){const F=real?fmtR:fmt;const def=S.aj.moneda||'PEN';const ks=Object.keys(o).filter(k=>Math.abs(o[k])>0.004);if(!ks.length)return{p:F(0,def),o:''};ks.sort((a,b)=>(b===def)-(a===def));const otro=ks.slice(1).map(k=>'+ '+F(o[k],k)).join('  ');const conv=ks.length>1&&ks.every(k=>tcDe(k)>0)?'  ≈ '+F(r2(ks.reduce((a,k)=>a+o[k]*tcDe(k),0)),'PEN')+' en total':'';return{p:F(o[ks[0]],ks[0]),o:otro+conv}}
const equipo=()=>{const s=new Set(String(S.aj.equipo||'').split(',').map(x=>x.trim()).filter(Boolean));S.trabajos.forEach(t=>(t.gastos||[]).forEach(g=>g.por&&s.add(g.por)));return [...s]};

const okMail=s=>/^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]+$/.test(s);
const lista=s=>[...new Set(String(s||'').split(/[,;\n]+/).map(x=>x.trim()).filter(Boolean))];
const etiquetasTodas=()=>{const o={};S.trabajos.forEach(t=>(t.etiquetas||[]).forEach(e=>o[e]=(o[e]||0)+1));return Object.keys(o).sort((a,b)=>o[b]-o[a]||a.localeCompare(b,'es'))};
const invitadosFrec=()=>{const s=new Set(lista(S.aj.invFrec).filter(okMail));S.trabajos.forEach(t=>(t.invitados||[]).forEach(e=>s.add(e)));return [...s]};
const invitadosDe=t=>{const c=cli(t.clienteId);const l=(t.invitados||[]).filter(okMail);if(t.invCliente&&c&&okMail(c.email||''))l.push(c.email.trim());return [...new Set(l.map(x=>x.toLowerCase()))]};
const tagsHtml=t=>(t.etiquetas||[]).length?`<span class="tags">${t.etiquetas.map(e=>`<span class="tag">${esc(e)}</span>`).join('')}</span>`:'';
const horario=t=>t.horaIni?t.horaIni+(t.horaFin?'–'+t.horaFin:''):'';
const rango=(a,b)=>{const out=[];if(!a)return out;let d=a;const fin=b&&b>a?b:a;while(d<=fin&&out.length<62){out.push(d);d=sumarDias(d,1)}return out};
const bloques=t=>t.fecha?[{id:'d1',fecha:t.fecha,hasta:t.fechaFin||'',horaIni:t.horaIni||'',horaFin:t.horaFin||''},...(t.diasExtra||[]).filter(d=>d&&d.fecha)]:[];
const diasRodaje=t=>bloques(t).flatMap(b=>{const r=rango(b.fecha,b.hasta);return r.map((f,k)=>({id:k?b.id+'@'+f:b.id,fecha:f,horaIni:b.horaIni,horaFin:b.horaFin,bIni:r[0],bFin:r[r.length-1]}))}).sort((a,b)=>a.fecha.localeCompare(b.fecha));
const horaDia=d=>{if(d.bFin>d.bIni&&d.horaIni)return d.fecha===d.bIni?'desde las '+d.horaIni:d.fecha===d.bFin?(d.horaFin?'hasta las '+d.horaFin:'último día'):'todo el día';return horario(d)};
const fr=(a,b)=>b&&b>a?(a.slice(0,7)===b.slice(0,7)?(+a.slice(8))+'–'+fd(b):fd(a).replace(/ \d{4}$/,'')+' – '+fd(b)):fd(a);
const fcorta=f=>fd(f).replace(/ \d{4}$/,'');
const txtBloque=b=>{const multi=b.hasta&&b.hasta>b.fecha;if(multi&&b.horaIni)return fcorta(b.fecha)+' '+b.horaIni+' → '+fcorta(b.hasta)+(b.horaFin?' '+b.horaFin:'');return fr(b.fecha,b.hasta)+(horario(b)?' · '+horario(b):'')};
const textoDias=(t,sep)=>bloques(t).sort((a,b)=>a.fecha.localeCompare(b.fecha)).map(txtBloque).join(sep);
const nDias=t=>diasRodaje(t).length;

/* ---------- Google Calendar ---------- */
const CAL='Google Calendar';let mcpNs=null;
const sumHora=(h,n)=>{const [a,b]=h.split(':').map(Number);const m=Math.min(23*60+59,a*60+b+n*60);return String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0')};
function busca(p,keys,d=0){if(!p||d>4)return'';if(typeof p==='string'){if(keys.includes('id')){const m=p.match(/(?:event ?id|"id")\W{0,4}([A-Za-z0-9_]{8,})/i);return m?m[1]:''}const m=p.match(/https:\/\/www\.google\.com\/calendar\/event\?eid=[A-Za-z0-9_=-]+/);return m?m[0]:''}if(typeof p!=='object')return'';for(const k of keys)if(typeof p[k]==='string'&&p[k])return p[k];for(const v of Object.values(p)){if(v&&typeof v==='object'){const r=busca(v,keys,d+1);if(r)return r}}return''}
const evId=r=>busca(r&&r.payload,['id','eventId'])||busca(r&&r.content&&r.content[0]&&r.content[0].text,['id']);
const evLink=r=>{const l=busca(r&&r.payload,['htmlLink','link','url']);return /^https:\/\/(www\.)?google\.com\/calendar\//.test(l)?l:''};
function calMsg(e){switch(e&&e.code){
 case'server_not_connected':return'Para usar el calendario, conecta Google Calendar en Ajustes.';
 case'needs_reauth':return'Vuelve a conectar Google Calendar en Ajustes.';
 case'approval_required':case'not_in_manifest':case'consent_required':return'Falta darle permiso a la app para usar tu Google Calendar. Toca “Sincronizar calendario” y acepta el aviso.';
 case'network':return'Sin conexión: el calendario se actualizará solo cuando vuelva la señal.';
 case'blocked_by_policy':return'Tu organización no permite usar Google Calendar desde aquí.';
 case'selection_required':return'Elige qué cuenta de Google Calendar usar en el aviso de Claude y vuelve a sincronizar.';
 default:return'No se pudo actualizar Google Calendar. Revisa tu conexión y toca “Sincronizar calendario”.'}}
function descEvento(t){return [t.tipo&&'Tipo: '+t.tipo,nomArt(t)&&'Artista: '+nomArt(t),temasTxt(t)&&'Temas: '+temasTxt(t)+(t.temasNom?' ('+t.temasNom+')':''),(t.etiquetas||[]).length&&'Etiquetas: '+t.etiquetas.join(', '),t.notas&&'\n'+t.notas,'\n— Registrado en Cuentas de producción'].filter(Boolean).join('\n')}
const conArt=t=>{const a=nomArt(t);return a&&nrm(a)!==nrm(t.titulo)?' · '+a:''};
function tiempoBloque(b){const fin=b.hasta&&b.hasta>b.fecha?b.hasta:b.fecha;
 if(b.horaIni){let ef,eh;if(b.horaFin){eh=b.horaFin;ef=fin===b.fecha&&b.horaFin<=b.horaIni?sumarDias(fin,1):fin}else if(fin>b.fecha){ef=sumarDias(fin,1);eh='00:00'}else{ef=fin;eh=sumHora(b.horaIni,2)}return{allDay:false,startTime:`${b.fecha}T${b.horaIni}:00`,endTime:`${ef}T${eh}:00`}}
 return{allDay:true,startTime:`${b.fecha}T00:00:00`,endTime:`${sumarDias(fin,1)}T00:00:00`}}
function txtEvento(b){const x=tiempoBloque(b),ini=x.startTime.slice(0,10),fin=x.endTime.slice(0,10);if(x.allDay){const u=sumarDias(fin,-1);return u>ini?`un solo evento de todo el día del ${fcorta(ini)} al ${fcorta(u)}`:`un evento de todo el día el ${fcorta(ini)}`}const hi=x.startTime.slice(11,16),hf=x.endTime.slice(11,16);return fin>ini?`un solo evento seguido: empieza el ${fcorta(ini)} a las ${hi} y termina el ${fcorta(fin)} a las ${hf}`:`un evento el ${fcorta(ini)} de ${hi} a ${hf}`}
function evTrabajo(t,b){
 const bs=bloques(t).sort((x,y)=>x.fecha.localeCompare(y.fecha));b=b||bs.find(x=>x.id==='d1')||{fecha:t.fecha};const i=bs.findIndex(x=>x.id===b.id)+1;
 const ev={summary:(t.estadoProd==='cotizado'?'Por confirmar: ':'')+t.titulo+conArt(t)+(bs.length>1?` (rodaje ${i} de ${bs.length})`:''),description:descEvento(t)};if(colT(t))ev.colorId=String(colT(t));if(t.lugar||(t.cal&&t.cal.ev))ev.location=t.lugar||'';
 return Object.assign(ev,tiempoBloque(b));
}
const evEntrega=t=>{const e={summary:'Entrega: '+t.titulo+conArt(t),description:descEvento(t),allDay:true,startTime:`${t.entrega}T00:00:00`,endTime:`${sumarDias(t.entrega,1)}T00:00:00`};if(S.aj.colEntrega)e.colorId=String(S.aj.colEntrega);return e};
const enCurso={};
const fueraDeCal=()=>mcpNs?S.trabajos.filter(t=>t.cal&&(t.cal.ev||t.cal.evE)&&t.estadoProd!=='cancelado'&&(t.cal.cid||'')!==(S.aj.calId||'')):[];
let moviendo=false;
async function moverTodos(){if(moviendo)return;const l=fueraDeCal();if(!l.length){toast('Todos tus trabajos ya están en '+(S.aj.calNom||'tu calendario principal')+'.');return}moviendo=true;render();toast(`Moviendo ${l.length} ${l.length===1?'trabajo':'trabajos'} a ${S.aj.calNom||'tu calendario principal'}…`);for(const t of l){await syncCal(t.id);await espera(400)}moviendo=false;render();const q=fueraDeCal().length;toast(q?'Algunos trabajos no se pudieron mover. Revisa tu conexión y vuelve a intentarlo.':'Listo: tus trabajos están en '+(S.aj.calNom||'tu calendario principal')+'.')}
let calAvisoRed=0;
window.CP_reintentarCal=()=>{calAvisoRed=0;if(!mcpNs)return;borrarCalPendientes();S.trabajos.filter(t=>t.cal&&t.cal.err&&(t.cal.on||t.cal.ev||t.cal.evE)).forEach(t=>syncCal(t.id))};
async function syncCal(id){
 const t0=S.trabajos.find(x=>x.id===id);if(!t0||!mcpNs||enCurso[id])return;
 if(!(t0.cal&&(t0.cal.on||t0.cal.ev||t0.cal.evE||Object.keys(t0.cal.evx||{}).length)))return;
 enCurso[id]=1;render();
 const t=JSON.parse(JSON.stringify(t0)),cal={...t.cal},notif=cal.notif===false?'NONE':'ALL',cid=S.aj.calId||'',call=(tool,inp,c=cid)=>mcpNs.callTool(CAL,tool,c?{...inp,calendarId:c}:inp,{cache:false});
 const vivo=t.estadoProd!=='cancelado';let prevInv=(t.cal&&t.cal.inv)||[];
 try{
  if((cal.cid||'')!==cid&&(cal.ev||cal.evE||Object.keys(cal.evx||{}).length)){const viejo=cal.cid||'';
   for(const ev of [cal.ev,cal.evE,...Object.values(cal.evx||{})])if(ev&&ev!=='?')await call('delete_event',{eventId:ev,notificationLevel:'NONE'},viejo).catch(e=>{if(!(e&&e.code==='tool_error'))throw e});
   cal.ev='';cal.evE='';cal.evx={};cal.link='';cal.inv=[];cal.sinId=false;prevInv=[]}
  cal.cid=cid;
  if(cal.on&&vivo&&t.fecha){
   const inv=invitadosDe(t),ev=evTrabajo(t);let hecho=false;
   if(cal.ev){const prev=cal.inv||[];try{await call('update_event',{eventId:cal.ev,...ev,addedAttendees:inv.filter(e=>!prev.includes(e)).map(email=>({email})),removedAttendeeEmails:prev.filter(e=>!inv.includes(e)),notificationLevel:notif});hecho=true}catch(e){if(e&&e.code==='tool_error')cal.ev='';else throw e}}
   if(!hecho&&!cal.sinId){const r=await call('create_event',{...ev,attendees:inv.map(email=>({email})),notificationLevel:notif});cal.ev=evId(r);cal.link=evLink(r)||cal.link||'';if(!cal.ev)cal.sinId=true}
   cal.inv=inv;
  }else if(cal.ev){await call('delete_event',{eventId:cal.ev,notificationLevel:notif}).catch(e=>{if(!(e&&e.code==='tool_error'))throw e});cal.ev='';cal.link='';cal.inv=[];cal.sinId=false}
  {const inv=invitadosDe(t),ex=(cal.on&&vivo&&t.fecha)?bloques(t).filter(d=>d.id!=='d1'):[];cal.evx={...(cal.evx||{})};
   for(const d of ex){const ev=evTrabajo(t,d);let ok=false;
    if(cal.evx[d.id]&&cal.evx[d.id]!=='?'){try{await call('update_event',{eventId:cal.evx[d.id],...ev,addedAttendees:inv.filter(e=>!prevInv.includes(e)).map(email=>({email})),removedAttendeeEmails:prevInv.filter(e=>!inv.includes(e)),notificationLevel:notif});ok=true}catch(e){if(e&&e.code==='tool_error')delete cal.evx[d.id];else throw e}}
    if(!ok&&!cal.evx[d.id]){const r=await call('create_event',{...ev,attendees:inv.map(email=>({email})),notificationLevel:notif});cal.evx[d.id]=evId(r)||'?'}}
   for(const k of Object.keys(cal.evx)){if(!ex.find(d=>d.id===k)){if(cal.evx[k]&&cal.evx[k]!=='?')await call('delete_event',{eventId:cal.evx[k],notificationLevel:notif}).catch(e=>{if(!(e&&e.code==='tool_error'))throw e});delete cal.evx[k]}}}
  if(cal.on&&cal.entrega&&vivo&&t.entrega){
   let hecho=false;const ev=evEntrega(t);
   if(cal.evE){try{await call('update_event',{eventId:cal.evE,...ev,notificationLevel:'NONE'});hecho=true}catch(e){if(e&&e.code==='tool_error')cal.evE='';else throw e}}
   if(!hecho){const r=await call('create_event',{...ev,notificationLevel:'NONE'});cal.evE=evId(r)}
  }else if(cal.evE){await call('delete_event',{eventId:cal.evE,notificationLevel:'NONE'}).catch(e=>{if(!(e&&e.code==='tool_error'))throw e});cal.evE=''}
  cal.err='';cal.ok=Date.now();
 }catch(e){if(!navigator.onLine)e={code:'network'};cal.err=calMsg(e);if(!(e&&e.code==='network'&&calAvisoRed))toast(cal.err);if(e&&e.code==='network')calAvisoRed=1}
 delete enCurso[id];
 await mutT(id,n=>{n.cal=cal});
}
// Eventos por borrar del calendario: si no hay señal al eliminar un trabajo, se guardan y se borran al volver la conexión.
const BORRAR_CAL='cp-cal-borrar';
const leerBorrarCal=()=>{try{return JSON.parse(localStorage.getItem(BORRAR_CAL)||'[]')}catch(e){return[]}};
const guardarBorrarCal=l=>{try{l.length?localStorage.setItem(BORRAR_CAL,JSON.stringify(l)):localStorage.removeItem(BORRAR_CAL)}catch(e){}};
function borrarEvCal(x){
 const inp=x.cid?{eventId:x.ev,notificationLevel:x.nl,calendarId:x.cid}:{eventId:x.ev,notificationLevel:x.nl};
 const quitar=()=>guardarBorrarCal(leerBorrarCal().filter(y=>y.ev!==x.ev));
 if(!mcpNs||!navigator.onLine){if(!leerBorrarCal().some(y=>y.ev===x.ev))guardarBorrarCal([...leerBorrarCal(),x]);return Promise.resolve()}
 return mcpNs.callTool(CAL,'delete_event',inp,{cache:false}).then(quitar,e=>{
  if(e&&(e.code==='tool_error'||e.code==='server_not_connected')){quitar();return}
  if(!leerBorrarCal().some(y=>y.ev===x.ev))guardarBorrarCal([...leerBorrarCal(),x]);
  if(navigator.onLine&&!(e&&e.code==='network'))toast(calMsg(e))});
}
function borrarCalPendientes(){leerBorrarCal().forEach(borrarEvCal)}
function quitarDeCal(t){if(!t.cal)return;const notif=t.cal.notif===false?'NONE':'ALL',cid=t.cal.cid||'';[[t.cal.ev,notif],[t.cal.evE,'NONE'],...Object.values(t.cal.evx||{}).filter(v=>v&&v!=='?').map(v=>[v,notif])].forEach(([ev,nl])=>{if(ev&&ev!=='?')borrarEvCal({ev,nl,cid})})}

/* ---------- WhatsApp y textos ---------- */
const waNum=s=>{const d=String(s||'').replace(/\D/g,'');if(!d)return'';return d.length===9&&d[0]==='9'?'51'+d:d};
const primerNombre=c=>c?String(c.nombre||'').trim().split(/\s+/)[0]:'';
const fill=(tpl,o)=>String(tpl||'').replace(/\{(\w+)\}/g,(m,k)=>k in o?o[k]:m).replace(/\(\s*\)/g,'').replace(/[ \t]{2,}/g,' ').trim();
function msgT(t){
 const c=cli(t.clienteId),nx=proxima(t);if(!nx)return'';
 const tpl=nx.tipo==='adelanto'?S.aj.tplAdelanto:nx.tipo==='cuota'?S.aj.tplCuota:S.aj.tplCancel;
 const m=nx.tipo==='entrega'?saldo(t):nx.falta;
 return fill(tpl,{cliente:primerNombre(c),trabajo:t.titulo||'',monto:fmtR(m,t.moneda),saldo:fmtR(saldo(t),t.moneda),fecha:t.fecha?fd(t.fecha):'',entrega:baseEntrega(t)?fd(baseEntrega(t)):'',vence:nx.vence?fd(nx.vence):'',cuota:String(nx.concepto).toLowerCase(),negocio:S.aj.negocio||''});
}
const waT=t=>{const c=cli(t.clienteId);return `https://wa.me/${waNum(c&&c.telefono)}?text=${encodeURIComponent(msgT(t))}`};
function waC(c){const ts=activos().filter(t=>t.clienteId===c.id);const tot=monto(sumMon(ts,saldo),true);const l=ts.map(t=>`• ${t.titulo}: ${fmtR(saldo(t),t.moneda)}`).join('\n');return `https://wa.me/${waNum(c.telefono)}?text=${encodeURIComponent(`Hola ${primerNombre(c)}, ¿cómo estás? Te comparto el resumen de saldos pendientes:\n${l}\nTotal: ${tot.p}${tot.o?' '+tot.o:''}\nQuedo atento. ¡Gracias!`)}`}
function textoT(t){
 const m=t.moneda,L=['ESTADO DE CUENTA'];if(S.aj.negocio)L.push(S.aj.negocio);L.push('');
 L.push('Cliente: '+nomCli(t));if(nomArt(t))L.push('Artista: '+nomArt(t));L.push('Trabajo: '+t.titulo);if(temasTxt(t))L.push('Temas: '+temasTxt(t)+(t.temasNom?' ('+t.temasNom+')':''));if(nDias(t)>1)L.push('Rodaje ('+nDias(t)+' días): '+textoDias(t,'; '));else if(t.fecha)L.push('Fecha del trabajo: '+fd(t.fecha));if(baseEntrega(t))L.push((t.entregadoEl?'Entregado: ':'Entrega: ')+fd(baseEntrega(t)));
 L.push('','Monto del trabajo: '+fmtR(num(t.total),m));if(t.retencion)L.push('Retención 4ta categoría (8 %): -'+fmtR(retT(t),m),'Neto a pagar: '+fmtR(r2(num(t.total)-retT(t)),m));
 const rb=(t.gastos||[]).filter(g=>g.reemb);if(rb.length){L.push('Gastos a reembolsar:');rb.forEach(g=>L.push(`• ${g.cat||'Gasto'}${g.det?' – '+g.det:''}: ${fmtR(num(g.monto),m)}`));L.push('Total a pagar: '+fmtR(cobrarT(t),m))}
 L.push('','Forma de pago:');cuotas(t).forEach(c=>L.push(`• ${c.concepto}: ${fmtR(c.monto,m)} — ${c.falta<=0.004?'Pagado':'Pendiente '+fmtR(c.falta,m)+(c.vence?' (vence '+fd(c.vence)+')':'')}`));
 const ps=(t.pagos||[]).slice().sort((a,b)=>(a.fecha||'').localeCompare(b.fecha||''));
 if(ps.length){L.push('','Pagos recibidos:');ps.forEach(p=>L.push(`• ${fd(p.fecha)} · ${p.metodo||''} · ${fmtR(num(p.monto),m)}`));L.push('Total cobrado: '+fmtR(pagado(t),m))}
 L.push('','SALDO PENDIENTE: '+fmtR(saldo(t),m));
 return L.join('\n');
}
function textoC(c){
 const ts=S.trabajos.filter(t=>t.clienteId===c.id&&cuenta(t)).sort((a,b)=>(a.fecha||'').localeCompare(b.fecha||''));
 const L=['ESTADO DE CUENTA'];if(S.aj.negocio)L.push(S.aj.negocio);L.push('','Cliente: '+c.nombre,'Fecha: '+fd(hoy()),'');
 ts.forEach(t=>L.push(`• ${t.titulo}${t.fecha?' ('+fd(t.fecha)+')':''}\n  Total ${fmtR(cobrarT(t),t.moneda)} · Cobrado ${fmtR(pagado(t),t.moneda)} · Saldo ${fmtR(saldo(t),t.moneda)}`));
 const tot=monto(sumMon(ts,saldo),true);L.push('','SALDO TOTAL PENDIENTE: '+tot.p+(tot.o?' '+tot.o:''));
 return L.join('\n');
}

/* ---------- datos ---------- */
let db=null;const LSK='cuentas-produccion-v1';const colas={};
const guardarLocal=()=>{try{localStorage.setItem(LSK,JSON.stringify({gastosGen:S.gastosGen,clientes:S.clientes,artistas:S.artistas,trabajos:S.trabajos,aj:S.aj}))}catch(e){}};
const cargarLocal=()=>{try{const d=JSON.parse(localStorage.getItem(LSK)||'null');if(d){S.clientes=d.clientes||[];S.artistas=d.artistas||[];S.gastosGen=d.gastosGen||[];S.trabajos=(d.trabajos||[]).map(normT);S.aj=normAj(d.aj)}}catch(e){}};
const encolar=(k,fn)=>{const p=(colas[k]||Promise.resolve()).catch(()=>{}).then(fn);colas[k]=p;return p};
function fallo(e){const c=e&&e.code;if(c==='invalid_argument')toast('No tienes permiso para guardar cambios en estas cuentas.');else if(c==='quota_exceeded')toast('Se llenó el espacio de la base de datos.');else toast('No se pudo guardar. Revisa tu conexión e inténtalo otra vez.')}
function guardar(col,obj){
 const o=JSON.parse(JSON.stringify(obj));const arr=S[col];const i=arr.findIndex(x=>x.id===o.id);
 if(i>=0)arr[i]=o;else arr.push(o);render();
 if(!db){guardarLocal();return Promise.resolve()}
 return encolar(col+'/'+o.id,()=>db.collection(col).doc(o.id).set(o)).catch(e=>{fallo(e);throw e});
}
function borrar(col,id){
 S[col]=S[col].filter(x=>x.id!==id);render();
 if(!db){guardarLocal();return Promise.resolve()}
 return encolar(col+'/'+id,()=>db.collection(col).doc(id).delete()).catch(e=>{fallo(e);throw e});
}
function guardarAj(){render();if(!db){guardarLocal();return Promise.resolve()}return encolar('aj',()=>db.doc('ajustes/general').set({...S.aj})).catch(fallo)}
function mutT(id,fn){const t=S.trabajos.find(x=>x.id===id);if(!t)return Promise.resolve();const n=JSON.parse(JSON.stringify(t));fn(n);n.mod=Date.now();return guardar('trabajos',n).catch(()=>{})}
/* comprobantes: un documento por foto, aparte del trabajo */
function guardarFoto(gid,tid,img){
 if(!db){try{localStorage.setItem('cp:'+gid,img);return Promise.resolve()}catch(e){toast('No hay espacio en este navegador para la foto.');return Promise.reject(e)}}
 return encolar('comprobantes/'+gid,()=>db.collection('comprobantes').doc(gid).set({img,trabajoId:tid,fecha:hoy()})).catch(e=>{fallo(e);throw e});
}
function borrarFoto(gid){if(!db){try{localStorage.removeItem('cp:'+gid)}catch(e){}return Promise.resolve()}return encolar('comprobantes/'+gid,()=>db.collection('comprobantes').doc(gid).delete()).catch(()=>{})}
async function leerFoto(gid){if(!db){try{return localStorage.getItem('cp:'+gid)}catch(e){return null}}const s=await db.doc('comprobantes/'+gid).get();return s.exists?(s.data()||{}).img:null}
function comprimir(file,mx=1100,cuadrado=false){return new Promise((res,rej)=>{const u=URL.createObjectURL(file);const im=new Image();im.onload=()=>{if(cuadrado){const lado=Math.min(im.naturalWidth,im.naturalHeight),cv=document.createElement('canvas');cv.width=cv.height=mx;cv.getContext('2d').drawImage(im,(im.naturalWidth-lado)/2,(im.naturalHeight-lado)/2,lado,lado,0,0,mx,mx);URL.revokeObjectURL(u);return res(cv.toDataURL('image/jpeg',.72))}const w=im.naturalWidth,h=im.naturalHeight,sc=Math.min(1,mx/Math.max(w,h));const cv=document.createElement('canvas');const draw=(s,q)=>{cv.width=Math.max(1,Math.round(w*s));cv.height=Math.max(1,Math.round(h*s));const cx=cv.getContext('2d');cx.fillStyle='#fff';cx.fillRect(0,0,cv.width,cv.height);cx.drawImage(im,0,0,cv.width,cv.height);return cv.toDataURL('image/jpeg',q)};let d=draw(sc,.62);if(d.length>200000)d=draw(sc*.75,.5);if(d.length>200000)d=draw(sc*.55,.45);URL.revokeObjectURL(u);res(d)};im.onerror=()=>{URL.revokeObjectURL(u);rej(new Error('img'))};im.src=u})}

/* ---------- contactos ---------- */
function parseVcf(txt){
 const un=String(txt||'').replace(/\r\n?/g,'\n').replace(/\n[ \t]/g,'');const out=[];
 for(const card of un.split(/BEGIN:VCARD/i).slice(1)){
  const body=card.split(/END:VCARD/i)[0],o={nombre:'',telefono:'',email:'',empresa:''},tels=[];let nn='';
  for(const line of body.split('\n')){const i=line.indexOf(':');if(i<0)continue;const key=line.slice(0,i).replace(/^item\d+\./i,''),name=key.split(';')[0].toUpperCase();
   const val=line.slice(i+1).replace(/\\n/gi,' ').replace(/\\([,;\\])/g,'$1').trim();
   if(name==='FN')o.nombre=val;else if(name==='N'){const p=val.split(';');nn=[p[1],p[2],p[0]].filter(Boolean).join(' ').trim()}
   else if(name==='TEL')tels.push({v:val.replace(/^tel:/i,''),cel:/CELL|MOBILE|IPHONE/i.test(key)});
   else if(name==='EMAIL'&&!o.email)o.email=val;else if(name==='ORG'&&!o.empresa)o.empresa=val.split(';')[0].trim()}
  o.nombre=(o.nombre||nn||o.empresa).slice(0,120);const tl=tels.find(x=>x.cel)||tels[0];if(tl)o.telefono=tl.v.slice(0,40);
  if(o.nombre)out.push(o);
 }
 return out;
}
const ayudaVcf=`<p class="hint">Elige un archivo de contacto (.vcf). En el iPhone: app Contactos → abre el contacto → Compartir contacto → Guardar en Archivos. En la Mac: app Contactos → selecciona uno o varios → Archivo → Exportar → Exportar vCard.</p>`;
function pickVcf(multi,cb){const inp=$('#vcf');inp.multiple=!!multi;inp.value='';inp.onchange=async()=>{let all=[];for(const f of [...inp.files]){try{all=all.concat(parseVcf(await f.text()))}catch(e){}}if(!all.length){toast('No se encontraron contactos en ese archivo.');return}cb(all)};inp.click()}
function desdeContactos(cb,ayuda){
 const cp=navigator.contacts;
 if(cp&&typeof cp.select==='function'&&!S.noPicker){cp.select(['name','tel','email'],{multiple:false}).then(r=>{const l=(r||[]).map(c=>({nombre:((c.name||[])[0]||'').trim(),telefono:(c.tel||[])[0]||'',email:(c.email||[])[0]||''})).filter(c=>c.nombre);if(l.length)cb(l)}).catch(()=>{S.noPicker=true;ayuda&&ayuda();toast('Aquí no se pueden abrir tus contactos directamente. Toca otra vez para elegir un archivo de contacto.')});return}
 ayuda&&ayuda();pickVcf(false,cb);
}
const dupe=(arr,c)=>{const tel=String(c.telefono||'').replace(/\D/g,'').slice(-9);return arr.some(x=>nrm(x.nombre)===nrm(c.nombre)||(tel.length>=7&&String(x.telefono||'').replace(/\D/g,'').slice(-9)===tel))};
function importar(){
 abrir(cab('Importar contactos')+`<p>Agrega clientes o artistas desde los contactos de tu iPhone o tu Mac.</p>${ayudaVcf}<div class="acts"><button class="btn pri" type="button" id="selv">Elegir archivo de contactos</button></div>`,{mount:s=>{
  s.querySelector('#selv').addEventListener('click',()=>pickVcf(true,l=>listaImport(l,S.vc==='artistas'?'artistas':'clientes')));
 }});
}
function listaImport(l,col){
 const pinta=()=>{const arr=S[col];return cab('Importar contactos',l.length+(l.length===1?' contacto encontrado':' contactos encontrados'))+`
  <div class="seg"><label><input type="radio" name="dest" value="clientes"${col==='clientes'?' checked':''}><span>Como clientes</span></label><label><input type="radio" name="dest" value="artistas"${col==='artistas'?' checked':''}><span>Como artistas</span></label></div>
  <div class="imp">${l.map((c,i)=>{const d=dupe(arr,c);return `<label class="chk"><input type="checkbox" data-i="${i}"${d?'':' checked'}><span>${esc(c.nombre)}<small>${esc([c.telefono,c.email].filter(Boolean).join(' · '))}</small></span>${d?'<span class="tag">Ya está en tu lista</span>':''}</label>`}).join('')}</div>
  <div class="acts"><button class="btn pri" type="button" id="impok">Agregar seleccionados</button><button class="btn" type="button" data-a="cerrar">Cancelar</button></div>`};
 const montar=s=>{s.querySelectorAll('input[name=dest]').forEach(r=>r.addEventListener('change',()=>{col=r.value;abrir(pinta(),{mount:montar})}));
  s.querySelector('#impok').addEventListener('click',async()=>{const sel=[...s.querySelectorAll('.imp input:checked')].map(x=>l[+x.dataset.i]);if(!sel.length){toast('No elegiste ningún contacto.');return}
   cerrar();toast(`Agregando ${sel.length} ${col==='artistas'?'artistas':'clientes'}…`);
   for(const c of sel){const o=col==='artistas'?{id:uid(),nombre:c.nombre,genero:'',telefono:c.telefono||'',email:c.email||'',redes:'',notas:'',creado:Date.now()}:{id:uid(),nombre:c.nombre,empresa:c.empresa||'',telefono:c.telefono||'',email:c.email||'',doc:'',notas:'',creado:Date.now()};await guardar(col,o).catch(()=>{});if(db)await espera(160)}
   S.vc=col;if(location.hash!=='#clientes')location.hash='#clientes';else render();toast(`Listo: ${sel.length} ${col==='artistas'?(sel.length===1?'artista agregado':'artistas agregados'):(sel.length===1?'cliente agregado':'clientes agregados')}.`)});
 };
 abrir(pinta(),{mount:montar});
}

/* ---------- íconos y avatares ---------- */
const IC={eye:'<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',eyeoff:'<path d="M3 3l18 18M10.6 5.1A10 10 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3.2 4.1M6.6 6.6A17 17 0 0 0 2 12s3.6 7 10 7a9.8 9.8 0 0 0 5.4-1.6M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',cash:'<rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6.5 9.5v.01M17.5 14.5v.01"/>',wa:'<path d="M3 20l1.3-3.9A8 8 0 1 1 7.7 19.3L3 20"/><path d="M9 10a.5.5 0 0 0 1 0v-1a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1"/>',cal:'<rect x="4" y="5" width="16" height="16" rx="2"/><path d="M16 3v4M8 3v4M4 11h16"/>',copy:'<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',edit:'<path d="M4 20h4L18.5 9.5a2.8 2.8 0 0 0-4-4L4 16v4M13.5 6.5l4 4"/>',check:'<path d="M5 12l5 5L20 7"/>',plus:'<path d="M12 5v14M5 12h14"/>',film:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 4v16M17 4v16M3 8h4M3 12h4M3 16h4M17 8h4M17 12h4M17 16h4"/>',gift:'<path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16l-3-2-2 2-2-2-2 2-2-2-3 2M9 7h6M9 11h6M9 15h4"/>',list:'<path d="M9 6h11M9 12h11M9 18h11M5 6v.01M5 12v.01M5 18v.01"/>',truck:'<circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/><path d="M5 17H3V6a1 1 0 0 1 1-1h9v12M9 17h6M13 9h5l3 4v4h-2"/>',bus:'<rect x="5" y="3" width="14" height="15" rx="3"/><path d="M5 11h14M8 21v-3M16 21v-3M8.5 14.5v.01M15.5 14.5v.01"/>',bed:'<path d="M3 18V7M3 14h18v4M21 14v-2a3 3 0 0 0-3-3h-7v5"/><circle cx="7" cy="11" r="2"/>',fork:'<path d="M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10M16 3c-2 0-3 3-3 6s1 4 3 4v8"/>',cam:'<rect x="2" y="7" width="15" height="11" rx="2"/><path d="M17 11l5-3v9l-5-3"/>',user:'<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/>',pin:'<path d="M12 21s7-6.5 7-12a7 7 0 0 0-14 0c0 5.5 7 12 7 12z"/><circle cx="12" cy="9" r="2.5"/>',music:'<path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>',dots:'<path d="M5 12v.01M12 12v.01M19 12v.01"/>',card:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M7 15h4"/>',del:'<path d="M9 5h11v14H9l-6-7z"/><path d="M12 9l5 6M17 9l-5 6"/>',calk:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4M8 14h.01M12 14h.01M16 14h.01M8 17h.01M12 17h.01"/>',coin:'<circle cx="12" cy="12" r="9"/><path d="M14.8 9a2 2 0 0 0-1.8-1h-2a2 2 0 0 0 0 4h2a2 2 0 0 1 0 4h-2a2 2 0 0 1-1.8-1M12 6v2M12 16v2"/>'};
const ic=n=>`<svg class="i" viewBox="0 0 24 24" aria-hidden="true">${IC[n]||''}</svg>`;
const iniciales=n=>String(n||'?').trim().split(/\s+/).filter(w=>/[\p{L}\p{N}]/u.test(w)).slice(0,2).map(w=>w.match(/[\p{L}\p{N}]/u)[0]).join('').toUpperCase()||'?';
const avatar=(nombre,foto,cls='')=>`<span class="av ${cls}" aria-hidden="true">${foto&&/^data:image\//.test(foto)?`<img src="${foto}" alt="">`:esc(iniciales(nombre))}</span>`;
const avT=t=>{const a=art(t.artistaId),c=cli(t.clienteId);const e=estado(t);return avatar(a?a.nombre:(c?c.nombre:t.titulo),a&&a.foto,'e-'+e+(e==='vencido'?' v':''))};

/* ---------- hoja ---------- */
const ov=$('#ov'),sh=$('#sheet');let live=null,ultima='';
function abrir(html,opt={}){sh.innerHTML=html;ultima=html;live=opt.live||null;ov.hidden=false;document.body.classList.add('lock');sh.scrollTop=0;opt.mount&&opt.mount(sh)}
function cerrar(){ov.hidden=true;sh.innerHTML='';live=null;document.body.classList.remove('lock')}
ov.addEventListener('click',e=>{if(e.target===ov)cerrar()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!ov.hidden)cerrar()});
let tt;function toast(m){const el=$('#toast');el.textContent=m;el.hidden=false;clearTimeout(tt);tt=setTimeout(()=>{el.hidden=true},3400)}
function copiar(txt,ok){
 const fall=()=>abrir(`<div class="shd"><h2>Copia este texto</h2><button class="x" data-a="cerrar" aria-label="Cerrar">×</button></div><p class="hint">Mantén presionado el texto, elige “Seleccionar todo” y luego “Copiar”.</p><textarea class="cp" readonly>${esc(txt)}</textarea>`);
 try{navigator.clipboard.writeText(txt).then(()=>toast(ok||'Copiado. Ya puedes pegarlo en WhatsApp o en un correo.'),fall)}catch(e){fall()}
}
const cab=(t,eb,av)=>`<div class="shd">${av||''}<div class="shm">${eb?`<p class="eyebrow">${eb}</p>`:''}<h2>${t}</h2></div><button class="x" type="button" data-a="cerrar" aria-label="Cerrar">×</button></div>`;
const opts=(arr,sel)=>arr.map(([v,l])=>`<option value="${esc(v)}"${v===sel?' selected':''}>${esc(l)}</option>`).join('');

/* ---------- vistas ---------- */
function filaT(t,rapido){
 const c=cli(t.clienteId),e=estado(t),tel=waNum(c&&c.telefono),sal=saldo(t);
 const fin=e==='pagado'||!cuenta(t)||e==='sinmonto';
 const ahora=fin?cobrarT(t):aCobrar(t);
 const q=rapido&&sal>0&&cuenta(t)?`<div class="rq"><button class="btn sm pri" data-a="pago" data-id="${t.id}">${ic('cash')}Registrar pago</button>${tel?`<a class="btn sm" href="${esc(waT(t))}" target="_blank" rel="noopener">${ic('wa')}WhatsApp</a>`:''}</div>`:'';
 const sw=sal>0&&cuenta(t)?`<div class="swa"><button class="sa1" data-a="pago" data-id="${t.id}">${ic('cash')}Cobrar</button>${tel?`<a class="sa2" href="${esc(waT(t))}" target="_blank" rel="noopener">${ic('wa')}WhatsApp</a>`:''}</div>`:'';
 return (sw?`<div class="sw">${sw}`:'')+`<article class="row" data-a="verT" data-id="${t.id}">${avT(t)}<div class="rm"><h3>${esc(t.titulo)}</h3><p>${esc(quien(t))}${t.tipo?' · '+esc(t.tipo):''}${temasTxt(t)?' · '+temasTxt(t):''}${t.fecha?' · '+fd(t.fecha)+(nDias(t)>1?' ('+nDias(t)+' días)':''):''}</p><div class="rmeta">${chip(t)}${!fin&&Math.abs(ahora-sal)>0.004?`<small class="of">de ${fmt(sal,t.moneda)} de saldo</small>`:''}</div>${tagsHtml(t)}${cuenta(t)&&cobrarT(t)>0?barra(t):''}</div><div class="ra"><b class="${e==='vencido'?'red':''}">${fmt(ahora,t.moneda)}</b></div>${q}</article>`+(sw?'</div>':'');
}
const GRUPOS=[['vencido','Vencidos'],['adelanto','Falta adelanto: fecha sin asegurar'],['porcobrar','Por cobrar ahora'],['separado','En curso']];
const ordVence=(a,b)=>((proxima(a)||{}).vence||'9999').localeCompare((proxima(b)||{}).vence||'9999');
function donaSvg(segs,size,sw,label){const r=(size-sw)/2,C=2*Math.PI*r,tot=segs.reduce((x,y)=>x+y[0],0);let off=0;const gap=segs.filter(x=>x[0]>0).length>1?2.5:0;const arcs=tot>0?segs.filter(x=>x[0]>0).map(([v,c])=>{const L=Math.max(0,C*v/tot-gap);const o=`<circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="${c}" stroke-width="${sw}" stroke-dasharray="${L.toFixed(2)} ${(C-L).toFixed(2)}" stroke-dashoffset="${(-off).toFixed(2)}" transform="rotate(-90 ${size/2} ${size/2})"/>`;off+=C*v/tot;return o}).join(''):'';return `<svg class="dona" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" role="img" aria-label="${esc(label)}"><circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="var(--track)" stroke-width="${sw}"/>${arcs}</svg>`}
function filaC(t,tot){
 const c=cli(t.clienteId),e=estado(t),tel=waNum(c&&c.telefono),sal=saldo(t),T=tot[t.moneda||'PEN']||0,p=T>0?Math.round(sal/T*100):0;
 const sw=`<div class="swa"><button class="sa1" data-a="pago" data-id="${t.id}">${ic('cash')}Cobrar</button>${tel?`<a class="sa2" href="${esc(waT(t))}" target="_blank" rel="noopener">${ic('wa')}WhatsApp</a>`:''}</div>`;
 return `<div class="sw">${sw}<article class="row rc ${e}" data-a="verT" data-id="${t.id}">${avT(t)}<div class="rm"><div class="rcl"><h3>${esc(t.titulo)}</h3><b class="${e==='vencido'?'red':''}">${fmt(sal,t.moneda)}</b></div><div class="rcb"><div class="pista"><i style="width:${Math.max(2,Math.min(100,p))}%"></i></div><span>${p}%</span></div><div class="rmeta">${chip(t)}<small>${esc(quien(t))}</small></div></div></article></div>`;
}
function vResumen(){
 if(S.modo==='cargando')return `<div class="wrap sec"><p class="lbl">Cargando tus cuentas…</p></div>`;
 const h=hoy(),act=activos(),g=G(),lim=sumarDias(h,7);
 const venc=act.filter(t=>estado(t)==='vencido'),fad=act.filter(t=>estado(t)==='adelanto');
 const prox=act.flatMap(t=>cuotas(t).filter(c=>c.falta>0.004&&c.vence&&c.vence<=lim&&sumarDias(c.vence,g)>=h).map(c=>({moneda:t.moneda,v:c.falta})));
 const tot=sumMon(act,saldo),por=monto(tot),mv=monto(sumMon(venc,montoVencido)),ma=monto(sumMon(fad,t=>proxima(t).falta)),mp=monto(sumMon(prox,x=>x.v));
 const mes=h.slice(0,7),pm=allPagos().filter(p=>(p.fecha||'').startsWith(mes)),cm=monto(sumMon(pm,p=>num(p.monto)));
 const gmes=S.trabajos.flatMap(t=>(t.gastos||[]).filter(x=>(x.fecha||'').startsWith(mes)).map(x=>({moneda:t.moneda||'PEN',v:num(x.monto)}))).concat(S.gastosGen.filter(x=>(x.fecha||'').startsWith(mes)).map(x=>({moneda:x.moneda||'PEN',v:num(x.monto)})));
 const gm=monto(sumMon(gmes,x=>x.v)),ML=MESL[+mes.slice(5)-1];
 const fs=`font-size:clamp(34px,${Math.min(12,118/por.p.length).toFixed(1)}vw,72px)`;
 const ult=allPagos().sort((a,b)=>(b.fecha||'').localeCompare(a.fecha||'')||String(b.id).localeCompare(String(a.id))).slice(0,7);
 let lista;
 if(!S.trabajos.length)lista=`<div class="vacio"><h3>Aún no tienes trabajos registrados</h3><p>Registra cada trabajo con su monto, el adelanto para separar la fecha y la fecha de entrega. La app te dice qué fechas no están aseguradas, qué toca cobrar al entregar y qué ya está vencido.</p><button class="btn pri" data-a="nuevoT">+ Registrar mi primer trabajo</button></div>`;
 else if(!act.length)lista=`<div class="vacio"><h3>Todo cobrado</h3><p>No tienes saldos pendientes. Las cotizaciones aprobadas aparecerán aquí.</p></div>`;
 else lista=(tactil&&!pistaVista()?`<p class="hint swh">${ic('cash')} Desliza un trabajo hacia la izquierda para cobrar o escribir por WhatsApp.</p>`:'')+GRUPOS.flatMap(([k])=>act.filter(t=>estado(t)===k).sort(ordVence)).map(t=>filaC(t,tot)).join('');
 const sinC=x=>x.replace(/[.,]\d{2}(?=[^\d]*$)/,'');const k=(cls,l,m,n,u)=>`<div class="tc ${cls}"><span>${l}</span><b>${sinC(m.p)}</b><small>${n} ${n===1?u[0]:u[1]}${m.o?' · '+m.o:''}</small></div>`;
 const nv=venc.length;
 return `<section class="hero hc"><div class="wrap">
  <div class="herot"><span class="lbl">Por cobrar</span><button class="ojo" data-a="ojo" aria-pressed="${S.oculto}" aria-label="${S.oculto?'Mostrar montos':'Ocultar montos'}">${ic(S.oculto?'eyeoff':'eye')}<span>${S.oculto?'Mostrar':'Ocultar'}</span></button></div>
  <div class="big" style="${fs}">${por.p}</div>${por.o?`<div class="otras">${por.o}</div>`:''}
  <p class="sub">${act.length} ${act.length===1?'trabajo con saldo':'trabajos con saldo'}${nv?` · <span class="red">${nv} ${nv===1?'vencido':'vencidos'}</span>`:''}${S.aj.negocio?' · '+esc(S.aj.negocio):''}</p>
 </div></section>
 <div class="wrap tarj">
  ${k('cob','Cobrado en '+ML,cm,pm.length,['pago','pagos'])}
  ${k('gas','Gastos en '+ML,gm,gmes.length,['gasto','gastos'])}
  ${k('ven','Vencido',mv,nv,['trabajo','trabajos'])}
  ${k('ade','Falta adelanto',ma,fad.length,['fecha','fechas'])}
  ${k('sie','En 7 días',mp,prox.length,['pago','pagos'])}
 </div>
 ${(()=>{const f=fueraDeCal();return f.length?`<div class="wrap"><div class="calb movb"><span>${f.length} ${f.length===1?'trabajo está':'trabajos están'} en otro calendario de Google. Tu calendario elegido es <b>${esc(S.aj.calNom||'el principal')}</b>.</span><button class="btn sm pri" data-a="moverCal"${moviendo?' disabled':''}>${moviendo?'Moviendo…':'Mover a '+esc(S.aj.calNom||'principal')}</button></div></div>`:''})()}
 <div class="wrap sec"><div class="cols">
  <section><div class="sh"><h2>Para cobrar</h2><span>${act.length?'% de lo pendiente':''}</span></div>${lista}${act.length?`<p class="hint">Vence con ${g} ${g===1?'día':'días'} de gracia.</p>`:''}</section>
  <section><div class="sh"><h2>Últimos pagos</h2><a class="lnk" href="#reportes">Ver reportes</a></div>${ult.length?ult.map(p=>`<div class="mini" data-a="verT" data-id="${p.t.id}"><span class="mic">${ic('coin')}</span><div><b>${fmt(num(p.monto),p.moneda)}</b><p>${esc(quien(p.t))} · ${esc(p.t.titulo)}</p></div><span>${fd(p.fecha)}<br>${esc(p.metodo||'')}</span></div>`).join(''):`<p class="hint">Aquí verás cada adelanto, abono o cancelación que registres.</p>`}</section>
 </div></div>`;
}
const FILTROS=[['cobrar','Por cobrar'],['vencido','Vencidos'],['adelanto','Falta adelanto'],['pagado','Pagados'],['cotizado','Cotizaciones'],['todos','Todos']];
function listaT(){
 const q=S.q.trim().toLowerCase();
 let ts=S.trabajos.filter(t=>{const e=estado(t);if(S.f==='cobrar')return cuenta(t)&&saldo(t)>0.004;if(S.f==='todos')return true;return e===S.f});
 if(S.tag)ts=ts.filter(t=>(t.etiquetas||[]).includes(S.tag));
 if(q)ts=ts.filter(t=>(t.titulo+' '+nomCli(t)+' '+nomArt(t)+' '+(t.temasNom||'')+' '+(t.tipo||'')+' '+(t.notas||'')+' '+(t.etiquetas||[]).join(' ')+' '+(t.lugar||'')).toLowerCase().includes(q));
 ts.sort((a,b)=>(b.fecha||'').localeCompare(a.fecha||'')||(b.creado||0)-(a.creado||0));
 const tot=monto(sumMon(ts.filter(cuenta),S.f==='pagado'?cobrarT:saldo));
 if(!ts.length)return `<p class="hint" style="padding:20px 0">${S.trabajos.length?'No hay trabajos que coincidan.':'Todavía no registras trabajos. Toca “+ Nuevo” para empezar.'}</p>`;
 return `<p class="hint">${ts.length} ${ts.length===1?'trabajo':'trabajos'}${S.f!=='cotizado'&&S.f!=='todos'?' · '+(S.f==='pagado'?'facturado ':'saldo ')+tot.p+(tot.o?' '+tot.o:''):''}</p>`+ts.map(t=>filaT(t)).join('');
}
function eventosMes(ym){
 const m={},add=(d,o)=>{if(d&&d.startsWith(ym))(m[d]=m[d]||[]).push(o)};
 S.trabajos.filter(t=>t.estadoProd!=='cancelado').forEach(t=>{
  diasRodaje(t).forEach((d,i,a)=>add(d.fecha,{k:'rodaje',t,d,n:i+1,de:a.length}));
  if(t.entrega&&!t.entregadoEl)add(t.entrega,{k:'entrega',t});
  if(cuenta(t))cuotas(t).forEach(c=>{if(c.falta>0.004&&c.vence&&!(c.tipo==='entrega'&&!t.entregadoEl))add(c.vence,{k:'pago',t,c})});
 });
 return m;
}
function vCal(){
 const h=hoy(),ym=S.mes||h.slice(0,7),[y,mo]=ym.split('-').map(Number);
 const off=(new Date(y,mo-1,1).getDay()+6)%7,nd=new Date(y,mo,0).getDate(),ev=eventosMes(ym);
 const sel=S.dia&&S.dia.startsWith(ym)?S.dia:(h.startsWith(ym)?h:(Object.keys(ev).sort()[0]||ym+'-01'));
 let cells='';for(let i=0;i<off;i++)cells+='<span class="dc vac"></span>';
 for(let d=1;d<=nd;d++){const ds=`${ym}-${String(d).padStart(2,'0')}`,it=ev[ds]||[];const ks=new Set(it.map(x=>x.k));
  const venc=it.some(x=>x.k==='pago'&&sumarDias(x.c.vence,G())<h);
  cells+=`<button class="dc${ds===h?' hoy':''}${ds===sel?' sel':''}" data-a="dia" data-id="${ds}" aria-label="${fd(ds)}${it.length?', '+it.length+' eventos':''}"><b>${d}</b><span class="dots">${ks.has('rodaje')?`<i class="dr" style="background:${colApp(it.find(x=>x.k==='rodaje').t.color||'')||'currentColor'}"></i>`:''}${ks.has('entrega')?'<i class="de"></i>':''}${ks.has('pago')?`<i class="dp${venc?' dv':''}"></i>`:''}</span></button>`}
 const items=(ev[sel]||[]).map(x=>{const t=x.t;
  const txt=x.k==='rodaje'?`Rodaje${x.de>1?` (día ${x.n} de ${x.de})`:''}${horaDia(x.d)?' · '+esc(horaDia(x.d)):''}${t.lugar?' · '+esc(t.lugar):''}`:x.k==='entrega'?`Entrega · cobrar ${fmt(saldo(t),t.moneda)}`:`Cobrar ${esc(String(x.c.concepto).toLowerCase())} · ${fmt(x.c.falta,t.moneda)}`;
  return `<article class="row" data-a="verT" data-id="${t.id}">${avT(t)}<div class="rm"><h3>${esc(t.titulo)}</h3><p>${esc(quien(t))}</p><p class="ev ${x.k}">${txt}</p></div><div class="ra">${chip(t)}</div></article>`}).join('');
 return `<div class="calv"><div class="calh"><button class="ico" data-a="mes" data-id="-1" aria-label="Mes anterior">‹</button><h2>${MESL[mo-1][0].toUpperCase()+MESL[mo-1].slice(1)} ${y}</h2><button class="ico" data-a="mes" data-id="1" aria-label="Mes siguiente">›</button><button class="btn sm" data-a="mes" data-id="0">Hoy</button></div>
 <div class="calg">${['Lu','Ma','Mi','Ju','Vi','Sá','Do'].map(x=>`<span class="dw">${x}</span>`).join('')}${cells}</div>
 <div class="leg"><span><i class="dr"></i>Rodaje</span><span><i class="de"></i>Entrega</span><span><i class="dp"></i>Cobro</span><span><i class="dp dv"></i>Cobro vencido</span></div>
 <div class="sh"><h2>${fd(sel)}</h2><span>${(ev[sel]||[]).length?'':'Sin rodajes, entregas ni cobros'}</span></div>${items}</div>`;
}
function vTrabajos(){
 const cal=S.tv==='cal';
 return `<div class="wrap"><h1 class="ttl">Trabajos</h1>
 <div class="segv"><button class="${!cal?'on':''}" data-a="tv" data-id="lista">${ic('list')}Lista</button><button class="${cal?'on':''}" data-a="tv" data-id="cal">${ic('cal')}Calendario</button></div>
 ${cal?vCal():`<div class="bar-tools"><input class="search" id="qt" type="search" placeholder="Buscar por trabajo, artista, cliente o tema" value="${esc(S.q)}" autocomplete="off"></div>
 <div class="chips">${FILTROS.map(([k,l])=>`<button class="chip${S.f===k?' on':''}" data-a="filtro" data-id="${k}">${l}</button>`).join('')}</div>
 ${etiquetasTodas().length?`<div class="chips tagsf"><span class="lbl">Etiqueta:</span><button class="chip${!S.tag?' on':''}" data-a="etq" data-id="">Todas</button>${etiquetasTodas().map(e=>`<button class="chip${S.tag===e?' on':''}" data-a="etq" data-id="${esc(e)}">${esc(e)}</button>`).join('')}</div>`:''}
 <div id="lst">${listaT()}</div>`}</div>`;
}
function listaC(){
 const q=S.qc.trim().toLowerCase();
 let cs=S.clientes.slice().sort((a,b)=>String(a.nombre).localeCompare(String(b.nombre),'es'));
 if(q)cs=cs.filter(c=>(c.nombre+' '+(c.empresa||'')+' '+(c.telefono||'')).toLowerCase().includes(q));
 if(!cs.length)return `<p class="hint" style="padding:20px 0">${S.clientes.length?'No hay clientes que coincidan.':'Aún no tienes clientes. Se crean solos al registrar un trabajo, o agrégalos aquí.'}</p>`;
 return cs.map(c=>{const ts=S.trabajos.filter(t=>t.clienteId===c.id);const ac=activos().filter(t=>t.clienteId===c.id);const d=monto(sumMon(ac,saldo));const v=ac.some(t=>estado(t)==='vencido');
  return `<article class="row" data-a="verC" data-id="${c.id}">${avatar(c.nombre,'',v?'v':'')}<div class="rm"><h3>${esc(c.nombre)}</h3><p>${c.empresa?esc(c.empresa)+' · ':''}${ts.length} ${ts.length===1?'trabajo':'trabajos'}</p></div><div class="ra">${ac.length?`<b class="${v?'red':''}">${d.p}</b><span class="st ${v?'vencido':''}">${v?'Con pago vencido':'Saldo pendiente'}</span>`:`<span class="st pagado">Al día</span>`}</div></article>`}).join('');
}
function listaA(){
 const q=S.qa.trim().toLowerCase();
 let as=S.artistas.slice().sort((a,b)=>String(a.nombre).localeCompare(String(b.nombre),'es'));
 if(q)as=as.filter(a=>(a.nombre+' '+(a.genero||'')+' '+(a.redes||'')).toLowerCase().includes(q));
 if(!as.length)return `<p class="hint" style="padding:20px 0">${S.artistas.length?'No hay artistas que coincidan.':'Aún no tienes artistas. Se guardan solos al escribir el artista en un trabajo, o agrégalos aquí.'}</p>`;
 return as.map(a=>{const ts=S.trabajos.filter(t=>t.artistaId===a.id&&cuenta(t));const tem=ts.reduce((x,t)=>x+(parseInt(t.temas,10)||0),0);const f=monto(sumMon(ts,cobrarT));
  return `<article class="row" data-a="verA" data-id="${a.id}">${avatar(a.nombre,a.foto)}<div class="rm"><h3>${esc(a.nombre)}</h3><p>${a.genero?esc(a.genero)+' · ':''}${ts.length} ${ts.length===1?'trabajo':'trabajos'}${tem?' · '+tem+(tem===1?' tema':' temas'):''}</p></div><div class="ra">${ts.length?`<b>${f.p}</b><span class="st">facturado</span>`:''}</div></article>`}).join('');
}
function vClientes(){
 const a=S.vc==='artistas';
 return `<div class="wrap"><h1 class="ttl">${a?'Artistas y grupos':'Clientes'}</h1>
 <div class="segv"><button class="${!a?'on':''}" data-a="vc" data-id="clientes">Clientes <span>${S.clientes.length}</span></button><button class="${a?'on':''}" data-a="vc" data-id="artistas">Artistas <span>${S.artistas.length}</span></button></div>
 <div class="bar-tools"><input class="search" id="${a?'qa':'qc'}" type="search" placeholder="${a?'Buscar artista o grupo':'Buscar cliente'}" value="${esc(a?S.qa:S.qc)}" autocomplete="off"><button class="btn" data-a="${a?'nuevoA':'nuevoC'}">+ ${a?'Artista':'Cliente'}</button><button class="btn" data-a="importar">Importar contactos</button></div>
 <div id="${a?'lsta':'lstc'}">${a?listaA():listaC()}</div></div>`;
}
/* ---------- gráfico: cobrado y gastos por mes ---------- */
// Columnas agrupadas, un solo eje. Colores validados (azul/naranja) para daltonismo; tabla como alternativa.
function grafMeses(datos,m){
 const W=480,H=210,L=44,R=6,T=12,B=30,iw=W-L-R,ih=H-T-B,n=datos.length;
 const mx=Math.max(1,...datos.flatMap(x=>[x.cob,x.gas]));
 const nice=v=>{const p=Math.pow(10,Math.floor(Math.log10(v)));for(const k of [1,2,2.5,5,10])if(k*p>=v)return k*p;return 10*p},paso=nice(mx/4),tope=paso*4;
 const yv=v=>T+ih-(v/tope)*ih,gw=iw/n,bw=Math.max(4,Math.min(16,(gw-8)/2));
 const corto=v=>v>=1000?(Math.round(v/100)/10).toString().replace(/\.0$/,'')+' mil':String(Math.round(v));
 const barra=(x,v,c)=>{if(v<=0)return '';const y=yv(v),h=T+ih-y,r=Math.min(4,h);return `<path class="${c}" d="M${x},${T+ih}V${y+r}Q${x},${y} ${x+r},${y}H${x+bw-r}Q${x+bw},${y} ${x+bw},${y+r}V${T+ih}Z"/>`};
 let g='';
 for(let i=0;i<=4;i++){const v=paso*i,y=yv(v);g+=`<line class="grl" x1="${L}" x2="${W-R}" y1="${y}" y2="${y}"/><text class="gax" x="${L-6}" y="${y+4}" text-anchor="end">${corto(v)}</text>`}
 datos.forEach((d,i)=>{const x0=L+i*gw+(gw-2*bw-2)/2;
  g+=barra(x0,d.cob,'gc1')+barra(x0+bw+2,d.gas,'gc2')
   +`<text class="gax" x="${L+i*gw+gw/2}" y="${H-8}" text-anchor="middle">${d.k.slice(0,1)}</text>`
   +`<rect class="ghit" data-chm="${i}" x="${L+i*gw}" y="${T}" width="${gw}" height="${ih+B}" tabindex="0" role="button" aria-label="${esc(d.k)}: cobrado ${esc(fmtR(d.cob,m))}, gastos ${esc(fmtR(d.gas,m))}"><title>${esc(d.k)}: cobrado ${esc(fmtR(d.cob,m))} · gastos ${esc(fmtR(d.gas,m))}</title></rect>`});
 const tot=datos.reduce((a,d)=>({c:a.c+d.cob,g:a.g+d.gas}),{c:0,g:0});
 return `<div class="gleg"><span><i class="gc1"></i>Cobrado <b>${fmt(r2(tot.c),m)}</b></span><span><i class="gc2"></i>Gastos <b>${fmt(r2(tot.g),m)}</b></span></div>
  <p class="gtip" id="gtip" aria-live="polite">Toca un mes para ver el detalle.</p>
  <svg class="graf" viewBox="0 0 ${W} ${H}" role="img" aria-label="Cobrado y gastos por mes">${g}</svg>
  <details class="gtab"><summary>Ver como tabla</summary><table><thead><tr><th>Mes</th><th>Cobrado</th><th>Gastos</th><th>Diferencia</th></tr></thead><tbody>${datos.map(d=>`<tr><td>${esc(d.k)}</td><td>${d.cob?fmt(d.cob,m):'—'}</td><td>${d.gas?fmt(d.gas,m):'—'}</td><td class="${d.cob-d.gas<0?'red':''}">${d.cob||d.gas?fmt(r2(d.cob-d.gas),m):'—'}</td></tr>`).join('')}</tbody></table></details>`;
}
let grafDatos=null,grafMon='PEN';
function grafTip(i){const d=grafDatos&&grafDatos[i],el=document.getElementById('gtip');if(!d||!el)return;el.innerHTML=`<b>${esc(d.k)}</b> · cobrado ${fmt(d.cob,grafMon)} · gastos ${fmt(d.gas,grafMon)}`;document.querySelectorAll('.ghit').forEach(r=>r.classList.toggle('on',r.dataset.chm===String(i)))}
['pointerover','click','focusin'].forEach(ev=>document.addEventListener(ev,e=>{const r=e.target.closest&&e.target.closest('[data-chm]');if(r)grafTip(+r.dataset.chm)}));
function barras(list,m,cls=''){
 if(!list.length)return `<p class="hint">Sin datos todavía.</p>`;
 const mx=Math.max(...list.map(x=>x.v),1);
 return list.map(x=>`<div class="hb ${cls}"><span title="${esc(x.k)}">${esc(x.k)}</span><div><i style="width:${(x.v/mx*100).toFixed(1)}%"></i></div><b>${fmt(x.v,m)}</b></div>`).join('');
}
const agrupar=(arr,kf,vf)=>{const o={};arr.forEach(x=>{const k=kf(x);o[k]=(o[k]||0)+vf(x)});return Object.entries(o).map(([k,v])=>({k,v:r2(v)})).filter(x=>x.v>0.004).sort((a,b)=>b.v-a.v)};
function vReportes(){
 const y0=+hoy().slice(0,4),ys=new Set([y0]);
 S.trabajos.forEach(t=>{if(t.fecha)ys.add(+t.fecha.slice(0,4));(t.pagos||[]).forEach(p=>p.fecha&&ys.add(+p.fecha.slice(0,4)))});
 const y=String(S.anio||y0);
 const mons=[...new Set(S.trabajos.map(t=>t.moneda||'PEN'))];
 const puedeTodo=mons.length>1&&mons.every(k=>tcDe(k)>0),todo=S.mon==='TODO'&&puedeTodo;
 const m=todo?'PEN':S.mon&&mons.includes(S.mon)?S.mon:(mons.includes(S.aj.moneda)?S.aj.moneda:(mons[0]||S.aj.moneda||'PEN'));
 const ts=todo?S.trabajos.map(enSoles):S.trabajos.filter(t=>(t.moneda||'PEN')===m);
 const GG=todo?S.gastosGen.map(gEnSoles):S.gastosGen;
 const tY=ts.filter(t=>(t.fecha||'').startsWith(y)&&cuenta(t));
 const pY=ts.flatMap(t=>(t.pagos||[]).map(p=>({...p,t}))).filter(p=>(p.fecha||'').startsWith(y));
 const gY=tY.flatMap(t=>(t.gastos||[]).map(g=>({...g,t})));
 const fact=tY.reduce((a,t)=>a+num(t.total),0),eqY=tY.reduce((a,t)=>a+eqAcordado(t),0),prop=tY.reduce((a,t)=>a+propiosT(t)+eqAcordado(t),0),cob=pY.reduce((a,p)=>a+num(p.monto),0),pen=tY.reduce((a,t)=>a+saldo(t),0);
 const meses=MESL.map((n,i)=>({k:n[0].toUpperCase()+n.slice(1),v:pY.filter(p=>+p.fecha.slice(5,7)===i+1).reduce((a,p)=>a+num(p.monto),0)}));
 const enMes=(f,i)=>(f||'').startsWith(y)&&+String(f).slice(5,7)===i+1;
 const gastMes=i=>r2(ts.reduce((a,t)=>a+(t.gastos||[]).filter(g=>!g.reemb&&enMes(g.fecha,i)).reduce((s,g)=>s+num(g.monto),0)+(t.equipo||[]).flatMap(e=>e.pagos||[]).filter(p=>enMes(p.fecha,i)).reduce((s,p)=>s+num(p.monto),0),0)+GG.filter(g=>(g.moneda||'PEN')===m&&enMes(g.fecha,i)).reduce((a,g)=>a+num(g.monto),0));
 grafDatos=meses.map((x,i)=>({k:x.k,cob:r2(x.v),gas:gastMes(i)}));grafMon=m;
 const mx=Math.max(...meses.map(x=>x.v),1);
 const deuda=agrupar(ts.filter(t=>cuenta(t)&&saldo(t)>0.004),t=>nomCli(t),saldo).slice(0,8);
 const tipos=agrupar(tY,t=>t.tipo||'Sin tipo',t=>num(t.total)).slice(0,8);
 const mets=agrupar(pY,p=>p.metodo||'Otro',p=>num(p.monto));
 const artY=agrupar(tY.filter(t=>t.artistaId),t=>nomArt(t)||'—',t=>num(t.total)).slice(0,8);
 const temY=S.trabajos.filter(t=>(t.fecha||'').startsWith(y)&&cuenta(t)),nTem=temY.reduce((a,t)=>a+(parseInt(t.temas,10)||0),0),nVid=temY.filter(t=>parseInt(t.temas,10)>0).length;
 const ret=tY.reduce((a,t)=>a+retT(t),0);
 const gG=GG.filter(g=>(g.moneda||'PEN')===m&&(g.fecha||'').startsWith(y)),totG=gG.reduce((a,g)=>a+num(g.monto),0),catG=agrupar(gG,g=>g.cat||'Otros',g=>num(g.monto));
 const etqs=agrupar(tY.flatMap(t=>(t.etiquetas||[]).map(e=>({e,v:num(t.total)}))),x=>x.e,x=>x.v).slice(0,8);
 const cats=agrupar(gY,g=>g.cat||'Otros',g=>num(g.monto));
 const conP=tY.filter(t=>Object.values(t.presupuesto||{}).some(v=>num(v)>0));
 const pres=conP.reduce((a,t)=>a+Object.values(t.presupuesto).reduce((s,v)=>s+num(v),0),0),real=conP.reduce((a,t)=>a+gastosT(t),0);
 const debe=agrupar(ts.flatMap(t=>(t.gastos||[]).filter(g=>g.por&&!g.dev)),g=>g.por,g=>num(g.monto));
 const porPagar=agrupar(ts.filter(t=>t.estadoProd!=='cancelado').flatMap(t=>t.equipo||[]),e=>e.persona||'Sin nombre',eqFalta);
 return `<div class="wrap"><h1 class="ttl">Reporte ${y}</h1>
 <div class="rtools"><select id="ranio" aria-label="Año">${[...ys].sort((a,b)=>b-a).map(v=>`<option${String(v)===y?' selected':''}>${v}</option>`).join('')}</select>${mons.length>1?`<select id="rmon" aria-label="Moneda">${opts([...(puedeTodo?[['TODO','Todo en soles (convertido)']]:[]),...mons.map(k=>[k,MONEDAS[k]||k])],todo?'TODO':m)}</select>`:''}</div>
 <div class="figs">
  <div><small>Facturado</small><b>${fmt(fact,m)}</b><small>${tY.length} ${tY.length===1?'trabajo':'trabajos'} con fecha en ${y}</small></div>
  <div><small>Cobrado</small><b>${fmt(cob,m)}</b><small>${pY.length} ${pY.length===1?'pago recibido':'pagos recibidos'} en ${y}</small></div>
  <div><small>Pendiente de esos trabajos</small><b class="${pen>0?'red':''}">${fmt(pen,m)}</b><small>${fact>0?Math.round(pen/fact*100)+'% de lo facturado':'—'}</small></div>
  <div><small>Temas grabados</small><b>${nTem}</b><small>en ${nVid} ${nVid===1?'trabajo':'trabajos'} de ${y}</small></div>
  <div><small>Ganancia de los trabajos</small><b>${fmt(fact-prop,m)}</b><small>Facturado menos gastos de producción${eqY>0?' y equipo':''} (${fmt(prop,m)})</small></div>
  <div><small>Ganancia neta</small><b class="${fact-prop-totG<0?'red':''}">${fmt(fact-prop-totG,m)}</b><small>Menos gastos del negocio (${fmt(totG,m)})</small></div>
  ${ret>0?`<div><small>Retenciones 4ta (8 %)</small><b>${fmt(ret,m)}</b><small>Pagos a cuenta para tu declaración anual</small></div>`:''}
 </div>
 <div class="rgrid">
  <section><div class="sh"><h2>Cobrado y gastos por mes</h2><span>${y}</span></div>${grafMeses(grafDatos,m)}
   <p class="hint">Gastos = de producción (sin reembolsables) + pagos al equipo + gastos del negocio, según su fecha.</p>
   <div class="sh" style="margin-top:26px"><h2>Gastos por categoría</h2><span>${y}</span></div>${barras(cats,m)}
   ${conP.length?`<div class="sh" style="margin-top:26px"><h2>Presupuesto vs real</h2><span>${conP.length} ${conP.length===1?'trabajo':'trabajos'}</span></div>${barras([{k:'Presupuestado',v:r2(pres)},{k:'Gastado',v:r2(real)}],m,real>pres?'r':'')}<p class="hint">${real>pres?'Gastaste '+fmt(real-pres,m)+' más de lo previsto.':'Quedaste '+fmt(pres-real,m)+' por debajo de lo previsto.'}</p>`:''}</section>
  <section><div class="sh"><h2>Quién te debe</h2><span>hoy</span></div>${barras(deuda,m,'r')}
   <div class="sh" style="margin-top:26px"><h2>Por pagar al equipo</h2><span>hoy</span></div>${porPagar.length?barras(porPagar,m,'r'):`<p class="hint">No le debes nada a tu equipo.</p>`}
   <div class="sh" style="margin-top:26px"><h2>Por devolver al equipo</h2><span>hoy</span></div>${debe.length?barras(debe,m):`<p class="hint">Nadie del equipo tiene gastos pendientes de devolución.</p>`}
   <div class="sh" style="margin-top:26px"><h2>Facturado por tipo</h2><span>${y}</span></div>${barras(tipos,m)}
   <div class="sh" style="margin-top:26px"><h2>Cómo te pagan</h2><span>${y}</span></div>${barras(mets,m)}
   <div class="sh" style="margin-top:26px"><h2>Gastos del negocio</h2><button class="lnk" data-a="gastoGen">+ Agregar</button></div>${catG.length?barras(catG,m):`<p class="hint">Equipo, software, publicidad, internet… lo que no pertenece a un trabajo.</p>`}
   ${gG.slice().sort((a,b)=>(b.fecha||'').localeCompare(a.fecha||'')).slice(0,8).map(g=>`<div class="it gi" data-a="editarGen" data-id="${esc(g.id)}"><div><b>${fmt(num(g.monto),m)}</b> <span class="cat">${esc(g.cat)}</span><p>${g.det?esc(g.det)+' · ':''}${fd(g.fecha)}</p></div>${g.foto?`<button class="btn sm" data-a="fotoGen" data-id="${esc(g.id)}">Ver foto</button>`:''}</div>`).join('')}
   ${artY.length?`<div class="sh" style="margin-top:26px"><h2>Facturado por artista</h2><span>${y}</span></div>${barras(artY,m)}`:''}
   ${etqs.length?`<div class="sh" style="margin-top:26px"><h2>Facturado por etiqueta</h2><span>${y}</span></div>${barras(etqs,m)}`:''}</section>
 </div>${todo?`<p class="hint">Convertido a soles: los pagos con el tipo de cambio del día en que se registraron; lo demás con el de ${S.aj.tcFecha?fd(S.aj.tcFecha):'hoy'} (${otrasMonedas().map(k=>k+' '+tcDe(k)).join(' · ')}).</p>`:mons.length>1?`<p class="hint">Cada moneda se reporta por separado; cámbiala arriba${puedeTodo?' o elige “Todo en soles”':''}.</p>`:''}</div>`;
}
const VISTAS={resumen:vResumen,trabajos:vTrabajos,clientes:vClientes,reportes:vReportes};
const vista=()=>{const h=location.hash.slice(1);return VISTAS[h]?h:'resumen'};

/* ---------- detalle ---------- */
function calBloque(t){
 if(!mcpNs)return '';
 const c=t.cal||{},inv=invitadosDe(t),sync=enCurso[t.id];
 if(!c.on)return t.fecha&&cuenta(t)?`<div class="calb"><span>No está en tu Google Calendar.</span><button class="btn sm" data-a="addCal" data-id="${t.id}">${ic('cal')}Agregar al calendario</button></div>`:'';
 if(!t.fecha)return `<div class="calb"><span>Agrega la fecha del trabajo para ponerlo en el calendario.</span></div>`;
 const estado=sync?'Sincronizando con Google Calendar…':c.err?`<span class="red">${esc(c.err)}</span>`:c.ev||c.sinId?'En tu Google Calendar ✓'+(c.entrega&&c.evE?' · con la entrega':''):'Pendiente de agregar al calendario';
 return `<div class="calb"><div><span>${estado}</span>${inv.length?`<p class="hint">Invitados: ${inv.map(esc).join(', ')}</p>`:''}</div><div class="acts" style="margin:0">${c.link?`<a class="btn sm" href="${esc(c.link)}" target="_blank" rel="noopener">Abrir evento</a>`:''}${sync?'':`<button class="btn sm" data-a="syncCal" data-id="${t.id}">Sincronizar calendario</button>`}</div></div>`;
}
function gastosCirc(t){
 const m=t.moneda,gs=t.gastos||[],pres=t.presupuesto||{};
 const real=k=>r2(gs.filter(g=>(g.cat||'Otros')===k).reduce((a,g)=>a+num(g.monto),0));
 const tot=gastosT(t),presTot=r2(CATS.reduce((a,k)=>a+num(pres[k]),0)),rb=reembT(t);
 const cel=k=>{const [n,i,c]=CATM[k]||[k,'dots','#9F9F9F'],v=real(k);return `<button type="button" class="gc${v>0?' on':''}" style="--c:${c}" data-a="gastoCat" data-id="${t.id}" data-p="${esc(k)}" aria-label="Anotar gasto de ${esc(k)}"><span class="gn">${esc(n)}</span><span class="gb">${ic(i)}</span><span class="gv">${fmt(v,m)}</span></button>`};
 const segs=CATS.map(k=>[real(k),(CATM[k]||[])[2]||'#9F9F9F']);
 return `<div class="gcirc"><div class="gfila">${CATS.slice(0,4).map(cel).join('')}</div>
 <div class="gdona">${donaSvg(segs,190,14,'Gastos por categoría')}<div class="gcen"><span>Gastos</span><b>${fmt(tot,m)}</b>${presTot>0?`<small class="${tot>presTot?'red':''}">de ${fmt(presTot,m)} presup.</small>`:rb>0?`<small class="verde">${fmt(rb,m)} reembolsable</small>`:''}</div></div>
 <div class="gfila">${CATS.slice(4).map(cel).join('')}</div>
 <p class="hint c">Toca una categoría para anotar un gasto${gs.length?'':'. Regístralos en el momento desde el celular'}.</p></div>`;
}
function dTrabajo(id){
 const t=S.trabajos.find(x=>x.id===id);if(!t)return null;
 const c=cli(t.clienteId),e=estado(t),m=t.moneda,tot=num(t.total),rb=reembT(t),pg=pagado(t),sal=saldo(t),tel=waNum(c&&c.telefono),nx=proxima(t);
 const ps=(t.pagos||[]).slice().sort((a,b)=>(b.fecha||'').localeCompare(a.fecha||''));
 const gs=(t.gastos||[]).slice().sort((a,b)=>(b.fecha||'').localeCompare(a.fecha||''));
 const cq=cuotas(t),hv=hoy();
 const pres=t.presupuesto||{},catsUsadas=CATS.filter(k=>num(pres[k])>0||gs.some(g=>(g.cat||'Otros')===k));
 const realCat=k=>r2(gs.filter(g=>(g.cat||'Otros')===k).reduce((a,g)=>a+num(g.monto),0));
 const presTot=r2(CATS.reduce((a,k)=>a+num(pres[k]),0));
 const cuotaHtml=q=>{const venc=q.falta>0.004&&q.vence&&sumarDias(q.vence,G())<hv;return `<div class="it"><div><b>${esc(q.concepto)}</b><p>${q.tipo==='entrega'?(q.vence?(t.entregadoEl?'Entregado el ':'Al entregar · ')+fd(q.vence):'Al entregar'):(q.vence?(q.tipo==='adelanto'&&t.modoPago!=='plan'?'Antes del rodaje · ':'Vence ')+fd(q.vence):'Sin fecha')}</p></div><div class="ra"><b>${fmt(q.monto,m)}</b><span class="st ${q.falta<=0.004?'pagado':venc?'vencido':''}">${q.falta<=0.004?'Pagado ✓':(venc?'Vencido · falta ':'Falta ')+fmt(q.falta,m)}</span></div></div>`};
 return cab(esc(t.titulo),esc(quien(t))+(t.tipo?' · '+esc(t.tipo):''),avT(t))+`
 <div class="saldo"><span class="lbl">${e==='pagado'?'Pagado completo':e==='cotizado'?'Monto cotizado':'Saldo pendiente'}</span><b class="${e==='vencido'?'red':''}">${fmt(e==='pagado'||e==='cotizado'?cobrarT(t):sal,m)}</b>${chip(t)}</div>
 ${nx&&cuenta(t)&&e!=='pagado'?`<p class="ahora">Ahora toca: <b>${esc(nx.concepto)}</b> · ${fmt(nx.tipo==='entrega'?sal:nx.falta,m)}${nx.vence?' · '+(nx.tipo==='entrega'&&!t.entregadoEl?'entrega ':nx.tipo==='adelanto'&&t.modoPago!=='plan'?'antes del ':'vence ')+fd(nx.vence):''}</p>`:''}
 ${m&&m!=='PEN'&&tcDe(m)>0&&cobrarT(t)>0?`<p class="hint">≈ ${fmt(aSoles(e==='pagado'||e==='cotizado'?cobrarT(t):sal,m),'PEN')} al tipo de cambio de ${S.aj.tcFecha?fd(S.aj.tcFecha):'hoy'} (S/ ${tcDe(m)} por ${m==='USD'?'dólar':m})</p>`:''}
 ${cuenta(t)&&cobrarT(t)>0?barra(t,'lg'):''}
 <dl class="kv">${nomArt(t)?`<div><dt>Artista o grupo</dt><dd style="white-space:normal">${esc(nomArt(t))}</dd></div>`:''}${temasTxt(t)?`<div><dt>Temas a grabar</dt><dd style="white-space:normal">${temasTxt(t)}${t.temasNom?'<br><span class="hint">'+esc(t.temasNom)+'</span>':''}</dd></div>`:''}<div><dt>Monto del trabajo</dt><dd>${fmt(tot,m)}</dd></div>${t.retencion?`<div><dt>Retención 4ta (8 %)</dt><dd>− ${fmt(retT(t),m)}</dd></div><div><dt>Neto a cobrar</dt><dd>${fmt(cobrarT(t),m)}</dd></div>`:''}${rb>0?`<div><dt>Gastos a reembolsar</dt><dd>+ ${fmt(rb,m)}</dd></div>`:''}<div><dt>Cobrado</dt><dd>${fmt(pg,m)}</dd></div><div><dt>Fecha del trabajo</dt><dd>${fd(t.fecha)||'—'}</dd></div><div><dt>${t.entregadoEl?'Entregado el':'Fecha de entrega'}</dt><dd>${fd(baseEntrega(t))||'—'}</dd></div><div><dt>Estado</dt><dd>${PROD[t.estadoProd]||'—'}</dd></div>${nDias(t)>1?`<div><dt>Rodaje · ${nDias(t)} días</dt><dd style="white-space:normal">${esc(textoDias(t,'\n')).replace(/\n/g,'<br>')}</dd></div>`:horario(t)?`<div><dt>Horario</dt><dd>${esc(horario(t))}</dd></div>`:''}${t.lugar?`<div><dt>Lugar</dt><dd style="white-space:normal">${esc(t.lugar)}</dd></div>`:''}</dl>
 ${tagsHtml(t)}
 ${calBloque(t)}
 <div class="acts">
  ${e==='cotizado'?`<button class="btn pri" data-a="aprobar" data-id="${id}">${ic('check')}Cotización aprobada</button>${cotLista(t)?`<button class="btn" data-a="cotWa" data-id="${id}">${ic('wa')}Enviar cotización ${esc(t.cot.num||'')}</button><button class="btn" data-a="cotPdf" data-id="${id}">${ic('list')}PDF</button><button class="btn" data-a="fCot" data-id="${id}">${ic('edit')}Editar cotización</button>`:`<button class="btn" data-a="fCot" data-id="${id}">${ic('list')}Armar cotización</button>`}`:e==='cancelado'?'':cotLista(t)?`<button class="btn" data-a="cotPdf" data-id="${id}">${ic('list')}Cotización ${esc(t.cot.num||'')}</button><button class="btn" data-a="fCot" data-id="${id}">${ic('edit')}Editar cotización</button>`:`<button class="btn" data-a="fCot" data-id="${id}">${ic('list')}Cotización PDF</button>`}
  ${sal>0&&cuenta(t)?`<button class="btn pri" data-a="pago" data-id="${id}">${ic('cash')}Registrar pago</button>`:''}
  ${tel&&sal>0&&cuenta(t)?`<a class="btn" href="${esc(waT(t))}" target="_blank" rel="noopener">${ic('wa')}${nx&&nx.tipo==='adelanto'?'Pedir adelanto por WhatsApp':nx&&nx.tipo==='entrega'?'Cobrar por WhatsApp':'Recordar por WhatsApp'}</a>`:''}
  ${['produccion','cotizado'].includes(t.estadoProd)?`<button class="btn" data-a="entregar" data-id="${id}">${ic('check')}Marcar entregado hoy</button>`:''}
  <button class="btn" data-a="copiarT" data-id="${id}">${ic('copy')}Copiar estado de cuenta</button><button class="btn" data-a="estadoPdf" data-id="${id}">${ic('gift')}Estado de cuenta PDF</button>
 </div>
 ${c&&c.telefono?'':`<p class="hint">Agrega el celular del cliente para enviarle recordatorios por WhatsApp.</p>`}
 ${cobrarT(t)>0?`<h4>Forma de pago <span>${t.modoPago==='plan'?'Plan de cuotas':'Adelanto y cancelación'}</span></h4>${cq.filter(q=>q.monto>0).map(cuotaHtml).join('')}`:''}
 <h4>Pagos recibidos <span>${ps.length}</span></h4>
 ${ps.length?ps.map(p=>`<div class="it gi" data-a="editarPago" data-id="${id}" data-p="${esc(p.id)}"><div><b>${fmt(num(p.monto),m)}</b><p>${fd(p.fecha)} · ${esc(p.metodo||'')}${p.nota?' · '+esc(p.nota):''}${m&&m!=='PEN'&&(p.tc||tcDe(m))?' · ≈ '+fmt(aSoles(p.monto,m,p.tc),'PEN')+(p.tc?' (TC '+p.tc+')':''):''}</p></div><button class="btn sm" data-a="reciboPdf" data-id="${id}" data-p="${esc(p.id)}" aria-label="Constancia de pago en PDF">PDF</button><button class="x sm" data-a="borrarPago" data-id="${id}" data-p="${esc(p.id)}" data-c="1" data-cl="¿Borrar?" aria-label="Borrar pago">×</button></div>`).join(''):`<p class="hint">Sin pagos registrados.</p>`}
 <h4>Gastos de producción <button class="lnk" data-a="gasto" data-id="${id}">+ Agregar gasto</button></h4>
 ${gastosCirc(t)}
 ${gs.length?gs.map(g=>`<div class="it gi" data-a="editarG" data-id="${id}" data-p="${esc(g.id)}"><div><b>${fmt(num(g.monto),m)}</b> <span class="cat">${esc(g.cat||'Otros')}</span><p>${g.det?esc(g.det)+' · ':''}${fd(g.fecha)}${g.por?' · pagó '+esc(g.por):''}</p><p class="tags">${g.reemb?'<span class="tag">Lo reembolsa el cliente</span>':''}${g.por&&!g.dev?`<span class="tag warn">Por devolver a ${esc(g.por)}</span>`:''}${g.por&&g.dev?'<span class="tag">Devuelto</span>':''}</p></div>${g.foto?`<button class="btn sm" data-a="foto" data-id="${id}" data-p="${esc(g.id)}">Ver foto</button>`:''}</div>`).join(''):''}
 ${catsUsadas.length?(presTot>0?`<div class="pv"><span class="h">Categoría</span><span class="h">Presupuesto</span><span class="h">Gastado</span>${catsUsadas.map(k=>{const p=num(pres[k]),r=realCat(k);return `<span>${esc(k)}</span><span>${p>0?fmt(p,m):'—'}</span><span class="${p>0&&r>p?'red':''}">${fmt(r,m)}</span>`}).join('')}<span class="t">Total</span><span class="t">${fmt(presTot,m)}</span><span class="t ${gastosT(t)>presTot?'red':''}">${fmt(gastosT(t),m)}</span></div>`:`<div class="pv pv2"><span class="h">Categoría</span><span class="h">Gastado</span>${catsUsadas.map(k=>`<span>${esc(k)}</span><span>${fmt(realCat(k),m)}</span>`).join('')}<span class="t">Total</span><span class="t">${fmt(gastosT(t),m)}</span></div>`):''}
 <h4>Pagos al equipo <button class="lnk" data-a="nuevoEq" data-id="${id}">+ Agregar persona</button></h4>
 ${(t.equipo||[]).length?(t.equipo||[]).map(q=>{const f=eqFalta(q);return `<div class="it gi" data-a="editarEq" data-id="${id}" data-p="${esc(q.id)}"><div><b>${esc(q.persona||'Sin nombre')}</b>${q.rol?` <span class="cat">${esc(q.rol)}</span>`:''}<p>Acordado ${fmt(num(q.acordado),m)} · pagado ${fmt(eqPagadoP(q),m)}</p></div>${f>0.004?`<span class="tag warn">Falta ${fmt(f,m)}</span>`:num(q.acordado)>0?'<span class="tag">Pagado ✓</span>':''}</div>`}).join('')+`<p class="hint">Total del equipo: ${fmt(eqAcordado(t),m)}${(t.equipo||[]).some(q=>eqFalta(q)>0.004)?' · por pagar '+fmt(r2((t.equipo||[]).reduce((a,q)=>a+eqFalta(q),0)),m):''}</p>`:`<p class="hint">Anota lo acordado con camarógrafos, editores o asistentes y lo que ya les pagaste; se resta de la ganancia.</p>`}
 ${gs.length||tot>0?`<p class="gan"><span>Ganancia estimada${rb>0?' (sin contar reembolsos)':''}</span><b>${fmt(gananciaT(t),m)}</b></p>`:''}
 ${t.notas?`<h4>Notas</h4><p class="nota">${esc(t.notas)}</p>`:''}
 <div class="acts end"><button class="btn" data-a="editarT" data-id="${id}">${ic('edit')}Editar trabajo</button><button class="btn red" data-a="borrarT" data-id="${id}" data-c="1" data-cl="Toca otra vez para eliminar">Eliminar</button></div>`;
}
function dCliente(id){
 const c=cli(id);if(!c)return null;
 const ts=S.trabajos.filter(t=>t.clienteId===id).sort((a,b)=>(b.fecha||'').localeCompare(a.fecha||''));
 const cu=ts.filter(cuenta),ac=cu.filter(t=>saldo(t)>0.004);
 const f=monto(sumMon(cu,cobrarT)),cb=monto(sumMon(cu,pagado)),d=monto(sumMon(ac,saldo));
 const tel=waNum(c.telefono);
 return cab(esc(c.nombre),c.empresa?esc(c.empresa):'Cliente',avatar(c.nombre,''))+`
 <div class="saldo"><span class="lbl">Saldo pendiente</span><b class="${ac.some(t=>estado(t)==='vencido')?'red':''}">${d.p}</b>${d.o?`<span class="st">${d.o}</span>`:''}</div>
 <dl class="kv"><div><dt>Facturado</dt><dd>${f.p}</dd></div><div><dt>Cobrado</dt><dd>${cb.p}</dd></div><div><dt>Trabajos</dt><dd>${ts.length}</dd></div>${c.telefono?`<div><dt>Celular</dt><dd>${esc(c.telefono)}</dd></div>`:''}${c.email?`<div><dt>Correo</dt><dd style="white-space:normal;overflow-wrap:anywhere">${esc(c.email)}</dd></div>`:''}${c.doc?`<div><dt>RUC / DNI</dt><dd>${esc(c.doc)}</dd></div>`:''}</dl>
 <div class="acts"><button class="btn pri" data-a="nuevoT" data-id="${id}">${ic('plus')}Trabajo para este cliente</button>${tel&&ac.length?`<a class="btn" href="${esc(waC(c))}" target="_blank" rel="noopener">${ic('wa')}Recordar por WhatsApp</a>`:''}${cu.length?`<button class="btn" data-a="copiarC" data-id="${id}">Copiar estado de cuenta</button>`:''}</div>
 <h4>Trabajos <span>${ts.length}</span></h4>${ts.length?ts.map(t=>filaT(t)).join(''):`<p class="hint">Sin trabajos todavía.</p>`}
 ${c.notas?`<h4>Notas</h4><p class="nota">${esc(c.notas)}</p>`:''}
 <div class="acts end"><button class="btn" data-a="editarC" data-id="${id}">Editar cliente</button><button class="btn red" data-a="borrarC" data-id="${id}" data-c="1" data-cl="Toca otra vez para eliminar">Eliminar</button></div>`;
}

function dArtista(id){
 const a=art(id);if(!a)return null;
 const ts=S.trabajos.filter(t=>t.artistaId===id).sort((x,y)=>(y.fecha||'').localeCompare(x.fecha||''));
 const cu=ts.filter(cuenta),tem=cu.reduce((x,t)=>x+(parseInt(t.temas,10)||0),0),f=monto(sumMon(cu,cobrarT)),d=monto(sumMon(cu.filter(t=>saldo(t)>0.004),saldo));
 const tel=waNum(a.telefono);
 return cab(esc(a.nombre),a.genero?esc(a.genero):'Artista o grupo',avatar(a.nombre,a.foto,'lg'))+`
 <dl class="kv"><div><dt>Trabajos</dt><dd>${cu.length}</dd></div><div><dt>Temas grabados</dt><dd>${tem}</dd></div><div><dt>Facturado</dt><dd>${f.p}</dd></div><div><dt>Saldo pendiente</dt><dd>${d.p}</dd></div>${a.telefono?`<div><dt>Celular</dt><dd>${esc(a.telefono)}</dd></div>`:''}${a.email?`<div><dt>Correo</dt><dd style="white-space:normal;overflow-wrap:anywhere">${esc(a.email)}</dd></div>`:''}${a.redes?`<div><dt>Redes</dt><dd style="white-space:normal;overflow-wrap:anywhere">${esc(a.redes)}</dd></div>`:''}</dl>
 <div class="acts"><button class="btn pri" data-a="nuevoTA" data-id="${id}">${ic('plus')}Trabajo para este artista</button>${tel?`<a class="btn" href="https://wa.me/${tel}" target="_blank" rel="noopener">${ic('wa')}Escribir por WhatsApp</a>`:''}</div>
 <h4>Trabajos <span>${ts.length}</span></h4>${ts.length?ts.map(t=>filaT(t)).join(''):`<p class="hint">Sin trabajos todavía.</p>`}
 ${a.notas?`<h4>Notas</h4><p class="nota">${esc(a.notas)}</p>`:''}
 <div class="acts end"><button class="btn" data-a="editarA" data-id="${id}">Editar artista</button><button class="btn red" data-a="borrarA" data-id="${id}" data-c="1" data-cl="Toca otra vez para eliminar">Eliminar</button></div>`;
}
function fArtista(a){
 const nuevo=!a;a=a?{...a}:{id:uid(),nombre:'',genero:'',telefono:'',email:'',redes:'',notas:'',creado:Date.now()};
 abrir(cab(nuevo?'Nuevo artista o grupo':'Editar artista')+`<form novalidate>
  <div class="lblrow"><label for="an1">Nombre artístico <span class="req">*</span></label><button type="button" class="lnk" id="acont">Desde contactos</button></div>
  <input id="an1" name="nombre" value="${esc(a.nombre)}" placeholder="Artista, banda o grupo"><div class="pick" id="apick" hidden></div>
  <label for="ag1">Género musical</label><input id="ag1" name="genero" list="gens" value="${esc(a.genero)}" placeholder="Ej. Cumbia, Salsa, Urbano"><datalist id="gens">${['Cumbia','Salsa','Urbano','Reggaetón','Rock','Pop','Folklore','Huayno','Criolla','Balada','Trap','Electrónica'].map(x=>`<option value="${x}">`).join('')}</datalist>
  <div class="g2"><div><label for="at1">Celular (artista o mánager)</label><input id="at1" name="telefono" type="tel" inputmode="tel" value="${esc(a.telefono)}"></div><div><label for="ae1">Correo</label><input id="ae1" name="email" type="email" value="${esc(a.email)}"></div></div>
  <label for="af1">Foto del artista o portada</label>
  <div class="fotorow">${avatar(a.nombre||'?',a.foto,'lg')}<input id="af1" type="file" accept="image/*">${a.foto?`<label class="inl"><input type="checkbox" name="sinfoto"> Quitar foto</label>`:''}</div>
  <label for="ar1">Redes</label><input id="ar1" name="redes" value="${esc(a.redes)}" placeholder="@instagram, canal de YouTube">
  <label for="ao1">Notas</label><textarea id="ao1" name="notas">${esc(a.notas)}</textarea>
  <p class="err" id="aerr"></p>
  <div class="acts"><button class="btn pri" type="submit">Guardar artista</button><button class="btn" type="button" data-a="${nuevo?'cerrar':'verA'}" data-id="${a.id}">Cancelar</button></div></form>`,{mount:s=>{
  let foto=null;
  s.querySelector('#af1').addEventListener('change',async e=>{const f=e.target.files&&e.target.files[0];if(!f)return;try{foto=await comprimir(f,200,true);s.querySelector('.fotorow .av').innerHTML=`<img src="${foto}" alt="">`}catch(x){s.querySelector('#aerr').textContent='No se pudo leer esa imagen.'}});
  const fill=c=>{s.querySelector('#an1').value=c.nombre;if(c.telefono)s.querySelector('#at1').value=c.telefono;if(c.email)s.querySelector('#ae1').value=c.email;s.querySelector('#apick').hidden=true};
  s.querySelector('#acont').addEventListener('click',()=>{const box=s.querySelector('#apick');desdeContactos(l=>{if(l.length===1)return fill(l[0]);box.hidden=false;box.innerHTML=l.slice(0,80).map((c,i)=>`<button type="button" class="chip" data-i="${i}">${esc(c.nombre)}</button>`).join('');box.onclick=e=>{const x=e.target.closest('[data-i]');if(x)fill(l[+x.dataset.i])}},()=>{box.hidden=false;box.innerHTML=ayudaVcf})});
  s.querySelector('form').addEventListener('submit',e=>{e.preventDefault();const F=new FormData(e.target);const n=String(F.get('nombre')||'').trim();
   if(!n){s.querySelector('#aerr').textContent='Escribe el nombre del artista o grupo.';return}
   const otro=porNombre(S.artistas,n);if(otro&&otro.id!==a.id){s.querySelector('#aerr').textContent='Ya tienes un artista con ese nombre.';return}
   ['genero','telefono','email','redes','notas'].forEach(k=>a[k]=String(F.get(k)||'').trim());a.nombre=n;a.mod=Date.now();
   if(foto)a.foto=foto;else if(F.get('sinfoto'))delete a.foto;
   guardar('artistas',a).catch(()=>{});toast(nuevo?'Artista agregado.':'Artista actualizado.');verA(a.id);
  });
 }});
}

/* ---------- formulario de trabajo ---------- */
function fTrabajo(t,preCliente,preArt){
 const nuevo=!t;
 t=t?JSON.parse(JSON.stringify(t)):normT({id:uid(),titulo:'',clienteId:preCliente||'',artistaId:preArt||'',tipo:S.aj.tipoDef||'',fecha:'',entrega:'',moneda:S.aj.moneda||'PEN',total:'',estadoProd:'produccion',notas:'',creado:Date.now()});
 const cs=S.clientes.slice().sort((a,b)=>String(a.nombre).localeCompare(String(b.nombre),'es'));
 const sinCli=!cs.length;
 let filas=(t.cuotas||[]).map(c=>({...c}));
 let dias=(t.diasExtra||[]).map(d=>({...d}));
 const adP=(t.pagos||[]).find(p=>p.adelanto)||(t.pagos||[]).find(p=>/^adelanto/i.test(p.nota||''));
 const pres=t.presupuesto||{};
 abrir(cab(nuevo?'Nuevo trabajo':'Editar trabajo')+`<form novalidate>
  <label for="ft">Trabajo o nombre del tema</label><input id="ft" name="titulo" value="${esc(t.titulo)}" placeholder="Si lo dejas vacío, se usa el nombre del artista">
  <div class="lblrow"><label for="far">Artista o grupo</label><button type="button" class="lnk" data-cont="art">Desde contactos</button></div>
  <input id="far" name="artista" list="lart" value="${esc(nomArt(t))}" placeholder="Nombre artístico" autocomplete="off"><datalist id="lart">${S.artistas.slice().sort((a,b)=>String(a.nombre).localeCompare(String(b.nombre),'es')).map(a=>`<option value="${esc(a.nombre)}">`).join('')}</datalist>
  <div class="pick" data-pick="art" hidden></div><p class="hint" id="harn" hidden>Artista nuevo: se guardará en tu lista de artistas.</p>
  <div class="lblrow"><label for="fc">Cliente</label><button type="button" class="lnk" data-cont="cli">Desde contactos</button></div>
  <input id="fc" name="cliente" list="lcli" value="${esc(cli(t.clienteId)?cli(t.clienteId).nombre:'')}" placeholder="Quién paga (si es el mismo artista, déjalo vacío)" autocomplete="off"><datalist id="lcli">${cs.map(c=>`<option value="${esc(c.nombre)}">`).join('')}</datalist>
  <div class="pick" data-pick="cli" hidden></div>
  <div id="nc" hidden><div class="g2"><div><label for="fct">Celular (WhatsApp)</label><input id="fct" name="ctel" type="tel" inputmode="tel" placeholder="987 654 321"></div><div><label for="fce">Correo</label><input id="fce" name="cemail" type="email" inputmode="email"></div></div><p class="hint">Cliente nuevo: se guardará en tu lista de clientes.</p></div>
  <label for="fy">Tipo de trabajo</label><input id="fy" name="tipo" list="tipos" value="${esc(t.tipo)}" placeholder="Elige o escribe"><datalist id="tipos">${TIPOS.map(x=>`<option value="${x}">`).join('')}</datalist>
  <div class="g2 tem"><div><label for="ftm">Temas a grabar</label><input id="ftm" name="temas" type="number" min="0" step="1" inputmode="numeric" value="${parseInt(t.temas,10)>0?parseInt(t.temas,10):''}" placeholder="0"></div><div><label for="ftn">Nombres de los temas</label><input id="ftn" name="temasNom" value="${esc(t.temasNom||'')}" placeholder="Separados por comas"></div></div>
  <div class="g2"><div><label for="ff">Rodaje: empieza</label><input id="ff" name="fecha" type="date" value="${esc(t.fecha)}"></div><div><label for="fhi">Hora de inicio</label><input id="fhi" name="horaIni" type="time" value="${esc(t.horaIni||'')}"></div></div>
  <div class="g2"><div><label for="ffin">Termina <span class="hint" style="font-weight:500">(opcional)</span></label><input id="ffin" name="fechaFin" type="date" value="${esc(t.fechaFin||'')}"></div><div><label for="fhf">Hora de término</label><input id="fhf" name="horaFin" type="time" value="${esc(t.horaFin||'')}"></div></div>
  <p class="hint" id="hdias"></p>
  <div id="dx"></div><button type="button" class="lnk" id="adddia">+ Agregar otro día o rango de rodaje</button>
  <label for="fv">Fecha de entrega</label><input id="fv" name="entrega" type="date" value="${esc(t.entrega)}">
  <label for="fl">Lugar</label><input id="fl" name="lugar" value="${esc(t.lugar||'')}" placeholder="Dirección o local">
  <div class="g2"><div><label for="fm">Moneda</label><select id="fm" name="moneda">${opts(Object.entries(MONEDAS),t.moneda)}</select></div><div><label for="fo">Monto total <span class="req">*</span></label><input id="fo" name="total" inputmode="decimal" value="${t.total===''?'':esc(t.total)}" placeholder="0.00"></div></div>
  <label>Forma de pago</label>
  <div class="seg"><label><input type="radio" name="modo" value="adelanto"${t.modoPago!=='plan'?' checked':''}><span>Adelanto + saldo al entregar</span></label><label><input type="radio" name="modo" value="plan"${t.modoPago==='plan'?' checked':''}><span>Plan de cuotas</span></label></div>
  <div id="bA">
   <div class="g2"><div><label for="fa">Adelanto del trabajo</label><input id="fa" name="adelanto" inputmode="decimal" value="${num(t.adelantoReq)>0?esc(t.adelantoReq):''}" placeholder="0.00"></div><div><label for="fu">En</label><select id="fu" name="unidad"><option value="m">Monto</option><option value="p">Porcentaje (%)</option></select></div></div>
   <p class="hint" id="ha"></p>
  </div>
  <div id="bP" hidden>
   <div class="presets"><span>Rápido:</span><button type="button" class="chip" data-p="50,50">50 / 50</button><button type="button" class="chip" data-p="30,40,30">30 / 40 / 30</button><button type="button" class="chip" data-p="40,30,30">40 / 30 / 30</button><button type="button" class="chip" data-p="25,25,25,25">4 × 25</button></div>
   <div id="rows"></div>
   <button type="button" class="lnk" id="addq">+ Agregar cuota</button>
   <p class="hint" id="hp"></p>
  </div>
  <div class="adr"><div><label for="fr">Adelanto ya recibido</label><input id="fr" name="recibido" inputmode="decimal" placeholder="0.00" value="${adP&&num(adP.monto)>0?esc(adP.monto):''}"></div><div><label for="frf">Fecha</label><input id="frf" name="rfecha" type="date" value="${esc(adP&&adP.fecha||hoy())}"></div><div><label for="frm">Pagado con</label><select id="frm" name="rmet">${opts(METODOS.map(x=>[x,x]),adP&&adP.metodo||'Yape')}</select></div></div>
  ${adP?`<p class="hint">Si borras el monto, se quita este adelanto de los pagos.</p>`:''}
  <label class="chk"><input type="checkbox" name="retencion" id="fret"${t.retencion?' checked':''}> El cliente me retiene 8 % (recibo por honorarios)</label>
  <p class="hint" id="hret"></p>
  <div class="g2"><div><label for="fe">Estado</label><select id="fe" name="estadoProd">${opts(Object.entries(PROD),t.estadoProd)}</select></div><div id="bE" ${t.estadoProd==='entregado'?'':'hidden'}><label for="fen">Entregado el</label><input id="fen" name="entregadoEl" type="date" value="${esc(t.entregadoEl||'')}"></div></div>
  <label>Color en el calendario <span class="hint" style="font-weight:500">(${esc(colNom(S.aj.colRodaje))} por defecto)</span></label>${swatches('color',t.color||'',true,'Usar el color de Ajustes')}
  <label for="fg">Etiquetas</label><input id="fg" name="etiquetas" value="${esc((t.etiquetas||[]).join(', '))}" placeholder="Separadas por comas" autocomplete="off">
  <div class="sug" data-for="fg">${[...new Set([...etiquetasTodas(),...ETQ_BASE])].slice(0,12).map(e=>`<button type="button" class="chip" data-s="${esc(e)}">${esc(e)}</button>`).join('')}</div>
  <label for="fi">Invitados (correos)</label><input id="fi" name="invitados" type="text" inputmode="email" value="${esc((t.invitados||[]).join(', '))}" placeholder="camarografo@gmail.com, editora@gmail.com" autocomplete="off">
  ${invitadosFrec().length?`<div class="sug" data-for="fi">${invitadosFrec().slice(0,10).map(e=>`<button type="button" class="chip" data-s="${esc(e)}">${esc(e)}</button>`).join('')}</div>`:''}
  <label class="chk"><input type="checkbox" name="invCliente"${t.invCliente?' checked':''}> Invitar también al cliente (si tiene correo)</label>
  <fieldset class="calf"><legend>Google Calendar</legend>${mcpNs?`
   <label class="chk"><input type="checkbox" name="calOn"${(t.cal?t.cal.on:nuevo)?' checked':''}> Poner el trabajo en mi calendario</label>
   <label class="chk"><input type="checkbox" name="calEnt"${(t.cal?t.cal.entrega:true)?' checked':''}> Agregar también la fecha de entrega</label>
   <label class="chk"><input type="checkbox" name="calNotif"${(t.cal?t.cal.notif!==false:true)?' checked':''}> Enviar la invitación por correo a los invitados</label>
   <p class="hint">Sin horario, el trabajo se agrega como evento de todo el día. Los montos no se incluyen en el evento.</p>`:`<p class="hint">Abre la app desde Claude con Google Calendar conectado para agregar tus trabajos al calendario.</p>`}</fieldset>
  <details class="pres"${Object.values(pres).some(v=>num(v)>0)?' open':''}><summary>Presupuesto de gastos (opcional)</summary><p class="hint">Lo que estimas gastar. Al final lo comparas con lo gastado de verdad.</p><div class="g2">${CATS.map((k,i)=>`<div><label for="pp${i}">${k}</label><input id="pp${i}" name="p${i}" inputmode="decimal" value="${num(pres[k])>0?esc(pres[k]):''}" placeholder="0.00"></div>`).join('')}</div></details>
  <label for="fn">Notas</label><textarea id="fn" name="notas" placeholder="Entregables, acuerdos, datos de facturación…">${esc(t.notas)}</textarea>
  <p class="err" id="ferr"></p>
  <div class="acts"><button class="btn pri" type="submit">${nuevo?'Guardar trabajo':'Guardar cambios'}</button><button class="btn" type="button" data-a="${nuevo?'cerrar':'verT'}" data-id="${t.id}">Cancelar</button></div></form>`,{mount:s=>{
  const F=s.querySelector('form'),fc=s.querySelector('#fc'),far=s.querySelector('#far'),nc=s.querySelector('#nc'),rows=s.querySelector('#rows'),err=s.querySelector('#ferr');
  const total=()=>num(s.querySelector('#fo').value),mon=()=>s.querySelector('#fm').value;
  const modo=()=>F.querySelector('input[name=modo]:checked').value;
  const pintaFilas=()=>{rows.innerHTML=filas.map((q,i)=>`<div class="cuota"><div class="cq1"><label for="qc${i}">Cuota ${i+1}</label><input id="qc${i}" data-i="${i}" data-k="concepto" value="${esc(q.concepto||'')}" placeholder="Ej. Adelanto"></div><div><label for="qm${i}">Monto</label><input id="qm${i}" data-i="${i}" data-k="monto" inputmode="decimal" value="${num(q.monto)>0?esc(q.monto):''}" placeholder="0.00"></div><div><label for="qf${i}">Fecha</label><input id="qf${i}" type="date" data-i="${i}" data-k="fecha" value="${esc(q.fecha||'')}"></div><button type="button" class="x sm" data-r="${i}" aria-label="Quitar cuota">×</button></div>`).join('');refresca()};
  const refresca=()=>{
   s.querySelector('#bA').hidden=modo()!=='adelanto';s.querySelector('#bP').hidden=modo()!=='plan';
   const tot=total(),m=mon();
   const av=num(s.querySelector('#fa').value),pct=s.querySelector('#fu').value==='p';const a=pct?r2(tot*av/100):av;
   s.querySelector('#ha').textContent=a>0?`Adelanto ${fmt(a,m)}${tot>0?' ('+Math.round(a/tot*100)+'%)':''} antes del rodaje · saldo de ${fmt(Math.max(0,tot-a),m)} al entregar.`:'Si el cliente no deja adelanto, todo se cobra al entregar.';
   const u=r2(filas.reduce((x,q)=>x+num(q.monto),0));
   s.querySelector('#hp').innerHTML=filas.length?(u>tot?`<span class="red">Las cuotas suman ${fmt(u,m)}, más que el total.</span>`:`Cuotas: ${fmt(u,m)} · <b>Saldo al entregar: ${fmt(tot-u,m)}</b>`):'Agrega las cuotas antes de la entrega; el resto se cobra al entregar.';
   s.querySelector('#bE').hidden=s.querySelector('#fe').value!=='entregado';
   {const tt={fecha:s.querySelector('#ff').value,fechaFin:s.querySelector('#ffin').value,horaIni:s.querySelector('#fhi').value,horaFin:s.querySelector('#fhf').value,diasExtra:typeof dias!=='undefined'?dias:[]};const bs=bloques(tt);s.querySelector('#hdias').textContent=bs.length?'En Google Calendar: '+txtEvento(bs[0])+(bs.length>1?`, y uno por cada rodaje extra (${bs.length} en total)`:'')+'.':''}
   const rc=s.querySelector('#fret').checked;s.querySelector('#hret').textContent=rc?`Te retienen ${fmt(r2(tot*0.08),m)}; cobras ${fmt(r2(tot*0.92),m)}. Lo retenido te sirve como pago a cuenta en tu declaración anual.`:(tot>1500?'Si el cliente es empresa (agente de retención), en recibos de más de S/ 1,500 te retiene 8 %.':'');
  };
  const pend={cli:{},art:{}};
  let retTocado=!nuevo;s.querySelector('#fret').addEventListener('change',()=>{retTocado=true});
  const revisa=()=>{const cn=fc.value.trim(),an=far.value.trim();const cx=porNombre(S.clientes,cn||an);if(!retTocado&&cx){s.querySelector('#fret').checked=!!cx.retiene}nc.hidden=!cn||!!porNombre(S.clientes,cn);s.querySelector('#harn').hidden=!an||!!porNombre(S.artistas,an)};
  fc.addEventListener('input',revisa);far.addEventListener('input',revisa);revisa();
  const poner=(k,c)=>{if(k==='cli'){fc.value=c.nombre;pend.cli=c;s.querySelector('#fct').value=c.telefono||'';s.querySelector('#fce').value=c.email||''}else{far.value=c.nombre;pend.art=c}revisa();s.querySelector(`[data-pick=${k}]`).hidden=true};
  s.querySelectorAll('[data-cont]').forEach(b=>b.addEventListener('click',()=>{const k=b.dataset.cont,box=s.querySelector(`[data-pick=${k}]`);
   desdeContactos(l=>{if(l.length===1)return poner(k,l[0]);box.hidden=false;box.innerHTML=`<p class="hint">Elige el contacto:</p>`+l.slice(0,80).map((c,i)=>`<button type="button" class="chip" data-i="${i}">${esc(c.nombre)}</button>`).join('');box.onclick=e=>{const x=e.target.closest('[data-i]');if(x)poner(k,l[+x.dataset.i])}},()=>{box.hidden=false;box.innerHTML=ayudaVcf})}));
  F.addEventListener('input',e=>{const el=e.target;if(el.dataset.i!==undefined){filas[+el.dataset.i][el.dataset.k]=el.value}if(el.dataset.di!==undefined){dias[+el.dataset.di][el.dataset.dk]=el.value}refresca()});
  const dx=s.querySelector('#dx');
  const pintaDias=()=>{dx.innerHTML=dias.map((d,i)=>`<div class="diax"><div class="dxh"><b>Rodaje ${i+2}</b><button type="button" class="x sm" data-rd="${i}" aria-label="Quitar">×</button></div><div class="dxg dxr"><div><label for="dxf${i}">Empieza</label><input id="dxf${i}" type="date" data-di="${i}" data-dk="fecha" value="${esc(d.fecha||'')}"></div><div><label for="dxi${i}">Hora de inicio</label><input id="dxi${i}" type="time" data-di="${i}" data-dk="horaIni" value="${esc(d.horaIni||'')}"></div></div><div class="dxg dxt"><div><label for="dxh${i}">Termina</label><input id="dxh${i}" type="date" data-di="${i}" data-dk="hasta" value="${esc(d.hasta||'')}"></div><div><label for="dxe${i}">Hora de término</label><input id="dxe${i}" type="time" data-di="${i}" data-dk="horaFin" value="${esc(d.horaFin||'')}"></div></div></div>`).join('');refresca()};
  dx.addEventListener('click',e=>{const b=e.target.closest('[data-rd]');if(b){dias.splice(+b.dataset.rd,1);pintaDias()}});
  s.querySelector('#adddia').addEventListener('click',()=>{const f1=s.querySelector('#ff').value;if(!f1){err.textContent='Primero escribe la fecha del trabajo (día 1).';return}err.textContent='';const ff=s.querySelector('#ffin').value,u=dias.length?(dias[dias.length-1].hasta||dias[dias.length-1].fecha||f1):(ff>f1?ff:f1);dias.push({id:uid(),fecha:sumarDias(u,1),hasta:'',horaIni:s.querySelector('#fhi').value,horaFin:s.querySelector('#fhf').value});pintaDias()});
  pintaDias();
  F.addEventListener('change',refresca);
  rows.addEventListener('click',e=>{const b=e.target.closest('[data-r]');if(b){filas.splice(+b.dataset.r,1);pintaFilas()}});
  s.querySelector('#addq').addEventListener('click',()=>{filas.push({id:uid(),concepto:filas.length?'Abono '+(filas.length+1):'Adelanto',monto:'',fecha:''});pintaFilas()});
  s.querySelector('.presets').addEventListener('click',e=>{const b=e.target.closest('[data-p]');if(!b)return;const tot=total();if(tot<=0){err.textContent='Primero escribe el monto total.';return}err.textContent='';
   const ps=b.dataset.p.split(',').map(Number),fe=s.querySelector('#ff').value;
   filas=ps.slice(0,-1).map((p,i)=>({id:uid(),concepto:i===0?'Adelanto':(ps.length===3?'Abono el día del trabajo':'Abono '+(i+1)),monto:r2(tot*p/100),fecha:i===0?hoy():(ps.length===3&&fe?fe:'')}));pintaFilas()});
  pintaFilas();
  s.querySelectorAll('.sug').forEach(box=>box.addEventListener('click',e=>{const b=e.target.closest('[data-s]');if(!b)return;const inp=s.querySelector('#'+box.dataset.for);const l=lista(inp.value);if(!l.includes(b.dataset.s))l.push(b.dataset.s);inp.value=l.join(', ')}));
  F.addEventListener('submit',e=>{
   e.preventDefault();const D=new FormData(F);
   const titulo=String(D.get('titulo')||'').trim()||String(D.get('artista')||'').trim();if(!titulo){err.textContent='Escribe el nombre del trabajo o del artista.';return}
   const tot=num(D.get('total'));if(tot<=0&&D.get('estadoProd')!=='cancelado'){err.textContent='Escribe el monto total del trabajo.';return}
   const md=D.get('modo');let adelantoReq=0,cq=[];
   if(md==='adelanto'){const av=num(D.get('adelanto'));adelantoReq=D.get('unidad')==='p'?r2(tot*av/100):av;if(adelantoReq>tot){err.textContent='El adelanto no puede ser mayor que el total.';return}}
   else{cq=filas.filter(q=>num(q.monto)>0).map(q=>({id:okId(q.id)?q.id:uid(),concepto:String(q.concepto||'').trim()||'Cuota',monto:num(q.monto),fecha:q.fecha||''}));if(r2(cq.reduce((x,q)=>x+q.monto,0))>tot){err.textContent='Las cuotas suman más que el total.';return}}
   const cn=String(D.get('cliente')||'').trim(),an=String(D.get('artista')||'').trim();
   let artistaId='';if(an){let a=porNombre(S.artistas,an);if(!a){const cx=porNombre(S.clientes,an)||{};a={id:uid(),nombre:an,genero:'',telefono:pend.art.telefono||cx.telefono||'',email:pend.art.email||cx.email||'',redes:'',notas:'',creado:Date.now()};guardar('artistas',a).catch(()=>{})}artistaId=a.id}
   let clienteId='';const ncli=cn||an;
   if(ncli){let c=porNombre(S.clientes,ncli);if(!c){const src=cn?pend.cli:pend.art;c={id:uid(),nombre:ncli,telefono:String(D.get('ctel')||'').trim()||src.telefono||'',email:String(D.get('cemail')||'').trim()||src.email||'',empresa:src.empresa||'',doc:'',notas:'',creado:Date.now()};guardar('clientes',c).catch(()=>{})}clienteId=c.id}
   const presupuesto={};CATS.forEach((k,i)=>{const v=num(D.get('p'+i));if(v>0)presupuesto[k]=v});
   const ep=D.get('estadoProd');
   const invs=lista(D.get('invitados')).map(x=>x.toLowerCase());const malos=invs.filter(x=>!okMail(x));if(malos.length){err.textContent='Revisa estos correos: '+malos.join(', ');return}
   
   const dxs=dias.filter(d=>d.fecha).map(d=>({id:okId(d.id)?d.id:uid(),fecha:d.fecha,hasta:d.hasta&&d.hasta>d.fecha?d.hasta:'',horaIni:d.horaIni||'',horaFin:d.horaFin||''}));
   if(D.get('fechaFin')&&D.get('fecha')&&D.get('fechaFin')<D.get('fecha')){err.textContent='La fecha en que termina el rodaje debe ser igual o posterior a la de inicio.';return}
   if(dias.some(d=>d.fecha&&d.hasta&&d.hasta<d.fecha)){err.textContent='En otro rodaje, la fecha en que termina es anterior a la de inicio.';return}
   if(dxs.length&&!D.get('fecha')){err.textContent='Escribe la fecha del primer día de rodaje.';return}
   
   {const tt={fecha:D.get('fecha'),fechaFin:D.get('fechaFin'),diasExtra:dxs};const ds=diasRodaje(tt);if(new Set(ds.map(d=>d.fecha)).size<ds.length){err.textContent='Hay días de rodaje que se repiten o se cruzan.';return}if(ds.length>60){err.textContent='Son demasiados días de rodaje (máximo 60).';return}}
   const calOn=!!D.get('calOn');if(mcpNs&&calOn&&!D.get('fecha')){err.textContent='Para ponerlo en el calendario, escribe la fecha del trabajo.';return}
   const nt=parseInt(D.get('temas'),10);
   t.retencion=!!D.get('retencion');
   Object.assign(t,{titulo,clienteId,artistaId,temas:nt>0?nt:0,temasNom:String(D.get('temasNom')||'').trim(),tipo:String(D.get('tipo')||'').trim(),fecha:D.get('fecha')||'',fechaFin:D.get('fechaFin')&&D.get('fechaFin')>D.get('fecha')?D.get('fechaFin'):'',entrega:D.get('entrega')||'',moneda:D.get('moneda')||'PEN',total:tot,modoPago:md,adelantoReq,cuotas:cq,presupuesto,estadoProd:ep,notas:String(D.get('notas')||'').trim(),horaIni:D.get('horaIni')||'',horaFin:D.get('horaFin')||'',diasExtra:dxs,lugar:String(D.get('lugar')||'').trim(),etiquetas:lista(D.get('etiquetas')),invitados:invs,invCliente:!!D.get('invCliente'),color:String(D.get('color')||''),mod:Date.now()});
   if(mcpNs)t.cal={...(t.cal||{}),on:calOn,entrega:!!D.get('calEnt'),notif:!!D.get('calNotif')};
   delete t.vence;
   if(ep==='entregado')t.entregadoEl=D.get('entregadoEl')||t.entregadoEl||t.entrega||hoy();else delete t.entregadoEl;
   {const a=num(D.get('recibido')),fa=D.get('rfecha')||hoy(),me=D.get('rmet')||'Otro';t.pagos=t.pagos||[];const k=adP?t.pagos.findIndex(p=>p.id===adP.id):-1;
    if(a>0){if(k>=0)Object.assign(t.pagos[k],{monto:a,fecha:fa,metodo:me,adelanto:true});else t.pagos.push({id:uid(),monto:a,fecha:fa,metodo:me,nota:'Adelanto',adelanto:true})}
    else if(k>=0)t.pagos.splice(k,1)}
   guardar('trabajos',t).then(()=>syncCal(t.id)).catch(()=>{});toast(nuevo?'Trabajo registrado.':'Cambios guardados.');verT(t.id);
  });
 }});
}

/* ---------- pagos ---------- */
const fLarga=f=>{if(!f)return'';const h=hoy(),p=f.split('-'),txt=`${+p[2]} de ${MESL[+p[1]-1]} de ${p[0]}`;return f===h?'Hoy, '+txt:f===sumarDias(h,-1)?'Ayer, '+txt:txt};
function calcExpr(x){const t=String(x).replace(/×/g,'*').replace(/÷/g,'/').replace(/−/g,'-').replace(/[+\-*/.]+$/,'');if(!t||!/^[\d.+\-*/]+$/.test(t))return NaN;try{const toks=t.match(/\d*\.?\d+|[+\-*/]/g)||[];const out=[],ops=[],pr={'+':1,'-':1,'*':2,'/':2};const ap=()=>{const o=ops.pop(),b=out.pop(),a=out.pop();out.push(o==='+'?a+b:o==='-'?a-b:o==='*'?a*b:a/b)};for(const k of toks){if(pr[k]){while(ops.length&&pr[ops[ops.length-1]]>=pr[k])ap();ops.push(k)}else out.push(parseFloat(k))}while(ops.length)ap();const r=out[0];return isFinite(r)?Math.round(r*100)/100:NaN}catch(e){return NaN}}
function fPago(id,pid){
 const t=S.trabajos.find(x=>x.id===id);if(!t)return;const nx=proxima(t),m=t.moneda||'PEN';
 const pe=pid?(t.pagos||[]).find(x=>x.id===pid):null;if(pid&&!pe)return;
 const sal=pe?r2(saldo(t)+num(pe.monto)):saldo(t);
 const def=pe?num(pe.monto):nx&&nx.tipo!=='entrega'?nx.falta:sal;
 const atajos=[];if(!pe){if(nx&&nx.tipo!=='entrega'&&Math.abs(nx.falta-sal)>0.004)atajos.push([nx.concepto,nx.falta]);atajos.push(['Todo el saldo',sal])}
 const sim=(fmtR(0,m).match(/^[^\d\s -]+/)||[m])[0];
 let ex=String(r2(def)),fresco=true,fecha=pe?pe.fecha||hoy():hoy(),metodo=pe?pe.metodo||'Otro':'Yape';
 const K=(v,l,cls='')=>`<button type="button" class="k ${cls}" data-k="${v}"${l?` aria-label="${l}"`:''}>${v==='del'?ic('del'):v==='fecha'?ic('calk'):v==='ok'?ic('check'):v}</button>`;
 abrir(cab(pe?'Editar pago':'Registrar pago',`Saldo ${fmt(sal,m)}`)+`<form class="pg" novalidate>
  <div class="pgs"><div class="pgl"><span>Del trabajo</span><b>${esc(t.titulo)}</b><i class="pgi">${ic('film')}</i></div>
  <label class="pgr"><span>A cuenta</span><b id="pmt">${esc(metodo)}</b><select name="metodo" id="pt" aria-label="Método de pago">${opts(METODOS.map(x=>[x,x]),metodo)}</select><i class="pgi sq">${ic('card')}</i></label></div>
  ${atajos.length?`<div class="pchips">${atajos.map(([l,v])=>`<button type="button" class="chip" data-v="${v}"><span>${esc(l)}</span><b>${fmt(v,m)}</b></button>`).join('')}</div>`:''}
  <div class="pmonto" aria-live="polite"><span class="ptipo" id="ptp"></span><output id="pval"></output><small class="pres" id="pres"></small></div>
  <div class="pfecha"><label for="pf">Fecha del pago</label><input type="date" id="pf" value="${esc(fecha)}" max="${esc(sumarDias(hoy(),365))}"><span id="pfb">${fLarga(fecha)}</span></div>
  <label class="vh" for="pn">Notas</label><input id="pn" class="pnota" name="nota" placeholder="Notas…" autocomplete="off" value="${esc(pe?pe.nota||'':nx?nx.concepto:'')}">
  <div class="kp">${K('÷','Dividir')}${K('7')}${K('8')}${K('9')}${K('del','Borrar')}${K('×','Multiplicar')}${K('4')}${K('5')}${K('6')}${K('fecha','Cambiar fecha')}${K('−','Restar')}${K('1')}${K('2')}${K('3')}${K('ok',pe?'Guardar cambios':'Guardar pago','ok')}${K('+','Sumar')}${K('C','Borrar todo')}${K('0')}${K('.','Punto decimal')}</div>
  ${!pe&&t.estadoProd!=='entregado'&&nx&&nx.tipo==='entrega'?`<label class="chk"><input type="checkbox" name="entregar"> También marcar el trabajo como entregado hoy</label>`:''}
  <p class="err" id="perr"></p>
  <button type="button" class="lnk pvolver" data-a="verT" data-id="${id}">Volver al trabajo</button></form>`,{mount:s=>{
  const F=s.querySelector('form'),out=s.querySelector('#pval'),tp=s.querySelector('#ptp'),rs=s.querySelector('#pres'),err=s.querySelector('#perr'),pf=s.querySelector('#pf');
  const tipo=v=>{if(pe)return 'Pago';if(Math.abs(v-sal)<0.005)return 'Cancelación';if(nx&&nx.tipo!=='entrega'&&Math.abs(v-nx.falta)<0.005)return nx.concepto;return 'Abono'};
  const pinta=()=>{const v=calcExpr(ex),op=/[+\-*/×÷−]/.test(ex.replace(/^-/,''));out.innerHTML=`${esc(ex||'0')} <small>${esc(sim)}</small>`;rs.textContent=op&&isFinite(v)?'= '+fmtR(v,m):'';tp.textContent=isFinite(v)?tipo(v):'';err.textContent='';s.querySelectorAll('.pchips .chip').forEach(c=>c.classList.toggle('on',isFinite(v)&&Math.abs(+c.dataset.v-v)<0.005))};
  const tecla=k=>{const ops='+−×÷';
   if(k==='C'){ex='0';fresco=true}
   else if(k==='del'){ex=fresco?'0':ex.slice(0,-1)||'0';fresco=false}
   else if(ops.includes(k)){if(/[+−×÷]$/.test(ex))ex=ex.slice(0,-1);ex+=k;fresco=false}
   else if(k==='.'){if(fresco){ex='0.';fresco=false}else{const last=ex.split(/[+−×÷]/).pop();if(!last.includes('.'))ex+=(last===''?'0.':'.')}}
   else if(/^\d$/.test(k)){if(fresco){ex=k;fresco=false}else{const last=ex.split(/[+−×÷]/).pop();if(last==='0')ex=ex.slice(0,-1)+k;else if(!/\.\d\d$/.test(last))ex+=k}}
   else if(k==='fecha'){abreFecha();return}
   else if(k==='ok'){enviar();return}
   pinta()};
  const abreFecha=()=>{pf.focus();try{if(pf.showPicker)pf.showPicker()}catch(e){}pf.scrollIntoView({block:'center',behavior:'smooth'})};
  const alCambiarFecha=()=>{if(pf.value){fecha=pf.value;s.querySelector('#pfb').textContent=fLarga(fecha)}};
  pf.addEventListener('change',alCambiarFecha);pf.addEventListener('input',alCambiarFecha);
  s.querySelector('#pt').addEventListener('change',e=>{metodo=e.target.value;s.querySelector('#pmt').textContent=metodo});
  s.querySelector('.kp').addEventListener('click',e=>{const b=e.target.closest('[data-k]');if(b)tecla(b.dataset.k)});
  const ch=s.querySelector('.pchips');ch&&ch.addEventListener('click',e=>{const b=e.target.closest('[data-v]');if(b){ex=String(r2(+b.dataset.v));fresco=true;pinta()}});
  const enviar=()=>{const v=calcExpr(ex);if(!(v>0)){err.textContent='Escribe un monto mayor a cero.';return}
   const D=new FormData(F);const datos={monto:v,fecha:fecha||hoy(),metodo:metodo||'Otro',nota:String(D.get('nota')||'').trim()};if(m!=='PEN'&&tcDe(m)>0&&!(pe&&pe.tc))datos.tc=tcDe(m);
   document.removeEventListener('keydown',kb);
   mutT(id,n=>{n.pagos=n.pagos||[];if(pe){const k=n.pagos.findIndex(x=>x.id===pe.id);if(k>=0)Object.assign(n.pagos[k],datos)}else n.pagos.push({id:uid(),...datos});if(D.get('entregar')){n.estadoProd='entregado';n.entregadoEl=hoy()}});
   const queda=Math.max(0,r2(sal-v));toast(pe?'Pago actualizado.':queda<=0.004?'Pago registrado. ¡Trabajo cobrado completo!':'Pago registrado. Queda '+fmt(queda,m)+'.');verT(id)};
  F.addEventListener('submit',e=>{e.preventDefault();enviar()});
  const mapa={'*':'×','x':'×','X':'×','/':'÷','-':'−','+':'+',',':'.','.':'.','Backspace':'del','Delete':'C','Escape':null};
  function kb(e){if(!document.body.contains(F)){document.removeEventListener('keydown',kb);return}
   const tg=e.target;if(tg&&(tg.id==='pn'||tg.tagName==='SELECT'||tg.type==='date')){if(e.key==='Enter'&&tg.id==='pn'){e.preventDefault();enviar()}return}
   if(e.metaKey||e.ctrlKey||e.altKey)return;
   if(e.key==='Enter'){e.preventDefault();enviar();return}
   const k=/^\d$/.test(e.key)?e.key:mapa[e.key];if(k){e.preventDefault();tecla(k)}}
  document.addEventListener('keydown',kb);
  pinta();
 }});
}
function elegirParaPago(){
 const act=activos();if(!act.length){toast('No tienes trabajos con saldo pendiente.');return}
 const ord=GRUPOS.flatMap(([k])=>act.filter(t=>estado(t)===k).sort(ordVence));
 abrir(cab('¿De qué trabajo es el pago?')+ord.map(t=>`<article class="row" data-a="pago" data-id="${t.id}">${avT(t)}<div class="rm"><h3>${esc(t.titulo)}</h3><p>${esc(quien(t))}</p></div><div class="ra"><b>${fmt(aCobrar(t),t.moneda)}</b>${chip(t)}</div></article>`).join(''));
}

/* ---------- gastos ---------- */
function infoRodaje(t,h){const ds=diasRodaje(t);if(!ds.length)return{dist:9999,txt:''};const k=ds.findIndex(d=>d.fecha===h);if(k>=0)return{dist:0,hoy:true,txt:ds.length>1?`rodaje hoy · día ${k+1} de ${ds.length}`:'rodaje hoy'};let best=null;for(const d of ds){const x=Math.abs(dias(d.fecha,h));if(!best||x<best.x)best={x,f:d.fecha}}return{dist:best.x,txt:(best.f>h?'rodaje ':'rodó ')+fd(best.f).replace(/ \d{4}$/,'')}}
function candidatosGasto(){const h=hoy(),pri=t=>t.estadoProd==='produccion'?0:t.estadoProd==='cotizado'?1:t.estadoProd==='entregado'?2:1;return S.trabajos.filter(t=>t.estadoProd!=='cancelado').map(t=>({t,r:infoRodaje(t,h)})).sort((a,b)=>(b.r.hoy?1:0)-(a.r.hoy?1:0)||pri(a.t)-pri(b.t)||a.r.dist-b.r.dist).map(x=>({...x.t,_rod:x.r.txt,_hoy:!!x.r.hoy}))}
function fGasto(tid,gid,catPre){
 const rapido=!tid;
 if(rapido){const cs=candidatosGasto();if(!cs.length){toast('Primero registra un trabajo.');return}tid=cs[0].id}
 const t=S.trabajos.find(x=>x.id===tid);if(!t)return;
 const g0=gid?(t.gastos||[]).find(x=>x.id===gid):null;if(gid&&!g0)return;
 const g=g0?{...g0}:{id:uid(),cat:CATS.includes(catPre)?catPre:'Transporte',det:'',monto:'',fecha:hoy(),por:'',reemb:false,dev:false,foto:false};
 let img=null,quitar=false;
 const eq=equipo();
 abrir(cab(g0?'Editar gasto':'Registrar gasto',rapido?'':esc(t.titulo))+`<form novalidate>
  ${rapido?(()=>{const cs=candidatosGasto();return `<label for="gt">Trabajo</label><select id="gt" name="trabajo">${opts(cs.map(x=>[x.id,x.titulo+(x._rod?' · '+x._rod:'')+' · '+nomCli(x)]),tid)}</select><p class="hint" id="gth">${cs[0]._hoy?'Elegido porque hoy es día de rodaje de este trabajo. Cámbialo si el gasto es de otro.':'Hoy no hay rodaje: se eligió el trabajo con el rodaje más cercano. Cámbialo si el gasto es de otro.'}</p>`})():''}
  <label>Categoría</label><div class="cats">${CATS.map(k=>`<label><input type="radio" name="cat" value="${k}"${(g.cat||'Otros')===k?' checked':''}><span>${k}</span></label>`).join('')}</div>
  <div class="g2"><div><label for="gm">Monto <span class="req">*</span></label><input id="gm" name="monto" inputmode="decimal" value="${num(g.monto)>0?esc(g.monto):''}" placeholder="0.00"></div><div><label for="gf">Fecha</label><input id="gf" name="fecha" type="date" value="${esc(g.fecha||hoy())}"></div></div>
  <label for="gd">Detalle (opcional)</label><input id="gd" name="det" value="${esc(g.det||'')}" placeholder="Ej. Taxi al local, 2 noches en Cusco">
  <label for="gp">¿Quién lo pagó?</label><input id="gp" name="por" list="eq" value="${esc(g.por||'')}" placeholder="Déjalo vacío si salió de la caja"><datalist id="eq">${eq.map(x=>`<option value="${esc(x)}">`).join('')}</datalist>
  <label class="chk" id="gdv" ${g.por?'':'hidden'}><input type="checkbox" name="dev"${g.dev?' checked':''}> Ya se le devolvió el dinero</label>
  <label class="chk"><input type="checkbox" name="reemb"${g.reemb?' checked':''}> El cliente me lo reembolsa (se suma a lo que debe)</label>
  <label for="gi">Foto del comprobante</label>
  ${g.foto?`<p class="hint">Ya tiene foto. <button type="button" class="lnk" data-a="foto" data-id="${tid}" data-p="${esc(g.id)}">Ver</button> · <label class="inl"><input type="checkbox" name="quitar"> Quitar</label></p>`:''}
  <input id="gi" type="file" accept="image/*">
  <img id="gprev" class="foto" alt="" hidden>
  <p class="err" id="gerr"></p>
  <div class="acts"><button class="btn pri" type="submit">${g0?'Guardar cambios':'Guardar gasto'}</button><button class="btn" type="button" data-a="${rapido?'cerrar':'verT'}" data-id="${tid}">Cancelar</button>${g0?`<button class="btn red" type="button" data-a="borrarGasto" data-id="${tid}" data-p="${esc(g.id)}" data-c="1" data-cl="Toca otra vez para borrar">Borrar</button>`:''}</div></form>`,{mount:s=>{
  const F=s.querySelector('form'),err=s.querySelector('#gerr');
  if(catPre&&!g0)setTimeout(()=>{const i=s.querySelector('#gm');i&&i.focus()},60);
  s.querySelector('#gp').addEventListener('input',e=>{s.querySelector('#gdv').hidden=!e.target.value.trim()});
  s.querySelector('#gi').addEventListener('change',async e=>{const f=e.target.files&&e.target.files[0];if(!f)return;err.textContent='Preparando foto…';try{img=await comprimir(f);const p=s.querySelector('#gprev');p.src=img;p.hidden=false;err.textContent=''}catch(x){img=null;err.textContent='No se pudo leer esa imagen. Prueba con otra foto.'}});
  F.addEventListener('submit',e=>{e.preventDefault();const D=new FormData(F);const v=num(D.get('monto'));
   if(v<=0){err.textContent='Escribe un monto mayor a cero.';return}
   const destino=rapido?D.get('trabajo'):tid;
   quitar=!!D.get('quitar');
   const por=String(D.get('por')||'').trim();
   const ng={...g,cat:D.get('cat')||'Otros',monto:v,fecha:D.get('fecha')||hoy(),det:String(D.get('det')||'').trim(),por,dev:por?!!D.get('dev'):false,reemb:!!D.get('reemb')};
   if(img)ng.foto=true;else if(quitar){ng.foto=false;borrarFoto(g.id)}
   mutT(destino,n=>{n.gastos=n.gastos||[];const i=n.gastos.findIndex(x=>x.id===ng.id);if(i>=0)n.gastos[i]=ng;else n.gastos.push(ng)});
   if(img)guardarFoto(ng.id,destino,img).catch(()=>{});
   toast(g0?'Gasto actualizado.':'Gasto registrado.');verT(destino);
  });
 }});
}
async function verFoto(tid,gid){
 abrir(cab('Comprobante')+`<p class="hint">Cargando foto…</p>`);
 try{const img=await leerFoto(gid);if(ov.hidden)return;sh.innerHTML=cab('Comprobante')+(img&&/^data:image\//.test(img)?`<img class="foto" src="${img}" alt="Foto del comprobante">`:`<p class="hint">No se encontró la foto.</p>`)+`<div class="acts">${tid?`<button class="btn" data-a="verT" data-id="${esc(tid)}">Volver al trabajo</button>`:`<button class="btn" data-a="cerrar">Cerrar</button>`}</div>`}
 catch(e){sh.innerHTML=cab('Comprobante')+`<p class="hint">No se pudo cargar la foto. Revisa tu conexión.</p><div class="acts"><button class="btn" data-a="verT" data-id="${esc(tid)}">Volver</button></div>`}
}

/* ---------- gastos del negocio ---------- */
function fGastoGen(g0){
 const g=g0?{...g0}:{id:uid(),cat:'Equipo y accesorios',det:'',monto:'',moneda:S.aj.moneda||'PEN',fecha:hoy(),foto:false};
 let img=null;
 abrir(cab(g0?'Editar gasto del negocio':'Gasto del negocio','No pertenece a un trabajo')+`<form novalidate>
  <label>Categoría</label><div class="cats">${CATSG.map(k=>`<label><input type="radio" name="cat" value="${k}"${g.cat===k?' checked':''}><span>${k}</span></label>`).join('')}</div>
  <div class="g2"><div><label for="ggm">Monto <span class="req">*</span></label><input id="ggm" name="monto" inputmode="decimal" value="${num(g.monto)>0?esc(g.monto):''}" placeholder="0.00"></div><div><label for="ggc">Moneda</label><select id="ggc" name="moneda">${opts(Object.entries(MONEDAS),g.moneda)}</select></div></div>
  <div class="g2"><div><label for="ggf">Fecha</label><input id="ggf" name="fecha" type="date" value="${esc(g.fecha||hoy())}"></div><div><label for="ggd">Detalle</label><input id="ggd" name="det" value="${esc(g.det||'')}" placeholder="Ej. Lente 35 mm, Adobe CC"></div></div>
  <label for="ggi">Foto del comprobante</label>${g.foto?`<p class="hint">Ya tiene foto. <button type="button" class="lnk" data-a="fotoGen" data-id="${esc(g.id)}">Ver</button></p>`:''}<input id="ggi" type="file" accept="image/*"><img id="ggp" class="foto" alt="" hidden>
  <p class="err" id="ggerr"></p>
  <div class="acts"><button class="btn pri" type="submit">${g0?'Guardar cambios':'Guardar gasto'}</button><button class="btn" type="button" data-a="cerrar">Cancelar</button>${g0?`<button class="btn red" type="button" data-a="borrarGen" data-id="${esc(g.id)}" data-c="1" data-cl="Toca otra vez para borrar">Borrar</button>`:''}</div></form>`,{mount:s=>{
  s.querySelector('#ggi').addEventListener('change',async e=>{const f=e.target.files&&e.target.files[0];if(!f)return;try{img=await comprimir(f);const p=s.querySelector('#ggp');p.src=img;p.hidden=false}catch(x){s.querySelector('#ggerr').textContent='No se pudo leer esa imagen.'}});
  s.querySelector('form').addEventListener('submit',e=>{e.preventDefault();const F=new FormData(e.target);const v=num(F.get('monto'));if(v<=0){s.querySelector('#ggerr').textContent='Escribe un monto mayor a cero.';return}
   Object.assign(g,{cat:F.get('cat')||'Otros',monto:v,moneda:F.get('moneda')||'PEN',fecha:F.get('fecha')||hoy(),det:String(F.get('det')||'').trim(),mod:Date.now()});if(img)g.foto=true;
   guardar('gastosGen',g).catch(()=>{});if(img)guardarFoto(g.id,'',img).catch(()=>{});toast(g0?'Gasto actualizado.':'Gasto del negocio registrado.');cerrar();
  });
 }});
}

/* ---------- PDF ---------- */
let pdfLib=null;
function cargarPdf(){if(pdfLib)return pdfLib;pdfLib=new Promise((res,rej)=>{const sc=document.createElement('script');sc.src='vendor/jspdf.umd.min.js';sc.onload=()=>window.jspdf?res(window.jspdf.jsPDF):rej(new Error('pdf'));sc.onerror=()=>{pdfLib=null;rej(new Error('pdf'))};document.head.appendChild(sc)});return pdfLib}
const pdfTxt=x=>String(x??'').replace(/[•●▪]/g,'·').replace(/[“”]/g,'"').replace(/[‘’]/g,"'").replace(/[–—]/g,'-').replace(/…/g,'...').replace(/[^\x20-\xFF\n]/g,'');
async function hacerPdf(tipo,t,p){
 const dl=window.claude&&window.claude.use?await window.claude.use('downloads').catch(()=>null):null;
 if(!dl){toast('Aquí no se pueden descargar archivos. Te dejo el texto para copiar.');copiar(tipo==='recibo'?textoRecibo(t,p):textoT(t));return}
 toast('Preparando PDF…');
 let J;try{J=await cargarPdf()}catch(e){toast('No se pudo preparar el PDF. Revisa tu conexión.');return}
 const d=new J({unit:'pt',format:'a4'}),W=595,M=48,m=t.moneda,c=cli(t.clienteId);let y=0;
 const txt=(x,X,Y,o={})=>{d.setFont('helvetica',o.b?'bold':'normal');d.setFontSize(o.s||10);d.setTextColor(...(o.c||[15,15,15]));d.text(pdfTxt(x),X,Y,o.r?{align:'right'}:undefined)};
 d.setFillColor(5,18,41);d.rect(0,0,W,96,'F');
 for(let i=-20;i<W;i+=24){d.setFillColor(255,255,255);d.triangle(i,0,i+12,0,i,12,'F');d.triangle(i+12,0,i+24,0,i+12,12,'F')}
 txt(S.aj.negocio||'Producción audiovisual',M,48,{s:18,b:1,c:[255,255,255]});
 txt(tipo==='recibo'?'CONSTANCIA DE PAGO':'ESTADO DE CUENTA',M,72,{s:10,c:[200,208,220]});
 const num_=tipo==='recibo'?'N.º '+String(p.fecha||'').replace(/-/g,'')+'-'+String((t.pagos||[]).findIndex(x=>x.id===p.id)+1).padStart(2,'0'):fd(hoy());
 txt(num_,W-M,72,{s:10,c:[200,208,220],r:1});
 y=134;
 const fila=(k,v,o={})=>{txt(k,M,y,{s:10,c:[90,100,110]});txt(v,W-M,y,{s:o.s||11,b:o.b,r:1,c:o.c});y+=o.gap||22};
 const linea=()=>{d.setDrawColor(226,229,232);d.line(M,y-12,W-M,y-12)};
 fila('Cliente',c?c.nombre:'—');if(c&&c.doc)fila('RUC / DNI',c.doc);if(nomArt(t))fila('Artista o grupo',nomArt(t));fila('Trabajo',t.titulo);if(temasTxt(t))fila('Temas',temasTxt(t)+(t.temasNom?' ('+t.temasNom+')':''));if(t.fecha)fila('Fecha del trabajo',fd(t.fecha));
 y+=8;linea();
 if(tipo==='recibo'){
  txt('Monto recibido',M,y+6,{s:11,c:[90,100,110]});txt(fmtR(num(p.monto),m),W-M,y+10,{s:26,b:1,r:1,c:[5,18,41]});y+=44;
  fila('Fecha de pago',fd(p.fecha));fila('Método',p.metodo||'—');if(p.nota)fila('Concepto',p.nota);
  y+=8;linea();
  fila('Total del trabajo',fmtR(cobrarT(t),m));const hasta=(t.pagos||[]).filter(x=>(x.fecha||'')<(p.fecha||'')||((x.fecha||'')===(p.fecha||'')&&(t.pagos||[]).indexOf(x)<=(t.pagos||[]).indexOf(p))).reduce((a,x)=>a+num(x.monto),0);
  fila('Pagado a la fecha',fmtR(r2(hasta),m));fila('Saldo pendiente',fmtR(Math.max(0,r2(cobrarT(t)-hasta)),m),{b:1,c:r2(cobrarT(t)-hasta)>0?[156,36,92]:[15,15,15]});
 }else{
  fila('Monto del trabajo',fmtR(num(t.total),m));if(t.retencion)fila('Retención 4ta categoría (8 %)','- '+fmtR(retT(t),m));const rb=(t.gastos||[]).filter(g=>g.reemb);rb.forEach(g=>fila('Reembolso: '+(g.cat||'Gasto')+(g.det?' - '+g.det:''),fmtR(num(g.monto),m)));fila('Total a pagar',fmtR(cobrarT(t),m),{b:1});
  y+=8;linea();txt('Forma de pago',M,y,{s:11,b:1});y+=20;
  cuotas(t).filter(q=>q.monto>0).forEach(q=>fila(q.concepto+(q.vence?' ('+fd(q.vence)+')':''),q.falta<=0.004?'Pagado  '+fmtR(q.monto,m):'Pendiente  '+fmtR(q.falta,m),{c:q.falta>0.004?[156,36,92]:[15,15,15]}));
  const ps=(t.pagos||[]).slice().sort((a,b)=>(a.fecha||'').localeCompare(b.fecha||''));
  if(ps.length){y+=8;linea();txt('Pagos recibidos',M,y,{s:11,b:1});y+=20;ps.forEach(x=>{if(y>760){d.addPage();y=60}fila(fd(x.fecha)+' · '+(x.metodo||''),fmtR(num(x.monto),m))})}
  y+=8;linea();fila('SALDO PENDIENTE',fmtR(saldo(t),m),{b:1,s:14,c:saldo(t)>0?[156,36,92]:[15,15,15]});
 }
 txt('Documento de control interno. No reemplaza al recibo por honorarios ni a la factura electrónica de SUNAT.',M,800,{s:8,c:[130,138,146]});
 const blob=d.output('blob');
 const nom=(tipo==='recibo'?'constancia-pago-':'estado-de-cuenta-')+String(t.titulo).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^\w]+/g,'-').replace(/^-|-$/g,'').slice(0,40).toLowerCase()+(tipo==='recibo'?'-'+(p.fecha||''):'')+'.pdf';
 try{await dl.save({filename:nom,data:blob});toast('PDF listo.')}catch(e){if(e&&e.code==='declined')return;toast(e&&e.code==='rate_limited'?'Ya hay una descarga esperando tu confirmación.':'No se pudo guardar el PDF aquí.')}
}
/* ---------- pagos al equipo ---------- */
const ROLES=['Dirección de fotografía','Camarógrafo','Asistente de cámara','Foquista','Gaffer / luces','Sonido','Edición','Colorista','Maquillaje','Vestuario','Producción','Drone','Asistente'];
function fEquipo(tid,eid){
 const t=S.trabajos.find(x=>x.id===tid);if(!t)return;const m=t.moneda||'PEN';
 const e0=eid?(t.equipo||[]).find(x=>x.id===eid):null;if(eid&&!e0)return;
 const q=e0?JSON.parse(JSON.stringify(e0)):{id:uid(),persona:'',rol:'',acordado:'',pagos:[]};
 const nombres=[...new Set([...String(S.aj.equipo||'').split(',').map(x=>x.trim()),...S.trabajos.flatMap(x=>(x.equipo||[]).map(e=>e.persona))].filter(Boolean))];
 const freel=r2((t.gastos||[]).filter(g=>g.cat==='Personal / freelancers').reduce((a,g)=>a+num(g.monto),0));
 abrir(cab(e0?'Pago al equipo':'Agregar persona',esc(t.titulo))+`<form novalidate>
  <div class="g2"><div><label for="eqn">Persona <span class="req">*</span></label><input id="eqn" name="persona" list="eqnl" value="${esc(q.persona)}" autocomplete="off"><datalist id="eqnl">${nombres.map(n=>`<option value="${esc(n)}">`).join('')}</datalist></div>
  <div><label for="eqr">Rol</label><input id="eqr" name="rol" list="eqrl" value="${esc(q.rol)}" autocomplete="off"><datalist id="eqrl">${ROLES.map(n=>`<option value="${esc(n)}">`).join('')}</datalist></div></div>
  <label for="eqa">Monto acordado (${esc(m)})</label><input id="eqa" name="acordado" inputmode="decimal" value="${esc(q.acordado)}" placeholder="0.00">
  <label>Pagos hechos</label><div id="eqpg"></div>
  <div class="acts" style="margin:6px 0"><button type="button" class="btn sm" id="eqadd">${ic('plus')}Agregar pago</button><button type="button" class="btn sm" id="eqtodo">Pagar lo que falta hoy</button></div>
  <p class="hint" id="eqres"></p>
  ${freel>0?`<p class="hint">Este trabajo ya tiene ${fmt(freel,m)} en gastos “Personal / freelancers”. Si son los mismos pagos, bórralos de los gastos para no contarlos dos veces.</p>`:''}
  <p class="err" id="eqerr" role="alert"></p>
  <div class="acts"><button class="btn pri" type="submit">Guardar</button><button class="btn" type="button" data-a="verT" data-id="${tid}">Cancelar</button>${e0?`<button class="btn red" type="button" data-a="borrarEq" data-id="${tid}" data-p="${esc(q.id)}" data-c="1" data-cl="Toca otra vez para quitar">Quitar</button>`:''}</div></form>`,{mount:s=>{
  const box=s.querySelector('#eqpg'),res=s.querySelector('#eqres'),ac=s.querySelector('#eqa'),F=s.querySelector('form'),err=s.querySelector('#eqerr');
  const leer=()=>{box.querySelectorAll('.eqp').forEach((r,i)=>{q.pagos[i].monto=r.querySelector('[data-f=m]').value;q.pagos[i].fecha=r.querySelector('[data-f=f]').value;q.pagos[i].metodo=r.querySelector('[data-f=t]').value})};
  const resumen=()=>{const pag=r2(q.pagos.reduce((a,p)=>a+num(p.monto),0)),f=r2(num(ac.value)-pag);res.textContent=num(ac.value)>0?(f>0.004?`Pagado ${fmtR(pag,m)} · falta ${fmtR(f,m)}`:f<-0.004?`Pagaste ${fmtR(-f,m)} más de lo acordado.`:'Pagado completo ✓'):(pag>0?`Pagado ${fmtR(pag,m)}`:'')};
  const pinta=()=>{box.innerHTML=q.pagos.length?q.pagos.map((p,i)=>`<div class="eqp"><input data-f="m" inputmode="decimal" aria-label="Monto del pago ${i+1}" value="${esc(p.monto)}" placeholder="0.00"><input data-f="f" type="date" aria-label="Fecha" value="${esc(p.fecha||hoy())}"><select data-f="t" aria-label="Método">${opts(METODOS.map(x=>[x,x]),p.metodo||'Yape')}</select><button type="button" class="x sm" data-r="${i}" aria-label="Quitar pago">×</button></div>`).join(''):'<p class="hint" style="margin:0">Todavía no hay pagos.</p>';resumen()};
  pinta();
  ac.addEventListener('input',resumen);box.addEventListener('input',()=>{leer();resumen()});box.addEventListener('change',()=>{leer();resumen()});
  box.addEventListener('click',e=>{const b=e.target.closest('[data-r]');if(b){leer();q.pagos.splice(+b.dataset.r,1);pinta()}});
  s.querySelector('#eqadd').addEventListener('click',()=>{leer();q.pagos.push({id:uid(),monto:'',fecha:hoy(),metodo:'Yape'});pinta();box.querySelector('.eqp:last-child [data-f=m]').focus()});
  s.querySelector('#eqtodo').addEventListener('click',()=>{leer();const f=r2(num(ac.value)-q.pagos.reduce((a,p)=>a+num(p.monto),0));if(!(f>0)){err.textContent=num(ac.value)>0?'Ya está pagado completo.':'Primero escribe el monto acordado.';return}err.textContent='';q.pagos.push({id:uid(),monto:String(f),fecha:hoy(),metodo:'Yape'});pinta()});
  F.addEventListener('submit',e=>{e.preventDefault();leer();const D=new FormData(F);const persona=String(D.get('persona')||'').trim();
   if(!persona){err.textContent='Escribe el nombre de la persona.';return}
   const n={...q,persona,rol:String(D.get('rol')||'').trim(),acordado:r2(num(D.get('acordado'))),pagos:q.pagos.filter(p=>num(p.monto)>0).map(p=>({id:p.id||uid(),monto:r2(num(p.monto)),fecha:p.fecha||hoy(),metodo:p.metodo||'Otro'}))};
   mutT(tid,x=>{x.equipo=x.equipo||[];const i=x.equipo.findIndex(y=>y.id===n.id);if(i>=0)x.equipo[i]=n;else x.equipo.push(n)});
   toast(e0?'Pago al equipo actualizado.':persona+' agregado al equipo.');verT(tid)});
  if(!e0)setTimeout(()=>s.querySelector('#eqn').focus(),60);
 }});
}
/* ---------- cotizaciones ---------- */
const PARTIDAS=['Dirección y realización','Rodaje (día)','Cámara y lentes','Equipo de luces','Drone','Edición y montaje','Colorización','Diseño de sonido','Movilidad','Locación','Maquillaje','Arte y vestuario'];
const totCot=c=>r2(((c&&c.items)||[]).reduce((a,x)=>a+r2(num(x.cant||1)*num(x.precio)),0));
function sigNumCot(anio){let mx=0;for(const t of S.trabajos){const m=/^COT-(\d{4})-(\d+)$/.exec((t.cot&&t.cot.num)||'');if(m&&m[1]===String(anio))mx=Math.max(mx,+m[2])}return `COT-${anio}-${String(mx+1).padStart(3,'0')}`}
function fCotPartidas(id){
 const t=S.trabajos.find(x=>x.id===id);if(!t)return;const m=t.moneda||'PEN';
 const c0=t.cot||{},emit=c0.emitida||hoy();
 let items=(c0.items&&c0.items.length?c0.items:(num(t.total)>0?[{concepto:(t.tipo&&!nrm(t.titulo).includes(nrm(t.tipo))?t.tipo+' – ':'')+(t.titulo||'Producción'),cant:1,precio:num(t.total)}]:[{concepto:'',cant:1,precio:''}])).map(x=>({id:x.id||uid(),concepto:x.concepto||'',cant:x.cant??1,precio:x.precio??''}));
 abrir(cab(c0.num?'Cotización '+esc(c0.num):'Cotización',esc(t.titulo))+`<form novalidate>
  <label>Modelo</label><div class="segm" role="group" aria-label="Modelo">${modelos().map(x=>`<button type="button" data-mod="${esc(x.id)}">${esc(x.nombre)}</button>`).join('')}<button type="button" class="on" aria-pressed="true">Por partidas</button></div>
  <label>Partidas</label><div id="qitems"></div>
  <div class="acts" style="margin:6px 0"><button type="button" class="btn sm" id="qadd">${ic('plus')}Agregar partida</button></div>
  <div class="chips presets" id="qpre">${PARTIDAS.map(x=>`<button type="button" class="chip" data-q="${esc(x)}">${esc(x)}</button>`).join('')}</div>
  <div class="qtot"><span>Total</span><b id="qtotal">${fmtR(0,m)}</b></div>
  <label class="chk"><input type="checkbox" name="usarTotal" checked> Usar este total como monto del trabajo</label>
  <div class="g2"><div><label for="qe">Fecha de emisión</label><input id="qe" name="emitida" type="date" value="${esc(emit)}"></div><div><label for="qv">Válida hasta</label><input id="qv" name="valida" type="date" value="${esc(c0.valida||sumarDias(emit,num(S.aj.cotValidez)||15))}"></div></div>
  <label for="qt">Términos y condiciones</label><textarea id="qt" name="terminos" rows="6">${esc(c0.terminos??S.aj.cotTerminos??TERM_DEF)}</textarea>
  <p class="hint">La forma de pago (adelanto y cuotas) se toma del trabajo. Los términos por defecto se cambian en Ajustes.</p>
  <p class="err" id="qerr" role="alert"></p>
  <div class="acts"><button class="btn pri" type="submit" name="pdf" value="1">Guardar y descargar PDF</button><button class="btn" type="submit">Guardar</button><button class="btn" type="button" data-a="verT" data-id="${t.id}">Cancelar</button></div></form>`,{mount:s=>{
  const box=s.querySelector('#qitems'),tot=s.querySelector('#qtotal'),F=s.querySelector('form'),err=s.querySelector('#qerr');
  s.querySelector('.segm').addEventListener('click',e=>{const b=e.target.closest('[data-mod]');if(b)fCotModelo(id,b.dataset.mod)});
  const leer=()=>{box.querySelectorAll('.qrow').forEach((r,i)=>{items[i].concepto=r.querySelector('[data-f=c]').value;items[i].cant=r.querySelector('[data-f=n]').value;items[i].precio=r.querySelector('[data-f=p]').value})};
  const suma=()=>{tot.textContent=fmtR(totCot({items}),m)};
  const pinta=()=>{box.innerHTML=items.map((x,i)=>`<div class="qrow"><input data-f="c" aria-label="Concepto ${i+1}" placeholder="Concepto" value="${esc(x.concepto)}"><input data-f="n" aria-label="Cantidad" inputmode="decimal" value="${esc(x.cant)}"><input data-f="p" aria-label="Precio unitario" inputmode="decimal" placeholder="0.00" value="${esc(x.precio)}"><button type="button" class="x sm" data-r="${i}" aria-label="Quitar partida">×</button></div>`).join('');suma()};
  pinta();
  box.addEventListener('input',()=>{leer();suma()});
  box.addEventListener('click',e=>{const b=e.target.closest('[data-r]');if(b){leer();items.splice(+b.dataset.r,1);if(!items.length)items.push({id:uid(),concepto:'',cant:1,precio:''});pinta()}});
  s.querySelector('#qadd').addEventListener('click',()=>{leer();items.push({id:uid(),concepto:'',cant:1,precio:''});pinta();box.querySelector('.qrow:last-child [data-f=c]').focus()});
  s.querySelector('#qpre').addEventListener('click',e=>{const b=e.target.closest('[data-q]');if(!b)return;leer();const vacia=items.find(x=>!x.concepto&&!num(x.precio));if(vacia)vacia.concepto=b.dataset.q;else items.push({id:uid(),concepto:b.dataset.q,cant:1,precio:''});pinta();const ps=[...box.querySelectorAll('[data-f=p]')].find((x,i)=>items[i].concepto===b.dataset.q&&!x.value);ps&&ps.focus()});
  s.querySelector('#qe').addEventListener('change',e=>{if(e.target.value)s.querySelector('#qv').value=sumarDias(e.target.value,num(S.aj.cotValidez)||15)});
  F.addEventListener('submit',async e=>{e.preventDefault();leer();
   const L=items.filter(x=>x.concepto.trim()||num(x.precio)>0).map(x=>({id:x.id,concepto:x.concepto.trim()||'Partida',cant:num(x.cant)||1,precio:r2(num(x.precio))}));
   if(!L.length||totCot({items:L})<=0){err.textContent='Agrega al menos una partida con precio.';return}
   const D=new FormData(F),emi=D.get('emitida')||hoy();
   const cot={num:c0.num||sigNumCot(emi.slice(0,4)),modo:'partidas',emitida:emi,valida:D.get('valida')||'',terminos:String(D.get('terminos')||'').trim(),items:L};
   const usar=!!D.get('usarTotal'),pdf=e.submitter&&e.submitter.name==='pdf';
   await mutT(id,n=>{n.cot=cot;if(usar)n.total=totCot(cot)});
   toast('Cotización '+cot.num+' guardada.');verT(id);
   if(pdf){const t2=S.trabajos.find(x=>x.id===id);t2&&hacerCotPdf(t2)}
  });
 }});
}
function dibujarCotPartidas(d,t,logo){
 const W=595,H=842,M=48,m=t.moneda||'PEN',c=cli(t.clienteId),q=t.cot;let y=0;
 const NAVY=[5,18,41],ROSA=[216,27,96],GRIS=[90,100,110];
 const txt=(x,X,Y,o={})=>{d.setFont('helvetica',o.b?'bold':'normal');d.setFontSize(o.s||10);d.setTextColor(...(o.c||[15,15,15]));d.text(pdfTxt(x),X,Y,o.r?{align:'right'}:undefined)};
 const salto=h=>{if(y+h>H-70){d.addPage();y=60}};
 encabezadoPdf(d,t,logo,txt,W,M);
 y=146;
 const col=(k,v,X,w)=>{txt(k.toUpperCase(),X,y,{s:8,c:GRIS});const ls=d.splitTextToSize(pdfTxt(v||'—'),w);d.setFont('helvetica','bold');d.setFontSize(11);d.setTextColor(15,15,15);d.text(ls,X,y+15);return ls.length};
 const w2=(W-2*M-24)/2;
 let n1=col('Cliente',c?(c.nombre+(c.empresa?' · '+c.empresa:'')):'',M,w2),n2=col('Proyecto',[t.titulo,nomArt(t)].filter(Boolean).join(' · '),M+w2+24,w2);y+=28+12*Math.max(n1,n2);
 n1=col(c&&c.doc?'RUC / DNI':'Tipo de trabajo',c&&c.doc?c.doc:(t.tipo||''),M,w2);n2=col('Fecha tentativa',t.fecha?fd(t.fecha)+(t.lugar?' · '+t.lugar:''):'Por definir',M+w2+24,w2);y+=28+12*Math.max(n1,n2);
 y+=6;
 // tabla
 const X1=M,X2=W-M-210,X3=W-M-120,X4=W-M;
 d.setFillColor(242,244,247);d.rect(M,y,W-2*M,24,'F');
 txt('Concepto',X1+10,y+16,{s:9,b:1,c:GRIS});txt('Cant.',X2+30,y+16,{s:9,b:1,c:GRIS,r:1});txt('P. unitario',X3+30,y+16,{s:9,b:1,c:GRIS,r:1});txt('Importe',X4-10,y+16,{s:9,b:1,c:GRIS,r:1});
 y+=24;
 q.items.forEach((x,i)=>{const ls=d.splitTextToSize(pdfTxt(x.concepto),X2-X1-30),h=Math.max(26,ls.length*13+13);salto(h);
  if(i%2)d.setFillColor(250,251,252),d.rect(M,y,W-2*M,h,'F');
  d.setFont('helvetica','normal');d.setFontSize(10);d.setTextColor(15,15,15);d.text(ls,X1+10,y+17);
  txt(String(num(x.cant)||1),X2+30,y+17,{r:1});txt(fmtR(num(x.precio),m),X3+30,y+17,{r:1});txt(fmtR(r2(num(x.cant||1)*num(x.precio)),m),X4-10,y+17,{r:1,b:1});
  y+=h;d.setDrawColor(230,233,236);d.line(M,y,W-M,y)});
 y+=26;salto(40);
 txt('TOTAL',X3-40,y,{s:11,b:1,c:GRIS,r:1});txt(fmtR(totCot(q),m),X4-10,y+2,{s:20,b:1,c:NAVY,r:1});y+=34;
 // forma de pago
 const tt={...t,total:totCot(q),pagos:[]},cs=cuotas(tt).filter(x=>x.monto>0);
 if(cs.length){salto(30+cs.length*18);txt('Forma de pago',M,y,{s:11,b:1});y+=18;cs.forEach(x=>{txt('• '+x.concepto+(x.vence?' ('+fd(x.vence)+')':''),M,y,{s:10});txt(fmtR(x.monto,m),X4-10,y,{s:10,r:1});y+=17});y+=8}
 if(q.valida){salto(26);txt('Esta cotización es válida hasta el '+fd(q.valida)+'.',M,y,{s:10,b:1,c:ROSA});y+=24}
 if(q.terminos){const ls=d.splitTextToSize(pdfTxt(q.terminos),W-2*M);salto(24);txt('Términos y condiciones',M,y,{s:11,b:1});y+=16;d.setFont('helvetica','normal');d.setFontSize(9);d.setTextColor(...GRIS);ls.forEach(l=>{salto(13);d.text(l,M,y);y+=13})}
 const pie=[S.aj.negocio,S.aj.cotContacto].filter(Boolean).join(' · ');
 const np=d.getNumberOfPages();for(let i=1;i<=np;i++){d.setPage(i);d.setDrawColor(230,233,236);d.line(M,H-46,W-M,H-46);txt(pie,M,H-30,{s:8,c:GRIS});if(np>1)txt(i+' / '+np,W-M,H-30,{s:8,c:GRIS,r:1})}
}

/* ---------- modelos de cotización (Videoclip, Sesión en vivo, Boda) ---------- */
// Basados en las cotizaciones de eMotion Studios. Se editan en Ajustes y se copian a cada trabajo al cotizar.
const MODELOS_DEF=[
 {id:'videoclip',nombre:'Videoclip',titulo:'Cotización – Producción de video musical',etiqueta:'Cliente',precio:2500,
  intro:'A continuación, se detalla la cotización para la producción de {videos}, con una duración aproximada de 5 minutos por video, a realizarse en la ciudad de {ciudad}.',
  servicio:'Servicios principales',
  incluye:['Producción y filmación (dirección, cámara y operador)','Edición y postproducción (incluye corrección de color)','Entrega optimizada para redes'],
  equipos:['Cámara Sony FX3 Cinema Line (grabación en 4K)','Lentes de cine Nisi Athena','Drone DJI Mavic 2 Pro','Iluminación básica (2 luces LED + difusores y soportes)','Trípodes y estabilizadores','Equipo técnico (3 personas)','2 días de rodaje (recomendado)'],
  opcionales:[{nombre:'Iluminación profesional (3 luces LED COB + C-Stand + difusores)',precio:300},{nombre:'Máquina de humo',precio:50},{nombre:'Cámara secundaria',precio:500}],
  notaOpc:'Recomendado para lograr mayor calidad visual en locaciones amplias, escenas nocturnas o propuestas más exigentes.',
  altTitulo:'Opciones',alternativas:[],secciones:[],
  consideraciones:['Los equipos serán utilizados según requerimientos técnicos y condiciones de rodaje.','Los costos no incluyen IGV, transporte, hospedaje, viáticos, actores, extras, alquiler de locaciones ni elementos de arte o escenografía.','Incluye hasta 2 rondas de correcciones en postproducción.'],
  fechaEtiqueta:'Fecha tentativa de rodaje',notaFecha:'',
  entrega:'15 días hábiles posteriores al rodaje y a la recepción del audio master final.',
  material:['Video final en resolución 4K'],
  pago:['50% a la firma del contrato','50% contra entrega del producto final'],validez:15},
 {id:'envivo',nombre:'Sesión en vivo',titulo:'Cotización – Realización de una sesión de video en vivo',etiqueta:'Cliente',precio:8000,
  intro:'A continuación, se detalla la cotización para la producción y filmación de una sesión musical en vivo, a realizarse en la ciudad de {ciudad}, contemplando aproximadamente {canciones}, con posibilidad de registrar canciones adicionales dentro del tiempo de producción contratado.',
  servicio:'Producción y filmación de sesión musical en vivo',
  incluye:['Dirección y realización audiovisual.','Filmación multicámara con hasta 5 cámaras de alta calidad y en 4K.','Operación y coordinación de cámaras durante la sesión.','Edición y postproducción del material.','Corrección de color.','Entrega del material final optimizado para plataformas digitales.','Entrega final en resolución 4K.'],
  equipos:[],opcionales:[],notaOpc:'',altTitulo:'Opciones',alternativas:[],
  secciones:[
   {titulo:'Jornada de producción',texto:'La producción contempla una jornada de aproximadamente 12 horas, incluyendo:\n• Preparación y montaje técnico.\n• Pruebas de cámara e iluminación.\n• Grabación de aproximadamente 15 canciones.\n• Descansos.\n• Ajustes técnicos necesarios durante la jornada.\n• Tomas adicionales de apoyo.\nLas 12 horas corresponden al tiempo total de jornada de producción, incluyendo descansos y tiempos de preparación. No representan 12 horas continuas de interpretación musical.\nEn caso de superar el tiempo de jornada establecido, las horas adicionales serán coordinadas y cotizadas por separado.'},
   {titulo:'Iluminación',texto:'Se incluye iluminación básica destinada principalmente a los artistas y a la correcta exposición y calidad de las imágenes durante la grabación.\nLa iluminación contemplada no corresponde a iluminación decorativa o de escenografía, por lo que cualquier requerimiento específico para iluminar el decorado, ambientación o elementos escénicos deberá ser considerado como un servicio adicional.'},
   {titulo:'Equipo humano',texto:'La producción contempla el personal técnico necesario para la realización de la sesión multicámara, incluyendo dirección, operación de cámaras y asistencia técnica.'},
   {titulo:'Equipos y servicios opcionales',texto:'En caso de requerirse equipos o servicios adicionales no contemplados en la presente cotización, estos serán cotizados por separado y deberán ser aprobados previamente por el cliente.\nEstos servicios opcionales podrán recomendarse de acuerdo con las características de la locación, propuesta visual o requerimientos específicos de la producción.'}],
  consideraciones:['Los costos no incluyen IGV, transporte, hospedaje, viáticos, artistas adicionales, extras, alquiler de locación, escenografía, utilería, vestuario ni elementos de arte, salvo que se indique expresamente lo contrario.','El cliente deberá garantizar el acceso a la locación y las condiciones necesarias para la instalación y operación de los equipos.','El cliente deberá proporcionar el audio master final necesario para la edición y sincronización del material.','Se incluyen hasta 2 rondas de correcciones en postproducción.'],
  fechaEtiqueta:'Fecha tentativa de rodaje',notaFecha:'La fecha definitiva deberá ser confirmada y coordinada previamente entre ambas partes.',
  entrega:'20 días hábiles posteriores al rodaje y a la recepción del audio master final y demás materiales necesarios para iniciar la edición.',
  material:['Video final en resolución 4K'],
  pago:['50% a la firma del contrato','50% contra entrega del producto final'],validez:15},
 {id:'boda',nombre:'Boda',titulo:'Proforma – Cobertura audiovisual de boda',etiqueta:'Novios',precio:10000,
  intro:'',servicio:'Servicios principales',
  incluye:['Sesión de preboda: una cámara. Fecha y locación coordinadas con los novios.','Cobertura de la boda: filmación con cuatro cámaras.','Ceremonia completa: edición independiente desde el ingreso de los novios hasta la salida, con registro de votos, lecturas y audio de la ceremonia. La calidad del audio dependerá de las condiciones del lugar y de los accesos disponibles para instalar micrófonos o grabadoras.','Cobertura completa de la recepción: registro audiovisual de los momentos programados, con cuatro cámaras, hasta la hora acordada.','Edición y corrección de color.'],
  equipos:['Cámaras y lentes de alta calidad.','Trípodes, estabilizadores e iluminación básica según las condiciones del evento.','Equipo de filmación según la cobertura indicada.'],
  opcionales:[{nombre:'Video de preboda para proyectar el día de la boda o compartir como invitación digital',precio:300},{nombre:'Edición resumen de 30 a 45 minutos',precio:500},{nombre:'Tomas con dron (vistas alrededor de la pareja y momentos clave del evento)',precio:500},{nombre:'Cámara adicional con operador',precio:1000}],
  notaOpc:'',altTitulo:'Opciones de calidad',
  alternativas:[{nombre:'Full HD',detalle:'1920 × 1080',precio:10000},{nombre:'4K UHD',detalle:'3840 × 2160',precio:12000}],
  secciones:[],
  consideraciones:['La cobertura se realizará dentro del horario y programa coordinados con los novios.','Los costos no incluyen transporte, hospedaje ni viáticos, permisos, alquiler de locaciones o servicios de terceros.','La disponibilidad de tomas con dron depende de la locación y las condiciones del evento.','Horario de cobertura: a coordinar con el cliente.'],
  fechaEtiqueta:'Fecha del evento',notaFecha:'',
  entrega:'20 días hábiles después de la boda.',
  material:['Preboda','Ceremonia completa'],
  pago:['50% para reservar la fecha','50% contra entrega'],validez:15}
];
const CATALOGO_DEF=[
 ['Cámara Sony FX3 Cinema Line (grabación en 4K)',0],['Lentes de cine Nisi Athena',0],['Drone DJI Mavic 2 Pro',0],['Iluminación básica (2 luces LED + difusores y soportes)',0],['Trípodes y estabilizadores',0],['Equipo técnico (3 personas)',0],
 ['Iluminación profesional (3 luces LED COB + C-Stand + difusores)',300],['Máquina de humo',50],['Cámara secundaria',500],['Cámara adicional con operador',1000],['Tomas con dron',500],['Edición resumen de 30 a 45 minutos',500],['Video de preboda para proyectar o invitación digital',300],['Día adicional de rodaje',800]
].map(([nombre,precio],i)=>({id:'c'+i,nombre,precio}));
const MSG_COT_DEF='Hola {nombre}, ¿cómo estás? Te envío la cotización {numero} para «{trabajo}». Cualquier duda me escribes. Saludos, {negocio}.';
const modelos=()=>Array.isArray(S.aj.modelos)&&S.aj.modelos.length?S.aj.modelos.map(x=>({...x,intro:introActual(x.intro)})):MODELOS_DEF;
const catalogo=()=>Array.isArray(S.aj.catalogo)?S.aj.catalogo:CATALOGO_DEF;
const lineas=v=>String(v||'').split('\n').map(x=>x.replace(/^\s*[•·\-*]\s*/,'').trim()).filter(Boolean);
const cotLista=t=>!!(t&&t.cot&&(t.cot.modo==='modelo'||(t.cot.items||[]).length));
function totModelo(c){const alt=(c.alternativas||[]).find(a=>a.id&&a.id===c.alt);return r2((alt?num(alt.precio):num(c.precio))+(c.opcionales||[]).filter(o=>o.ok).reduce((a,o)=>a+num(o.precio),0))}
// Texto de las fechas de rodaje del trabajo, p. ej. "4 y 5 de agosto de 2026"
function fechasRodaje(t){const bs=bloques(t);if(!bs.length)return'';return bs.map(b=>b.hasta&&b.hasta>b.fecha?fd(b.fecha)+' al '+fd(b.hasta):fd(b.fecha)).join(' · ')}
// Textos de la primera versión de los modelos (fijaban 1 video y 15 canciones): se cambian por los que usan la cantidad de temas del trabajo
const introActual=x=>String(x||'').replace('A continuación, se detalla la cotización para la producción de 1 video musical, con una duración aproximada de 5 minutos, a realizarse en la ciudad de {ciudad}.','A continuación, se detalla la cotización para la producción de {videos}, con una duración aproximada de 5 minutos por video, a realizarse en la ciudad de {ciudad}.').replace('contemplando aproximadamente 15 canciones, con posibilidad','contemplando aproximadamente {canciones}, con posibilidad');
function datosTemas(t){const n=parseInt(t&&t.temas,10)||0,nom=String((t&&t.temasNom)||'').split(',').map(x=>x.trim()).filter(Boolean);
 const lista=nom.length?' ('+nom.map(x=>'«'+x+'»').join(', ')+')':'';
 return {n,videos:(n>1?n+' videos musicales':'1 video musical')+lista,canciones:n>0?(n===1?'1 canción':n+' canciones')+lista:'las canciones acordadas',temas:n>0?String(n):''}}
const ponerDatos=(x,t,c)=>{const d=datosTemas(t);return introActual(x).replace(/\{ciudad\}/g,c.ciudad||'(ciudad)').replace(/\{artista\}/g,nomArt(t)||'').replace(/\{cliente\}/g,(cli(t.clienteId)||{}).nombre||'').replace(/\{trabajo\}/g,t.titulo||'').replace(/\{videos\}/g,d.videos).replace(/\{canciones\}/g,d.canciones).replace(/\{temas\}/g,d.temas||'1')};

// Cotización nueva a partir de un modelo y los datos del trabajo
function cotDesdeModelo(md,t){
 const base=JSON.parse(JSON.stringify(md));
 const c={modo:'modelo',modelo:md.id,titulo:base.titulo,etiqueta:base.etiqueta||'Cliente',intro:base.intro,servicio:base.servicio,ciudad:t&&t.lugar?String(t.lugar).split(/[,–-]/)[0].trim():'',
  precio:t&&num(t.total)>0&&!(base.alternativas||[]).length?num(t.total):num(base.precio),incluye:base.incluye||[],equipos:base.equipos||[],
  opcionales:(base.opcionales||[]).map(o=>({id:uid(),nombre:o.nombre,precio:num(o.precio),ok:false})),notaOpc:base.notaOpc||'',
  altTitulo:base.altTitulo||'Opciones',alternativas:(base.alternativas||[]).map(a=>({id:uid(),nombre:a.nombre,detalle:a.detalle||'',precio:num(a.precio)})),alt:'',
  secciones:base.secciones||[],consideraciones:base.consideraciones||[],fechaEtiqueta:base.fechaEtiqueta||'Fecha tentativa de rodaje',notaFecha:base.notaFecha||'',
  entrega:base.entrega||'',material:base.material||[],pago:base.pago||[]};
 if(t&&num(t.total)>0&&c.alternativas.length){const a=c.alternativas.find(x=>Math.abs(num(x.precio)-num(t.total))<0.01);if(a)c.alt=a.id}
 return c;
}

// Formulario compartido: cotización de un trabajo (t) o modelo de Ajustes (sin t)
function htmlEditorCot(c,t,m){
 const chipsCat=(f)=>catalogo().filter(f).map(x=>`<button type="button" class="chip" data-cat="${esc(x.id)}">${esc(x.nombre)}${num(x.precio)?' · '+esc(fmtR(num(x.precio),m)):''}</button>`).join('');
 const opRow=o=>`<div class="orow" data-id="${esc(o.id||uid())}"><input data-f="n" aria-label="Opcional" value="${esc(o.nombre)}" placeholder="Equipo o servicio"><input data-f="p" inputmode="decimal" aria-label="Precio" value="${esc(o.precio)}" placeholder="0.00">${t?`<label class="mini" title="El cliente lo aceptó"><input type="checkbox" data-f="ok"${o.ok?' checked':''}>Sí</label>`:''}<button type="button" class="x sm" data-del aria-label="Quitar">×</button></div>`;
 const altRow=a=>`<div class="arow" data-id="${esc(a.id||uid())}">${t?`<input type="radio" name="altSel" value="${esc(a.id||'')}" aria-label="Elegida"${c.alt&&c.alt===a.id?' checked':''}>`:''}<input data-f="n" aria-label="Opción" value="${esc(a.nombre)}" placeholder="Full HD"><input data-f="d" aria-label="Detalle" value="${esc(a.detalle||'')}" placeholder="1920 × 1080"><input data-f="p" inputmode="decimal" aria-label="Precio" value="${esc(a.precio)}" placeholder="0.00"><button type="button" class="x sm" data-del aria-label="Quitar">×</button></div>`;
 const secRow=x=>`<div class="srow"><div class="srh"><input data-f="t" aria-label="Título de la sección" value="${esc(x.titulo)}" placeholder="Título"><button type="button" class="x sm" data-del aria-label="Quitar">×</button></div><textarea data-f="x" rows="4" aria-label="Texto de la sección">${esc(x.texto)}</textarea></div>`;
 const ta=(name,label,arr,rows,hint)=>`<label for="ce-${name}">${label}</label><textarea id="ce-${name}" name="${name}" rows="${rows||4}">${esc((arr||[]).join('\n'))}</textarea>${hint?`<p class="hint">${hint}</p>`:''}`;
 return `<div class="cotEd">
  ${t?'':`<label for="ce-nom">Nombre del modelo <span class="req">*</span></label><input id="ce-nom" name="nombre" value="${esc(c.nombre||'')}">`}
  <label for="ce-tit">Título del documento</label><input id="ce-tit" name="titulo" value="${esc(c.titulo)}">
  <div class="g2"><div><label for="ce-eti">Se dirige a</label><select id="ce-eti" name="etiqueta">${opts([['Cliente','Cliente'],['Novios','Novios'],['Empresa','Empresa']],c.etiqueta||'Cliente')}</select></div>
  ${t?`<div><label for="ce-ciu">Ciudad</label><input id="ce-ciu" name="ciudad" value="${esc(c.ciudad||'')}" placeholder="Lima"></div>`:`<div><label for="ce-pre">Precio base</label><input id="ce-pre" name="precio" inputmode="decimal" value="${esc(c.precio||'')}"></div>`}</div>
  <label for="ce-int">Descripción</label><textarea id="ce-int" name="intro" rows="4">${esc(c.intro)}</textarea>
  <p class="hint">Se reemplazan con los datos del trabajo: {videos} (p. ej. “3 videos musicales («A», «B», «C»)”), {canciones}, {temas}, {ciudad}, {artista} y {cliente}.${t?' La cantidad y los nombres de los temas salen de “Temas a grabar” del trabajo.':''}</p>${t?'<p class="hint cprev" id="ce-prev"></p>':''}
  <h4>Precio</h4>
  <label for="ce-alt-t" class="lbls">Si das opciones con distinto precio (por ejemplo Full HD o 4K), agrégalas aquí; si no, deja la lista vacía.</label>
  <div id="ce-alt">${(c.alternativas||[]).map(altRow).join('')}</div>
  <div class="acts" style="margin:4px 0 8px"><button type="button" class="btn sm" data-add="alt">${ic('plus')}Agregar opción de precio</button>${t&&(c.alternativas||[]).length?`<label class="mini"><input type="radio" name="altSel" value=""${c.alt?'':' checked'}>Aún no elige</label>`:''}</div>
  <input type="hidden" name="altTitulo" value="${esc(c.altTitulo||'Opciones')}">
  ${t?`<div id="ce-prebox"${(c.alternativas||[]).length?' hidden':''}><label for="ce-pre">Precio total (${esc(m)})</label><input id="ce-pre" name="precio" inputmode="decimal" value="${esc(c.precio||'')}"></div>`:''}
  <label for="ce-ser">Título de los servicios</label><input id="ce-ser" name="servicio" value="${esc(c.servicio||'Servicios principales')}">
  ${ta('incluye','Qué incluye (uno por línea)',c.incluye,5)}
  ${ta('equipos','Equipos incluidos sin costo (uno por línea)',c.equipos,5)}
  <details class="catd"><summary>+ Equipo del catálogo</summary><div class="chips presets" data-catbox="equipos">${chipsCat(x=>!num(x.precio))}</div></details>
  <h4>Opcionales con costo adicional</h4>
  <div id="ce-opc">${(c.opcionales||[]).map(opRow).join('')}</div>
  <div class="acts" style="margin:4px 0 6px"><button type="button" class="btn sm" data-add="opc">${ic('plus')}Agregar opcional</button></div>
  <details class="catd"><summary>+ Opcional del catálogo</summary><div class="chips presets" data-catbox="opc">${chipsCat(x=>num(x.precio)>0)}</div></details>
  ${t?'<p class="hint">Marca “Sí” en lo que el cliente aceptó: se suma al total.</p>':''}
  <label for="ce-nop">Nota de los opcionales</label><input id="ce-nop" name="notaOpc" value="${esc(c.notaOpc||'')}">
  <details class="cdet"${(c.secciones||[]).length?' open':''}><summary>Otras secciones (${(c.secciones||[]).length})</summary>
   <div id="ce-sec">${(c.secciones||[]).map(secRow).join('')}</div>
   <div class="acts" style="margin:4px 0"><button type="button" class="btn sm" data-add="sec">${ic('plus')}Agregar sección</button></div>
   <p class="hint">Por ejemplo Jornada de producción, Iluminación o Equipo humano. Empieza una línea con • para hacer una lista.</p></details>
  ${ta('consideraciones','Consideraciones (una por línea)',c.consideraciones,5)}
  <div class="g2"><div><label for="ce-fet">Título de la fecha</label><input id="ce-fet" name="fechaEtiqueta" value="${esc(c.fechaEtiqueta||'Fecha tentativa de rodaje')}"></div><div><label for="ce-nfe">Nota de la fecha</label><input id="ce-nfe" name="notaFecha" value="${esc(c.notaFecha||'')}" placeholder="Opcional"></div></div>
  <label for="ce-ent">Tiempo de entrega</label><input id="ce-ent" name="entrega" value="${esc(c.entrega||'')}">
  ${ta('material','Material de entrega (uno por línea)',c.material,3)}
  ${ta('pago','Forma de pago (una por línea)',c.pago,2,'Si una línea tiene un porcentaje (50%), el PDF le agrega el monto.')}
  ${t?'':`<label for="ce-val">Validez (días)</label><input id="ce-val" name="validez" inputmode="numeric" value="${esc(c.validez||15)}">`}
 </div>`;
}
function montarEditorCot(s,m,onCambio){
 const tpl={alt:()=>`<div class="arow" data-id="${uid()}">${s.querySelector('#ce-ciu')?`<input type="radio" name="altSel" value="" aria-label="Elegida">`:''}<input data-f="n" aria-label="Opción" placeholder="Full HD"><input data-f="d" aria-label="Detalle" placeholder="1920 × 1080"><input data-f="p" inputmode="decimal" aria-label="Precio" placeholder="0.00"><button type="button" class="x sm" data-del aria-label="Quitar">×</button></div>`,
  opc:(n='',p='')=>`<div class="orow" data-id="${uid()}"><input data-f="n" aria-label="Opcional" value="${esc(n)}" placeholder="Equipo o servicio"><input data-f="p" inputmode="decimal" aria-label="Precio" value="${esc(p)}" placeholder="0.00">${s.querySelector('#ce-ciu')?'<label class="mini"><input type="checkbox" data-f="ok">Sí</label>':''}<button type="button" class="x sm" data-del aria-label="Quitar">×</button></div>`,
  sec:()=>`<div class="srow"><div class="srh"><input data-f="t" aria-label="Título de la sección" placeholder="Título"><button type="button" class="x sm" data-del aria-label="Quitar">×</button></div><textarea data-f="x" rows="4" aria-label="Texto de la sección"></textarea></div>`};
 const box={alt:s.querySelector('#ce-alt'),opc:s.querySelector('#ce-opc'),sec:s.querySelector('#ce-sec')};
 const preBox=s.querySelector('#ce-prebox');
 const ajustar=()=>{if(preBox)preBox.hidden=!!box.alt.querySelector('.arow');onCambio&&onCambio()};
 s.querySelector('.cotEd').addEventListener('click',e=>{
  const a=e.target.closest('[data-add]');if(a){const k=a.dataset.add;box[k].insertAdjacentHTML('beforeend',tpl[k]());if(k==='sec')box.sec.closest('details').open=true;const nv=box[k].lastElementChild.querySelector('input:not([type=radio]),textarea');nv&&nv.focus();ajustar();return}
  const d=e.target.closest('[data-del]');if(d){d.closest('.orow,.arow,.srow').remove();ajustar();return}
  const ch=e.target.closest('[data-cat]');if(ch){const it=catalogo().find(x=>x.id===ch.dataset.cat);if(!it)return;
   if(ch.closest('[data-catbox]').dataset.catbox==='equipos'){const tx=s.querySelector('#ce-equipos');if(!lineas(tx.value).includes(it.nombre))tx.value=(tx.value.trim()?tx.value.trim()+'\n':'')+it.nombre}
   else box.opc.insertAdjacentHTML('beforeend',tpl.opc(it.nombre,num(it.precio)||''));
   ch.classList.add('on');setTimeout(()=>ch.classList.remove('on'),600);ajustar()}
 });
 s.querySelector('.cotEd').addEventListener('input',()=>onCambio&&onCambio());
 s.querySelector('.cotEd').addEventListener('change',()=>onCambio&&onCambio());
}
function leerEditorCot(s,c0){
 const F=new FormData(s.querySelector('form')),g=k=>String(F.get(k)??'').trim();
 const alternativas=[...s.querySelectorAll('#ce-alt .arow')].map(r=>({id:r.dataset.id,nombre:r.querySelector('[data-f=n]').value.trim(),detalle:r.querySelector('[data-f=d]').value.trim(),precio:r2(num(r.querySelector('[data-f=p]').value))})).filter(a=>a.nombre||a.precio>0);
 const radios=[...s.querySelectorAll('#ce-alt .arow')];const sel=radios.find(r=>{const x=r.querySelector('input[type=radio]');return x&&x.checked});
 return {...(c0||{}),modo:'modelo',titulo:g('titulo'),etiqueta:g('etiqueta')||'Cliente',ciudad:g('ciudad'),intro:g('intro'),servicio:g('servicio'),
  precio:r2(num(F.get('precio'))),alternativas,alt:sel?sel.dataset.id:'',altTitulo:g('altTitulo')||'Opciones',
  incluye:lineas(F.get('incluye')),equipos:lineas(F.get('equipos')),
  opcionales:[...s.querySelectorAll('#ce-opc .orow')].map(r=>({id:r.dataset.id,nombre:r.querySelector('[data-f=n]').value.trim(),precio:r2(num(r.querySelector('[data-f=p]').value)),ok:!!(r.querySelector('[data-f=ok]')&&r.querySelector('[data-f=ok]').checked)})).filter(o=>o.nombre),
  notaOpc:g('notaOpc'),secciones:[...s.querySelectorAll('#ce-sec .srow')].map(r=>({titulo:r.querySelector('[data-f=t]').value.trim(),texto:r.querySelector('[data-f=x]').value.trim()})).filter(x=>x.titulo||x.texto),
  consideraciones:lineas(F.get('consideraciones')),fechaEtiqueta:g('fechaEtiqueta'),notaFecha:g('notaFecha'),entrega:g('entrega'),material:lineas(F.get('material')),pago:lineas(F.get('pago'))};
}

// Cotización de un trabajo con un modelo
function fCotModelo(id,modeloId){
 const t=S.trabajos.find(x=>x.id===id);if(!t)return;const m=t.moneda||'PEN';
 const prev=t.cot&&t.cot.modo==='modelo'?t.cot:null;
 const md=modelos().find(x=>x.id===(modeloId||(prev&&prev.modelo)))||modelos().find(x=>nrm(x.nombre)===nrm(t.tipo))||modelos()[0];
 const c=prev&&(!modeloId||modeloId===prev.modelo)?{...prev,intro:introActual(prev.intro)}:{...cotDesdeModelo(md,t),...(prev&&prev.ciudad?{ciudad:prev.ciudad}:{})};
 const emit=(prev&&prev.emitida)||hoy();
 cargarPdf().catch(()=>{});cargarLogo().catch(()=>{});
 abrir(cab(prev&&prev.num?'Cotización '+esc(prev.num):'Cotización',esc(t.titulo))+`<form novalidate>
  <label>Modelo</label><div class="segm" role="group" aria-label="Modelo">${modelos().map(x=>`<button type="button" class="${x.id===md.id?'on':''}" data-mod="${esc(x.id)}" aria-pressed="${x.id===md.id}">${esc(x.nombre)}</button>`).join('')}<button type="button" data-mod="__partidas">Por partidas</button></div>
  ${prev?'<p class="hint">Cambiar de modelo reemplaza el contenido por el del modelo elegido.</p>':''}
  ${htmlEditorCot(c,t,m)}
  <div class="qtot"><span>Total</span><b id="ce-total"></b></div>
  <label class="chk"><input type="checkbox" name="usarTotal" checked> Usar este total como monto del trabajo</label>
  <div class="g2"><div><label for="qe">Fecha de emisión</label><input id="qe" name="emitida" type="date" value="${esc(emit)}"></div><div><label for="qv">Válida hasta</label><input id="qv" name="valida" type="date" value="${esc((prev&&prev.valida)||sumarDias(emit,num(md.validez)||num(S.aj.cotValidez)||15))}"></div></div>
  <p class="hint">${t.fecha?esc(c.fechaEtiqueta||'Fecha')+': '+esc(fechasRodaje(t))+' (se toma del trabajo).':'El trabajo aún no tiene fecha: en el PDF saldrá “Por definir”.'}</p>
  <p class="err" id="ce-err" role="alert"></p>
  <div class="acts"><button class="btn pri" type="submit" name="ir" value="wa">${ic('wa')}Guardar y enviar por WhatsApp</button><button class="btn" type="submit" name="ir" value="pdf">Guardar y descargar PDF</button><button class="btn" type="submit" name="ir" value="">Guardar</button><button class="btn" type="button" data-a="verT" data-id="${t.id}">Cancelar</button></div></form>`,{mount:s=>{
  const F=s.querySelector('form'),tot=s.querySelector('#ce-total'),err=s.querySelector('#ce-err');
  const prevD=s.querySelector('#ce-prev');
  const suma=()=>{const n=leerEditorCot(s,c);tot.textContent=fmtR(totModelo(n),m);if(prevD)prevD.innerHTML='<b>Así se verá:</b> '+esc(ponerDatos(n.intro,t,n))};
  montarEditorCot(s,m,suma);suma();
  s.querySelector('.segm').addEventListener('click',e=>{const b=e.target.closest('[data-mod]');if(!b||b.classList.contains('on'))return;if(b.dataset.mod==='__partidas')fCotPartidas(id,true);else fCotModelo(id,b.dataset.mod)});
  s.querySelector('#qe').addEventListener('change',e=>{if(e.target.value)s.querySelector('#qv').value=sumarDias(e.target.value,num(md.validez)||num(S.aj.cotValidez)||15)});
  F.addEventListener('submit',async e=>{e.preventDefault();
   const n=leerEditorCot(s,c),D=new FormData(F);
   if(!(totModelo(n)>0)&&!n.alternativas.length){err.textContent='Escribe el precio total.';return}
   const emi=D.get('emitida')||hoy();
   const cot={...n,modelo:md.id,num:(prev&&prev.num)||(t.cot&&t.cot.num)||sigNumCot(emi.slice(0,4)),emitida:emi,valida:D.get('valida')||''};
   const usar=!!D.get('usarTotal')&&totModelo(cot)>0,ir=e.submitter&&e.submitter.value;
   await mutT(id,x=>{x.cot=cot;if(usar)x.total=totModelo(cot)});
   toast('Cotización '+cot.num+' guardada.');verT(id);
   const t2=S.trabajos.find(x=>x.id===id);
   if(t2&&ir==='pdf')hacerCotPdf(t2);else if(t2&&ir==='wa')enviarCot(t2);
  });
 }});
}
function fCot(id){const t=S.trabajos.find(x=>x.id===id);if(!t)return;if(t.cot&&t.cot.modo!=='modelo'&&(t.cot.items||[]).length)fCotPartidas(id);else fCotModelo(id)}

// Al aprobar: qué opción y qué opcionales aceptó el cliente
function fAprobar(id){
 const t=S.trabajos.find(x=>x.id===id);if(!t)return;const c=t.cot,m=t.moneda||'PEN';
 abrir(cab('Cotización aprobada',esc(t.titulo))+`<form novalidate>
  ${(c.alternativas||[]).length?`<label>¿Qué opción eligió?</label>${c.alternativas.map(a=>`<label class="chk"><input type="radio" name="alt" value="${esc(a.id)}"${c.alt===a.id?' checked':''}> ${esc(a.nombre)}${a.detalle?' ('+esc(a.detalle)+')':''} · ${fmtR(num(a.precio),m)}</label>`).join('')}`:''}
  ${(c.opcionales||[]).length?`<label>¿Qué opcionales aceptó?</label>${c.opcionales.map(o=>`<label class="chk"><input type="checkbox" name="op" value="${esc(o.id)}"${o.ok?' checked':''}> ${esc(o.nombre)} · ${fmtR(num(o.precio),m)}</label>`).join('')}`:''}
  <div class="qtot"><span>Total del trabajo</span><b id="ap-tot"></b></div>
  <p class="err" id="ap-err" role="alert"></p>
  <div class="acts"><button class="btn pri" type="submit">${ic('check')}Aprobar</button><button class="btn" type="button" data-a="verT" data-id="${id}">Cancelar</button></div></form>`,{mount:s=>{
  const F=s.querySelector('form'),leer=()=>{const D=new FormData(F),ops=D.getAll('op');return {...c,alt:String(D.get('alt')||c.alt||''),opcionales:(c.opcionales||[]).map(o=>({...o,ok:ops.includes(o.id)}))}};
  const pinta=()=>{s.querySelector('#ap-tot').textContent=fmtR(totModelo(leer()),m)};pinta();F.addEventListener('change',pinta);
  F.addEventListener('submit',e=>{e.preventDefault();const n=leer();if((n.alternativas||[]).length&&!n.alt){s.querySelector('#ap-err').textContent='Elige la opción que aprobó el cliente.';return}
   mutT(id,x=>{x.cot=n;x.total=totModelo(n);x.estadoProd='produccion'}).then(()=>syncCal(id));toast('Cotización aprobada: ya cuenta como trabajo por cobrar.');verT(id)});
 }});
}

/* ---------- modelos y catálogo en Ajustes ---------- */
function fModelos(){
 abrir(cab('Modelos de cotización')+`<p class="hint">Al cotizar un trabajo eliges uno de estos modelos; luego puedes ajustar todo para ese cliente.</p>
  ${modelos().map(x=>`<div class="it gi" data-a="editarModelo" data-id="${esc(x.id)}"><div><b>${esc(x.nombre)}</b><p>${esc(x.titulo)}</p></div><span class="tag">${(x.alternativas||[]).length?esc(x.alternativas.map(a=>fmtR(num(a.precio),S.aj.moneda||'PEN')).join(' / ')):esc(fmtR(num(x.precio),S.aj.moneda||'PEN'))}</span></div>`).join('')}
  <div class="acts"><button class="btn pri" data-a="nuevoModelo">${ic('plus')}Nuevo modelo</button><button class="btn" data-a="catalogo">Catálogo de equipos</button><button class="btn" data-a="ajustes">Volver a Ajustes</button></div>`);
}
function fModelo(id){
 const lista=modelos(),x0=id?lista.find(x=>x.id===id):null;if(id&&!x0)return;
 const base=x0||{...JSON.parse(JSON.stringify(lista[0])),id:'',nombre:''},m=S.aj.moneda||'PEN';
 abrir(cab(x0?'Modelo: '+esc(x0.nombre):'Nuevo modelo')+`<form novalidate>${htmlEditorCot(base,null,m)}
  <p class="err" id="ce-err" role="alert"></p>
  <div class="acts"><button class="btn pri" type="submit">Guardar modelo</button><button class="btn" type="button" data-a="modelos">Cancelar</button>${x0&&lista.length>1?`<button class="btn red" type="button" data-a="borrarModelo" data-id="${esc(x0.id)}" data-c="1" data-cl="Toca otra vez para borrar">Borrar</button>`:''}</div></form>`,{mount:s=>{
  montarEditorCot(s,m);
  s.querySelector('form').addEventListener('submit',e=>{e.preventDefault();const n=leerEditorCot(s,{}),D=new FormData(e.target),nombre=String(D.get('nombre')||'').trim();
   if(!nombre){s.querySelector('#ce-err').textContent='Ponle un nombre al modelo.';return}
   const md={id:x0?x0.id:'m'+uid(),nombre,titulo:n.titulo,etiqueta:n.etiqueta,precio:n.precio,intro:n.intro,servicio:n.servicio,incluye:n.incluye,equipos:n.equipos,
    opcionales:n.opcionales.map(o=>({nombre:o.nombre,precio:o.precio})),notaOpc:n.notaOpc,altTitulo:n.altTitulo,alternativas:n.alternativas.map(a=>({nombre:a.nombre,detalle:a.detalle,precio:a.precio})),
    secciones:n.secciones,consideraciones:n.consideraciones,fechaEtiqueta:n.fechaEtiqueta,notaFecha:n.notaFecha,entrega:n.entrega,material:n.material,pago:n.pago,validez:Math.max(1,parseInt(D.get('validez'),10)||15)};
   const nueva=x0?lista.map(x=>x.id===x0.id?md:x):[...lista,md];
   S.aj={...S.aj,modelos:nueva};guardarAj();toast('Modelo guardado.');fModelos()});
 }});
}
function fCatalogo(){
 const m=S.aj.moneda||'PEN',fila=x=>`<div class="orow" data-id="${esc(x.id||uid())}"><input data-f="n" aria-label="Equipo o servicio" value="${esc(x.nombre||'')}" placeholder="Equipo o servicio"><input data-f="p" inputmode="decimal" aria-label="Precio" value="${esc(x.precio||'')}" placeholder="0"><button type="button" class="x sm" data-del aria-label="Quitar">×</button></div>`;
 abrir(cab('Catálogo de equipos y servicios')+`<form novalidate><p class="hint">Precio vacío o 0 = se ofrece en “Equipos incluidos sin costo”. Con precio = aparece como opcional. Al cotizar, tocas cada uno para agregarlo.</p>
  <div id="cat">${catalogo().map(fila).join('')}</div>
  <div class="acts" style="margin:6px 0"><button type="button" class="btn sm" id="catadd">${ic('plus')}Agregar</button></div>
  <div class="acts"><button class="btn pri" type="submit">Guardar catálogo</button><button class="btn" type="button" data-a="modelos">Volver a modelos</button></div></form>`,{mount:s=>{
  const box=s.querySelector('#cat');
  s.querySelector('#catadd').addEventListener('click',()=>{box.insertAdjacentHTML('beforeend',fila({}));box.lastElementChild.querySelector('input').focus()});
  box.addEventListener('click',e=>{const d=e.target.closest('[data-del]');if(d)d.closest('.orow').remove()});
  s.querySelector('form').addEventListener('submit',e=>{e.preventDefault();
   const cat=[...box.querySelectorAll('.orow')].map(r=>({id:r.dataset.id,nombre:r.querySelector('[data-f=n]').value.trim(),precio:r2(num(r.querySelector('[data-f=p]').value))})).filter(x=>x.nombre);
   S.aj={...S.aj,catalogo:cat};guardarAj();toast('Catálogo guardado.');fModelos()});
 }});
}

/* ---------- PDF ---------- */
let logoData=null;
function cargarLogo(){if(logoData)return logoData;logoData=fetch('icons/logo-emotion.png').then(r=>{if(!r.ok)throw 0;return r.blob()}).then(b=>new Promise((res,rej)=>{const fr=new FileReader();fr.onload=()=>res(fr.result);fr.onerror=rej;fr.readAsDataURL(b)})).catch(e=>{logoData=null;throw e});return logoData}
async function pdfCot(t){
 let J;try{J=await cargarPdf()}catch(e){toast('No se pudo preparar el PDF. Revisa tu conexión.');return null}
 let logo=null;try{logo=await cargarLogo()}catch(e){}
 const d=new J({unit:'pt',format:'a4',compress:true});
 if(t.cot.modo==='modelo')dibujarCotModelo(d,t,logo);else dibujarCotPartidas(d,t,logo);
 const nom=(t.cot.num||'cotizacion')+'-'+String(t.titulo||'').normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^\w]+/g,'-').replace(/^-|-$/g,'').slice(0,40).toLowerCase()+'.pdf';
 return {blob:d.output('blob'),nombre:nom};
}
function encabezadoPdf(d,t,logo,txt,W,M){
 const NAVY=[5,18,41],ROSA=[216,27,96];
 d.setFillColor(...NAVY);d.rect(0,0,W,108,'F');d.setFillColor(...ROSA);d.rect(0,108,W,3,'F');
 if(logo){try{d.addImage(logo,'PNG',M,26,168,54,'logo','FAST')}catch(e){logo=null}}
 if(!logo)txt(S.aj.negocio||'eMotion Studios',M,60,{s:22,b:1,c:[255,255,255]});
 txt(t.cot.modo==='modelo'?String(t.cot.titulo||'Cotización').split(/\s[–-]\s/)[0].toUpperCase():'COTIZACIÓN',W-M,42,{s:9,c:[200,208,220],r:1});
 txt(t.cot.num||'',W-M,64,{s:16,b:1,c:[255,255,255],r:1});
 txt('Emitida el '+fd(t.cot.emitida||hoy()),W-M,84,{s:9,c:[200,208,220],r:1});
}
function dibujarCotModelo(d,t,logo){
 const W=595,H=842,M=50,CW=W-2*M,m=t.moneda||'PEN',c=t.cot,cl=cli(t.clienteId);let y=0;
 const NAVY=[5,18,41],ROSA=[216,27,96],GRIS=[95,104,114],TINTA=[24,28,34];
 const txt=(x,X,Y,o={})=>{d.setFont('helvetica',o.b?'bold':o.i?'italic':'normal');d.setFontSize(o.s||10);d.setTextColor(...(o.c||TINTA));d.text(pdfTxt(x),X,Y,o.r?{align:'right'}:undefined)};
 const salto=h=>{if(y+h>H-64){d.addPage();y=56}};
 const parrafo=(x,o={})=>{const s=o.s||10.5,lh=s*1.42,X=o.x||M,w=o.w||CW;d.setFont('helvetica',o.b?'bold':o.i?'italic':'normal');d.setFontSize(s);const ls=d.splitTextToSize(pdfTxt(x),w);ls.forEach(l=>{salto(lh);d.setFont('helvetica',o.b?'bold':o.i?'italic':'normal');d.setFontSize(s);d.setTextColor(...(o.c||TINTA));d.text(l,X,y);y+=lh})};
 const vinetas=(arr,o={})=>{(arr||[]).forEach(x=>{const s=o.s||10.5,lh=s*1.42;d.setFont('helvetica','normal');d.setFontSize(s);const ls=d.splitTextToSize(pdfTxt(x),CW-16);salto(lh*Math.min(ls.length,2));d.setFillColor(...ROSA);d.circle(M+3,y-3.4,1.7,'F');ls.forEach(l=>{salto(lh);d.setFont('helvetica','normal');d.setFontSize(s);d.setTextColor(...TINTA);d.text(l,M+14,y);y+=lh})});y+=4};
 const titulo=x=>{y+=10;salto(40);txt(String(x).toUpperCase(),M,y,{s:9.5,b:1,c:ROSA});y+=6;d.setDrawColor(232,234,238);d.setLineWidth(.8);d.line(M,y,W-M,y);y+=16};
 encabezadoPdf(d,t,logo,txt,W,M);
 y=148;
 d.setFont('helvetica','bold');d.setFontSize(16);d.setTextColor(...NAVY);d.splitTextToSize(pdfTxt(c.titulo||'Cotización'),CW).forEach(l=>{d.text(l,M,y);y+=20});
 y+=6;
 // datos
 const datos=[[c.etiqueta||'Cliente',cl?cl.nombre:(c.etiqueta==='Novios'?t.titulo:'')],['Ciudad',c.ciudad],['Proyecto',[t.titulo,nomArt(t)&&nrm(nomArt(t))!==nrm(t.titulo)?nomArt(t):''].filter(Boolean).join(' · ')],[c.fechaEtiqueta||'Fecha tentativa de rodaje',t.fecha?fechasRodaje(t):'Por definir']].filter(x=>x[1]);
 const cw2=(CW-20)/2;
 for(let i=0;i<datos.length;i+=2){let alto=0;[0,1].forEach(k=>{const it=datos[i+k];if(!it)return;const X=M+k*(cw2+20);txt(String(it[0]).toUpperCase(),X,y,{s:7.5,c:GRIS});d.setFont('helvetica','bold');d.setFontSize(11);const ls=d.splitTextToSize(pdfTxt(it[1]),cw2);d.setTextColor(...TINTA);d.text(ls,X,y+14);alto=Math.max(alto,ls.length)});y+=22+13*alto}
 if(c.intro){y+=4;parrafo(ponerDatos(c.intro,t,c),{c:[55,62,70]})}
 // servicios y precio
 const alts=c.alternativas||[],altSel=alts.find(a=>a.id===c.alt),acept=(c.opcionales||[]).filter(o=>o.ok);
 titulo(c.servicio||'Servicios principales');
 if(!alts.length){salto(54);d.setFillColor(244,246,249);d.roundedRect(M,y-14,CW,44,6,6,'F');txt('Total',M+14,y+12,{s:10,c:GRIS});txt(fmtR(num(c.precio),m),W-M-14,y+14,{s:18,b:1,c:NAVY,r:1});y+=48}
 vinetas(c.incluye);
 if(alts.length){titulo(c.altTitulo||'Opciones');salto(26+alts.length*24);
  d.setFillColor(244,246,249);d.rect(M,y-13,CW,22,'F');txt('Opción',M+10,y+2,{s:8.5,b:1,c:GRIS});txt('Detalle',M+CW*0.42,y+2,{s:8.5,b:1,c:GRIS});txt('Precio',W-M-10,y+2,{s:8.5,b:1,c:GRIS,r:1});y+=22;
  alts.forEach(a=>{const sel=a.id===c.alt;if(sel){d.setFillColor(253,236,243);d.rect(M,y-14,CW,24,'F')}txt(a.nombre+(sel?'  (elegida)':''),M+10,y+2,{s:10.5,b:1});txt(a.detalle||'',M+CW*0.42,y+2,{s:10});txt(fmtR(num(a.precio),m),W-M-10,y+2,{s:10.5,b:1,r:1});y+=24;d.setDrawColor(232,234,238);d.line(M,y-10,W-M,y-10)});y+=4}
 if((c.equipos||[]).length){titulo('Equipos incluidos (sin costo adicional)');vinetas(c.equipos)}
 if((c.opcionales||[]).length){titulo('Opcionales (costo adicional)');
  c.opcionales.forEach(o=>{d.setFont('helvetica','normal');d.setFontSize(10.5);const ls=d.splitTextToSize(pdfTxt(o.nombre),CW-(o.ok?200:120));salto(ls.length*15+8);d.setFillColor(...ROSA);d.circle(M+3,y-3.4,1.7,'F');ls.forEach((l,i)=>{d.setTextColor(...TINTA);d.setFont('helvetica','normal');d.setFontSize(10.5);d.text(l,M+14,y+i*15)});txt(fmtR(num(o.precio),m),W-M,y,{s:10.5,b:1,r:1});if(o.ok)txt('INCLUIDO',W-M-82,y,{s:8,b:1,c:ROSA,r:1});y+=ls.length*15+4});
  if(c.notaOpc){y+=2;parrafo('* '+c.notaOpc,{s:9,i:1,c:GRIS})}y+=4}
 if(altSel||acept.length){salto(56);y+=6;d.setFillColor(...NAVY);d.roundedRect(M,y-14,CW,46,6,6,'F');
  const det=[altSel?altSel.nombre+' '+fmtR(num(altSel.precio),m):'Base '+fmtR(num(c.precio),m),...acept.map(o=>'+ '+o.nombre.split('(')[0].trim())].join(' ');
  d.setFont('helvetica','normal');d.setFontSize(8.5);d.setTextColor(200,208,220);d.text(d.splitTextToSize(pdfTxt(det),CW-200)[0]||'',M+14,y+12);
  txt('Total '+fmtR(totModelo(c),m),W-M-14,y+14,{s:15,b:1,c:[255,255,255],r:1});y+=50}
 (c.secciones||[]).forEach(sc=>{titulo(sc.titulo||'');const ls=String(sc.texto||'').split('\n');let bl=[];const vaciar=()=>{if(bl.length){vinetas(bl);bl=[]}};
  ls.forEach(l=>{if(/^\s*[•·\-*]\s+/.test(l))bl.push(l.replace(/^\s*[•·\-*]\s+/,''));else if(l.trim()){vaciar();parrafo(l);y+=3}});vaciar()});
 if((c.consideraciones||[]).length){titulo('Consideraciones');vinetas(c.consideraciones)}
 titulo('Fechas y entrega');
 const fila=(k,v)=>{if(!v)return;d.setFont('helvetica','normal');d.setFontSize(10.5);const ls=d.splitTextToSize(pdfTxt(v),CW-150);salto(ls.length*15+6);txt(k,M,y,{s:10,b:1,c:GRIS});ls.forEach((l,i)=>{d.setTextColor(...TINTA);d.setFont('helvetica','normal');d.setFontSize(10.5);d.text(l,M+150,y+i*15)});y+=ls.length*15+6};
 fila(c.fechaEtiqueta||'Fecha tentativa de rodaje',t.fecha?fechasRodaje(t):'Por definir');
 if(c.notaFecha){parrafo(c.notaFecha,{s:9,i:1,c:GRIS,x:M+150,w:CW-150});y+=4}
 fila('Tiempo de entrega',c.entrega);
 if((c.material||[]).length)fila('Material de entrega',c.material.join(' · '));
 if((c.pago||[]).length){titulo('Forma de pago');const tot=totModelo(c);vinetas(c.pago.map(l=>{const p=/(\d+(?:[.,]\d+)?)\s*%/.exec(l);return p&&tot>0?l+': '+fmtR(r2(tot*num(p[1])/100),m):l}))}
 if(c.valida){salto(30);y+=6;parrafo('La presente cotización tiene una validez de '+Math.max(1,Math.round((new Date(c.valida)-new Date(c.emitida||hoy()))/864e5))+' días calendario a partir de su fecha de emisión (hasta el '+fd(c.valida)+').',{s:10,b:1,c:ROSA})}
 // firma
 const firma=lineas(S.aj.firma||'José Payva Humalla\nRealizador Audiovisual');salto(40+firma.length*15);y+=22;txt('Atentamente,',M,y,{s:10.5,c:GRIS});y+=30;
 firma.forEach((l,i)=>{txt(l,M,y,{s:i?10:11.5,b:!i,c:i?GRIS:TINTA});y+=15});
 txt(S.aj.negocio||'eMotion Studios',M,y,{s:10,c:GRIS});
 const pie=[S.aj.negocio||'eMotion Studios',S.aj.cotContacto].filter(Boolean).join(' · ');
 const np=d.getNumberOfPages();for(let i=1;i<=np;i++){d.setPage(i);d.setDrawColor(232,234,238);d.line(M,H-44,W-M,H-44);txt(pie,M,H-28,{s:8,c:GRIS});txt((c.num||'')+(np>1?'  ·  '+i+' / '+np:''),W-M,H-28,{s:8,c:GRIS,r:1})}
}
async function hacerCotPdf(t){
 if(!cotLista(t)){fCot(t.id);return}
 const dl=window.claude&&window.claude.use?await window.claude.use('downloads').catch(()=>null):null;
 if(!dl){toast('Aquí no se pueden descargar archivos.');return}
 toast('Preparando cotización…');const r=await pdfCot(t);if(!r)return;
 try{await dl.save({filename:r.nombre,data:r.blob});toast('Cotización lista.')}catch(e){if(e&&e.code==='declined')return;toast('No se pudo guardar el PDF aquí.')}
}
// Enviar por WhatsApp: en el iPhone abre el menú Compartir con el PDF; en la Mac lo guarda y abre WhatsApp con el mensaje
function msgCot(t){const c=cli(t.clienteId);return String(S.aj.tplCot||MSG_COT_DEF).replace(/\{nombre\}/g,primerNombre(c)||'').replace(/\{numero\}/g,t.cot.num||'').replace(/\{trabajo\}/g,t.titulo||'').replace(/\{negocio\}/g,S.aj.negocio||'eMotion Studios').replace(/\{total\}/g,fmtR(num(t.total),t.moneda||'PEN')).replace(/ ,/g,',').replace(/Hola ,/,'Hola,')}
async function enviarCot(t){
 if(!cotLista(t)){fCot(t.id);return}
 toast('Preparando cotización…');const r=await pdfCot(t);if(!r)return;
 const file=new File([r.blob],r.nombre,{type:'application/pdf'}),texto=msgCot(t),c=cli(t.clienteId);
 const compartir=async()=>{await navigator.share({files:[file],text:texto})};
 if(navigator.canShare&&navigator.canShare({files:[file]})){
  try{await compartir();return}catch(e){if(e&&e.name==='AbortError')return;
   // Safari pide un toque nuevo si el PDF tardó en armarse
   abrir(cab('Cotización lista',esc(r.nombre))+`<p class="hint">Toca el botón y elige WhatsApp en el menú Compartir.</p><div class="acts"><button class="btn pri" id="cpShare">${ic('wa')}Enviar PDF</button><button class="btn" data-a="verT" data-id="${t.id}">Volver al trabajo</button></div>`,{mount:s=>{s.querySelector('#cpShare').addEventListener('click',()=>compartir().then(()=>verT(t.id),er=>{if(!er||er.name!=='AbortError')toast('No se pudo compartir.')}))}});return}
 }
 const dl=window.claude&&window.claude.use?await window.claude.use('downloads').catch(()=>null):null;
 try{dl&&await dl.save({filename:r.nombre,data:r.blob})}catch(e){}
 const url=`https://wa.me/${waNum(c&&c.telefono)}?text=${encodeURIComponent(texto)}`;
 abrir(cab('Enviar por WhatsApp',esc(t.titulo))+`<p class="hint">El PDF <b>${esc(r.nombre)}</b> quedó en tu carpeta Descargas. Abre WhatsApp con el mensaje listo y adjunta el PDF (arrástralo a la conversación).</p>${c&&c.telefono?'':'<p class="hint">Este cliente no tiene teléfono guardado: WhatsApp te pedirá elegir el contacto.</p>'}
  <div class="acts"><a class="btn pri" href="${esc(url)}" target="_blank" rel="noopener">${ic('wa')}Abrir WhatsApp</a><button class="btn" data-a="verT" data-id="${t.id}">Volver al trabajo</button></div>`);
}

function textoRecibo(t,p){return ['CONSTANCIA DE PAGO',S.aj.negocio||'','','Cliente: '+nomCli(t),'Trabajo: '+t.titulo,'Monto recibido: '+fmtR(num(p.monto),t.moneda),'Fecha: '+fd(p.fecha),'Método: '+(p.metodo||''),p.nota?'Concepto: '+p.nota:'','Saldo pendiente: '+fmtR(saldo(t),t.moneda)].filter(x=>x!=='').join('\n')}

/* ---------- clientes y ajustes ---------- */
function fCliente(c){
 const nuevo=!c;c=c?{...c}:{id:uid(),nombre:'',empresa:'',telefono:'',email:'',doc:'',notas:'',creado:Date.now()};
 abrir(cab(nuevo?'Nuevo cliente':'Editar cliente')+`<form novalidate>
  <div class="lblrow"><label for="cn">Nombre <span class="req">*</span></label><button type="button" class="lnk" id="ccont">Desde contactos</button></div><input id="cn" name="nombre" value="${esc(c.nombre)}" placeholder="Nombre de contacto o marca"><div class="pick" id="cpick" hidden></div>
  <label for="ce">Empresa</label><input id="ce" name="empresa" value="${esc(c.empresa)}">
  <div class="g2"><div><label for="ct">Celular (WhatsApp)</label><input id="ct" name="telefono" type="tel" inputmode="tel" value="${esc(c.telefono)}" placeholder="987 654 321"></div><div><label for="cd">RUC / DNI</label><input id="cd" name="doc" inputmode="numeric" value="${esc(c.doc)}"></div></div>
  <label for="cm">Correo</label><input id="cm" name="email" type="email" value="${esc(c.email)}">
  <label class="chk"><input type="checkbox" name="retiene"${c.retiene?' checked':''}> Es agente de retención (me retiene 8 % en recibos de más de S/ 1,500)</label>
  <label for="co">Notas</label><textarea id="co" name="notas">${esc(c.notas)}</textarea>
  <p class="hint">Si el número no empieza con código de país, se asume Perú (+51).</p>
  <p class="err" id="cerr"></p>
  <div class="acts"><button class="btn pri" type="submit">Guardar cliente</button><button class="btn" type="button" data-a="${nuevo?'cerrar':'verC'}" data-id="${c.id}">Cancelar</button></div></form>`,{mount:s=>{
  const fill=x=>{s.querySelector('#cn').value=x.nombre;if(x.telefono)s.querySelector('#ct').value=x.telefono;if(x.email)s.querySelector('#cm').value=x.email;if(x.empresa)s.querySelector('#ce').value=x.empresa;s.querySelector('#cpick').hidden=true};
  s.querySelector('#ccont').addEventListener('click',()=>{const box=s.querySelector('#cpick');desdeContactos(l=>{if(l.length===1)return fill(l[0]);box.hidden=false;box.innerHTML=l.slice(0,80).map((x,i)=>`<button type="button" class="chip" data-i="${i}">${esc(x.nombre)}</button>`).join('');box.onclick=e=>{const b=e.target.closest('[data-i]');if(b)fill(l[+b.dataset.i])}},()=>{box.hidden=false;box.innerHTML=ayudaVcf})});
  s.querySelector('form').addEventListener('submit',e=>{e.preventDefault();const F=new FormData(e.target);const n=String(F.get('nombre')||'').trim();
   if(!n){s.querySelector('#cerr').textContent='Escribe el nombre del cliente.';return}
   const otro=porNombre(S.clientes,n);if(otro&&otro.id!==c.id){s.querySelector('#cerr').textContent='Ya tienes un cliente con ese nombre.';return}
   ['empresa','telefono','email','doc','notas'].forEach(k=>c[k]=String(F.get(k)||'').trim());c.nombre=n;c.retiene=!!F.get('retiene');c.mod=Date.now();
   guardar('clientes',c).catch(()=>{});toast(nuevo?'Cliente agregado.':'Cliente actualizado.');verC(c.id);
  });
 }});
}
function fAjustes(){
 abrir(cab('Ajustes')+`<form novalidate>
  ${window.CP&&CP.cuenta?`<h4 style="margin-top:4px">Avisos en el iPhone</h4><div id="pushbox" class="cuenta"></div>
  <div class="avt"><label class="chk"><input type="checkbox" name="avCobros"${(S.aj.avisos||{}).cobros!==false?' checked':''}> Cobros: el día que toca y si se vence</label>
  <label class="chk"><input type="checkbox" name="avEntregas"${(S.aj.avisos||{}).entregas!==false?' checked':''}> Entregas: el día antes</label>
  <label class="chk"><input type="checkbox" name="avRodajes"${(S.aj.avisos||{}).rodajes!==false?' checked':''}> Rodajes: el día antes</label></div>
  <p class="hint">Llegan a las 8 a.m. Muestran el trabajo y el artista, nunca montos ni datos del cliente. Guarda los ajustes después de cambiar estas casillas.</p>
  <h4>Atajos y Siri</h4><div id="atajobox" class="cuenta"></div>`:''}
  <label class="chk"><input type="checkbox" id="aoc"${ocultarInicio?' checked':''}> Ocultar los montos al abrir la app en este equipo</label>
  <p class="hint">Se muestran tocando el ojo junto a “Por cobrar”. Se vuelven a ocultar cuando sales de la app.</p>
  <label for="atm">Apariencia en este equipo</label><select id="atm"><option value="">Automática (según el sistema)</option><option value="light"${tema==='light'?' selected':''}>Clara</option><option value="dark"${tema==='dark'?' selected':''}>Oscura</option></select>
  <label for="an">Tu nombre o el de tu productora</label><input id="an" name="negocio" value="${esc(S.aj.negocio)}" placeholder="Aparece en los estados de cuenta">
  <div class="g2"><div><label for="am">Moneda principal</label><select id="am" name="moneda">${opts(Object.entries(MONEDAS),S.aj.moneda)}</select></div><div><label for="ag">Días de gracia</label><input id="ag" name="gracia" inputmode="numeric" value="${esc(S.aj.gracia)}"></div></div>
  <p class="hint">Un pago pasa a “vencido” cuando pasan estos días desde su fecha (la entrega, en el caso de la cancelación).</p>
  <label>Tipo de cambio (soles por cada…)</label>
  <div class="g2"><div><label for="atcu" class="lbls">Dólar (US$)</label><input id="atcu" name="tcUSD" inputmode="decimal" value="${esc((S.aj.tc||{}).USD||'')}" placeholder="3.75"></div><div><label for="atce" class="lbls">Euro (€)</label><input id="atce" name="tcEUR" inputmode="decimal" value="${esc((S.aj.tc||{}).EUR||'')}" placeholder="4.05"></div></div>
  <label class="chk"><input type="checkbox" name="tcAuto"${S.aj.tcAuto!==false?' checked':''}> Actualizarlo solo cada día (cambio referencial del mercado)</label>
  <p class="hint" id="atch">${S.aj.tcFecha?'Último: '+fd(S.aj.tcFecha)+'. ':''}Sirve para ver en soles los trabajos en dólares y sumar todo en Reportes. Cada pago en dólares guarda el tipo de cambio del día. <button type="button" class="lnk" id="atcb">Actualizar ahora</button></p>
  <label for="atd">Tipo de trabajo por defecto</label><input id="atd" name="tipoDef" list="tipos2" value="${esc(S.aj.tipoDef||'')}"><datalist id="tipos2">${TIPOS.map(x=>`<option value="${x}">`).join('')}</datalist>
  ${mcpNs?`<label>Calendario de Google donde guardar los trabajos</label>
  <div class="calsel"><select id="acal" name="calId"><option value="">Mi calendario principal</option>${S.aj.calId?`<option value="${esc(S.aj.calId)}" selected>${esc(S.aj.calNom||S.aj.calId)}</option>`:''}</select><button type="button" class="btn sm" id="acalc">Cargar mis calendarios</button></div><input type="hidden" name="calNom" id="acaln" value="${esc(S.aj.calNom||'')}">
  ${fueraDeCal().length?`<div class="acts" style="margin:6px 0"><button type="button" class="btn sm pri" data-a="moverCal">Mover ${fueraDeCal().length} ${fueraDeCal().length===1?'trabajo':'trabajos'} a ${esc(S.aj.calNom||'principal')}</button></div>`:''}
  <p class="hint" id="acalh">Para usar tu rosa palo (#d81b60), crea en Google Calendar un calendario llamado "Rodajes", ponle ese color y elígelo aquí. Con el color en "Auto", los eventos toman el color de ese calendario.</p>`:''}
  <label>Color de los rodajes en Google Calendar</label>${swatches('colRodaje',S.aj.colRodaje||'',true,'Color del calendario')}
  <label>Color de las entregas en Google Calendar</label>${swatches('colEntrega',S.aj.colEntrega||'',true,'Color del calendario')}
  <p class="hint">Cada trabajo puede tener su propio color. Los eventos que ya existen cambian de color cuando los vuelves a sincronizar.</p>
  <label for="ae">Equipo</label><input id="ae" name="equipo" value="${esc(S.aj.equipo)}" placeholder="Nombres separados por comas: Ana, Jorge, Luis">
  <p class="hint">Para elegir rápido quién pagó un gasto y saber a quién hay que devolverle.</p>
  <label for="ai">Correos frecuentes para invitar</label><input id="ai" name="invFrec" inputmode="email" value="${esc(S.aj.invFrec)}" placeholder="camarografo@gmail.com, editora@gmail.com">
  <h4>Cotizaciones</h4>
  <div class="g2"><div><label for="acv">Validez (días)</label><input id="acv" name="cotValidez" inputmode="numeric" value="${esc(S.aj.cotValidez??15)}"></div><div><label for="acc">Contacto en el PDF</label><input id="acc" name="cotContacto" value="${esc(S.aj.cotContacto||'')}" placeholder="987 654 321 · correo · RUC"></div></div>
  <div class="acts" style="margin:4px 0 10px"><button type="button" class="btn" data-a="modelos">Modelos de cotización (${modelos().length})</button><button type="button" class="btn" data-a="catalogo">Catálogo de equipos</button></div>
  <label for="afi">Firma (una línea por renglón)</label><textarea id="afi" name="firma" rows="2">${esc(S.aj.firma??'José Payva Humalla\nRealizador Audiovisual')}</textarea>
  <label for="amc">Mensaje al enviar la cotización por WhatsApp</label><textarea id="amc" name="tplCot" rows="3">${esc(S.aj.tplCot||MSG_COT_DEF)}</textarea>
  <p class="hint">Puedes usar {nombre}, {numero}, {trabajo}, {total} y {negocio}.</p>
  <label for="act">Términos por defecto (cotización por partidas)</label><textarea id="act" name="cotTerminos" rows="5">${esc(S.aj.cotTerminos??TERM_DEF)}</textarea>
  <h4>Mensajes de WhatsApp</h4>
  <label for="t1">Para pedir el adelanto</label><textarea id="t1" name="tplAdelanto">${esc(S.aj.tplAdelanto)}</textarea>
  <label for="t2">Para una cuota intermedia</label><textarea id="t2" name="tplCuota">${esc(S.aj.tplCuota)}</textarea>
  <label for="t3">Para la cancelación al entregar</label><textarea id="t3" name="tplCancel">${esc(S.aj.tplCancel)}</textarea>
  <p class="hint">Puedes usar {cliente}, {trabajo}, {monto}, {saldo}, {fecha}, {entrega}, {cuota} y {negocio}.</p>
  <div class="acts"><button class="btn pri" type="submit">Guardar ajustes</button><button class="btn" type="button" data-a="tplDef">Restaurar mensajes</button></div></form>
  <h4>Respaldo y exportar</h4>
  ${window.CP&&CP.cuenta?`<div id="respbox" class="cuenta"></div>`:''}
  <p class="hint">${S.modo==='nube'?'Tus cuentas se guardan en tu base de datos de Supabase y se sincronizan entre tu iPhone y tu Mac. Solo tú puedes verlas, con tu inicio de sesión.':'Ahora mismo los datos se guardan solo en este navegador.'} La copia de seguridad no incluye las fotos de comprobantes.</p>
  <div class="acts"><button class="btn" data-a="copiarTabla">Copiar tabla de trabajos</button><button class="btn" data-a="copiarGastos">Copiar tabla de gastos</button><button class="btn" data-a="copiarBackup">Copiar copia de seguridad</button></div>
  <label for="rb" style="font-weight:650;font-size:14px;display:block;margin:14px 0 6px">Restaurar desde una copia de seguridad</label>
  <textarea id="rb" placeholder="Pega aquí el texto de la copia de seguridad"></textarea>
  <div class="acts"><button class="btn" data-a="restaurar" data-c="1" data-cl="Toca otra vez para restaurar">Restaurar</button></div>
  ${window.CP&&CP.cuenta?`<h4>Google Calendar</h4><div id="gcalbox" class="cuenta"></div>
  <h4>Tu cuenta</h4><div class="cuenta"><span>Entraste como <b>${esc(CP.cuenta.email||'')}</b></span><button type="button" class="btn sm" data-a="salir">Cerrar sesión</button></div>`:''}`,{mount:s=>{
  const acal=s.querySelector('#acal');
  if(acal){
   s.querySelector('#acalc').addEventListener('click',async()=>{const h=s.querySelector('#acalh');h.textContent='Buscando tus calendarios…';
    try{const r=await mcpNs.callTool(CAL,'list_calendars',{pageSize:100},{cache:false});const p=r&&r.payload;const l=(p&&(p.calendars||p.items))||(Array.isArray(p)?p:[]);
     const mios=l.filter(c=>c&&c.id&&!/#holiday@|#contacts@|import\.calendar|v\.calendar/.test(c.id));
     const sel=acal.value;acal.innerHTML='<option value="">Mi calendario principal</option>'+mios.map(c=>`<option value="${esc(c.id)}"${c.id===sel?' selected':''}>${esc(c.summary||c.summaryOverride||c.id)}</option>`).join('');
     const rod=mios.find(c=>/rodaje/i.test(c.summary||''));if(rod&&!sel){acal.value=rod.id;acal.dispatchEvent(new Event('change'))}
     h.textContent=mios.length?(rod?'Encontré tu calendario "'+(rod.summary)+'" y lo dejé elegido.':'Elige el calendario. Si no ves "Rodajes", créalo en Google Calendar y vuelve a cargar.'):'No encontré calendarios propios.'}
    catch(e){h.textContent=calMsg(e)}});
   acal.addEventListener('change',()=>{const o=acal.selectedOptions[0];s.querySelector('#acaln').value=acal.value?o.textContent:'';if(acal.value){['colRodaje','colEntrega'].forEach(n=>{const x=s.querySelector(`input[name=${n}][value=""]`);if(x)x.checked=true})}});
  }
  s.querySelector('#atcb').addEventListener('click',async()=>{const h=s.querySelector('#atch');const b=s.querySelector('#atcb');b.disabled=true;b.textContent='Buscando…';const ok=await actualizarTC(true);b.disabled=false;b.textContent='Actualizar ahora';if(ok){s.querySelector('#atcu').value=S.aj.tc.USD||'';s.querySelector('#atce').value=S.aj.tc.EUR||'';toast('Tipo de cambio: S/ '+S.aj.tc.USD+' por dólar.')}else toast('No se pudo traer el tipo de cambio. Escríbelo a mano.')});
  s.querySelector('#aoc').addEventListener('change',e=>{ocultarInicio=e.target.checked;try{localStorage.setItem('cp-ocultar',ocultarInicio?'1':'0')}catch(x){}if(ocultarInicio){S.oculto=true;render()}});
  s.querySelector('#atm').addEventListener('change',e=>{tema=e.target.value;try{localStorage.setItem('cp-tema',tema)}catch(x){}if(tema)aplicaTema();else delete document.documentElement.dataset.theme});
  s.querySelector('form').addEventListener('submit',e=>{e.preventDefault();const F=new FormData(e.target);const g=parseInt(F.get('gracia'),10);
   const calAntes=S.aj.calId||'';
   S.aj=normAj({...S.aj,negocio:String(F.get('negocio')||'').trim(),moneda:F.get('moneda')||'PEN',gracia:isFinite(g)?g:3,equipo:String(F.get('equipo')||'').trim(),colRodaje:String(F.get('colRodaje')??''),colEntrega:String(F.get('colEntrega')??''),calId:String(F.get('calId')||''),calNom:F.get('calId')?String(F.get('calNom')||''):'',tipoDef:String(F.get('tipoDef')||'').trim(),invFrec:String(F.get('invFrec')||'').trim(),tplAdelanto:String(F.get('tplAdelanto')||'').trim()||TPL.tplAdelanto,tplCuota:String(F.get('tplCuota')||'').trim()||TPL.tplCuota,tplCancel:String(F.get('tplCancel')||'').trim()||TPL.tplCancel,avisos:{...(S.aj.avisos||{}),cobros:F.has('avCobros'),entregas:F.has('avEntregas'),rodajes:F.has('avRodajes')},cotValidez:Math.max(1,parseInt(F.get('cotValidez'),10)||15),tc:{...(S.aj.tc||{}),USD:num(F.get('tcUSD'))||undefined,EUR:num(F.get('tcEUR'))||undefined},tcAuto:F.has('tcAuto'),tcFecha:(num(F.get('tcUSD'))!==num((S.aj.tc||{}).USD)||num(F.get('tcEUR'))!==num((S.aj.tc||{}).EUR))?hoy():S.aj.tcFecha,cotContacto:String(F.get('cotContacto')||'').trim(),firma:String(F.get('firma')??'').trim(),tplCot:String(F.get('tplCot')||'').trim()||MSG_COT_DEF,cotTerminos:String(F.get('cotTerminos')??'').trim()});
   guardarAj();cerrar();
   const enCal=S.trabajos.filter(t=>t.cal&&(t.cal.on||t.cal.ev)&&t.estadoProd!=='cancelado');
   if(mcpNs&&enCal.length&&(S.aj.calId||'')!==calAntes){toast(`Moviendo ${enCal.length} ${enCal.length===1?'trabajo':'trabajos'} a ${S.aj.calNom||'tu calendario principal'}…`);(async()=>{for(const t of enCal){await syncCal(t.id);await espera(400)}toast('Listo: tus trabajos están en '+(S.aj.calNom||'tu calendario principal')+'.')})()}
   else toast('Ajustes guardados.')});
 }});
}
const espera=ms=>new Promise(r=>setTimeout(r,ms));
async function restaurar(txt){
 let d;try{d=JSON.parse(txt)}catch(e){toast('Ese texto no es una copia de seguridad válida.');return}
 const cs=(Array.isArray(d.clientes)?d.clientes:[]).filter(x=>x&&typeof x==='object'),ts=(Array.isArray(d.trabajos)?d.trabajos:[]).filter(x=>x&&typeof x==='object');
 if(!cs.length&&!ts.length){toast('La copia no tiene datos.');return}
 cerrar();toast(`Restaurando ${cs.length+ts.length} registros…`);
 for(const c of cs){if(!okId(c.id))c.id=uid();await guardar('clientes',c).catch(()=>{});if(db)await espera(160)}
 for(const g of (Array.isArray(d.gastosGen)?d.gastosGen:[]).filter(x=>x&&typeof x==='object')){if(!okId(g.id))g.id=uid();await guardar('gastosGen',g).catch(()=>{});if(db)await espera(160)}
 for(const a of (Array.isArray(d.artistas)?d.artistas:[]).filter(x=>x&&typeof x==='object')){if(!okId(a.id))a.id=uid();await guardar('artistas',a).catch(()=>{});if(db)await espera(160)}
 for(const t of ts){if(!okId(t.id))t.id=uid();await guardar('trabajos',normT(t)).catch(()=>{});if(db)await espera(160)}
 if(d.aj&&typeof d.aj==='object'){S.aj=normAj(d.aj);await guardarAj()}
 toast('Copia restaurada.');
}
const cl=v=>String(v??'').replace(/[\t\n\r]+/g,' ');
function tabla(){
 const H=['Fecha','Cliente','Artista','Trabajo','Tipo','Temas','Etiquetas','Estado','Moneda','Monto','Reembolsos','Cobrado','Saldo','Gastos','Ganancia','Entrega'];
 return [H.join('\t')].concat(S.trabajos.slice().sort((a,b)=>(a.fecha||'').localeCompare(b.fecha||'')).map(t=>[t.fecha,nomCli(t),nomArt(t),t.titulo,t.tipo,parseInt(t.temas,10)||'',(t.etiquetas||[]).join(', '),etiqueta(t),t.moneda,num(t.total).toFixed(2),reembT(t).toFixed(2),pagado(t).toFixed(2),saldo(t).toFixed(2),gastosT(t).toFixed(2),gananciaT(t).toFixed(2),baseEntrega(t)].map(cl).join('\t'))).join('\n');
}
function tablaGastosGen(){const H=['Fecha','Categoría','Detalle','Moneda','Monto'];return [H.join('\t')].concat(S.gastosGen.slice().sort((a,b)=>(a.fecha||'').localeCompare(b.fecha||'')).map(g=>[g.fecha,g.cat,g.det,g.moneda,num(g.monto).toFixed(2)].map(cl).join('\t'))).join('\n')}
function tablaGastos(){
 const H=['Fecha','Trabajo','Cliente','Categoría','Detalle','Moneda','Monto','Pagó','Devuelto','Reembolsable'];
 return [H.join('\t')].concat(S.trabajos.flatMap(t=>(t.gastos||[]).map(g=>({g,t}))).sort((a,b)=>(a.g.fecha||'').localeCompare(b.g.fecha||'')).map(({g,t})=>[g.fecha,t.titulo,nomCli(t),g.cat||'Otros',g.det,t.moneda,num(g.monto).toFixed(2),g.por||'Caja',g.por?(g.dev?'Sí':'No'):'',g.reemb?'Sí':'No'].map(cl).join('\t'))).join('\n');
}

/* ---------- acciones ---------- */
/* ---------- avisos al iPhone ---------- */
// La app arma el plan de los próximos 45 días; Supabase manda cada mañana (8 a.m.) los del día.
// Sin montos ni nombres de clientes: solo el trabajo y el artista.
function planAvisos(){
 const A=S.aj.avisos||{};if(!A.on)return[];
 const h=hoy(),lim=sumarDias(h,45),out=[],add=(fecha,id,titulo,cuerpo,url)=>{if(fecha&&fecha>=h&&fecha<=lim)out.push({id,fecha,titulo,cuerpo,url})};
 for(const t of S.trabajos){
  if(t.estadoProd==='cancelado')continue;
  const nom='«'+(t.titulo||'Trabajo')+'»'+(nomArt(t)?' · '+nomArt(t):''),url='#t-'+t.id;
  const cs=cuenta(t)?cuotas(t):[],faltaAd=cs.some(c=>c.tipo==='adelanto'&&c.falta>0.004);
  if(A.cobros!==false)for(const c of cs){if(c.falta<=0.004||!c.vence)continue;
   if(c.tipo!=='entrega')add(c.vence,'v-'+t.id+'-'+c.id,c.tipo==='adelanto'?'Hoy toca cobrar el adelanto':'Hoy vence: '+c.concepto,nom,url);
   add(sumarDias(c.vence,G()+1),'x-'+t.id+'-'+c.id,'Pago vencido: '+c.concepto,nom,url)}
  if(A.entregas!==false&&t.estadoProd==='produccion'&&t.entrega)add(sumarDias(t.entrega,-1),'e-'+t.id,'Mañana entregas',nom+(saldo(t)>0.004?' · cobrar al entregar':''),url);
  if(A.rodajes!==false&&t.estadoProd!=='cotizado')for(const b of bloques(t))add(sumarDias(b.fecha,-1),'r-'+t.id+'-'+b.fecha,'Mañana rodaje'+(b.horaIni?' · '+b.horaIni:''),nom+(t.lugar?' · '+t.lugar:'')+(faltaAd?' · falta el adelanto':''),url);
 }
 return out.sort((a,b)=>a.fecha.localeCompare(b.fecha)||a.id.localeCompare(b.id));
}
let tcRevisado=false,pedidoNuevo='';try{pedidoNuevo=new URLSearchParams(location.search).get('nuevo')||''}catch(e){}
let tmAvisos=0,ultPlan=null;try{ultPlan=localStorage.getItem('cp-avisos-plan')}catch(e){}
function revisarAvisos(){
 if(!db||S.modo!=='nube'||tmAvisos)return;
 tmAvisos=setTimeout(()=>{tmAvisos=0;const plan=planAvisos(),k=JSON.stringify(plan);if(k===ultPlan)return;ultPlan=k;
  encolar('sistema/avisos',()=>db.collection('sistema').doc('avisos').set({plan,actualizado:new Date().toISOString()})).then(()=>{try{localStorage.setItem('cp-avisos-plan',k)}catch(e){}},()=>{ultPlan=null})},2500);
}
window.CP_avisosActivos=on=>{const a={cobros:true,entregas:true,rodajes:true,...(S.aj.avisos||{}),on:!!on};if(!!(S.aj.avisos||{}).on===!!on)return;S.aj={...S.aj,avisos:a};guardarAj();revisarAvisos()};
/* ---------- buscador general ---------- */
// Busca en trabajos, clientes, artistas, pagos y gastos. Cada palabra debe aparecer (sin tildes ni mayúsculas).
function buscarTodo(q){
 const w=nrm(q).split(' ').filter(Boolean);if(!w.length)return null;
 const ok=(...xs)=>{const n=nrm(xs.filter(x=>x!=null&&x!=='').join(' '));return w.every(x=>n.includes(x))};
 const mto=v=>{const n=num(v);return n?[String(n),fmtR(n,'PEN').replace(/[^\d.,]/g,''),Math.round(n)].join(' '):''};
 const R={t:[],c:[],a:[],p:[],g:[]};
 for(const t of S.trabajos){
  const est=PROD[t.estadoProd]||'';
  if(ok(t.titulo,quien(t),nomCli(t),t.tipo,t.lugar,t.notas,(t.etiquetas||[]).join(' '),t.temasNom,est,fd(t.fecha),mto(t.total)))R.t.push(t);
  for(const p of t.pagos||[])if(ok(mto(p.monto),p.metodo,p.nota,fd(p.fecha),t.titulo,quien(t),'pago cobro'))R.p.push({t,p});
  for(const g of t.gastos||[])if(ok(mto(g.monto),g.cat,g.det,fd(g.fecha),t.titulo,quien(t),'gasto'))R.g.push({t,g});
 }
 for(const c of S.clientes)if(ok(c.nombre,c.telefono,c.email,c.notas,c.doc,'cliente'))R.c.push(c);
 for(const a of S.artistas)if(ok(a.nombre,a.telefono,a.email,a.notas,'artista'))R.a.push(a);
 for(const g of S.gastosGen||[])if(ok(mto(g.monto),g.cat,g.det,fd(g.fecha),'gasto general'))R.g.push({g});
 const rec=(x,y)=>(y||'').localeCompare(x||'');
 R.t.sort((x,y)=>rec(x.fecha,y.fecha));R.p.sort((x,y)=>rec(x.p.fecha,y.p.fecha));R.g.sort((x,y)=>rec(x.g.fecha,y.g.fecha));
 return R;
}
function resultadosBusqueda(q){
 const R=buscarTodo(q);
 if(!R)return `<p class="hint">Escribe el nombre de un trabajo, cliente o artista, un monto (por ejemplo 1500), un método de pago o una palabra de las notas.</p>`;
 const tot=R.t.length+R.c.length+R.a.length+R.p.length+R.g.length;
 if(!tot)return `<p class="hint">No encontré nada con “${esc(q)}”. Prueba con menos palabras.</p>`;
 const MAX=8,grupo=(tit,arr,fila)=>arr.length?`<div class="bq"><h3>${tit}<span>${arr.length}</span></h3>${arr.slice(0,MAX).map(fila).join('')}${arr.length>MAX?`<p class="hint">y ${arr.length-MAX} más: escribe otra palabra para afinar.</p>`:''}</div>`:'';
 const fila=(a,id,p,tit,sub,der)=>`<button type="button" class="it bqi" data-a="${a}" data-id="${esc(id)}"${p?` data-p="${esc(p)}"`:''}><div><b>${esc(tit)}</b><p>${sub}</p></div>${der?`<span class="bqm">${der}</span>`:''}</button>`;
 return grupo('Trabajos',R.t,t=>fila('verT',t.id,'',t.titulo||'Trabajo',esc([quien(t),PROD[t.estadoProd],fd(t.fecha)].filter(Boolean).join(' · ')),fmt(num(t.total),t.moneda)))
  +grupo('Clientes',R.c,c=>fila('verC',c.id,'',c.nombre,esc([c.telefono,c.email].filter(Boolean).join(' · ')||'Cliente'),''))
  +grupo('Artistas',R.a,a=>fila('verA',a.id,'',a.nombre,esc([a.telefono,a.email].filter(Boolean).join(' · ')||'Artista'),''))
  +grupo('Pagos',R.p,({t,p})=>fila('editarPago',t.id,p.id,t.titulo||'Trabajo',esc([fd(p.fecha),p.metodo,p.nota].filter(Boolean).join(' · ')),fmt(num(p.monto),t.moneda)))
  +grupo('Gastos',R.g,({t,g})=>t?fila('editarG',t.id,g.id,g.det||g.cat||'Gasto',esc([t.titulo,g.cat,fd(g.fecha)].filter(Boolean).join(' · ')),fmt(num(g.monto),t.moneda))
   :fila('editarGen',g.id,'',g.det||g.cat||'Gasto general',esc(['Gasto general',g.cat,fd(g.fecha)].filter(Boolean).join(' · ')),fmt(num(g.monto),g.moneda||S.aj.moneda||'PEN')));
}
function buscar(){
 abrir(cab('Buscar')+`<label class="bqin"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg><input id="qg" type="search" placeholder="Trabajo, cliente, monto, nota…" aria-label="Buscar en todo" autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="search" value="${esc(S.qg||'')}"></label><div id="qgr" aria-live="polite">${resultadosBusqueda(S.qg||'')}</div>`,{mount:s=>{
  const i=s.querySelector('#qg'),r=s.querySelector('#qgr');let tm=0;
  i.addEventListener('input',()=>{clearTimeout(tm);tm=setTimeout(()=>{S.qg=i.value;r.innerHTML=resultadosBusqueda(i.value)},120)});
  i.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();const b=r.querySelector('.bqi');if(b)b.click()}});
  setTimeout(()=>{i.focus();i.select()},60);
 }});
}
document.addEventListener('keydown',e=>{
 const k=e.key&&e.key.toLowerCase(),enCampo=/^(input|textarea|select)$/i.test((e.target&&e.target.tagName)||'')||(e.target&&e.target.isContentEditable);
 if((k==='k'&&(e.metaKey||e.ctrlKey))||(k==='/'&&!enCampo&&ov.hidden)){if(document.getElementById('login'))return;e.preventDefault();buscar()}
});
function verT(id){if(!S.trabajos.find(x=>x.id===id)){cerrar();return}abrir(dTrabajo(id),{live:()=>dTrabajo(id)})}
function verC(id){if(!cli(id)){cerrar();return}abrir(dCliente(id),{live:()=>dCliente(id)})}
function verA(id){if(!art(id)){cerrar();return}abrir(dArtista(id),{live:()=>dArtista(id)})}
const A={
 cerrar,verT,verC,verA,buscar,
 ojo:()=>{S.oculto=!S.oculto;render()},
 vc:k=>{S.vc=k==='artistas'?'artistas':'clientes';render()},
 importar:()=>importar(),
 nuevoA:()=>fArtista(null),
 editarA:id=>{const a=art(id);a&&fArtista(a)},
 borrarA:id=>{if(S.trabajos.some(t=>t.artistaId===id)){toast('Este artista tiene trabajos. Quítalo de esos trabajos primero.');return}borrar('artistas',id).catch(()=>{});cerrar();toast('Artista eliminado.')},
 nuevoTA:id=>fTrabajo(null,'',art(id)?id:''),
 mas:()=>abrir(cab('¿Qué quieres registrar?')+`<div class="elige"><button class="btn pri" data-a="nuevoT">${ic('film')}<span>Nuevo trabajo<small>Artista, cliente, temas, adelanto y entrega</small></span></button><button class="btn" data-a="pagoRapido">${ic('cash')}<span>Un pago recibido<small>Adelanto, abono o cancelación</small></span></button><button class="btn" data-a="gastoRapido">${ic('gift')}<span>Un gasto de producción<small>Transporte, hospedaje, viáticos…</small></span></button><button class="btn" data-a="gastoGen">${ic('coin')}<span>Un gasto del negocio<small>Equipo, software, publicidad, internet…</small></span></button></div>`),
 pagoRapido:()=>elegirParaPago(),
 gastoGen:()=>fGastoGen(null),
 editarGen:id=>{const g=S.gastosGen.find(x=>x.id===id);g&&fGastoGen(g)},
 borrarGen:id=>{const g=S.gastosGen.find(x=>x.id===id);if(g&&g.foto)borrarFoto(id);borrar('gastosGen',id).catch(()=>{});cerrar();toast('Gasto borrado.')},
 fotoGen:id=>verFoto('',id),
 reciboPdf:(id,b)=>{const t=S.trabajos.find(x=>x.id===id),p=t&&(t.pagos||[]).find(x=>x.id===b.dataset.p);if(p)hacerPdf('recibo',t,p)},
 estadoPdf:id=>{const t=S.trabajos.find(x=>x.id===id);t&&hacerPdf('estado',t)},
 gastoRapido:()=>fGasto(null),
 nuevoT:id=>fTrabajo(null,id&&cli(id)?id:''),
 editarT:id=>{const t=S.trabajos.find(x=>x.id===id);t&&fTrabajo(t)},
 borrarT:id=>{const t=S.trabajos.find(x=>x.id===id);if(t)quitarDeCal(t);(t&&t.gastos||[]).forEach(g=>g.foto&&borrarFoto(g.id));borrar('trabajos',id).catch(()=>{});cerrar();toast('Trabajo eliminado.')},
 cotPdf:id=>{const t=S.trabajos.find(x=>x.id===id);if(t)(cotLista(t)?hacerCotPdf(t):fCot(t.id))},
 cotWa:id=>{const t=S.trabajos.find(x=>x.id===id);if(t)enviarCot(t)},
 modelos:()=>fModelos(),editarModelo:id=>fModelo(id),nuevoModelo:()=>fModelo(),catalogo:()=>fCatalogo(),borrarModelo:id=>{S.aj={...S.aj,modelos:modelos().filter(x=>x.id!==id)};guardarAj();toast('Modelo borrado.');fModelos()},
 fCot:id=>fCot(id),
 nuevoEq:id=>fEquipo(id),editarEq:(id,b)=>fEquipo(id,b.dataset.p),borrarEq:(id,b)=>{mutT(id,n=>{n.equipo=(n.equipo||[]).filter(x=>x.id!==b.dataset.p)});toast('Quitado del equipo.');verT(id)},
 aprobar:id=>{const t=S.trabajos.find(x=>x.id===id);if(t&&t.cot&&t.cot.modo==='modelo'&&((t.cot.alternativas||[]).length||(t.cot.opcionales||[]).length)){fAprobar(id);return}mutT(id,n=>{n.estadoProd='produccion'}).then(()=>syncCal(id));toast('Cotización aprobada: ya cuenta como trabajo por cobrar.')},
 entregar:id=>{mutT(id,n=>{n.estadoProd='entregado';n.entregadoEl=hoy()});toast(`Entregado. La cancelación vence en ${G()} ${G()===1?'día':'días'}.`)},
 pago:id=>fPago(id),gasto:id=>fGasto(id),
 editarPago:(id,b)=>fPago(id,b.dataset.p),
 editarG:(id,b)=>fGasto(id,b.dataset.p),gastoCat:(id,b)=>fGasto(id,null,b.dataset.p),
 foto:(id,b)=>verFoto(id,b.dataset.p),
 borrarPago:(id,b)=>{const p=b.dataset.p;mutT(id,n=>{n.pagos=(n.pagos||[]).filter(x=>x.id!==p)});toast('Pago borrado.')},
 borrarGasto:(id,b)=>{const p=b.dataset.p;const t=S.trabajos.find(x=>x.id===id);const g=t&&(t.gastos||[]).find(x=>x.id===p);if(g&&g.foto)borrarFoto(p);mutT(id,n=>{n.gastos=(n.gastos||[]).filter(x=>x.id!==p)});toast('Gasto borrado.');verT(id)},
 copiarT:id=>{const t=S.trabajos.find(x=>x.id===id);t&&copiar(textoT(t))},
 copiarC:id=>{const c=cli(id);c&&copiar(textoC(c))},
 nuevoC:()=>fCliente(null),
 editarC:id=>{const c=cli(id);c&&fCliente(c)},
 borrarC:id=>{if(S.trabajos.some(t=>t.clienteId===id)){toast('Este cliente tiene trabajos. Elimina o reasigna sus trabajos primero.');return}borrar('clientes',id).catch(()=>{});cerrar();toast('Cliente eliminado.')},
 filtro:k=>{S.f=k;render()},
 etq:k=>{S.tag=k||'';render()},
 tv:k=>{S.tv=k==='cal'?'cal':'lista';render()},
 dia:k=>{S.dia=k;render()},
 mes:k=>{const n=+k;if(!n){S.mes='';S.dia='';}else{const base=S.mes||hoy().slice(0,7);const d=new Date(base+'-15T12:00:00');d.setMonth(d.getMonth()+n);S.mes=d.toISOString().slice(0,7);S.dia=''}render()},
 syncCal:id=>syncCal(id),
 moverCal:()=>{cerrar();moverTodos()},
 addCal:id=>{mutT(id,n=>{n.cal={entrega:true,notif:true,...(n.cal||{}),on:true}}).then(()=>syncCal(id))},
 ajustes:()=>fAjustes(),salir:(id,b)=>{if(b.dataset.seguro){CP.salir();return}b.dataset.seguro='1';b.textContent='Toca otra vez para cerrar sesión';setTimeout(()=>{if(b.isConnected){delete b.dataset.seguro;b.textContent='Cerrar sesión'}},5000)},
 tplDef:()=>{const m={t1:'tplAdelanto',t2:'tplCuota',t3:'tplCancel'};Object.entries(m).forEach(([i,k])=>{const ta=sh.querySelector('#'+i);if(ta)ta.value=TPL[k]})},
 copiarTabla:()=>copiar(tabla(),'Tabla copiada. Pégala en Excel, Numbers o Google Sheets.'),
 copiarGastos:()=>copiar(tablaGastos()+(S.gastosGen.length?'\n\nGASTOS DEL NEGOCIO\n'+tablaGastosGen():''),'Tabla de gastos copiada. Pégala en Excel, Numbers o Google Sheets.'),
 copiarBackup:()=>copiar(JSON.stringify({app:'cuentas-produccion',fecha:hoy(),clientes:S.clientes,artistas:S.artistas,gastosGen:S.gastosGen,trabajos:S.trabajos,aj:S.aj}),'Copia de seguridad copiada. Guárdala en Notas o envíatela por correo.'),
 restaurar:()=>{const ta=sh.querySelector('#rb');if(ta&&ta.value.trim())restaurar(ta.value.trim());else toast('Primero pega el texto de la copia.')}
};
/* ---------- deslizar ---------- */
const tactil=!!(window.matchMedia&&matchMedia('(pointer:coarse)').matches);
const pistaVista=()=>{try{return localStorage.getItem('cp-pista-sw')==='1'}catch(e){return true}};
let sw=null,sinClick=0;
const cierraSw=ex=>document.querySelectorAll('.sw.abierto').forEach(x=>{if(x!==ex){x.classList.remove('abierto');const r=x.querySelector('.row');if(r)r.style.transform=''}});
document.addEventListener('touchstart',e=>{const r=e.target.closest('.sw>.row');cierraSw(r&&r.parentNode);if(!r||e.target.closest('a,button'))return;const t=e.touches[0];sw={r,x:t.clientX,y:t.clientY,dx:0,on:false,base:r.parentNode.classList.contains('abierto')?-r.parentNode.querySelector('.swa').offsetWidth:0}},{passive:true});
document.addEventListener('touchmove',e=>{if(!sw)return;const t=e.touches[0],dx=t.clientX-sw.x,dy=t.clientY-sw.y;
 if(!sw.on){if(Math.abs(dx)>10&&Math.abs(dx)>Math.abs(dy)*1.3){sw.on=true;sw.r.style.transition='none'}else if(Math.abs(dy)>10){sw=null;return}else return}
 sw.dx=dx;const w=sw.r.parentNode.querySelector('.swa').offsetWidth;sw.r.style.transform=`translateX(${Math.max(-w-24,Math.min(0,sw.base+dx))}px)`},{passive:true});
document.addEventListener('touchend',()=>{if(!sw)return;const {r,on,dx,base}=sw;sw=null;if(!on)return;r.style.transition='';const w=r.parentNode.querySelector('.swa').offsetWidth,ab=base+dx<-w/2;
 r.parentNode.classList.toggle('abierto',ab);r.style.transform=ab?`translateX(${-w}px)`:'';sinClick=Date.now();if(ab){try{localStorage.setItem('cp-pista-sw','1')}catch(x){}const h=document.querySelector('.swh');if(h)h.remove()}});

document.addEventListener('click',e=>{
 if(Date.now()-sinClick<400){e.preventDefault();return}
 const rowSw=e.target.closest('.sw.abierto>.row');if(rowSw){e.preventDefault();cierraSw(null);return}
 if(e.target.closest('a[href]'))return;
 const b=e.target.closest('[data-a]');if(!b)return;
 if(b.dataset.c&&!b.dataset.ok){e.preventDefault();b.dataset.ok='1';const old=b.textContent;b.textContent=b.dataset.cl||'¿Seguro?';b.classList.add('conf');setTimeout(()=>{if(b.isConnected){delete b.dataset.ok;b.textContent=old;b.classList.remove('conf')}},4000);return}
 const fn=A[b.dataset.a];if(fn){e.preventDefault();fn(b.dataset.id,b)}
});
document.addEventListener('input',e=>{
 if(e.target.id==='qt'){S.q=e.target.value;$('#lst').innerHTML=listaT()}
 if(e.target.id==='qc'){S.qc=e.target.value;$('#lstc').innerHTML=listaC()}
 if(e.target.id==='qa'){S.qa=e.target.value;$('#lsta').innerHTML=listaA()}
});
document.addEventListener('change',e=>{
 if(e.target.id==='ranio'){S.anio=+e.target.value;render()}
 if(e.target.id==='rmon'){S.mon=e.target.value;render()}
});
addEventListener('hashchange',()=>{if(!ov.hidden)cerrar();scrollTo(0,0);render()});

/* ---------- pintar ---------- */
let raf=0;function render(){if(raf)return;raf=requestAnimationFrame(()=>{raf=0;pintar()})}
function pintar(){
 if(/^#t-/.test(location.hash)){const id=location.hash.slice(3);if(S.trabajos.some(x=>x.id===id)){history.replaceState(null,'','#trabajos');setTimeout(()=>verT(id),0)}}
 revisarAvisos();
 if(S.modo==='nube'&&!tcRevisado){tcRevisado=true;setTimeout(()=>actualizarTC(false),4000)}
 if(pedidoNuevo&&S.modo==='nube'){const k=pedidoNuevo;pedidoNuevo='';try{const u=new URL(location.href);u.searchParams.delete('nuevo');history.replaceState(null,'',u.pathname+u.search+u.hash)}catch(e){}
  setTimeout(()=>{if(k==='gasto')A.gastoRapido();else if(k==='pago')A.pagoRapido();else if(k==='trabajo')A.nuevoT();else if(k==='buscar')buscar()},200)}
 const ae=document.activeElement,aid=ae&&ae.id,sel=ae&&ae.selectionStart;
 const v=vista();
 document.querySelectorAll('[data-v]').forEach(a=>a.classList.toggle('on',a.dataset.v===v));
 const sy=$('#sync'),red=S.modo==='nube'&&window.CP_estadoRed?window.CP_estadoRed():null;sy.className='sync'+(S.modo==='local'?' local':'')+(red?' '+red.cls:'');sy.innerHTML='<i></i>'+(red?red.txt:S.modo==='nube'?'Sincronizado':S.modo==='local'?'Solo este equipo':'Conectando…');
 const av=$('#aviso');av.hidden=!S.aviso;av.textContent=S.aviso;
 $('#view').innerHTML=VISTAS[v]();
 if(aid==='qt'||aid==='qc'||aid==='qa'){const el=document.getElementById(aid);if(el){el.focus();try{el.setSelectionRange(sel,sel)}catch(e){}}}
 if(live){const h=live();if(h===null)cerrar();else if(h!==ultima){const st=sh.scrollTop;sh.innerHTML=h;ultima=h;sh.scrollTop=st}}
}

/* ---------- tema ---------- */
let tema='';try{tema=localStorage.getItem('cp-tema')||''}catch(e){}
let ocultarInicio=false;try{ocultarInicio=localStorage.getItem('cp-ocultar')==='1'}catch(e){}
S.oculto=ocultarInicio;
document.addEventListener('visibilitychange',()=>{if(document.hidden&&ocultarInicio&&!S.oculto){S.oculto=true;render()}});
const aplicaTema=()=>{const r=document.documentElement;if(tema){if(r.dataset.theme!==tema)r.dataset.theme=tema}};
aplicaTema();new MutationObserver(aplicaTema).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});

/* ---------- inicio ---------- */
async function init(){
 render();
 if(window.claude&&typeof window.claude.use==='function'){window.claude.use('mcp').then(m=>{mcpNs=m||null;render();if(mcpNs&&navigator.onLine)setTimeout(borrarCalPendientes,1500)},()=>{})}
 try{if(window.claude&&typeof window.claude.use==='function')db=await window.claude.use('db')}catch(e){db=null}
 if(!db){S.modo='local';cargarLocal();S.aviso='No se pudo conectar con tu base de datos: lo que registres ahora queda solo en este equipo. Revisa tu conexión y vuelve a abrir la app.';render();return}
 const listo={clientes:false,artistas:false,gastosGen:false,trabajos:false,aj:false};
 const timer=setTimeout(()=>{if(!Object.values(listo).every(Boolean)){S.aviso='Todavía no se pueden cargar tus cuentas. Revisa tu conexión; lo que ves podría no estar actualizado.';if(S.modo==='cargando')S.modo='nube';render()}},10000);
 const marca=(k,meta)=>{if(!meta.fromCache)listo[k]=true;if(Object.values(listo).every(Boolean)){clearTimeout(timer);S.aviso=''}S.modo='nube';render()};
 const err=e=>{clearTimeout(timer);S.aviso=e&&e.code==='revoked'?'Ya no tienes acceso a estas cuentas.':'Se perdió la conexión con tus cuentas. Vuelve a abrir la app para reconectar.';if(S.modo==='cargando')S.modo='nube';render()};
 db.collection('clientes').onSnapshot(s=>{S.clientes=s.docs.map(d=>({...d.data(),id:d.id}));marca('clientes',s.metadata)},err);
 db.collection('gastosGen').onSnapshot(s=>{S.gastosGen=s.docs.map(d=>({...d.data(),id:d.id}));marca('gastosGen',s.metadata)},err);
 db.collection('artistas').onSnapshot(s=>{S.artistas=s.docs.map(d=>({...d.data(),id:d.id}));marca('artistas',s.metadata)},err);
 db.collection('trabajos').onSnapshot(s=>{S.trabajos=s.docs.map(d=>normT({...d.data(),id:d.id}));marca('trabajos',s.metadata)},err);
 db.doc('ajustes/general').onSnapshot(d=>{if(d.exists)S.aj=normAj(d.data());marca('aj',d.metadata)},err);
}
init();
}
