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

async def nueva(p, **kw):
    b = await p.chromium.launch()
    ctx = await b.new_context(viewport=kw.pop('viewport', {'width': 390, 'height': 844}), device_scale_factor=2, color_scheme='dark', accept_downloads=True, **kw)
    await ctx.route('http://localhost:8765/**', servir)
    pg = await ctx.new_page()
    pg.errores = []
    pg.on('pageerror', lambda e: pg.errores.append(str(e)))
    await pg.goto(URL)
    await pg.evaluate("localStorage.clear();localStorage.setItem('cp-rec-copia',new Date().toISOString().slice(0,10))")
    await pg.goto(URL)
    await pg.wait_for_timeout(400)
    await pg.click('#lgm'); await pg.fill('#lge', 'a@b.com'); await pg.fill('#lgp', 'clave1234'); await pg.fill('#lgp2', 'clave1234')
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

async def main():
    nombres = sys.argv[1:] or list(PRUEBAS)
    async with async_playwright() as p:
        for n in nombres:
            print(n)
            await PRUEBAS[n](p)
    print('\nFallos:', comprobar.fallos)
    sys.exit(1 if comprobar.fallos else 0)

asyncio.run(main())
