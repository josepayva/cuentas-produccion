"""Pruebas de la app con un Supabase simulado (tests/supabase-simulado.js).
Uso: pip install playwright && playwright install chromium && python3 tests/probar.py [nombre_prueba ...]"""
import asyncio, json, os, sys, pathlib
from playwright.async_api import async_playwright

RAIZ = pathlib.Path(__file__).resolve().parent.parent
FAKE = (RAIZ / 'tests' / 'supabase-simulado.js').read_text()
URL = 'http://localhost:8765/index.html'
PRUEBAS = {}

def prueba(f):
    PRUEBAS[f.__name__] = f
    return f

async def servir(route):
    u = route.request.url.split('localhost:8765/')[1].split('?')[0].split('#')[0] or 'index.html'
    if u.startswith('vendor/supabase.js'):
        return await route.fulfill(body=FAKE, content_type='application/javascript')
    p = RAIZ / u
    if p.is_file():
        return await route.fulfill(path=str(p))
    await route.fulfill(status=404, body='')

async def nueva(p, entrar=True, **kw):
    hash_ = kw.pop('hash', '')
    b = await p.chromium.launch()
    ctx = await b.new_context(viewport=kw.pop('viewport', {'width': 390, 'height': 844}), device_scale_factor=2, color_scheme='dark', accept_downloads=True, **kw)
    await ctx.route('http://localhost:8765/**', servir)
    pg = await ctx.new_page()
    pg.errores = []
    pg.on('pageerror', lambda e: pg.errores.append(str(e) + ' @ ' + (e.stack or '')[:300]))
    await pg.goto(URL)
    await pg.evaluate("""localStorage.clear();localStorage.setItem('cp-rec-copia',new Date().toISOString().slice(0,10));
      localStorage.setItem('fake-sb',JSON.stringify({rows:[],session:null,users:{'a@b.com':'clave1234'}}))""")
    await pg.goto(URL + ('?t=1' + hash_ if hash_ else ''))
    await pg.wait_for_timeout(400)
    if not entrar:
        return b, ctx, pg
    await pg.fill('#lge', 'a@b.com'); await pg.fill('#lgp', 'clave1234')
    await pg.click('#lgf button[type=submit]'); await pg.wait_for_timeout(700)
    return b, ctx, pg

async def abrir_cot(pg):
    # Una cotización nueva ya abre su editor al guardarse; si no, se abre desde el trabajo
    if await pg.locator('#sheet [data-a=fCot]').count():
        await pg.click('#sheet [data-a=fCot]')

async def nuevo_trabajo(pg, titulo='Prueba', artista='Artista', monto='2000', fecha='2026-11-28', **extra):
    await pg.click('.fab'); await pg.click('#sheet [data-a=nuevoTipo]'); await pg.click('#sheet [data-tipo=__libre]')
    await pg.fill('#ft', titulo); await pg.fill('#far', artista); await pg.fill('#fo', monto); await pg.fill('#ff', fecha)
    for sel, v in extra.items():
        await pg.fill('#' + sel, v)
    await pg.click('#sheet form button[type=submit]'); await pg.wait_for_timeout(600)

def servidor(st, col):
    return [r['datos'] for r in st['rows'] if r['coleccion'] == col]

async def estado(pg):
    return await pg.evaluate("JSON.parse(localStorage.getItem('fake-sb'))")

def comprobar(cond, msg):
    print(('  ✓ ' if cond else '  ✗ ') + msg)
    if not cond:
        comprobar.fallos += 1
comprobar.fallos = 0

@prueba
async def fecha_de_pago(p):
    b, ctx, pg = await nueva(p)
    await nuevo_trabajo(pg, fr='500')
    await pg.click('#sheet [data-a=editarPago]'); await pg.wait_for_timeout(300)
    await pg.fill('#pf', '2026-11-10'); await pg.click('#sheet .k[data-k="ok"]'); await pg.wait_for_timeout(400)
    t = servidor(await estado(pg), 'trabajos')[0]
    comprobar(t['pagos'][0]['fecha'] == '2026-11-10', 'cambia la fecha del adelanto')
    comprobar(not pg.errores, 'sin errores de JavaScript')
    await b.close()

@prueba
async def sin_conexion(p):
    b, ctx, pg = await nueva(p)
    await nuevo_trabajo(pg, titulo='Rodaje Cusco')
    await ctx.set_offline(True); await pg.wait_for_timeout(200)
    await pg.click('#sheet [data-a=pago]'); await pg.wait_for_timeout(200)
    for k in ['C', '5', '0', '0', 'ok']:
        await pg.click(f'#sheet .k[data-k="{k}"]')
    await pg.wait_for_timeout(400)
    comprobar('por subir' in await pg.inner_text('#sync'), 'indica cambios por subir')
    await pg.reload(); await pg.wait_for_timeout(1000)
    comprobar('Rodaje Cusco' in await pg.inner_text('body'), 'abre sin conexión con los datos')
    await ctx.set_offline(False); await pg.evaluate("window.dispatchEvent(new Event('online'))"); await pg.wait_for_timeout(1500)
    t = servidor(await estado(pg), 'trabajos')[0]
    comprobar([x['monto'] for x in t.get('pagos', [])] == [500], 'al volver la señal se sube el pago')
    comprobar(not pg.errores, 'sin errores de JavaScript')
    await b.close()

@prueba
async def recuperar_clave(p):
    b, ctx, pg = await nueva(p, entrar=False)
    comprobar(await pg.locator('#lgm').inner_text() == '¿Olvidaste tu contraseña?', 'el inicio muestra "¿Olvidaste tu contraseña?"')
    await pg.click('#lgm'); await pg.fill('#lge', 'A@b.com'); await pg.click('#lgf button[type=submit]'); await pg.wait_for_timeout(300)
    r = await pg.evaluate('window.__reset')
    comprobar(r['email'] == 'a@b.com' and r['o']['redirectTo'].endswith('/index.html'), 'pide el correo con el enlace de vuelta a la app')
    comprobar('revisa tu correo' in await pg.inner_text('.lgerr'), 'avisa que revise el correo')
    await b.close()
    # abrir el enlace del correo
    b, ctx, pg = await nueva(p, entrar=False, hash='#access_token=rec-ok&refresh_token=r1&expires_in=3600&token_type=bearer&type=recovery')
    comprobar(await pg.inner_text('#lgt') == 'Nueva contraseña', 'el enlace abre "Nueva contraseña"')
    comprobar('access_token' not in pg.url, 'el token se quita de la dirección')
    await pg.fill('#lgp', 'nueva12345'); await pg.fill('#lgp2', 'otra12345'); await pg.click('#lgf button[type=submit]'); await pg.wait_for_timeout(200)
    comprobar('no coinciden' in await pg.inner_text('.lgerr'), 'detecta contraseñas distintas')
    await pg.fill('#lgp2', 'nueva12345'); await pg.click('#lgf button[type=submit]'); await pg.wait_for_timeout(900)
    comprobar(await pg.locator('#login').count() == 0, 'guarda la contraseña y entra a la app')
    st = await estado(pg)
    comprobar(st['users']['a@b.com'] == 'nueva12345', 'la contraseña nueva queda guardada')
    comprobar(not pg.errores, 'sin errores de JavaScript')
    await b.close()
    # enlace vencido
    b, ctx, pg = await nueva(p, entrar=False, hash='#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired')
    comprobar('venció' in await pg.inner_text('.lgerr') and await pg.inner_text('#lgt') == '¿Olvidaste tu contraseña?', 'enlace vencido: pide uno nuevo')
    await b.close()

@prueba
async def borrar_sin_senal(p):
    b, ctx, pg = await nueva(p)
    await pg.evaluate("localStorage.setItem('fake-cal','{\"con\":true}')")
    await pg.reload(); await pg.wait_for_timeout(900)
    await nuevo_trabajo(pg, titulo='Con evento')
    await pg.wait_for_timeout(800)
    t = servidor(await estado(pg), 'trabajos')[0]
    tiene = bool((t.get('cal') or {}).get('ev'))
    if not tiene:
        # marcar un evento a mano si la creación automática no aplica a este trabajo
        await pg.evaluate("""()=>{const s=JSON.parse(localStorage.getItem('fake-sb'));const r=s.rows.find(r=>r.coleccion==='trabajos');r.datos.cal={on:true,ev:'ev-123'};localStorage.setItem('fake-sb',JSON.stringify(s))}""")
        await pg.reload(); await pg.wait_for_timeout(900)
    ev = (servidor(await estado(pg), 'trabajos')[0].get('cal') or {}).get('ev')
    await ctx.set_offline(True); await pg.wait_for_timeout(200)
    await pg.evaluate("window.__fnLog=[]")
    if not await pg.locator('#sheet [data-a=borrarT]').count():
        await pg.locator('[data-a=verT]:visible').first.click(timeout=3000)
    await pg.wait_for_timeout(300)
    await pg.click('#sheet [data-a=borrarT]'); await pg.wait_for_timeout(200)
    if await pg.locator('#sheet [data-a=borrarT]').count():
        await pg.click('#sheet [data-a=borrarT]'); await pg.wait_for_timeout(300)
    pend = await pg.evaluate("JSON.parse(localStorage.getItem('cp-cal-borrar')||'[]')")
    comprobar(any(x['ev'] == ev for x in pend), 'sin señal: el evento queda pendiente de borrar')
    await ctx.set_offline(False); await pg.evaluate("window.dispatchEvent(new Event('online'))"); await pg.wait_for_timeout(2500)
    log = await pg.evaluate("window.__fnLog")
    borrados = [x for x in log if x.get('accion') == 'llamar' and x.get('tool') == 'delete_event']
    comprobar(any(x['input']['eventId'] == ev for x in borrados), 'al volver la señal se borra del calendario')
    comprobar(await pg.evaluate("localStorage.getItem('cp-cal-borrar')") is None, 'la lista de pendientes queda vacía')
    comprobar(not pg.errores, 'sin errores de JavaScript: ' + '; '.join(pg.errores))
    await b.close()

@prueba
async def buscador(p):
    b, ctx, pg = await nueva(p)
    await nuevo_trabajo(pg, titulo='Videoclip Ñañez', artista='Los Pávidos', monto='3500', fr='1200')
    await pg.click('#sheet [data-a=cerrar]'); await pg.wait_for_timeout(200)
    await pg.click('[data-a=buscar]'); await pg.wait_for_timeout(200)
    comprobar(await pg.evaluate("document.activeElement.id") == 'qg', 'abre el buscador con el cursor listo')
    await pg.fill('#qg', 'pavidos nanez'); await pg.wait_for_timeout(300)
    comprobar('Videoclip Ñañez' in await pg.inner_text('#qgr'), 'encuentra sin tildes ni mayúsculas')
    await pg.fill('#qg', 'pavidos'); await pg.wait_for_timeout(300)
    comprobar('ARTISTAS' in (await pg.inner_text('#qgr')).upper(), 'encuentra al artista')
    await pg.fill('#qg', '1200'); await pg.wait_for_timeout(300)
    comprobar('PAGOS' in (await pg.inner_text('#qgr')).upper(), 'encuentra el pago por monto')
    await pg.locator('#qgr [data-a=editarPago]').first.click(); await pg.wait_for_timeout(300)
    comprobar(await pg.locator('#sheet #pf').count() == 1, 'tocar el pago abre el pago para editarlo')
    await pg.keyboard.press('Escape'); await pg.wait_for_timeout(200)
    await pg.keyboard.press('Control+k'); await pg.wait_for_timeout(300)
    comprobar(await pg.locator('#sheet #qg').input_value() == '1200', 'Ctrl/⌘+K abre el buscador y recuerda la búsqueda')
    await pg.fill('#qg', 'zzzz'); await pg.wait_for_timeout(300)
    comprobar('No encontré' in await pg.inner_text('#qgr'), 'avisa cuando no hay resultados')
    await pg.fill('#qg', 'videoclip'); await pg.wait_for_timeout(300)
    await pg.screenshot(path='/tmp/buscador.png')
    comprobar(not pg.errores, 'sin errores de JavaScript: ' + '; '.join(pg.errores))
    await b.close()

PUSH_FALSO = """
window.PushManager = window.PushManager || function(){};
const subFalsa = {endpoint:'https://push.test/abc', toJSON(){return {endpoint:this.endpoint, keys:{p256dh:'pk', auth:'au'}}}, unsubscribe: async()=>{window.__subOn=false; return true}};
Object.defineProperty(Notification, 'permission', {get(){return window.__permiso||'default'}});
Notification.requestPermission = async()=>{window.__permiso='granted'; return 'granted'};
const listo = Promise.resolve({pushManager:{getSubscription: async()=>window.__subOn?subFalsa:null, subscribe: async()=>{window.__subOn=true; return subFalsa}}});
Object.defineProperty(navigator.serviceWorker, 'ready', {get(){return listo}});
"""

@prueba
async def avisos(p):
    b = await p.chromium.launch()
    ctx = await b.new_context(viewport={'width': 390, 'height': 844}, color_scheme='dark')
    await ctx.add_init_script(PUSH_FALSO)
    await ctx.route('http://localhost:8765/**', servir)
    pg = await ctx.new_page(); pg.errores = []; pg.on('pageerror', lambda e: pg.errores.append(str(e)))
    await pg.goto(URL)
    await pg.evaluate("""localStorage.clear();localStorage.setItem('cp-rec-copia',new Date().toISOString().slice(0,10));
      localStorage.setItem('fake-sb',JSON.stringify({rows:[],session:null,users:{'a@b.com':'clave1234'}}))""")
    await pg.goto(URL); await pg.wait_for_timeout(400)
    await pg.fill('#lge', 'a@b.com'); await pg.fill('#lgp', 'clave1234'); await pg.click('#lgf button[type=submit]'); await pg.wait_for_timeout(700)
    hoy = await pg.evaluate("(()=>{const d=new Date();d.setMinutes(d.getMinutes()-d.getTimezoneOffset());return d.toISOString().slice(0,10)})()")
    import datetime
    man = (datetime.date.fromisoformat(hoy) + datetime.timedelta(days=2)).isoformat()
    await nuevo_trabajo(pg, titulo='Rodaje Selva', artista='Grupo Río', monto='4000', fecha=man, fa='2000')
    await pg.click('#sheet [data-a=cerrar]'); await pg.wait_for_timeout(200)
    await pg.click('[data-a=ajustes]'); await pg.wait_for_timeout(500)
    await pg.locator('#pushbox').scroll_into_view_if_needed(); await pg.screenshot(path='/tmp/avisos.png')
    comprobar('Activar avisos' in await pg.inner_text('#pushbox'), 'Ajustes ofrece activar avisos')
    await pg.click('#pushbox [data-p=on]'); await pg.wait_for_timeout(3500)
    st = await estado(pg)
    comprobar(len(st.get('push', [])) == 1 and st['push'][0]['endpoint'] == 'https://push.test/abc', 'registra este equipo en Supabase')
    comprobar('Avisos activados' in await pg.inner_text('#pushbox'), 'muestra avisos activados')
    plan = next((r['datos']['plan'] for r in st['rows'] if r['coleccion'] == 'sistema' and r['id'] == 'avisos'), None)
    comprobar(plan is not None, 'guarda el plan de avisos')
    ids = [x['id'][:2] for x in (plan or [])]
    comprobar('r-' in ids and 'v-' in ids, 'incluye el rodaje del día antes y el cobro del adelanto: ' + str([(x['fecha'], x['titulo']) for x in plan or []]))
    txt = json.dumps(plan, ensure_ascii=False)
    comprobar('4000' not in txt and '4,000' not in txt, 'el aviso no muestra montos')
    rod = next(x for x in plan if x['id'].startswith('r-'))
    comprobar(rod['fecha'] < man and 'Rodaje Selva' in rod['cuerpo'], 'aviso del rodaje un día antes')
    # quitar rodajes en ajustes
    await pg.uncheck('input[name=avRodajes]'); await pg.click('#sheet form button[type=submit]'); await pg.wait_for_timeout(3500)
    st = await estado(pg)
    plan = next(r['datos']['plan'] for r in st['rows'] if r['coleccion'] == 'sistema' and r['id'] == 'avisos')
    comprobar(not any(x['id'].startswith('r-') for x in plan), 'al quitar rodajes se dejan de avisar')
    # abrir desde el aviso
    await pg.evaluate("location.hash='#t-'+JSON.parse(localStorage.getItem('fake-sb')).rows.find(r=>r.coleccion==='trabajos').id"); await pg.wait_for_timeout(500)
    comprobar('Rodaje Selva' in await pg.inner_text('#sheet'), 'tocar el aviso abre el trabajo')
    await pg.click('#sheet [data-a=cerrar]'); await pg.wait_for_timeout(200)
    await pg.click('[data-a=ajustes]'); await pg.wait_for_timeout(500)
    await pg.click('#pushbox [data-p=off]'); await pg.wait_for_timeout(2500)
    st = await estado(pg)
    comprobar(not st.get('push'), 'desactivar quita el equipo')
    plan = next(r['datos']['plan'] for r in st['rows'] if r['coleccion'] == 'sistema' and r['id'] == 'avisos')
    comprobar(plan == [], 'sin equipos, el plan queda vacío')
    comprobar(not pg.errores, 'sin errores de JavaScript: ' + '; '.join(pg.errores))
    await b.close()

@prueba
async def atajos(p):
    b, ctx, pg = await nueva(p)
    await nuevo_trabajo(pg, titulo='Clip Atajo')
    await pg.click('#sheet [data-a=cerrar]'); await pg.wait_for_timeout(200)
    await pg.click('[data-a=ajustes]'); await pg.wait_for_timeout(500)
    await pg.click('#atajobox [data-k=crear]'); await pg.wait_for_timeout(500)
    clave = await pg.input_value('#atajobox .atk input')
    comprobar(clave.startswith('cp_') and len(clave) > 40, 'crea una clave y la muestra una vez')
    st = await estado(pg)
    import hashlib
    comprobar(st['claves'][0]['huella'] == hashlib.sha256(clave.encode()).hexdigest() and clave not in json.dumps(st), 'guarda solo la huella, no la clave')
    comprobar('Obtener contenido de URL' in await pg.inner_text('#atajobox'), 'muestra cómo armar los atajos')
    await pg.locator('#atajobox').scroll_into_view_if_needed(); await pg.screenshot(path='/tmp/atajos.png')
    await pg.click('#atajobox [data-k=borrar]'); await pg.click('#atajobox [data-k=borrar]'); await pg.wait_for_timeout(500)
    comprobar(not (await estado(pg)).get('claves'), 'borrar con doble toque')
    await pg.goto(URL + '?nuevo=gasto'); await pg.wait_for_timeout(1500)
    comprobar(await pg.locator('#sheet form [name=monto]').count() == 1 and 'nuevo=' not in pg.url, '?nuevo=gasto abre el gasto rápido')
    comprobar(not pg.errores, 'sin errores de JavaScript: ' + '; '.join(pg.errores))
    await b.close()

@prueba
async def cotizacion(p):
    import subprocess, urllib.parse
    pdftxt = lambda ruta: subprocess.run(['pdftotext', ruta, '-'], capture_output=True, text=True).stdout
    b, ctx, pg = await nueva(p, viewport={'width': 1280, 'height': 900})
    await pg.click('.fab'); await pg.click('#sheet [data-a=nuevoTipo]'); await pg.click('#sheet [data-tipo=__libre]')
    await pg.fill('#ft', 'Videoclip Amanecer'); await pg.fill('#far', 'Banda Sol'); await pg.fill('#fo', '1000'); await pg.fill('#ff', '2026-12-10')
    await pg.select_option('#fe', 'cotizado')
    await pg.fill('#ftm', '3'); await pg.fill('#sheet [name=temasNom]', 'Amanecer, Lluvia, Volver')
    await pg.click('#sheet form button[type=submit]'); await pg.wait_for_timeout(600)
    await abrir_cot(pg); await pg.wait_for_timeout(400)
    comprobar(await pg.locator('.segm button.on').inner_text() == 'Videoclip', 'elige el modelo Videoclip según el tipo de trabajo')
    comprobar('3 videos musicales («Amanecer», «Lluvia», «Volver»)' in await pg.inner_text('#ce-prev'), 'la descripción usa la cantidad y los nombres de los temas')
    des = await pg.inner_text('#ce-desg')
    comprobar('3 videos musicales' in des and '20%' in des and '6,000.00' in des, 'precio por video con descuento por cantidad (3 × 2,500 − 20%)')
    await pg.fill('#ce-ciu', 'Juliaca')
    await pg.locator('.catd', has=pg.locator('[data-catbox=opc]')).locator('summary').click()
    await pg.locator('[data-catbox=opc] [data-cat]', has_text='Día adicional').click()
    comprobar(await pg.locator('#ce-opc .orow').count() == 4, 'agrega un opcional desde el catálogo')
    await pg.locator('#ce-opc .orow', has=pg.locator('input[value="Máquina de humo"]')).locator('[data-f=ok]').check()
    await pg.select_option('#sheet [name=dTipo]', 'pct'); await pg.fill('#sheet [name=dValor]', '5'); await pg.fill('#sheet [name=dMotivo]', 'Cliente frecuente'); await pg.check('#sheet [name=dVer]')
    await pg.wait_for_timeout(150)
    des = await pg.inner_text('#ce-desg')
    comprobar('Cliente frecuente' in des and '5,747.50' in des and 'ahorra' in des, 'descuento especial sobre el total: ' + des.replace(chr(10), ' | '))
    # precio por posición
    await pg.select_option('#ce-et', 'precio')
    await pg.locator('#ce-tr .trow').first.locator('[data-f=d]').fill('2'); await pg.locator('#ce-tr .trow').first.locator('[data-f=v]').fill('2200')
    await pg.click('#sheet [data-add=tr]'); await pg.locator('#ce-tr .trow').nth(1).locator('[data-f=d]').fill('3'); await pg.locator('#ce-tr .trow').nth(1).locator('[data-f=v]').fill('2000')
    await pg.wait_for_timeout(150)
    des = await pg.inner_text('#ce-desg')
    comprobar('2.º a S/' in des and '3.er a S/' in des, 'precio por posición: 2.º y 3.er video con su precio: ' + des.replace(chr(10), ' | '))
    # 2500+2200+2000=6700 +50 humo = 6750 -5% = 6412.50
    comprobar('6,412.50' in des, 'total con precio por posición')
    async with pg.expect_download() as dl:
        await pg.click('#sheet button[name=ir][value=pdf]')
    d = await dl.value
    await d.save_as('/tmp/cot-modelo.pdf')
    tp = pdftxt('/tmp/cot-modelo.pdf')
    comprobar('3 videos musicales' in tp and 'Cliente frecuente' in tp and 'Ahorro' in tp, 'el PDF muestra el desglose con descuentos')
    comprobar(d.suggested_filename.startswith('EMS-2026-1148'), 'numera la cotización: ' + d.suggested_filename)
    t = servidor(await estado(pg), 'trabajos')[0]
    comprobar(t['cot']['modo'] == 'modelo' and t['total'] == 6412.5 and t['cot']['cantidad'] == 3, 'guarda la cotización y actualiza el monto')
    async with pg.expect_download():
        await pg.click('#sheet [data-a=cotWa]')
    await pg.wait_for_timeout(500)
    href = await pg.locator('#sheet a[href*="wa.me"]').get_attribute('href')
    comprobar('EMS-2026-1148' in urllib.parse.unquote(href), 'WhatsApp abre con el mensaje de la cotización')
    await pg.click('#sheet [data-a=verT]'); await pg.wait_for_timeout(300)
    await abrir_cot(pg); await pg.wait_for_timeout(300)
    await pg.locator('.segm button', has_text='Por partidas').click(); await pg.wait_for_timeout(300)
    comprobar(await pg.locator('#sheet .qrow').count() >= 1, 'se puede cambiar a cotización por partidas')
    await pg.click('#sheet [data-a=verT]'); await pg.wait_for_timeout(300)
    # paquete: videoclip + sesión en vivo
    await abrir_cot(pg); await pg.wait_for_timeout(300)
    await pg.locator('.segm button', has_text='Paquete').click(); await pg.wait_for_timeout(500)
    comprobar(await pg.locator('#pq-partes .pqp').count() == 1, 'el paquete empieza con la cotización actual como 1.ª parte')
    await pg.click('[data-addp=envivo]'); await pg.wait_for_timeout(500)
    comprobar('Parte 2' in await pg.inner_text('#sheet'), 'agregar Sesión en vivo abre la parte 2')
    await pg.fill('#ce-can', '3'); await pg.wait_for_timeout(100)
    comprobar('3,900.00' in await pg.inner_text('#ce-desg') and '3 cámaras adicionales' in await pg.inner_text('#ce-desg'), 'sesión en vivo: base 1,500 (con 2 cámaras) + 3 canciones × 300 + 3 cámaras adicionales × 500')
    comprobar(await pg.input_value('#ce-cam') == '5', 'la sesión en vivo trae el número de cámaras (5)')
    await pg.fill('#ce-cam', '4'); await pg.wait_for_timeout(100)
    comprobar('2 cámaras adicionales × S/' in await pg.inner_text('#ce-desg') and '3,400.00' in await pg.inner_text('#ce-desg'), 'con 4 cámaras baja a 3,400')
    await pg.click('#sheet button[name=ir][value=""]'); await pg.wait_for_timeout(500)
    await pg.fill('#sheet [name=dValor]', '500'); await pg.wait_for_timeout(150)
    des = await pg.inner_text('#pq-desg')
    comprobar('Descuento por paquete' in des and '9,312.50' in des, 'total del paquete con descuento: ' + des.replace(chr(10), ' | '))
    comprobar('3 videos musicales y sesión en vivo de 3 canciones' in await pg.inner_text('#pq-prev'), 'la descripción lista los servicios del paquete')
    async with pg.expect_download() as dl:
        await pg.click('#sheet button[name=ir][value=pdf]')
    await (await dl.value).save_as('/tmp/cot-paquete.pdf')
    tp = pdftxt('/tmp/cot-paquete.pdf')
    comprobar('Resumen del paquete' in tp.replace('RESUMEN DEL PAQUETE', 'Resumen del paquete') and 'Sesión en vivo - 3 canciones' in tp, 'PDF del paquete con resumen y cada servicio')
    tpl = ' '.join(tp.split())
    comprobar('multicámara con 4 cámaras' in tpl and '4 cámaras' in tpl, 'el PDF usa el número de cámaras')
    comprobar('12 horas' not in tpl and 'aproximadamente 15 canciones' not in tpl and 'Grabación de los temas acordados' in tpl, 'la jornada ya no indica horas ni 15 canciones')
    await pg.click('#sheet [data-a=aprobar]'); await pg.wait_for_timeout(300)
    await pg.click('#sheet form button[type=submit]'); await pg.wait_for_timeout(800)
    ts = servidor(await estado(pg), 'trabajos')
    comprobar(len(ts) == 2 and abs(sum(x['total'] for x in ts) - 9312.5) < 0.01, 'al aprobar se separa en 2 trabajos que suman el total')
    comprobar(any('Sesión en vivo' in x['titulo'] and x['temas'] == 3 for x in ts), 'el trabajo nuevo de la sesión en vivo tiene sus 3 temas')
    await pg.click('#sheet [data-a=cerrar]')
    # modelos y catálogo en Ajustes
    await pg.click('[data-a=ajustes]'); await pg.wait_for_timeout(400)
    await pg.click('#sheet [data-a=modelos]'); await pg.wait_for_timeout(300)
    comprobar(await pg.locator('#sheet [data-a=editarModelo]').count() == 3 and '−15%' in await pg.inner_text('#sheet'), 'Ajustes muestra los 3 modelos con su escala')
    await pg.click('#sheet [data-a=editarModelo][data-id=videoclip]'); await pg.wait_for_timeout(300)
    await pg.fill('#ce-preu', '2800'); await pg.click('#sheet form button[type=submit]'); await pg.wait_for_timeout(400)
    aj = next(r['datos'] for r in (await estado(pg))['rows'] if r['coleccion'] == 'ajustes' and r['id'] == 'general')
    vc = next(x for x in aj['modelos'] if x['id'] == 'videoclip')
    comprobar(vc['precio'] == 2800 and vc['precioModo'] == 'porTema' and vc['escala']['tramos'][0]['valor'] == 15, 'editar un modelo guarda precio por video y escala')
    await pg.click('#sheet [data-a=catalogo]'); await pg.wait_for_timeout(300)
    await pg.click('#catadd'); await pg.locator('#cat .orow').last.locator('[data-f=n]').fill('Gimbal DJI RS3'); await pg.click('#sheet form button[type=submit]'); await pg.wait_for_timeout(400)
    aj = next(r['datos'] for r in (await estado(pg))['rows'] if r['coleccion'] == 'ajustes' and r['id'] == 'general')
    comprobar(any(x['nombre'] == 'Gimbal DJI RS3' for x in aj['catalogo']), 'agregar al catálogo lo guarda')
    comprobar(not pg.errores, 'sin errores de JavaScript: ' + '; '.join(pg.errores))
    await b.close()

@prueba
async def boda(p):
    b, ctx, pg = await nueva(p, viewport={'width': 1280, 'height': 900})
    await pg.click('.fab'); await pg.click('#sheet [data-a=nuevoTipo]'); await pg.click('#sheet [data-tipo=__libre]')
    await pg.fill('#ft', 'Boda Ana y Luis'); await pg.fill('#far', 'Ana y Luis'); await pg.fill('#fo', '10000'); await pg.fill('#ff', '2026-12-20')
    await pg.select_option('#fe', 'cotizado')
    await pg.click('#sheet form button[type=submit]'); await pg.wait_for_timeout(600)
    await abrir_cot(pg); await pg.wait_for_timeout(300)
    await pg.click('.segm [data-mod=boda]'); await pg.wait_for_timeout(300)
    comprobar(await pg.locator('#ce-alt .arow').count() == 2 and await pg.locator('#ce-prebox').is_hidden(), 'Boda trae Full HD y 4K como opciones de precio')
    await pg.click('#sheet button[name=ir][value=""]'); await pg.wait_for_timeout(500)
    await pg.click('#sheet [data-a=aprobar]'); await pg.wait_for_timeout(300)
    await pg.locator('#sheet input[name=alt]').nth(1).check()
    await pg.locator('#sheet input[name=op]').nth(2).check()
    comprobar('12,500.00' in await pg.inner_text('#ap-desg'), 'al aprobar elige 4K + dron: ' + await pg.inner_text('#ap-desg'))
    await pg.click('#sheet form button[type=submit]'); await pg.wait_for_timeout(500)
    t = servidor(await estado(pg), 'trabajos')[0]
    comprobar(t['estadoProd'] == 'produccion' and t['total'] == 12500 and t['cot']['num'] == 'EMS-2026-1148', 'queda aprobado con el total elegido y el mismo número')
    async with pg.expect_download() as dl:
        await pg.click('#sheet [data-a=cotPdf]')
    await (await dl.value).save_as('/tmp/cot-boda.pdf')
    comprobar(not pg.errores, 'sin errores de JavaScript: ' + '; '.join(pg.errores))
    await b.close()

@prueba
async def equipo(p):
    b, ctx, pg = await nueva(p)
    await nuevo_trabajo(pg, titulo='Clip Equipo', monto='3000')
    await pg.click('#sheet [data-a=nuevoEq]'); await pg.wait_for_timeout(300)
    await pg.fill('#eqn', 'Jorge'); await pg.fill('#eqr', 'Camarógrafo'); await pg.fill('#eqa', '600')
    await pg.click('#eqadd'); await pg.locator('#eqpg .eqp [data-f=m]').fill('200')
    comprobar('falta S/\xa0400.00' in await pg.inner_text('#eqres') or 'falta S/ 400.00' in await pg.inner_text('#eqres'), 'calcula lo que falta pagar')
    await pg.click('#sheet form button[type=submit]'); await pg.wait_for_timeout(500)
    txt = await pg.inner_text('#sheet')
    comprobar('Jorge' in txt and 'Falta S' in txt and '400.00' in txt, 'el trabajo muestra a la persona y lo que falta')
    comprobar('2,400.00' in txt, 'la ganancia resta lo acordado con el equipo')
    await pg.click('#sheet [data-a=editarEq]'); await pg.wait_for_timeout(300)
    await pg.click('#eqtodo'); await pg.click('#sheet form button[type=submit]'); await pg.wait_for_timeout(500)
    t = servidor(await estado(pg), 'trabajos')[0]
    comprobar(sum(x['monto'] for x in t['equipo'][0]['pagos']) == 600, '"Pagar lo que falta" completa el pago')
    await pg.click('#sheet [data-a=nuevoEq]'); await pg.wait_for_timeout(300)
    await pg.fill('#eqn', 'Ana'); await pg.fill('#eqa', '350'); await pg.click('#sheet form button[type=submit]'); await pg.wait_for_timeout(500)
    await pg.click('#sheet [data-a=cerrar]'); await pg.goto(URL + '#reportes'); await pg.wait_for_timeout(900)
    rep = await pg.inner_text('#view')
    comprobar('Por pagar al equipo' in rep and 'Ana' in rep, 'Reportes muestra a quién le debes')
    comprobar(await pg.locator('svg.graf path.gc2').count() >= 1, 'el gráfico mensual muestra los pagos al equipo como gasto')
    await pg.locator('.ghit').nth(10).click(); await pg.wait_for_timeout(200)
    comprobar('Noviembre' in await pg.inner_text('#gtip'), 'tocar un mes muestra su detalle')
    await pg.locator('svg.graf').scroll_into_view_if_needed(); await pg.screenshot(path='/tmp/grafico.png')
    comprobar(not pg.errores, 'sin errores de JavaScript: ' + '; '.join(pg.errores))
    await b.close()

@prueba
async def dolares(p):
    b, ctx, pg = await nueva(p)
    await ctx.route('https://open.er-api.com/**', lambda r: r.fulfill(json={'result': 'success', 'rates': {'USD': 1, 'PEN': 3.8, 'EUR': 0.95}}))
    await nuevo_trabajo(pg, titulo='Soles', monto='1000')
    await pg.click('#sheet [data-a=cerrar]'); await pg.wait_for_timeout(200)
    await pg.click('.fab'); await pg.click('#sheet [data-a=nuevoTipo]'); await pg.click('#sheet [data-tipo=__libre]')
    await pg.fill('#ft', 'Spot USA'); await pg.fill('#far', 'Marca X'); await pg.fill('#fo', '500'); await pg.fill('#ff', '2026-11-28')
    await pg.select_option('#sheet select[name=moneda]', 'USD')
    await pg.click('#sheet form button[type=submit]'); await pg.wait_for_timeout(5500)
    st = await estado(pg)
    aj = next(r['datos'] for r in st['rows'] if r['coleccion'] == 'ajustes' and r['id'] == 'general')
    comprobar(aj.get('tc', {}).get('USD') == 3.8, 'trae el tipo de cambio solo al haber trabajos en dólares')
    await pg.goto(URL + '?t=2#trabajos'); await pg.wait_for_timeout(1200)
    await pg.locator('[data-a=verT]:visible', has_text='Spot USA').first.click(); await pg.wait_for_timeout(300)
    comprobar('1,900.00' in await pg.inner_text('#sheet'), 'el trabajo en dólares muestra su equivalente en soles')
    await pg.click('#sheet [data-a=pago]'); await pg.wait_for_timeout(200)
    for k in ['C', '1', '0', '0', 'ok']:
        await pg.click(f'#sheet .k[data-k="{k}"]')
    await pg.wait_for_timeout(500)
    t = next(x for x in servidor(await estado(pg), 'trabajos') if x['titulo'] == 'Spot USA')
    comprobar(t['pagos'][0].get('tc') == 3.8, 'el pago en dólares guarda el tipo de cambio del día')
    await pg.click('#sheet [data-a=cerrar]'); await pg.goto(URL + '?t=3#reportes'); await pg.wait_for_timeout(1200)
    await pg.select_option('#rmon', 'TODO'); await pg.wait_for_timeout(400)
    rep = await pg.inner_text('#view')
    comprobar('2,900.00' in rep and 'Convertido a soles' in rep, 'Reportes suma todo en soles: ' + rep[:0])
    comprobar(not pg.errores, 'sin errores de JavaScript: ' + '; '.join(pg.errores))
    await b.close()

@prueba
async def servicios_en_trabajo(p):
    b, ctx, pg = await nueva(p)
    await pg.click('.fab'); await pg.click('#sheet [data-a=nuevoTipo]'); await pg.click('#sheet [data-tipo=__libre]')
    await pg.fill('#ft', 'Proyecto Duo'); await pg.fill('#far', 'Duo Andino'); await pg.fill('#ff', '2026-12-15'); await pg.fill('#ftm', '2')
    await pg.click('.srvd summary')
    await pg.click('[data-srv=videoclip]'); await pg.wait_for_timeout(150)
    comprobar(await pg.locator('#srv .svrow [data-f=n]').input_value() == '2', 'toma los 2 temas del trabajo')
    comprobar(await pg.input_value('#fo') == '4250', 'el monto se llena solo: 2 videos − 15% = 4,250')
    await pg.click('[data-srv=envivo]'); await pg.wait_for_timeout(150)
    await pg.locator('#srv .svrow').nth(1).locator('[data-f=n]').fill('3'); await pg.wait_for_timeout(150)
    await pg.fill('#srvpq [data-pq=valor]', '250'); await pg.wait_for_timeout(150)
    comprobar(await pg.input_value('#fo') == '7900', 'paquete: 4,250 + sesión 3,900 (5 cámaras, 2 incluidas) − 250 = 7,900: ' + await pg.input_value('#fo'))
    comprobar(await pg.input_value('#ftm') == '5' and 'videos musicales + 3 canciones' in await pg.inner_text('#ftmh'), 'Temas a grabar suma los servicios: 2 videos + 3 canciones = 5')
    await pg.locator('#srv .svrow').nth(1).locator('[data-f=cam]').fill('3'); await pg.wait_for_timeout(150)
    comprobar(await pg.input_value('#fo') == '6900', 'con 3 cámaras el monto baja 1,000: ' + await pg.input_value('#fo'))
    await pg.click('#sheet form button[type=submit]'); await pg.wait_for_timeout(600)
    t = servidor(await estado(pg), 'trabajos')[0]
    comprobar(t['total'] == 6900 and t['temas'] == 5 and t['cot']['modo'] == 'paquete' and t['cot']['partes'][1]['camaras'] == 3 and len(t['cot']['partes']) == 2 and t['cot']['partes'][1]['cantidad'] == 3, 'guarda el paquete en el trabajo')
    # editar el trabajo: cambiar la cantidad de videoclips
    await pg.click('#sheet [data-a=editarT]'); await pg.wait_for_timeout(400)
    comprobar(await pg.locator('#srv .svrow').count() == 2, 'al editar aparecen los servicios del paquete')
    await pg.locator('#srv .svrow').first.locator('[data-f=n]').fill('3'); await pg.wait_for_timeout(150)
    comprobar(await pg.input_value('#fo') == '8650' and await pg.input_value('#ftm') == '6', 'al cambiar a 3 videos se recalculan monto y temas: ' + await pg.input_value('#fo'))
    await pg.click('#sheet form button[type=submit]'); await pg.wait_for_timeout(600)
    await abrir_cot(pg); await pg.wait_for_timeout(400)
    comprobar(await pg.locator('#pq-partes .pqp').count() == 2 and '8,650.00' in await pg.inner_text('#pq-desg'), 'Armar cotización abre el paquete listo')
    comprobar(not pg.errores, 'sin errores de JavaScript: ' + '; '.join(pg.errores))
    await b.close()

@prueba
async def sin_desborde(p):
    """En el iPhone nada debe hacer que la pantalla se desplace hacia los costados."""
    b, ctx, pg = await nueva(p, viewport={'width': 375, 'height': 812})
    largo = 'Producción audiovisual Municipalidad Distrital de Acomayo Cusco'
    await nuevo_trabajo(pg, titulo=largo, artista='Agrupación Folklórica Virgen de la Candelaria de Acomayo', monto='1234567', fr='987654')
    await pg.click('#sheet [data-a=cerrar]'); await pg.wait_for_timeout(200)
    await nuevo_trabajo(pg, titulo='Videoclip', artista='Anita', monto='2500', fr='1250')
    await pg.click('#sheet [data-a=cerrar]'); await pg.wait_for_timeout(200)
    malos = []
    for v in ['resumen', 'trabajos', 'calendario', 'clientes', 'artistas', 'gastos', 'reportes']:
        await pg.goto(URL + '?v=' + v + '#' + v); await pg.wait_for_timeout(700)
        r = await pg.evaluate("""()=>{const W=document.documentElement.clientWidth;const sw=document.documentElement.scrollWidth;
          const fuera=[...document.querySelectorAll('#view *')].filter(e=>{const b=e.getBoundingClientRect();return b.width>0&&b.right>W+1}).slice(0,3).map(e=>e.tagName+'.'+e.className+': '+(e.textContent||'').trim().slice(0,40));
          return {sw,W,fuera}}""")
        if r['sw'] > r['W'] + 1:
            malos.append(f"{v}: ancho {r['sw']} > {r['W']} · {r['fuera']}")
    comprobar(not malos, 'ninguna vista se desborda a los costados' + ('' if not malos else ': ' + ' | '.join(malos)))
    await pg.goto(URL + '?v=r#resumen'); await pg.wait_for_timeout(700)
    await pg.screenshot(path='/tmp/resumen-iphone.png', full_page=True)
    comprobar(not pg.errores, 'sin errores de JavaScript: ' + '; '.join(pg.errores))
    await b.close()

@prueba
async def numeracion(p):
    b, ctx, pg = await nueva(p)
    async def cotizar(titulo):
        await nuevo_trabajo(pg, titulo=titulo, monto='2500')
        await abrir_cot(pg); await pg.wait_for_timeout(300)
        await pg.click('#sheet button[name=ir][value=""]'); await pg.wait_for_timeout(500)
        await pg.click('#sheet [data-a=cerrar]'); await pg.wait_for_timeout(200)
        return next(x for x in servidor(await estado(pg), 'trabajos') if x['titulo'] == titulo)['cot']['num']
    a = await cotizar('Uno'); c = await cotizar('Dos')
    comprobar(a == 'EMS-2026-1148' and c == 'EMS-2026-1149', f'números correlativos: {a}, {c}')
    await pg.click('[data-a=ajustes]'); await pg.wait_for_timeout(400)
    comprobar(await pg.input_value('#ans') == '1150' and 'EMS-2026-1150' in await pg.inner_text('#anx'), 'Ajustes muestra el próximo número')
    await pg.fill('#ans', '1300'); await pg.uncheck('[name=cotAnio]'); await pg.wait_for_timeout(100)
    comprobar('EMS-1300' in await pg.inner_text('#anx'), 'el ejemplo se actualiza al escribir')
    await pg.click('#sheet form button[type=submit]'); await pg.wait_for_timeout(400)
    d = await cotizar('Tres')
    comprobar(d == 'EMS-1300', 'se puede cambiar el número y quitar el año: ' + d)
    await pg.locator('[data-a=verT]:visible', has_text='Uno').first.click(); await pg.wait_for_timeout(300)
    await abrir_cot(pg); await pg.wait_for_timeout(300)
    comprobar(await pg.input_value('#qn') == 'EMS-2026-1148', 'la cotización muestra su número para editarlo')
    await pg.fill('#qn', 'ems-2026-1148b'); await pg.click('#sheet button[name=ir][value=""]'); await pg.wait_for_timeout(500)
    e = next(x for x in servidor(await estado(pg), 'trabajos') if x['titulo'] == 'Uno')['cot']['num']
    comprobar(e == 'EMS-2026-1148B', 'se puede corregir el número a mano: ' + e)
    comprobar(not pg.errores, 'sin errores de JavaScript: ' + '; '.join(pg.errores))
    await b.close()

@prueba
async def cotizacion_calendario(p):
    b, ctx, pg = await nueva(p)
    await pg.evaluate("localStorage.setItem('fake-cal','{\"con\":true}')")
    await pg.reload(); await pg.wait_for_timeout(900)
    await pg.evaluate("window.__fnLog=[]")
    await pg.click('.fab'); await pg.click('#sheet [data-a=nuevoTipo]'); await pg.click('#sheet [data-tipo=__libre]')
    await pg.fill('#ft', 'Cotización Rodaje'); await pg.fill('#far', 'Grupo X'); await pg.fill('#fo', '2500'); await pg.fill('#ff', '2026-12-12')
    await pg.fill('#fi', 'camarografo@gmail.com')
    await pg.select_option('#fe', 'cotizado'); await pg.wait_for_timeout(100)
    comprobar(not await pg.is_checked('[name=calEnt]') and not await pg.is_checked('[name=calNotif]') and await pg.is_checked('[name=calOn]'), 'cotización: va al calendario, sin fecha de entrega ni correos')
    await pg.click('#sheet form button[type=submit]'); await pg.wait_for_timeout(1200)
    log = await pg.evaluate("window.__fnLog")
    cr = [x for x in log if x.get('tool') == 'create_event']
    comprobar(len(cr) == 1 and cr[0]['input']['summary'].startswith('Por confirmar:') and cr[0]['input'].get('colorId') == '8' and cr[0]['input'].get('notificationLevel') == 'NONE', 'evento “Por confirmar” en gris y sin avisar: ' + str(cr[0]['input'] if cr else log))
    comprobar(await pg.is_visible('#sheet form') and 'Cotización' in await pg.inner_text('#sheet .shd'), 'al guardar se abre la cotización para revisarla')
    await pg.click('#sheet [data-a=cerrar]'); await pg.wait_for_timeout(300)
    await pg.click('.cqrow h3'); await pg.wait_for_timeout(300)
    await pg.evaluate("window.__fnLog=[]")
    await pg.click('#sheet [data-a=pago]'); await pg.wait_for_timeout(200)
    for k in ['C', '1', '2', '5', '0', 'ok']:
        await pg.click(f'#sheet .k[data-k="{k}"]')
    await pg.wait_for_timeout(1500)
    t = servidor(await estado(pg), 'trabajos')[0]
    comprobar(t['estadoProd'] == 'produccion' and t['cal']['notif'] is True, 'al registrar el pago pasa a En producción')
    up = [x for x in await pg.evaluate("window.__fnLog") if x.get('tool') == 'update_event']
    comprobar(up and not up[0]['input']['summary'].startswith('Por confirmar') and up[0]['input'].get('notificationLevel') == 'ALL' and up[0]['input'].get('colorId') == '4', 'el evento se confirma con el color de rodajes y avisa a los invitados: ' + str(up[0]['input'] if up else ''))
    comprobar(not pg.errores, 'sin errores de JavaScript: ' + '; '.join(pg.errores))
    await b.close()

@prueba
async def cotizacion_nueva(p):
    b, ctx, pg = await nueva(p)
    await pg.click('.fab')
    txt = await pg.inner_text('#sheet .elige')
    comprobar(txt.index('Nueva cotización') < txt.index('Nuevo trabajo'), '+ Nuevo ofrece primero “Nueva cotización”')
    await pg.click('#sheet [data-a=nuevaCot]'); await pg.wait_for_timeout(150)
    tipos = await pg.eval_on_selector_all('#sheet [data-tipo]', 'b=>b.map(x=>x.dataset.tipo)')
    comprobar(tipos == ['videoclip', 'envivo', 'boda', '__paquete', '__partidas'], 'tipos de cotización: ' + str(tipos))
    comprobar('2,500' in await pg.inner_text('#sheet [data-tipo=videoclip]'), 'cada tipo muestra su precio')
    await pg.click('#sheet [data-tipo=__paquete]'); await pg.wait_for_timeout(300)
    comprobar('Nueva cotización' in await pg.inner_text('#sheet .shd') and await pg.input_value('#fe') == 'cotizado', 'el formulario se abre como cotización')
    comprobar(await pg.locator('#srv .svrow').count() == 2 and float(await pg.input_value('#fo') or 0) > 0, 'el paquete trae 2 servicios y calcula el monto')
    await pg.fill('#ft', 'Paquete Prueba'); await pg.fill('#far', 'Banda Q'); await pg.fill('#ff', '2026-12-20')
    await pg.click('#sheet form button[type=submit]'); await pg.wait_for_timeout(700)
    comprobar('paquete' in (await pg.inner_text('#sheet .shd')).lower(), 'al guardar abre la cotización por paquete')
    await pg.click('#sheet [data-a=cerrar]'); await pg.wait_for_timeout(300)
    comprobar(await pg.is_visible('#cotq') and 'Sin enviar' in await pg.inner_text('.cqrow'), 'Inicio muestra “Cotizaciones por confirmar”')
    comprobar(await pg.locator('.cqrow [data-a=cotWa]').count() == 1 and await pg.locator('.cqrow [data-a=aprobar]').count() == 1, 'con botones Enviar y Aprobada')
    await pg.click('.cqrow [data-a=cotWa]'); await pg.wait_for_timeout(2500)
    await pg.evaluate("(()=>{const a=document.querySelector('#cpWa');a.addEventListener('click',e=>e.preventDefault(),{capture:true});a.click()})()")
    await pg.wait_for_timeout(500)
    t = servidor(await estado(pg), 'trabajos')[0]
    comprobar(t['cot'].get('enviada') == await pg.evaluate("new Intl.DateTimeFormat('en-CA',{timeZone:'America/Lima'}).format(new Date())"), 'al abrir WhatsApp queda marcada como enviada')
    await pg.click('#sheet [data-a=cerrar]'); await pg.wait_for_timeout(300)
    comprobar('Enviada hoy' in await pg.inner_text('.cqrow') and 'Reenviar' in await pg.inner_text('.cqrow'), 'Inicio muestra “Enviada hoy”')
    await pg.click('.cqrow h3'); await pg.wait_for_timeout(300)
    await pg.click('#sheet [data-a=cotEnv]'); await pg.wait_for_timeout(400)
    comprobar('Ya la envié' in await pg.inner_text('#sheet .qenv'), 'se puede quitar la marca de enviada')
    await pg.click('#sheet [data-a=cerrar]'); await pg.wait_for_timeout(200)
    await pg.click('[data-a=verCots]'); await pg.wait_for_timeout(300)
    comprobar('#trabajos' in pg.url and await pg.locator('.chip.on[data-id=cotizado]').count() == 1, '“Ver en Trabajos” abre el filtro Cotizaciones')
    await pg.click('.fab'); await pg.click('#sheet [data-a=nuevoTipo]'); await pg.wait_for_timeout(150)
    tipos = await pg.eval_on_selector_all('#sheet [data-tipo]', 'b=>b.map(x=>x.dataset.tipo)')
    comprobar(tipos[-1] == '__libre' and '__partidas' not in tipos, 'trabajo nuevo: tipos con “Monto libre”')
    await pg.click('#sheet [data-tipo=videoclip]'); await pg.wait_for_timeout(300)
    comprobar('Nuevo trabajo' in await pg.inner_text('#sheet .shd') and await pg.input_value('#fe') == 'produccion' and await pg.input_value('#fo') == '2500' and await pg.input_value('#fy') == 'Videoclip', 'trabajo de videoclip con monto y tipo puestos')
    await pg.click('#sheet [data-a=cerrar]')
    await pg.click('.fab'); await pg.click('#sheet [data-a=nuevaCot]'); await pg.click('#sheet [data-tipo=__partidas]'); await pg.wait_for_timeout(300)
    await pg.fill('#ft', 'Spot Tienda'); await pg.fill('#fo', '900')
    await pg.click('#sheet form button[type=submit]'); await pg.wait_for_timeout(700)
    comprobar(await pg.locator('#sheet form').count() == 1 and 'Spot Tienda' in await pg.inner_text('#sheet'), '“Otro” abre la cotización por conceptos: ' + (await pg.inner_text('#sheet .shd')))
    comprobar(not pg.errores, 'sin errores de JavaScript: ' + '; '.join(pg.errores))
    await pg.screenshot(path='/tmp/cotq.png', full_page=False)
    await b.close()

@prueba
async def precio_pactado(p):
    import subprocess
    pdftxt = lambda ruta: ' '.join(subprocess.run(['pdftotext', ruta, '-'], capture_output=True, text=True).stdout.split())
    b, ctx, pg = await nueva(p, viewport={'width': 1280, 'height': 900})
    await pg.click('.fab'); await pg.click('#sheet [data-a=nuevaCot]'); await pg.click('#sheet [data-tipo=videoclip]'); await pg.wait_for_timeout(300)
    await pg.fill('#ft', 'Larry Prueba'); await pg.fill('#far', 'Larry'); await pg.fill('#ff', '2026-12-18')
    comprobar(await pg.input_value('#fo') == '2500' and await pg.is_hidden('#srvpq'), 'videoclip a precio de lista, sin descuento')
    await pg.fill('#fo', '1800'); await pg.wait_for_timeout(150)
    comprobar(await pg.is_visible('#srvpq') and await pg.input_value('#srvpq [data-pq=valor]') == '700' and await pg.inner_text('#srvpql') == 'Descuento especial', 'al pactar 1,800 aparece el descuento de 700')
    comprobar(not await pg.is_checked('#srvpq [data-pq=ver]') and '28%' in await pg.inner_text('#srvpqh'), 'la casilla del PDF viene desmarcada y muestra el 28%: ' + await pg.inner_text('#srvpqh'))
    comprobar('no sale en el PDF' in await pg.inner_text('#srvtot'), 'el desglose avisa que no sale en el PDF')
    await pg.click('#sheet form button[type=submit]'); await pg.wait_for_timeout(700)
    t = servidor(await estado(pg), 'trabajos')[0]
    comprobar(t['total'] == 1800 and t['cot']['modo'] == 'modelo' and t['cot']['descuento']['valor'] == 700 and t['cot']['descPdf'] is False, 'se guarda el descuento en la cotización: ' + str(t['cot'].get('descuento')))
    comprobar(not await pg.is_checked('#sheet [name=dVer]') and '1,800.00' in await pg.inner_text('#ce-desg'), 'el editor de la cotización muestra 1,800 con la casilla desmarcada')
    async with pg.expect_download() as dl:
        await pg.click('#sheet button[name=ir][value=pdf]')
    await (await dl.value).save_as('/tmp/pactado1.pdf')
    tp = pdftxt('/tmp/pactado1.pdf')
    comprobar('1,800.00' in tp and '700.00' not in tp and 'Descuento especial' not in tp and '2,500.00' not in tp, 'el PDF muestra solo el total pactado')
    await pg.click('#sheet [data-a=cerrar]'); await pg.wait_for_timeout(200)
    await pg.click('.cqrow h3'); await pg.wait_for_timeout(300)
    det = await pg.inner_text('#sheet')
    comprobar('Precio de lista' in det and '2,500.00' in det and '28%' in det, 'el trabajo muestra precio de lista y descuento')
    await pg.click('#sheet [data-a=fCot]'); await pg.wait_for_timeout(300)
    await pg.check('#sheet [name=dVer]')
    async with pg.expect_download() as dl:
        await pg.click('#sheet button[name=ir][value=pdf]')
    await (await dl.value).save_as('/tmp/pactado2.pdf')
    tp = pdftxt('/tmp/pactado2.pdf')
    comprobar('2,500.00' in tp and '700.00' in tp and '1,800.00' in tp, 'con la casilla marcada el PDF muestra valor, descuento y total')
    # monto mayor: adicional
    await pg.click('#sheet [data-a=cerrar]'); await pg.wait_for_timeout(200)
    await pg.click('.cqrow h3'); await pg.wait_for_timeout(300)
    await pg.click('#sheet [data-a=editarT]'); await pg.wait_for_timeout(400)
    comprobar(await pg.input_value('#srvpq [data-pq=valor]') == '700', 'al editar se ve el descuento guardado')
    await pg.fill('#fo', '2800'); await pg.wait_for_timeout(150)
    comprobar(await pg.is_hidden('#srvpq') and await pg.is_visible('#srvad') and await pg.input_value('#srvad [data-ad=monto]') == '300', 'si el monto es mayor, ofrece la diferencia como adicional')
    await pg.fill('#srvad [data-ad=motivo]', 'Dron adicional')
    await pg.click('#sheet form button[type=submit]'); await pg.wait_for_timeout(600)
    t = servidor(await estado(pg), 'trabajos')[0]
    comprobar(t['total'] == 2800 and t['cot']['adicional'] == {'monto': 300, 'motivo': 'Dron adicional'} and not t['cot']['descuento']['valor'], 'se guarda el adicional: ' + str(t['cot'].get('adicional')))
    # trabajo antiguo: monto cambiado a mano sin descuento en la cotización
    await pg.click('#sheet [data-a=editarT]'); await pg.wait_for_timeout(400)
    await pg.fill('#fo', '2000'); await pg.wait_for_timeout(150)
    await pg.click('#sheet form button[type=submit]'); await pg.wait_for_timeout(600)
    t = servidor(await estado(pg), 'trabajos')[0]
    comprobar(t['cot']['descuento']['valor'] == 500 and not t['cot'].get('adicional'), 'al bajar a 2,000 el adicional se quita y queda descuento de 500')
    # reportes: el trabajo confirmado cuenta en descuentos otorgados
    await pg.click('#sheet [data-a=aprobar]'); await pg.wait_for_timeout(500)
    if await pg.locator('#sheet form').count():
        await pg.click('#sheet form button[type=submit]'); await pg.wait_for_timeout(500)
    t = servidor(await estado(pg), 'trabajos')[0]
    comprobar(t['estadoProd'] == 'produccion' and t['total'] == 2000, 'al aprobar se mantiene el precio pactado: ' + str(t['total']))
    await pg.goto(pg.url.split('#')[0] + '#reportes'); await pg.wait_for_timeout(800)
    rep = await pg.inner_text('.figs')
    comprobar('Descuentos otorgados' in rep and '500.00' in rep and '20%' in rep, 'Reportes muestra los descuentos otorgados: ' + rep.replace(chr(10), ' | ')[-160:])
    comprobar(not pg.errores, 'sin errores de JavaScript: ' + '; '.join(pg.errores))
    await b.close()

@prueba
async def duracion_video(p):
    b, ctx, pg = await nueva(p)
    await pg.click('.fab'); await pg.click('#sheet [data-a=nuevaCot]'); await pg.click('#sheet [data-tipo=videoclip]'); await pg.wait_for_timeout(300)
    comprobar(await pg.input_value('#srv [data-f=dur]') == '5', 'la duración del video viene en 5 min')
    await pg.fill('#ft', 'Tema Corto'); await pg.fill('#far', 'Grupo D')
    await pg.fill('#srv [data-f=dur]', '3.5'); await pg.wait_for_timeout(100)
    await pg.click('#sheet form button[type=submit]'); await pg.wait_for_timeout(700)
    comprobar(await pg.input_value('#ce-dur') == '3.5' and '3.5 minutos por video' in await pg.inner_text('#ce-prev'), 'la cotización usa la duración elegida: ' + await pg.inner_text('#ce-prev'))
    await pg.fill('#ce-dur', '4'); await pg.wait_for_timeout(150)
    comprobar('4 minutos por video' in await pg.inner_text('#ce-prev'), 'se puede cambiar en el editor de la cotización')
    await pg.click('#sheet button[name=ir][value=""]'); await pg.wait_for_timeout(500)
    t = servidor(await estado(pg), 'trabajos')[0]
    comprobar(t['cot']['duracion'] == 4 and '{duracion}' in t['cot']['intro'], 'se guarda la duración: ' + str(t['cot'].get('duracion')))
    await pg.click('#sheet [data-a=cerrar]'); await pg.wait_for_timeout(200)
    await pg.click('.fab'); await pg.click('#sheet [data-a=nuevaCot]'); await pg.click('#sheet [data-tipo=envivo]'); await pg.wait_for_timeout(300)
    comprobar(await pg.locator('#srv [data-f=dur]').count() == 0, 'la sesión en vivo no pide duración')
    comprobar(not pg.errores, 'sin errores de JavaScript: ' + '; '.join(pg.errores))
    await b.close()

@prueba
async def validez_cotizacion(p):
    import datetime
    b, ctx, pg = await nueva(p)
    hoy = await pg.evaluate("new Intl.DateTimeFormat('en-CA',{timeZone:'America/Lima'}).format(new Date())")
    d = lambda n: (datetime.date.fromisoformat(hoy) + datetime.timedelta(days=n)).isoformat()
    await pg.click('.fab'); await pg.click('#sheet [data-a=nuevaCot]'); await pg.click('#sheet [data-tipo=videoclip]'); await pg.wait_for_timeout(300)
    await pg.fill('#ft', 'Valida Uno'); await pg.fill('#far', 'Grupo V'); await pg.fill('#ff', d(30))
    await pg.click('#sheet form button[type=submit]'); await pg.wait_for_timeout(700)
    comprobar(await pg.input_value('#qv') == d(5), 'la validez por defecto es de 5 días: ' + await pg.input_value('#qv'))
    await pg.click('#sheet [data-a=cerrar]'); await pg.wait_for_timeout(200)
    await pg.click('.fab'); await pg.click('#sheet [data-a=nuevaCot]'); await pg.click('#sheet [data-tipo=videoclip]'); await pg.wait_for_timeout(300)
    await pg.fill('#ft', 'Valida Dos'); await pg.fill('#far', 'Grupo W'); await pg.fill('#ff', d(3))
    await pg.click('#sheet form button[type=submit]'); await pg.wait_for_timeout(700)
    comprobar(await pg.input_value('#qv') == d(2), 'con rodaje en 3 días vence el día antes del rodaje')
    await pg.fill('#qe', d(-10)); await pg.dispatch_event('#qe', 'change'); await pg.fill('#qv', d(-2))
    await pg.click('#sheet button[name=ir][value=""]'); await pg.wait_for_timeout(500)
    await pg.click('#sheet [data-a=cerrar]'); await pg.wait_for_timeout(300)
    fila = pg.locator('.cqrow', has_text='Valida Dos')
    comprobar('Vencida' in await fila.inner_text() and await fila.locator('[data-a=cotLiberar]').count() == 1, 'Inicio marca la cotización vencida con “Liberar la fecha”')
    await fila.locator('[data-a=cotExtender]').click(); await pg.wait_for_timeout(500)
    t = next(x for x in servidor(await estado(pg), 'trabajos') if x['titulo'] == 'Valida Dos')
    comprobar(t['cot']['valida'] == d(5), 'extender da 5 días más desde hoy: ' + t['cot']['valida'])
    comprobar('Vencida' not in await pg.locator('.cqrow', has_text='Valida Dos').inner_text(), 'deja de verse vencida')
    await pg.click('.cqrow:has-text("Valida Uno") h3'); await pg.wait_for_timeout(300)
    await pg.click('#sheet [data-a=fCot]'); await pg.wait_for_timeout(300)
    await pg.fill('#qv', d(-1)); await pg.click('#sheet button[name=ir][value=""]'); await pg.wait_for_timeout(500)
    await pg.click('#sheet [data-a=cerrar]'); await pg.wait_for_timeout(300)
    lib = pg.locator('.cqrow', has_text='Valida Uno').locator('[data-a=cotLiberar]')
    await lib.click(); await lib.click(); await pg.wait_for_timeout(600)
    t = next(x for x in servidor(await estado(pg), 'trabajos') if x['titulo'] == 'Valida Uno')
    comprobar(t['estadoProd'] == 'cancelado' and t['cot'].get('liberada') == hoy, 'liberar la fecha la deja como no aceptada')
    comprobar(await pg.locator('.cqrow', has_text='Valida Uno').count() == 0, 'ya no aparece en Inicio')
    comprobar(not pg.errores, 'sin errores de JavaScript: ' + '; '.join(pg.errores))
    await b.close()

@prueba
async def sin_descuentos(p):
    b, ctx, pg = await nueva(p)
    await pg.click('.fab'); await pg.click('#sheet [data-a=nuevaCot]'); await pg.click('#sheet [data-tipo=videoclip]'); await pg.wait_for_timeout(300)
    await pg.fill('#ft', 'Dos Temas'); await pg.fill('#far', 'Grupo S')
    await pg.fill('#srv [data-f=n]', '2'); await pg.wait_for_timeout(150)
    comprobar(await pg.input_value('#fo') == '4250' and await pg.is_visible('#srvesc') and await pg.is_checked('#srvesc input'), 'con 2 videos aplica −15% y muestra la opción marcada')
    comprobar('−15% desde 2' in await pg.inner_text('#srvesc'), 'la opción dice qué descuento es: ' + await pg.inner_text('#srvesc'))
    await pg.uncheck('#srvesc input'); await pg.wait_for_timeout(150)
    comprobar(await pg.input_value('#fo') == '5000' and 'Descuento' not in await pg.inner_text('#srvtot'), 'sin descuentos: 2 × 2,500 = 5,000')
    await pg.click('#sheet form button[type=submit]'); await pg.wait_for_timeout(700)
    t = servidor(await estado(pg), 'trabajos')[0]
    comprobar(t['total'] == 5000 and t['cot']['sinEscala'] is True, 'se guarda sin descuento por cantidad')
    comprobar(not await pg.is_checked('#ce-aesc') and '5,000.00' in await pg.inner_text('#ce-desg'), 'el editor respeta la opción')
    await pg.check('#ce-aesc'); await pg.wait_for_timeout(150)
    comprobar('4,250.00' in await pg.inner_text('#ce-desg'), 'en el editor se puede volver a aplicar')
    await pg.click('#sheet [data-a=cerrar]'); await pg.wait_for_timeout(200)
    await pg.click('.cqrow h3'); await pg.wait_for_timeout(300); await pg.click('#sheet [data-a=editarT]'); await pg.wait_for_timeout(400)
    comprobar(not await pg.is_checked('#srvesc input') and await pg.input_value('#fo') == '5000', 'al editar el trabajo sigue sin descuentos')
    await pg.fill('#fo', '4500'); await pg.wait_for_timeout(150)
    comprobar(await pg.input_value('#srvpq [data-pq=valor]') == '500', 'un precio pactado menor sigue quedando como descuento especial')
    await pg.click('#sheet [data-a=cerrar]'); await pg.wait_for_timeout(200)
    await pg.click('.fab'); await pg.click('#sheet [data-a=nuevaCot]'); await pg.click('#sheet [data-tipo=boda]'); await pg.wait_for_timeout(300)
    comprobar(await pg.is_hidden('#srvesc'), 'la boda (precio fijo) no muestra la opción')
    comprobar(not pg.errores, 'sin errores de JavaScript: ' + '; '.join(pg.errores))
    await b.close()

async def main():
    nombres = sys.argv[1:] or list(PRUEBAS)
    async with async_playwright() as p:
        for n in nombres:
            print(n)
            await PRUEBAS[n](p)
    print('\nFallos:', comprobar.fallos)
    sys.exit(1 if comprobar.fallos else 0)

if __name__ == "__main__":
    asyncio.run(main())
