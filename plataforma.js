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
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false, storageKey: 'cp-auth' }
  });

  const CP = (window.CP = { sb, cuenta: null, version: '1' });

  /* ---------- inicio de sesión ---------- */
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const LOGO = '<svg width="64" height="64" viewBox="0 0 40 40" aria-hidden="true"><rect width="40" height="40" rx="10" fill="#36454F"/><path d="M26 13.5a9 9 0 1 0 0 13" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round"/><circle cx="28.5" cy="27" r="2.4" fill="#FE004E"/></svg>';

  function pantallaLogin() {
    return new Promise(resolve => {
      const el = document.createElement('div');
      el.id = 'login';
      el.setAttribute('role', 'dialog');
      el.setAttribute('aria-modal', 'true');
      el.setAttribute('aria-labelledby', 'lgt');
      document.body.appendChild(el);
      let correo = '';
      try { correo = localStorage.getItem('cp-correo') || ''; } catch (e) {}
      const pinta = (modo, msg) => {
        const nueva = modo === 'crear';
        el.innerHTML = `<form class="lgc" id="lgf" novalidate>${LOGO}<h1 id="lgt">${nueva ? 'Crea tu cuenta' : 'Cuentas'}</h1>
          <p>${nueva ? 'Solo la primera vez. Usa una contraseña de al menos 8 caracteres; el iPhone y la Mac te ofrecerán guardarla.' : 'Entra con tu correo y tu contraseña.'}</p>
          <label for="lge">Correo</label>
          <input id="lge" name="email" type="email" inputmode="email" autocomplete="username" autocapitalize="off" spellcheck="false" required value="${esc(correo)}">
          <label for="lgp">Contraseña</label>
          <input id="lgp" name="password" type="password" autocomplete="${nueva ? 'new-password' : 'current-password'}" minlength="8" required>
          ${nueva ? `<label for="lgp2">Repite la contraseña</label><input id="lgp2" type="password" autocomplete="new-password" minlength="8" required>` : ''}
          <button class="btn pri" type="submit">${nueva ? 'Crear cuenta y entrar' : 'Entrar'}</button>
          <p class="lgerr" role="alert">${esc(msg || '')}</p>
          <div class="lgacts lgc1"><button type="button" class="lnk" id="lgm">${nueva ? 'Ya tengo cuenta: entrar' : 'Primera vez: crear mi cuenta'}</button></div></form>`;
        const f = el.querySelector('#lgf'), ie = el.querySelector('#lge'), ip = el.querySelector('#lgp'), b = f.querySelector('button[type=submit]'), er = f.querySelector('.lgerr');
        setTimeout(() => (ie.value ? ip : ie).focus(), 50);
        el.querySelector('#lgm').addEventListener('click', () => { correo = ie.value.trim(); pinta(nueva ? 'entrar' : 'crear'); });
        f.addEventListener('submit', async e => {
          e.preventDefault();
          const v = ie.value.trim().toLowerCase(), pw = ip.value;
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) { er.textContent = 'Revisa el correo: parece incompleto.'; return; }
          if (pw.length < 8) { er.textContent = 'La contraseña debe tener al menos 8 caracteres.'; return; }
          if (nueva && pw !== el.querySelector('#lgp2').value) { er.textContent = 'Las dos contraseñas no coinciden.'; return; }
          const txt = b.textContent; b.disabled = true; b.textContent = nueva ? 'Creando…' : 'Entrando…'; er.textContent = '';
          correo = v; try { localStorage.setItem('cp-correo', v); } catch (e2) {}
          const r = nueva ? await sb.auth.signUp({ email: v, password: pw }) : await sb.auth.signInWithPassword({ email: v, password: pw });
          const m = (r.error && r.error.message) || '';
          if (r.error || !r.data.session) {
            b.disabled = false; b.textContent = txt;
            if (nueva && !r.error && !r.data.session) er.textContent = 'La cuenta se creó, pero Supabase pide confirmarla por correo. Desactiva “Confirm email” en Supabase (Authentication → Sign In / Providers → Email) y vuelve a entrar.';
            else if (/invalid login|invalid credentials/i.test(m)) er.textContent = 'El correo o la contraseña no son correctos.';
            else if (/not confirmed/i.test(m)) er.textContent = 'Tu correo aún no está confirmado. Desactiva “Confirm email” en Supabase y vuelve a intentarlo.';
            else if (/already registered|already exists/i.test(m)) er.textContent = 'Ese correo ya tiene cuenta. Toca “Ya tengo cuenta: entrar”.';
            else if (/signups? not allowed|disabled/i.test(m)) er.textContent = 'No se pueden crear cuentas nuevas en esta app.';
            else if (/weak|pwned|leaked/i.test(m)) er.textContent = 'Esa contraseña es muy fácil de adivinar o apareció en filtraciones. Usa otra.';
            else if (/rate|too many/i.test(m)) er.textContent = 'Demasiados intentos. Espera un minuto y vuelve a intentarlo.';
            else er.textContent = 'No se pudo entrar. Revisa tu conexión e inténtalo otra vez.';
            return;
          }
          el.remove();
          resolve(r.data.session);
        });
      };
      pinta(correo ? 'entrar' : 'crear');
    });
  }

  const sesionLista = (async () => {
    const { data } = await sb.auth.getSession();
    const s = data.session || (await pantallaLogin());
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

  /* ---------- base de datos (misma forma que la base de Claude) ---------- */
  function crearDB(uid) {
    const COLS = ['clientes', 'artistas', 'trabajos', 'gastosGen', 'comprobantes', 'ajustes'];
    const maps = {};      // coleccion -> Map(id -> datos)
    const oyentes = {};   // coleccion -> [fn(fromCache)]
    let canal = null, ocultoDesde = 0;
    const kCache = c => 'cp-cache:' + uid + ':' + c;
    const err = (e, code) => Object.assign(new Error((e && e.message) || code || 'error'), { code: code || 'network' });
    const guardarCache = c => { if (c === 'comprobantes') return; try { localStorage.setItem(kCache(c), JSON.stringify([...maps[c]])); } catch (e) {} };
    const avisar = (c, fromCache) => { (oyentes[c] || []).forEach(fn => { try { fn(!!fromCache); } catch (e) { console.error(e); } }); if (!fromCache) guardarCache(c); };

    async function cargar(c) {
      const filas = [];
      for (let desde = 0; ; desde += 1000) {
        const { data, error } = await sb.from('documentos').select('id,datos').eq('coleccion', c).range(desde, desde + 999);
        if (error) throw err(error);
        filas.push(...data);
        if (data.length < 1000) break;
      }
      maps[c] = new Map(filas.map(f => [f.id, f.datos]));
      avisar(c, false);
    }

    function asegurarCanal() {
      if (canal) return;
      canal = sb.channel('documentos-' + uid)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'documentos' }, p => {
          const fila = p.eventType === 'DELETE' ? p.old : p.new;
          if (!fila || !fila.coleccion || !maps[fila.coleccion]) return;
          if (p.eventType === 'DELETE') maps[fila.coleccion].delete(fila.id);
          else maps[fila.coleccion].set(fila.id, fila.datos);
          avisar(fila.coleccion, false);
        })
        .subscribe(estado => {
          if (estado === 'SUBSCRIBED') recargarTodo();
        });
    }

    let recargando = null;
    function recargarTodo() {
      if (recargando) return recargando;
      recargando = Promise.all(Object.keys(oyentes).map(c => cargar(c).catch(() => {}))).finally(() => { recargando = null; });
      return recargando;
    }

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) { ocultoDesde = Date.now(); return; }
      if (ocultoDesde && Date.now() - ocultoDesde > 20000) recargarTodo();
    });
    window.addEventListener('online', () => recargarTodo());

    function escuchar(c, fn, onErr) {
      if (!COLS.includes(c)) throw err(null, 'invalid_argument');
      (oyentes[c] = oyentes[c] || []).push(fn);
      if (!maps[c]) {
        try {
          const g = JSON.parse(localStorage.getItem(kCache(c)) || 'null');
          if (Array.isArray(g)) { maps[c] = new Map(g); setTimeout(() => fn(true), 0); }
        } catch (e) {}
        cargar(c).catch(e => onErr && onErr(e));
      } else setTimeout(() => fn(false), 0);
      asegurarCanal();
      return () => { oyentes[c] = (oyentes[c] || []).filter(x => x !== fn); };
    }

    async function escribir(c, id, datos) {
      if (!COLS.includes(c)) throw err(null, 'invalid_argument');
      if (maps[c]) maps[c].set(id, datos);
      const { error } = await sb.from('documentos').upsert({ coleccion: c, id, datos }, { onConflict: 'usuario,coleccion,id' });
      if (error) {
        if (/quota|disk|space/i.test(error.message)) throw err(error, 'quota_exceeded');
        if (error.code === '42501' || /permission|JWT|row-level/i.test(error.message)) throw err(error, 'invalid_argument');
        throw err(error);
      }
      if (maps[c]) guardarCache(c);
    }

    async function borrarDoc(c, id) {
      if (maps[c]) maps[c].delete(id);
      const { error } = await sb.from('documentos').delete().eq('coleccion', c).eq('id', id);
      if (error) throw err(error);
      if (maps[c]) guardarCache(c);
    }

    async function leer(c, id) {
      if (maps[c] && maps[c].has(id)) return maps[c].get(id);
      const { data, error } = await sb.from('documentos').select('datos').eq('coleccion', c).eq('id', id).maybeSingle();
      if (error) throw err(error);
      return data ? data.datos : undefined;
    }

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

  /* ---------- lo que pide la app ---------- */
  window.claude = {
    use: async nombre => {
      if (nombre === 'db') { const s = await sesionLista; return crearDB(s.user.id); }
      if (nombre === 'downloads') return descargas;
      if (nombre === 'mcp') return window.CP_CALENDARIO ? window.CP_CALENDARIO() : null;
      return null;
    }
  };

  /* ---------- app instalable: trabajar sin conexión ---------- */
  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
  }
})();
