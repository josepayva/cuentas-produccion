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

async def nuevo_trabajo(pg, titulo='Prueba', artista='Artista', monto='2000', fecha='2026-11-28', **extra):
    await pg.click('.fab'); await pg.click('#sheet [data-a=nuevoT]')
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
    b, ctx, pg = await nueva(p)
    await pg.click('.fab'); await pg.click('#sheet [data-a=nuevoT]')
    await pg.fill('#ft', 'Videoclip Amanecer'); await pg.fill('#far', 'Banda Sol'); await pg.fill('#fo', '1000'); await pg.fill('#ff', '2026-12-10')
    await pg.select_option('#fe', 'cotizado')
    await pg.click('#sheet form button[type=submit]'); await pg.wait_for_timeout(600)
    await pg.click('#sheet [data-a=cotPdf]'); await pg.wait_for_timeout(300)
    comprobar(await pg.locator('#sheet .qrow').count() == 1, 'abre el armado con una partida del monto actual')
    await pg.fill('#sheet .qrow [data-f=p]', '2500')
    await pg.click('#qpre [data-q="Edición y montaje"]'); await pg.wait_for_timeout(100)
    await pg.locator('#sheet .qrow').nth(1).locator('[data-f=p]').fill('800')
    await pg.locator('#sheet .qrow').nth(1).locator('[data-f=n]').fill('2')
    comprobar('4,100.00' in await pg.inner_text('#qtotal'), 'suma partidas con cantidad: ' + await pg.inner_text('#qtotal'))
    async with pg.expect_download() as dl:
        await pg.click('#sheet button[name=pdf]')
    d = await dl.value
    ruta = '/tmp/cotizacion.pdf'; await d.save_as(ruta)
    comprobar(d.suggested_filename.startswith('COT-2026-001'), 'numera la cotización: ' + d.suggested_filename)
    st = await estado(pg)
    t = servidor(st, 'trabajos')[0]
    comprobar(t['total'] == 4100 and t['cot']['num'] == 'COT-2026-001' and len(t['cot']['items']) == 2, 'guarda partidas y actualiza el monto')
    comprobar(t['cot']['valida'] > t['cot']['emitida'], 'pone la fecha de validez')
    await pg.click('#sheet [data-a=aprobar]'); await pg.wait_for_timeout(500)
    t = servidor(await estado(pg), 'trabajos')[0]
    comprobar(t['estadoProd'] == 'produccion' and t['cot']['num'] == 'COT-2026-001', 'aprobar la convierte en trabajo y conserva la cotización')
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
    await pg.click('.fab'); await pg.click('#sheet [data-a=nuevoT]')
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

async def main():
    nombres = sys.argv[1:] or list(PRUEBAS)
    async with async_playwright() as p:
        for n in nombres:
            print(n)
            await PRUEBAS[n](p)
    print('\nFallos:', comprobar.fallos)
    sys.exit(1 if comprobar.fallos else 0)

asyncio.run(main())
