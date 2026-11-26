/* Plataforma de "Cuentas de producción" fuera de Claude:
   - inicio de sesión con correo y contraseña (Supabase Auth)
   - base de datos en Supabase con la misma forma que usa la app (colecciones y documentos)
   - descargas (PDF) desde el navegador
   La app (index.html) pide estas piezas con window.claude.use(nombre), igual que antes. */
(function () {
  'use strict';
  const CFG = {
    url: 'https://xktubxqesglnyvwgeoll.supabase.co',
    key: 'sb_publishable_XEp-jcHM6xnIuqDo12doHA_28ZFUHY0'
  };
  const sb = window.supabase.createClient(CFG.url, CFG.key, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false, storageKey: 'cp-auth', flowType: 'implicit' }
  });

  const CP = (window.CP = { sb, cuenta: null, version: '1' });

  // Vuelta desde el correo de "olvidé mi contraseña" (#access_token=…&type=recovery) o enlace vencido (#error=…)
  const RECUPERA = (() => {
    const h = new URLSearchParams(location.hash.slice(1));
    let r = null;
    if (h.get('type') === 'recovery' && h.get('access_token') && h.get('refresh_token')) r = { at: h.get('access_token'), rt: h.get('refresh_token') };
    else if (h.get('error_code') || (h.get('error') && h.get('error_description'))) r = { error: h.get('error_code') || h.get('error') };
    if (r) try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {}
    return r;
  })();

  /* ---------- inicio de sesión ---------- */
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const LOGO = '<svg width="64" height="64" viewBox="0 0 40 40" aria-hidden="true"><rect width="40" height="40" rx="10" fill="#36454F"/><path d="M26 13.5a9 9 0 1 0 0 13" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round"/><circle cx="28.5" cy="27" r="2.4" fill="#FE004E"/></svg>';

  const CLAVE_ERR = m =>
    /invalid login|invalid credentials/i.test(m) ? 'El correo o la contraseña no son correctos.'
    : /not confirmed/i.test(m) ? 'Tu correo aún no está confirmado. Desactiva “Confirm email” en Supabase y vuelve a intentarlo.'
    : /same.*password|different from the old/i.test(m) ? 'La nueva contraseña debe ser distinta de la anterior.'
    : /weak|pwned|leaked|at least/i.test(m) ? 'Esa contraseña es muy fácil de adivinar. Usa otra de al menos 8 caracteres.'
    : /rate|too many|security purposes/i.test(m) ? 'Demasiados intentos. Espera unos minutos y vuelve a intentarlo.'
    : /expired|invalid.*(token|jwt)|session/i.test(m) ? 'El enlace venció. Pide otro con “¿Olvidaste tu contraseña?”.'
    : 'No se pudo completar. Revisa tu conexión e inténtalo otra vez.';

  // modo: 'entrar' | 'olvido' | 'nueva' (poner contraseña nueva tras abrir el enlace del correo)
  function pantallaLogin(modoInicial, msgInicial) {
    return new Promise(resolve => {
      const el = document.createElement('div');
      el.id = 'login';
      el.setAttribute('role', 'dialog');
      el.setAttribute('aria-modal', 'true');
      el.setAttribute('aria-labelledby', 'lgt');
      document.body.appendChild(el);
      let correo = '';
      try { correo = localStorage.getItem('cp-correo') || ''; } catch (e) {}
      const pinta = (modo, msg, ok) => {
        const campoCorreo = `<label for="lge">Correo</label>
          <input id="lge" name="email" type="email" inputmode="email" autocomplete="username" autocapitalize="off" spellcheck="false" required value="${esc(correo)}">`;
        const cuerpo = modo === 'nueva'
          ? `<h1 id="lgt">Nueva contraseña</h1><p>Escribe tu nueva contraseña (mínimo 8 caracteres). El iPhone y la Mac te ofrecerán guardarla.</p>
             <input type="email" autocomplete="username" value="${esc(correo)}" hidden aria-hidden="true" tabindex="-1">
             <label for="lgp">Nueva contraseña</label><input id="lgp" type="password" autocomplete="new-password" minlength="8" required>
             <label for="lgp2">Repite la contraseña</label><input id="lgp2" type="password" autocomplete="new-password" minlength="8" required>
             <button class="btn pri" type="submit">Guardar y entrar</button>`
          : modo === 'olvido'
          ? `<h1 id="lgt">¿Olvidaste tu contraseña?</h1><p>Te enviamos un correo con un enlace para poner una nueva. Llega de Supabase y está en inglés: toca <b>Reset Password</b>.</p>
             ${campoCorreo}<button class="btn pri" type="submit">Enviarme el enlace</button>`
          : `<h1 id="lgt">Cuentas</h1><p>Entra con tu correo y tu contraseña.</p>
             ${campoCorreo}
             <label for="lgp">Contraseña</label><input id="lgp" name="password" type="password" autocomplete="current-password" minlength="8" required>
             <button class="btn pri" type="submit">Entrar</button>`;
        const enlace = modo === 'entrar' ? '¿Olvidaste tu contraseña?' : modo === 'olvido' ? 'Volver a entrar' : '';
        el.innerHTML = `<form class="lgc" id="lgf" novalidate>${LOGO}${cuerpo}
          <p class="lgerr${ok ? ' lgok' : ''}" role="alert">${esc(msg || '')}</p>
          ${enlace ? `<div class="lgacts lgc1"><button type="button" class="lnk" id="lgm">${enlace}</button></div>` : ''}</form>`;
        const f = el.querySelector('#lgf'), ie = el.querySelector('#lge'), ip = el.querySelector('#lgp'), b = f.querySelector('button[type=submit]'), er = f.querySelector('.lgerr');
        setTimeout(() => ((ie && !ie.value) || !ip ? ie : ip).focus(), 50);
        const lm = el.querySelector('#lgm');
        if (lm) lm.addEventListener('click', () => { if (ie) correo = ie.value.trim(); pinta(modo === 'entrar' ? 'olvido' : 'entrar'); });
        const ocupado = (si, txt) => { b.disabled = si; if (txt) b.textContent = txt; };
        f.addEventListener('submit', async e => {
          e.preventDefault();
          er.classList.remove('lgok');
          const v = ie ? ie.value.trim().toLowerCase() : correo, pw = ip ? ip.value : '';
          if (ie && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) { er.textContent = 'Revisa el correo: parece incompleto.'; return; }
          if (ip && pw.length < 8) { er.textContent = 'La contraseña debe tener al menos 8 caracteres.'; return; }
          if (modo === 'nueva' && pw !== el.querySelector('#lgp2').value) { er.textContent = 'Las dos contraseñas no coinciden.'; return; }
          const txt = b.textContent; er.textContent = '';
          if (ie) { correo = v; try { localStorage.setItem('cp-correo', v); } catch (e2) {} }
          if (modo === 'olvido') {
            ocupado(true, 'Enviando…');
            const { error } = await sb.auth.resetPasswordForEmail(v, { redirectTo: location.origin + location.pathname });
            ocupado(false, txt);
            if (error) { er.textContent = CLAVE_ERR(error.message || ''); return; }
            pinta('entrar', 'Listo: revisa tu correo (y la carpeta de spam). Abre el enlace en este mismo equipo; vence en 1 hora.', true);
            return;
          }
          if (modo === 'nueva') {
            ocupado(true, 'Guardando…');
            const { data, error } = await sb.auth.updateUser({ password: pw });
            if (error) { ocupado(false, txt); er.textContent = CLAVE_ERR(error.message || ''); return; }
            const { data: ses } = await sb.auth.getSession();
            el.remove();
            resolve(ses.session || { user: data.user });
            return;
          }
          ocupado(true, 'Entrando…');
          const r = await sb.auth.signInWithPassword({ email: v, password: pw });
          if (r.error || !r.data.session) { ocupado(false, txt); er.textContent = CLAVE_ERR((r.error && r.error.message) || ''); return; }
          el.remove();
          resolve(r.data.session);
        });
      };
      pinta(modoInicial || 'entrar', msgInicial);
    });
  }

  async function sesionDeRecuperacion() {
    if (!RECUPERA) return null;
    if (RECUPERA.error) return pantallaLogin('olvido', 'El enlace ya se usó o venció. Pide uno nuevo aquí.');
    const { data, error } = await sb.auth.setSession({ access_token: RECUPERA.at, refresh_token: RECUPERA.rt });
    if (error || !data.session) return pantallaLogin('olvido', 'El enlace ya se usó o venció. Pide uno nuevo aquí.');
    try { if (data.session.user && data.session.user.email) localStorage.setItem('cp-correo', data.session.user.email); } catch (e) {}
    return pantallaLogin('nueva');
  }

  const sesionLista = (async () => {
    const rec = await sesionDeRecuperacion();
    if (rec) { CP.cuenta = rec.user; return rec; }
    const { data, error } = await sb.auth.getSession();
    let s = data.session;
    if (!s && error) {
      // Sin conexión y con la sesión vencida: se sigue con la sesión guardada; se renueva sola al volver la señal
      try { const g = JSON.parse(localStorage.getItem('cp-auth') || 'null'); if (g && g.user && g.user.id && g.refresh_token) s = g; } catch (e) {}
    }
    s = s || (await pantallaLogin());
    CP.cuenta = s.user;
    return s;
  })();

  sb.auth.onAuthStateChange(ev => { if (ev === 'SIGNED_OUT') location.reload(); });

  CP.salir = async () => {
    try {
      Object.keys(localStorage).filter(k => k.startsWith('cp-cache:')).forEach(k => localStorage.removeItem(k));
    } catch (e) {}
    await sb.auth.signOut();
    location.reload();
  };

  /* ---------- base de datos (misma forma que la base de Claude) ----------
     Sin conexión: lo que se registra se guarda en el equipo (cola) y se sube solo cuando vuelve la señal. */
  const esDeRed = e => !navigator.onLine || /fetch|network|load failed|timed? ?out|conexi|abort|ECONN|offline/i.test(String((e && (e.message || e.details)) || e || ''));
  const esDeSesion = e => /jwt|token.*expired|401|not authenticated/i.test(String((e && (e.message || e.code)) || ''));

  function crearDB(uid) {
    const COLS = ['clientes', 'artistas', 'trabajos', 'gastosGen', 'comprobantes', 'ajustes', 'sistema'];
    const maps = {};      // coleccion -> Map(id -> datos)
    const oyentes = {};   // coleccion -> [fn(fromCache)]
    let canal = null, ocultoDesde = 0;
    const kCache = c => 'cp-cache:' + uid + ':' + c;
    const kCola = 'cp-cola:' + uid;
    const err = (e, code) => Object.assign(new Error((e && e.message) || code || 'error'), { code: code || 'network' });
    const guardarCache = c => { if (c === 'comprobantes') return; try { localStorage.setItem(kCache(c), JSON.stringify([...maps[c]])); } catch (e) {} };
    const avisar = (c, fromCache) => { (oyentes[c] || []).forEach(fn => { try { fn(!!fromCache); } catch (e) { console.error(e); } }); if (!fromCache) guardarCache(c); };

    /* --- cola de cambios pendientes --- */
    let cola = [];
    try { cola = JSON.parse(localStorage.getItem(kCola) || '[]'); if (!Array.isArray(cola)) cola = []; } catch (e) { cola = []; }
    const guardarCola = () => {
      try { localStorage.setItem(kCola, JSON.stringify(cola)); }
      catch (e) { throw Object.assign(new Error('Sin espacio en el equipo'), { code: 'quota_exceeded' }); }
      pintarEstado();
    };
    const pendiente = (c, id) => cola.find(x => x.c === c && x.id === id);
    function encolar(op, c, id, datos) {
      cola = cola.filter(x => !(x.c === c && x.id === id));
      cola.push({ op, c, id, datos: op === 'set' ? datos : undefined, t: Date.now() });
      guardarCola();
    }
    // Aplica los cambios pendientes encima de lo que llega del servidor
    function aplicarCola(c) {
      if (!maps[c]) return;
      for (const x of cola) if (x.c === c) { if (x.op === 'del') maps[c].delete(x.id); else maps[c].set(x.id, x.datos); }
    }

    let subiendo = null, avisoError = 0;
    async function subir() {
      if (subiendo || !cola.length || !navigator.onLine) return subiendo;
      subiendo = (async () => {
        pintarEstado(true);
        let subidos = 0;
        while (cola.length && navigator.onLine) {
          const x = cola[0];
          let r;
          try {
            r = x.op === 'set'
              ? await sb.from('documentos').upsert({ coleccion: x.c, id: x.id, datos: x.datos }, { onConflict: 'usuario,coleccion,id' })
              : await sb.from('documentos').delete().eq('coleccion', x.c).eq('id', x.id);
          } catch (e) { r = { error: e }; }
          if (r.error) {
            if (esDeSesion(r.error)) { try { await sb.auth.refreshSession(); } catch (e) {} break; }
            if (esDeRed(r.error)) break;
            // error permanente: no bloquear la cola por un solo cambio
            console.error('Cambio descartado', x, r.error);
            if (!avisoError++) aviso('Un cambio hecho sin conexión no se pudo guardar en la nube. Revisa que tus datos estén bien.');
          } else subidos++;
          // quitar solo si sigue siendo el mismo cambio (pudo reemplazarse mientras subía)
          if (cola[0] === x) cola.shift(); else cola = cola.filter(y => y !== x);
          guardarCola();
        }
        if (subidos && !cola.length) {
          aviso(subidos === 1 ? 'Se subió el cambio que hiciste sin conexión.' : `Se subieron los ${subidos} cambios que hiciste sin conexión.`, true);
          if (window.CP_reintentarCal) setTimeout(() => { try { window.CP_reintentarCal(); } catch (e) {} }, 800);
        }
      })().finally(() => { subiendo = null; pintarEstado(); });
      return subiendo;
    }
    setInterval(() => { if (cola.length) subir(); }, 30000);

    /* --- carga y tiempo real --- */
    async function cargar(c) {
      const filas = [];
      for (let desde = 0; ; desde += 1000) {
        const { data, error } = await sb.from('documentos').select('id,datos').eq('coleccion', c).range(desde, desde + 999);
        if (error) throw err(error, esDeRed(error) ? 'network' : 'unavailable');
        filas.push(...data);
        if (data.length < 1000) break;
      }
      maps[c] = new Map(filas.map(f => [f.id, f.datos]));
      aplicarCola(c);
      avisar(c, false);
    }

    function asegurarCanal() {
      if (canal) return;
      canal = sb.channel('documentos-' + uid)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'documentos' }, p => {
          const fila = p.eventType === 'DELETE' ? p.old : p.new;
          if (!fila || !fila.coleccion || !maps[fila.coleccion]) return;
          if (pendiente(fila.coleccion, fila.id)) return; // gana lo que está por subir
          if (p.eventType === 'DELETE') maps[fila.coleccion].delete(fila.id);
          else maps[fila.coleccion].set(fila.id, fila.datos);
          avisar(fila.coleccion, false);
        })
        .subscribe(estado => {
          if (estado === 'SUBSCRIBED') subir().then(() => recargarTodo());
        });
    }

    let recargando = null;
    function recargarTodo() {
      if (recargando) return recargando;
      recargando = Promise.all(Object.keys(oyentes).map(c => cargar(c).catch(() => {}))).finally(() => { recargando = null; });
      return recargando;
    }
    const alVolver = () => { pintarEstado(); subir().then(() => recargarTodo()); };

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) { ocultoDesde = Date.now(); return; }
      if (cola.length || (ocultoDesde && Date.now() - ocultoDesde > 20000)) alVolver();
    });
    window.addEventListener('online', alVolver);
    window.addEventListener('offline', () => pintarEstado());

    function escuchar(c, fn, onErr) {
      if (!COLS.includes(c)) throw err(null, 'invalid_argument');
      (oyentes[c] = oyentes[c] || []).push(fn);
      if (!maps[c]) {
        let enCache = false;
        try {
          const g = JSON.parse(localStorage.getItem(kCache(c)) || 'null');
          if (Array.isArray(g)) { maps[c] = new Map(g); aplicarCola(c); enCache = true; setTimeout(() => fn(true), 0); }
        } catch (e) {}
        cargar(c).catch(e => {
          // Sin conexión pero con datos guardados: se trabaja con lo guardado y se reintenta al volver la señal
          if (enCache && e.code === 'network') { (oyentes[c] || []).forEach(f => { try { f(false); } catch (x) {} }); pintarEstado(); return; }
          if (!enCache && e.code === 'network') { maps[c] = maps[c] || new Map(); aplicarCola(c); }
          onErr && onErr(e);
        });
      } else setTimeout(() => fn(false), 0);
      asegurarCanal();
      return () => { oyentes[c] = (oyentes[c] || []).filter(x => x !== fn); };
    }

    async function escribir(c, id, datos) {
      if (!COLS.includes(c)) throw err(null, 'invalid_argument');
      if (!maps[c]) maps[c] = new Map();
      maps[c].set(id, datos);
      guardarCache(c);
      if (!navigator.onLine || cola.length) { encolar('set', c, id, datos); subir(); return; }
      let r;
      try { r = await sb.from('documentos').upsert({ coleccion: c, id, datos }, { onConflict: 'usuario,coleccion,id' }); } catch (e) { r = { error: e }; }
      if (r.error) {
        if (esDeRed(r.error) || esDeSesion(r.error)) { encolar('set', c, id, datos); if (esDeSesion(r.error)) sb.auth.refreshSession().then(() => subir()).catch(() => {}); return; }
        if (/quota|disk|space/i.test(r.error.message)) throw err(r.error, 'quota_exceeded');
        if (r.error.code === '42501' || /permission|row-level/i.test(r.error.message)) throw err(r.error, 'invalid_argument');
        throw err(r.error);
      }
    }

    async function borrarDoc(c, id) {
      if (maps[c]) { maps[c].delete(id); guardarCache(c); }
      if (!navigator.onLine || cola.length) { encolar('del', c, id); subir(); return; }
      let r;
      try { r = await sb.from('documentos').delete().eq('coleccion', c).eq('id', id); } catch (e) { r = { error: e }; }
      if (r.error) {
        if (esDeRed(r.error) || esDeSesion(r.error)) { encolar('del', c, id); return; }
        throw err(r.error);
      }
    }

    async function leer(c, id) {
      const p = pendiente(c, id);
      if (p) return p.op === 'del' ? undefined : p.datos;
      if (maps[c] && maps[c].has(id)) return maps[c].get(id);
      const { data, error } = await sb.from('documentos').select('datos').eq('coleccion', c).eq('id', id).maybeSingle();
      if (error) { if (esDeRed(error)) return undefined; throw err(error); }
      return data ? data.datos : undefined;
    }

    /* --- indicador "Sin conexión · N cambios por subir" --- */
    let pill = null;
    function pintarEstado(subiendoAhora) {
      const n = cola.length, off = !navigator.onLine;
      const sy = document.getElementById('sync');
      if (sy && sy.textContent !== 'Conectando…') {
        const r = window.CP_estadoRed();
        sy.className = 'sync' + (r ? ' ' + r.cls : '');
        sy.innerHTML = '<i></i>' + (r ? esc(r.txt) : 'Sincronizado');
      }
      if (!off && !n) { if (pill) { pill.remove(); pill = null; } return; }
      if (!pill) { pill = document.createElement('div'); pill.className = 'cpcola'; pill.setAttribute('role', 'status'); pill.setAttribute('aria-live', 'polite'); document.body.appendChild(pill); }
      const cambios = n ? `${n} ${n === 1 ? 'cambio por subir' : 'cambios por subir'}` : '';
      pill.classList.toggle('off', off);
      pill.innerHTML = `<i aria-hidden="true"></i><span>${off ? 'Sin conexión' + (cambios ? ' · ' + cambios : ' · mostrando lo último guardado') : (subiendoAhora || subiendo ? 'Subiendo ' + cambios.replace(' por subir', '') + '…' : cambios)}</span>`;
    }
    CP.cola = { pendientes: () => cola.length, subir };
    window.CP_estadoRed = () => {
      const n = cola.length;
      if (!navigator.onLine) return { cls: 'off', txt: 'Sin conexión' + (n ? ` · ${n} por subir` : '') };
      if (n) return { cls: 'pend', txt: `Subiendo ${n} ${n === 1 ? 'cambio' : 'cambios'}…` };
      return null;
    };
    setTimeout(() => { pintarEstado(); subir(); }, 0);

    const refDoc = (c, id) => ({
      set: o => escribir(c, id, JSON.parse(JSON.stringify(o))),
      delete: () => borrarDoc(c, id),
      get: async () => { const d = await leer(c, id); return { exists: d !== undefined, id, data: () => d }; },
      onSnapshot: (fn, onErr) => escuchar(c, fromCache => {
        const d = maps[c] && maps[c].get(id);
        fn({ exists: d !== undefined, id, data: () => d, metadata: { fromCache } });
      }, onErr)
    });

    return {
      collection: c => ({
        doc: id => refDoc(c, id),
        onSnapshot: (fn, onErr) => escuchar(c, fromCache => {
          const docs = [...(maps[c] || new Map())].map(([id, d]) => ({ id, data: () => d }));
          fn({ docs, metadata: { fromCache } });
        }, onErr)
      }),
      doc: ruta => { const [c, id] = String(ruta).split('/'); return refDoc(c, id); }
    };
  }

  /* ---------- descargas ---------- */
  const descargas = {
    async save({ filename, data }) {
      const blob = data instanceof Blob ? data : new Blob([data]);
      const archivo = new File([blob], filename, { type: blob.type || 'application/octet-stream' });
      const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      if (iOS && navigator.canShare && navigator.canShare({ files: [archivo] })) {
        try { await navigator.share({ files: [archivo], title: filename }); return; }
        catch (e) { if (e && e.name === 'AbortError') throw Object.assign(new Error('cancelado'), { code: 'declined' }); }
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 30000);
    }
  };

  /* ---------- Google Calendar (por la función "calendario" de Supabase) ---------- */
  async function fnCal(body) {
    const { data, error } = await sb.functions.invoke('calendario', { body });
    if (error) {
      let d = null;
      try { d = await error.context.json(); } catch (e) {}
      if (d && d.error) throw Object.assign(new Error(d.error.message), { code: d.error.code });
      throw Object.assign(new Error('Sin conexión con el calendario.'), { code: 'network' });
    }
    if (data && data.error) throw Object.assign(new Error(data.error.message), { code: data.error.code });
    return data || {};
  }
  const zona = (() => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Lima'; } catch (e) { return 'America/Lima'; } })();
  const calendario = {
    callTool: async (_servidor, tool, input) => {
      const d = await fnCal({ accion: 'llamar', tool, input: Object.assign({}, input, { zona }) });
      return { payload: d.payload };
    }
  };
  let estadoCal = null;
  const leerEstadoCal = async () => { await sesionLista; try { estadoCal = await fnCal({ accion: 'estado' }); } catch (e) { estadoCal = { error: e.message || 'error' }; } return estadoCal; };
  CP.cal = {
    estado: leerEstadoCal,
    conectar: async () => { const d = await fnCal({ accion: 'iniciar' }); location.href = d.url; },
    desconectar: async () => { await fnCal({ accion: 'desconectar' }); location.reload(); }
  };

  function aviso(txt, ok) {
    const el = document.createElement('div');
    el.className = 'cpaviso' + (ok ? ' ok' : '');
    el.setAttribute('role', 'status');
    el.innerHTML = `<span>${esc(txt)}</span><button type="button" aria-label="Cerrar">×</button>`;
    el.querySelector('button').addEventListener('click', () => el.remove());
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 12000);
  }

  // Vuelta desde Google después de dar permiso (?code=…&state=…)
  (async () => {
    const q = new URLSearchParams(location.search);
    if (!q.has('state') || !(q.has('code') || q.has('error'))) return;
    history.replaceState(null, '', location.pathname);
    if (q.get('error')) { aviso(q.get('error') === 'access_denied' ? 'No se conectó Google Calendar: cancelaste el permiso.' : 'Google no completó la conexión. Inténtalo otra vez desde Ajustes.'); return; }
    try {
      const d = await fnCal({ accion: 'terminar', code: q.get('code'), estado: q.get('state') });
      aviso('Google Calendar conectado' + (d.correo ? ' (' + d.correo + ')' : '') + '. Si estabas en la app del iPhone, ya puedes volver a ella.', true);
    } catch (e) { aviso(e.message || 'No se pudo conectar Google Calendar.'); }
  })();

  // Cuadro de Google Calendar en Ajustes
  async function pintarCaja(el) {
    el.dataset.ok = '1';
    el.innerHTML = '<span>Google Calendar: revisando…</span>';
    const e = estadoCal && !estadoCal.error ? estadoCal : await leerEstadoCal();
    if (!el.isConnected) return;
    if (e.error) { el.innerHTML = `<span>Google Calendar: no se pudo revisar la conexión.</span><button type="button" class="btn sm" data-cal="re">Reintentar</button>`; }
    else if (!e.configurado) { el.innerHTML = '<span>Google Calendar: falta terminar la configuración en Google Cloud y Supabase.</span>'; }
    else if (e.conectado) { el.innerHTML = `<span>Google Calendar conectado${e.correo ? ' como <b>' + esc(e.correo) + '</b>' : ''}</span><button type="button" class="btn sm" data-cal="des">Desconectar</button>`; }
    else { el.innerHTML = `<span>Google Calendar no está conectado. Los rodajes y entregas no se guardan en tu calendario.</span><button type="button" class="btn sm pri" data-cal="con">Conectar Google Calendar</button>`; }
    el.onclick = async ev => {
      const b = ev.target.closest('[data-cal]'); if (!b) return;
      b.disabled = true;
      try {
        if (b.dataset.cal === 'con') await CP.cal.conectar();
        else if (b.dataset.cal === 'des') {
          if (b.dataset.seguro) await CP.cal.desconectar();
          else { b.dataset.seguro = '1'; b.disabled = false; b.textContent = 'Toca otra vez para desconectar'; setTimeout(() => { if (b.isConnected) { delete b.dataset.seguro; b.textContent = 'Desconectar'; } }, 5000); }
        }
        else { estadoCal = null; pintarCaja(el); }
      } catch (err) { b.disabled = false; aviso(err.message || 'No se pudo completar.'); }
    };
  }
  // Al volver a la ventana (por ejemplo, después de conectar en el navegador), revisar otra vez
  window.addEventListener('focus', () => {
    const el = document.getElementById('gcalbox');
    if (el && estadoCal && !estadoCal.conectado) { estadoCal = null; pintarCaja(el); }
  });
  new MutationObserver(() => {
    const el = document.getElementById('gcalbox');
    if (el && !el.dataset.ok) pintarCaja(el);
  }).observe(document.documentElement, { childList: true, subtree: true });

  /* ---------- copias de seguridad ---------- */
  const fFecha = iso => { try { return new Date(iso).toLocaleString('es-PE', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' }); } catch (e) { return iso; } };
  const hace = iso => { const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000); return d <= 0 ? 'hoy' : d === 1 ? 'ayer' : 'hace ' + d + ' días'; };
  const MOTIVO = { diaria: 'automática', manual: 'hecha a mano', 'antes de restaurar': 'antes de restaurar' };

  async function leerTodo() {
    const filas = [];
    for (let desde = 0; ; desde += 1000) {
      const { data, error } = await sb.from('documentos').select('coleccion,id,datos').range(desde, desde + 999);
      if (error) throw error;
      filas.push(...data);
      if (data.length < 1000) break;
    }
    return filas;
  }

  async function descargarCopia() {
    const filas = await leerTodo();
    const de = c => filas.filter(f => f.coleccion === c).map(f => Object.assign({}, f.datos, { id: f.id }));
    const aj = (filas.find(f => f.coleccion === 'ajustes' && f.id === 'general') || {}).datos || {};
    const hoyISO = new Date().toISOString().slice(0, 10);
    const copia = {
      app: 'cuentas-produccion', fecha: hoyISO, version: 2,
      clientes: de('clientes'), artistas: de('artistas'), gastosGen: de('gastosGen'), trabajos: de('trabajos'), aj,
      comprobantes: de('comprobantes')
    };
    const blob = new Blob([JSON.stringify(copia)], { type: 'application/json' });
    await descargas.save({ filename: `Cuentas-copia-${hoyISO}.json`, data: blob });
    await sb.from('documentos').upsert({ coleccion: 'ajustes', id: 'respaldo', datos: { ultDescarga: new Date().toISOString() } }, { onConflict: 'usuario,coleccion,id' });
    return copia;
  }
  CP.respaldo = { descargar: descargarCopia };

  async function pintarRespaldo(el, abierto) {
    el.dataset.ok = '1';
    el.innerHTML = '<span>Copias de seguridad: revisando…</span>';
    const [{ data: lista, error }, { data: rd }] = await Promise.all([
      sb.from('respaldos').select('id,creado,motivo,documentos').order('creado', { ascending: false }).limit(40),
      sb.from('documentos').select('datos').eq('coleccion', 'ajustes').eq('id', 'respaldo').maybeSingle()
    ]);
    if (!el.isConnected) return;
    if (error) { el.innerHTML = '<span>Copias de seguridad: no se pudo revisar. Revisa tu conexión.</span>'; return; }
    const ult = lista[0], desc = rd && rd.datos && rd.datos.ultDescarga;
    el.innerHTML = `<div class="rsp">
      <span><b>Copias automáticas</b> · cada madrugada, se guardan 30 días (sin fotos de comprobantes).<br>${ult ? `Última: ${esc(fFecha(ult.creado))} · ${lista.length} ${lista.length === 1 ? 'copia guardada' : 'copias guardadas'}` : 'La primera copia se hará esta madrugada.'}</span>
      <span>Descarga a tu equipo (con fotos): ${desc ? esc(hace(desc)) : 'todavía ninguna'}. Guárdala en iCloud Drive una vez al mes.</span>
      <div class="rspb"><button type="button" class="btn sm pri" data-r="desc">Descargar copia completa</button><button type="button" class="btn sm" data-r="ahora">Hacer copia ahora</button><button type="button" class="btn sm" data-r="ver">${abierto ? 'Ocultar copias' : 'Ver y restaurar'}</button></div>
      ${abierto ? `<ul class="rspl">${lista.map(r => `<li><span>${esc(fFecha(r.creado))}<small>${esc(MOTIVO[r.motivo] || r.motivo)} · ${r.documentos} registros</small></span><button type="button" class="btn sm" data-r="rest" data-id="${r.id}">Restaurar</button></li>`).join('') || '<li><span>Aún no hay copias.</span></li>'}</ul><p class="rsph">Restaurar deja tus cuentas como estaban ese día. Antes se guarda una copia de cómo están ahora, por si te arrepientes.</p>` : ''}
    </div>`;
    el.onclick = async ev => {
      const b = ev.target.closest('[data-r]'); if (!b) return;
      const r = b.dataset.r;
      if (r === 'ver') { pintarRespaldo(el, !abierto); return; }
      if (r === 'rest' && !b.dataset.seguro) {
        b.dataset.seguro = '1'; b.textContent = 'Toca otra vez para restaurar';
        setTimeout(() => { if (b.isConnected) { delete b.dataset.seguro; b.textContent = 'Restaurar'; } }, 5000);
        return;
      }
      b.disabled = true;
      try {
        if (r === 'desc') { await descargarCopia(); aviso('Copia descargada. Guárdala en iCloud Drive o en otra carpeta segura.', true); pintarRespaldo(el, abierto); }
        else if (r === 'ahora') { const { error: e } = await sb.rpc('respaldar_ahora'); if (e) throw e; aviso('Copia guardada.', true); pintarRespaldo(el, abierto); }
        else if (r === 'rest') {
          const { data: n, error: e } = await sb.rpc('restaurar_respaldo', { p_id: Number(b.dataset.id) });
          if (e) throw e;
          aviso(`Listo: se restauraron ${n} registros. Recargando…`, true);
          Object.keys(localStorage).filter(k => k.startsWith('cp-cache:')).forEach(k => localStorage.removeItem(k));
          setTimeout(() => location.reload(), 1200);
        }
      } catch (err) { b.disabled = false; aviso('No se pudo completar. Revisa tu conexión e inténtalo otra vez.'); }
    };
  }
  new MutationObserver(() => {
    const el = document.getElementById('respbox');
    if (el && !el.dataset.ok) pintarRespaldo(el, false);
  }).observe(document.documentElement, { childList: true, subtree: true });

  // Recordatorio mensual de descargar una copia
  sesionLista.then(async () => {
    try {
      const k = 'cp-rec-copia';
      if (localStorage.getItem(k) === new Date().toISOString().slice(0, 10)) return;
      const { data } = await sb.from('documentos').select('datos').eq('coleccion', 'ajustes').eq('id', 'respaldo').maybeSingle();
      const ult = data && data.datos && data.datos.ultDescarga;
      if (ult && Date.now() - new Date(ult).getTime() < 30 * 86400000) return;
      localStorage.setItem(k, new Date().toISOString().slice(0, 10));
      setTimeout(() => {
        const el = document.createElement('div');
        el.className = 'cpaviso ok';
        el.setAttribute('role', 'status');
        el.innerHTML = `<span>${ult ? 'Hace más de un mes que no descargas una copia de tus cuentas.' : 'Descarga tu primera copia de seguridad y guárdala en iCloud Drive.'}</span><button type="button" class="cpav-b">Descargar</button><button type="button" aria-label="Cerrar">×</button>`;
        el.querySelector('.cpav-b').addEventListener('click', async () => { el.remove(); try { await descargarCopia(); aviso('Copia descargada. Guárdala en iCloud Drive.', true); } catch (e) { aviso('No se pudo descargar la copia.'); } });
        el.querySelector('[aria-label=Cerrar]').addEventListener('click', () => el.remove());
        document.body.appendChild(el);
      }, 2500);
    } catch (e) {}
  });

  /* ---------- avisos al iPhone (Web Push) ---------- */
  const VAPID = 'BPwZdqXtDADGmPCq5hE6cvNNbvGTm1hLRQ8jm8nE7qB02v41FEZyhEJj1sgApzPznT3ghgvMKt-lTj6wI8mP1rs';
  const deB64 = t => { const r = atob((t + '='.repeat((4 - t.length % 4) % 4)).replace(/-/g, '+').replace(/_/g, '/')); return Uint8Array.from(r, c => c.charCodeAt(0)); };
  const esIOS = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const instalada = () => navigator.standalone === true || (window.matchMedia && matchMedia('(display-mode: standalone)').matches);
  const hayPush = () => 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window && (location.protocol === 'https:' || location.hostname === 'localhost');
  const nombreEquipo = () => esIOS ? 'iPhone' : /Mac/.test(navigator.platform) ? 'Mac' : (navigator.platform || 'Equipo');
  async function subActual() { const reg = await navigator.serviceWorker.ready; return reg.pushManager.getSubscription(); }
  CP.push = {
    async activar() {
      const permiso = await Notification.requestPermission();
      if (permiso !== 'granted') throw Object.assign(new Error('permiso'), { code: 'denegado' });
      const reg = await navigator.serviceWorker.ready;
      const sub = (await reg.pushManager.getSubscription()) || (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: deB64(VAPID) }));
      const j = sub.toJSON();
      const { error } = await sb.from('push_subs').upsert({ endpoint: j.endpoint, p256dh: j.keys.p256dh, auth: j.keys.auth, dispositivo: nombreEquipo() }, { onConflict: 'endpoint' });
      if (error) throw error;
      if (window.CP_avisosActivos) window.CP_avisosActivos(true);
    },
    async desactivar() {
      const sub = await subActual();
      if (sub) { await sb.from('push_subs').delete().eq('endpoint', sub.endpoint); await sub.unsubscribe().catch(() => {}); }
      const { count } = await sb.from('push_subs').select('endpoint', { count: 'exact', head: true });
      if (!count && window.CP_avisosActivos) window.CP_avisosActivos(false);
    },
    async probar() {
      const { data, error } = await sb.functions.invoke('avisos', { body: { accion: 'probar' } });
      if (error || !data || data.error) throw new Error((data && data.error) || 'error');
      return data;
    }
  };
  async function pintarAvisos(el) {
    el.dataset.ok = '1';
    const caja = (txt, botones) => { el.innerHTML = `<div class="psh"><span>${txt}</span>${botones ? `<div class="rspb">${botones}</div>` : ''}</div>`; };
    if (!hayPush()) {
      if (esIOS && !instalada()) caja('Para recibir avisos en el iPhone, abre la app desde su ícono en la pantalla de inicio (no desde Safari) y actívalos ahí. Necesita iOS 16.4 o más nuevo.');
      else caja('Este equipo no puede mostrar avisos (la app de la Mac no los admite). Actívalos en tu iPhone: te llegan ahí.');
      return;
    }
    let sub = null;
    try { sub = await subActual(); } catch (e) {}
    let registrada = false;
    if (sub) { const { data } = await sb.from('push_subs').select('endpoint').eq('endpoint', sub.endpoint).maybeSingle(); registrada = !!data; }
    if (!el.isConnected) return;
    if (Notification.permission === 'denied') caja('Los avisos están bloqueados para esta app. Actívalos en Ajustes del iPhone → Notificaciones → Cuentas, y vuelve aquí.');
    else if (sub && registrada) caja('<b>Avisos activados en este equipo</b> · llegan cada día a las 8 a.m.', '<button type="button" class="btn sm" data-p="probar">Enviar aviso de prueba</button><button type="button" class="btn sm" data-p="off">Desactivar en este equipo</button>');
    else caja('Recibe un aviso a las 8 a.m. cuando toca cobrar, cuando se vence un pago y el día antes de cada entrega y rodaje.', '<button type="button" class="btn sm pri" data-p="on">Activar avisos en este equipo</button>');
    el.onclick = async ev => {
      const b = ev.target.closest('[data-p]'); if (!b) return;
      b.disabled = true;
      try {
        if (b.dataset.p === 'on') { await CP.push.activar(); await CP.push.probar().catch(() => {}); aviso('Listo: avisos activados. Te mandé uno de prueba.', true); }
        else if (b.dataset.p === 'off') { await CP.push.desactivar(); aviso('Avisos desactivados en este equipo.', true); }
        else { const r = await CP.push.probar(); aviso(r.enviados ? 'Aviso de prueba enviado: debería llegar en unos segundos.' : 'No hay equipos con avisos activados.', !!r.enviados); }
        pintarAvisos(el);
      } catch (err) {
        b.disabled = false;
        aviso(err && err.code === 'denegado' ? 'No diste permiso para los avisos. Puedes activarlo en Ajustes del iPhone → Notificaciones → Cuentas.' : 'No se pudo completar. Revisa tu conexión e inténtalo otra vez.');
      }
    };
  }
  new MutationObserver(() => {
    const el = document.getElementById('pushbox');
    if (el && !el.dataset.ok) pintarAvisos(el);
  }).observe(document.documentElement, { childList: true, subtree: true });
  // Al tocar un aviso con la app abierta, el service worker pide ir al trabajo
  if ('serviceWorker' in navigator) navigator.serviceWorker.addEventListener('message', e => {
    const d = e.data || {};
    if (d.tipo === 'abrir' && typeof d.url === 'string') { const i = d.url.indexOf('#'); if (i >= 0) location.hash = d.url.slice(i); }
  });

  /* ---------- Atajos del iPhone y Siri ---------- */
  const URL_ATAJO = CFG.url + '/functions/v1/atajo';
  const huellaDe = async t => [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(t)))].map(x => x.toString(16).padStart(2, '0')).join('');
  const nuevaClave = () => 'cp_' + btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32)))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const copiarTxt = async (t, ok) => { try { await navigator.clipboard.writeText(t); aviso(ok, true); } catch (e) { aviso('No se pudo copiar. Mantén presionado el texto para copiarlo.'); } };
  const PASOS = `<ol class="atp">
    <li><b>Atajo “Gasto”</b> (dile a Siri “Gasto”). En la app Atajos toca <b>+</b> y agrega estas acciones:
      <ul><li><b>Solicitar entrada</b> · tipo Número · “¿Cuánto?”</li>
      <li><b>Solicitar entrada</b> · tipo Texto · “¿En qué?”</li>
      <li><b>Obtener contenido de URL</b> · URL <code>${URL_ATAJO}</code> · Método <b>POST</b> · Encabezados: <code>x-clave</code> = tu clave · Cuerpo <b>JSON</b>: <code>accion</code> = gasto, <code>monto</code> = Entrada 1, <code>detalle</code> = Entrada 2</li>
      <li><b>Mostrar resultado</b> (Siri lo lee en voz alta)</li></ul>
      Va al trabajo que tiene rodaje hoy; si no hay, queda como gasto general. La categoría se elige sola (taxi → Transporte, almuerzo → Viáticos…).</li>
    <li><b>Atajo “Pago”</b>:
      <ul><li><b>Obtener contenido de URL</b> igual que arriba, con el cuerpo <code>accion</code> = pendientes</li>
      <li><b>Dividir texto</b> por saltos de línea → <b>Elegir de la lista</b></li>
      <li><b>Solicitar entrada</b> · Número · “¿Cuánto pagaron?”</li>
      <li><b>Obtener contenido de URL</b> con <code>accion</code> = pago, <code>trabajo</code> = Elemento elegido, <code>monto</code> = Entrada (y si quieres <code>metodo</code> = Yape)</li>
      <li><b>Mostrar resultado</b></li></ul></li>
    <li><b>Atajo “Cuánto me deben”</b>: <b>Obtener contenido de URL</b> con <code>accion</code> = resumen → <b>Mostrar resultado</b>.</li>
  </ol><p class="rsph">Cuida tu clave como una contraseña: con ella se pueden anotar gastos y pagos en tus cuentas. Si la pierdes o cambias de iPhone, bórrala aquí y crea otra.</p>`;
  async function pintarAtajos(el, recien, pasos) {
    el.dataset.ok = '1';
    const { data: claves, error } = await sb.from('atajo_claves').select('huella,nombre,creado,usado').order('creado', { ascending: false });
    if (!el.isConnected) return;
    if (error) { el.innerHTML = '<span>Atajos y Siri: no se pudo revisar. Revisa tu conexión.</span>'; return; }
    el.innerHTML = `<div class="psh">
      <span>Anota gastos y pagos con Siri o desde Atajos del iPhone, sin abrir la app.</span>
      ${recien ? `<div class="atk"><span>Tu clave (solo se muestra esta vez):</span><input readonly value="${esc(recien)}" aria-label="Clave para Atajos"><div class="rspb"><button type="button" class="btn sm pri" data-k="copiar">Copiar clave</button><button type="button" class="btn sm" data-k="url">Copiar dirección</button></div></div>` : ''}
      ${claves.length ? `<ul class="rspl">${claves.map(c => `<li><span>Clave de ${esc(c.nombre)}<small>Creada ${esc(fFecha(c.creado))} · ${c.usado ? 'usada ' + esc(hace(c.usado)) : 'aún sin usar'}</small></span><button type="button" class="btn sm" data-k="borrar" data-h="${esc(c.huella)}">Borrar</button></li>`).join('')}</ul>` : ''}
      <div class="rspb">${claves.length < 5 ? `<button type="button" class="btn sm${claves.length ? '' : ' pri'}" data-k="crear">${claves.length ? 'Crear otra clave' : 'Crear clave para Atajos'}</button>` : ''}<button type="button" class="btn sm" data-k="pasos">${pasos ? 'Ocultar instrucciones' : 'Cómo armar los atajos'}</button></div>
      ${pasos ? PASOS : ''}</div>`;
    el.onclick = async ev => {
      const b = ev.target.closest('[data-k]'); if (!b) return;
      const k = b.dataset.k;
      if (k === 'pasos') return pintarAtajos(el, recien, !pasos);
      if (k === 'copiar') return copiarTxt(recien, 'Clave copiada. Pégala en el encabezado x-clave del atajo.');
      if (k === 'url') return copiarTxt(URL_ATAJO, 'Dirección copiada.');
      if (k === 'borrar' && !b.dataset.seguro) {
        b.dataset.seguro = '1'; b.textContent = 'Toca otra vez para borrar';
        setTimeout(() => { if (b.isConnected) { delete b.dataset.seguro; b.textContent = 'Borrar'; } }, 5000);
        return;
      }
      b.disabled = true;
      try {
        if (k === 'crear') {
          const c = nuevaClave();
          const { error: e } = await sb.from('atajo_claves').insert({ huella: await huellaDe(c), nombre: esIOS ? 'iPhone' : 'Atajos' });
          if (e) throw e;
          return pintarAtajos(el, c, true);
        }
        if (k === 'borrar') { const { error: e } = await sb.from('atajo_claves').delete().eq('huella', b.dataset.h); if (e) throw e; aviso('Clave borrada: los atajos que la usaban dejan de funcionar.', true); return pintarAtajos(el, '', pasos); }
      } catch (err) { b.disabled = false; aviso('No se pudo completar. Revisa tu conexión e inténtalo otra vez.'); }
    };
  }
  new MutationObserver(() => {
    const el = document.getElementById('atajobox');
    if (el && !el.dataset.ok) pintarAtajos(el, '', false);
  }).observe(document.documentElement, { childList: true, subtree: true });

  /* ---------- lo que pide la app ---------- */
  window.claude = {
    use: async nombre => {
      if (nombre === 'db') { const s = await sesionLista; return crearDB(s.user.id); }
      if (nombre === 'downloads') return descargas;
      if (nombre === 'mcp') {
        const e = await leerEstadoCal(), k = 'cp-cal-con:' + (CP.cuenta && CP.cuenta.id);
        if (e && !e.error) { try { localStorage.setItem(k, e.conectado ? '1' : '0'); } catch (x) {} return e.conectado ? calendario : null; }
        let antes = null; try { antes = localStorage.getItem(k); } catch (x) {}
        return antes === '1' ? calendario : null; // sin conexión: se recuerda que estaba conectado
      }
      return null;
    }
  };

  /* ---------- app instalable: trabajar sin conexión ---------- */
  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
  }
})();
