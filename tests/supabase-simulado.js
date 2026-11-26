// Supabase simulado para pruebas: guarda en memoria + localStorage, imita las llamadas que usa plataforma.js
(function(){
 const LS='fake-sb';const st=JSON.parse(localStorage.getItem(LS)||'{"rows":[],"session":null}');
 const save=()=>localStorage.setItem(LS,JSON.stringify(st));window.__sbLog=[];
 const chans=[];
 const emit=(type,row,old)=>chans.forEach(h=>setTimeout(()=>h({eventType:type,new:row||{},old:old||{}}),30));
 function q(tabla){const f={eq:[],range:null,op:'select',payload:null};const api={
  select(){return api},order(){return api},limit(){return api},eq(k,v){f.eq.push([k,v]);return api},range(a,b){f.range=[a,b];return api},
  upsert(p){f.op='upsert';f.payload=p;return api},delete(){f.op='delete';return api},
  maybeSingle(){f.single=true;return api},
  then(res,rej){window.__sbLog.push([f.op,JSON.stringify(f.eq),f.payload&&f.payload.coleccion+'/'+f.payload.id]);
   if(!navigator.onLine){return Promise.resolve({data:null,error:{message:'TypeError: Failed to fetch'}}).then(res,rej)}
   if(window.__sbFail){return Promise.resolve({data:null,error:{message:'network down'}}).then(res,rej)}
   const m=r=>f.eq.every(([k,v])=>r[k]===v);let out;
   if(tabla==='respaldos'){return Promise.resolve({data:(st.resp||[]).slice().reverse().map(r=>({id:r.id,creado:r.creado,motivo:r.motivo,documentos:Object.keys(r.datos).length})),error:null}).then(res,rej)}
   if(f.op==='select'){let rs=st.rows.filter(m).map(r=>({coleccion:r.coleccion,id:r.id,datos:r.datos}));if(f.range)rs=rs.slice(f.range[0],f.range[1]+1);out={data:f.single?(rs[0]||null):rs,error:null}}
   else if(f.op==='upsert'){const p=f.payload;const i=st.rows.findIndex(r=>r.coleccion===p.coleccion&&r.id===p.id);const row={coleccion:p.coleccion,id:p.id,datos:p.datos};if(i>=0)st.rows[i]=row;else st.rows.push(row);save();emit(i>=0?'UPDATE':'INSERT',row);out={data:null,error:null}}
   else if(f.op==='delete'){const del=st.rows.filter(m);st.rows=st.rows.filter(r=>!m(r));save();del.forEach(r=>emit('DELETE',null,{coleccion:r.coleccion,id:r.id}));out={data:null,error:null}}
   return Promise.resolve(out).then(res,rej)}};return api}
 window.supabase={createClient:()=>({
  auth:{getSession:async()=>(!navigator.onLine&&localStorage.getItem('test-expirado')?{data:{session:null},error:{message:'TypeError: Failed to fetch'}}:{data:{session:st.session}}),refreshSession:async()=>({data:{},error:null}),
   signUp:async({email,password})=>{if(st.users&&st.users[email])return{data:{},error:{message:'User already registered'}};st.users=st.users||{};st.users[email]=password;st.session={user:{id:'u-1',email}};save();return{data:{session:st.session},error:null}},signInWithPassword:async({email,password})=>{if(!st.users||st.users[email]!==password)return{data:{},error:{message:'Invalid login credentials'}};st.session={user:{id:'u-1',email}};save();return{data:{session:st.session},error:null}},
   verifyOtp:async({email,token})=>{if(token!=='123456')return{data:{},error:{message:'Token has expired or is invalid'}};st.session={user:{id:'u-1',email}};save();return{data:{session:st.session},error:null}},
   onAuthStateChange:()=>({data:{subscription:{unsubscribe(){}}}}),
   signOut:async()=>{st.session=null;save()}},
  functions:{invoke:async(n,{body})=>{window.__fnLog=(window.__fnLog||[]);window.__fnLog.push(body);const c=JSON.parse(localStorage.getItem('fake-cal')||'{"con":false}');
   if(body.accion==='estado')return{data:{conectado:c.con,correo:c.con?'jozeph9@gmail.com':'',configurado:true},error:null};
   if(body.accion==='iniciar')return{data:{url:location.origin+location.pathname+'?code=abc&state=xyz&scope=s'},error:null};
   if(body.accion==='terminar'){localStorage.setItem('fake-cal','{"con":true}');return{data:{ok:true,correo:'jozeph9@gmail.com'},error:null}}
   if(body.accion==='desconectar'){localStorage.setItem('fake-cal','{"con":false}');return{data:{ok:true},error:null}}
   if(body.accion==='llamar'){if(!c.con)return{data:{error:{code:'server_not_connected',message:'x'}},error:null};return{data:{payload:body.tool==='list_calendars'?{calendars:[{id:'rod',summary:'Rodajes'}]}:{id:'gev'+window.__fnLog.length}},error:null}}
   return{data:null,error:{context:{json:async()=>({error:{code:'error',message:'?'}})}}}}},
  rpc:async(n,a)=>{st.resp=st.resp||[];const snap=mot=>{const datos={};st.rows.filter(r=>r.coleccion!=='comprobantes').forEach(r=>datos[r.coleccion+'/'+r.id]=r.datos);st.resp.push({id:st.resp.length+1,creado:new Date().toISOString(),motivo:mot,datos});save()};
   if(n==='respaldar_ahora'){snap('manual');return{data:st.resp.length,error:null}}
   if(n==='restaurar_respaldo'){const r=st.resp.find(x=>x.id===a.p_id);snap('antes de restaurar');st.rows=st.rows.filter(x=>x.coleccion==='comprobantes');for(const k in r.datos){const [c,...i]=k.split('/');st.rows.push({coleccion:c,id:i.join('/'),datos:r.datos[k]})}save();return{data:Object.keys(r.datos).length,error:null}}
   return{data:null,error:{message:'?'}}},
  from:t=>q(t),
  channel:()=>{const c={on(_,__,h){chans.push(h);return c},subscribe(cb){setTimeout(()=>cb&&cb('SUBSCRIBED'),50);return c}};return c}
 })};
 window.__sbExterno=(row)=>{const i=st.rows.findIndex(r=>r.coleccion===row.coleccion&&r.id===row.id);if(i>=0)st.rows[i]=row;else st.rows.push(row);save();emit('INSERT',row)};
})();
