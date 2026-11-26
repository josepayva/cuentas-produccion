"""Arma index.html a partir de src/ y actualiza la versión del service worker.
Uso (desde la raíz del repositorio):  python3 src/build.py"""
import hashlib, pathlib, re

RAIZ = pathlib.Path(__file__).resolve().parent.parent
src = RAIZ / 'src'
plantilla = (src / 'plantilla.html').read_text()
css = (src / 'estilos.css').read_text()
js = (src / 'app.js').read_text()

assert '/*ESTILOS*/' in plantilla and '//APP' in plantilla, 'faltan marcadores en plantilla.html'
html = plantilla.replace('\n/*ESTILOS*/\n', css, 1).replace('<script>\n//APP\n</script>', '<script>\n' + js + '</script>', 1)
(RAIZ / 'index.html').write_text(html)

# Versión del service worker = huella de los archivos de la app (así cada cambio se descarga solo)
huella = hashlib.sha256()
for f in ['index.html', 'plataforma.js', 'manifest.webmanifest']:
    huella.update((RAIZ / f).read_bytes())
sw = RAIZ / 'sw.js'
txt = sw.read_text()
txt = re.sub(r"const VERSION = '[^']*';", f"const VERSION = 'cuentas-{huella.hexdigest()[:10]}';", txt, count=1)
sw.write_text(txt)
print('index.html', len(html), 'bytes ·', re.search(r"const VERSION = '([^']*)'", txt).group(1))
