/* Plataforma de "Cuentas de producción" fuera de Claude:
   - inicio de sesión con código al correo (Supabase Auth)
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
      const paso1 = msg => {
        el.innerHTML = `<form class="lgc" id="lg1" novalidate>${LOGO}<h1 id="lgt">Cuentas</h1>
          <p>Escribe tu correo y te enviamos un código para entrar.</p>
          <label for="lge">Correo</label>
          <input id="lge" type="email" inputmode="email" autocomplete="email" autocapitalize="off" spellcheck="false" required value="${esc(correo)}">
          <button class="btn pri" type="submit">Enviarme el código</button>
          <p class="lgerr" role="alert">${esc(msg || '')}</p></form>`;
        const f = el.querySelector('#lg1'), i = el.querySelector('#lge'), b = f.querySelector('button'), er = f.querySelector('.lgerr');
        setTimeout(() => i.focus(), 50);
        f.addEventListener('submit', async e => {
          e.preventDefault();
          const v = i.value.trim().toLowerCase();
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) { er.textContent = 'Revisa el correo: parece incompleto.'; return; }
          b.disabled = true; b.textContent = 'Enviando…'; er.textContent = '';
          const { error } = await sb.auth.signInWithOtp({ email: v, options: { shouldCreateUser: true } });
          if (error) {
            b.disabled = false; b.textContent = 'Enviarme el código';
            er.textContent = /rate|seconds|limit/i.test(error.message) ? 'Ya se envió un código hace poco. Espera un minuto y vuelve a intentarlo, o usa el último código que te llegó.' : /signups?.*(not allowed|disabled)/i.test(error.message) ? 'Este correo no tiene acceso a estas cuentas.' : 'No se pudo enviar el código. Revisa tu conexión e inténtalo otra vez.';
            if (!/rate|seconds|limit/i.test(error.message)) return;
          }
          correo = v; try { localStorage.setItem('cp-correo', v); } catch (e2) {}
          paso2();
        });
      };
      const paso2 = msg => {
        el.innerHTML = `<form class="lgc" id="lg2" novalidate>${LOGO}<h1 id="lgt">Revisa tu correo</h1>
          <p>Te enviamos un código de 6 dígitos a <b>${esc(correo)}</b>. Si no lo ves, busca en Spam o Promociones.</p>
          <label for="lgc">Código</label>
          <input id="lgc" class="lgcod" inputmode="numeric" autocomplete="one-time-code" maxlength="10" pattern="[0-9]*" required>
          <button class="btn pri" type="submit">Entrar</button>
          <p class="lgerr" role="alert">${esc(msg || '')}</p>
          <div class="lgacts"><button type="button" class="lnk" id="lgr">Reenviar código</button><button type="button" class="lnk" id="lgx">Usar otro correo</button></div></form>`;
        const f = el.querySelector('#lg2'), i = el.querySelector('#lgc'), b = f.querySelector('button[type=submit]'), er = f.querySelector('.lgerr');
        setTimeout(() => i.focus(), 50);
        const verificar = async () => {
          const tok = i.value.replace(/\D/g, '');
          if (tok.length < 6) { er.textContent = 'El código tiene 6 dígitos.'; return; }
          b.disabled = true; b.textContent = 'Entrando…'; er.textContent = '';
          const { data, error } = await sb.auth.verifyOtp({ email: correo, token: tok, type: 'email' });
          if (error || !data.session) {
            b.disabled = false; b.textContent = 'Entrar';
            er.textContent = /expired|invalid/i.test((error && error.message) || '') ? 'El código no es válido o ya venció. Pide uno nuevo con “Reenviar código”.' : 'No se pudo entrar. Revisa tu conexión e inténtalo otra vez.';
            return;
          }
          el.remove();
          resolve(data.session);
        };
        f.addEventListener('submit', e => { e.preventDefault(); verificar(); });
        i.addEventListener('input', () => { const t = i.value.replace(/\D/g, ''); if (t !== i.value) i.value = t; if (t.length === 6) verificar(); });
        el.querySelector('#lgx').addEventListener('click', () => paso1());
        el.querySelector('#lgr').addEventListener('click', async () => {
          er.textContent = 'Enviando…';
          const { error } = await sb.auth.signInWithOtp({ email: correo, options: { shouldCreateUser: true } });
          er.textContent = error ? (/rate|seconds|limit/i.test(error.message) ? 'Espera un minuto antes de pedir otro código.' : 'No se pudo reenviar. Revisa tu conexión.') : 'Listo, te enviamos un código nuevo.';
        });
      };
      paso1();
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
