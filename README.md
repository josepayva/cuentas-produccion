# Cuentas de producción

App para llevar las cobranzas, gastos y rodajes de los trabajos de producción (videoclips).

- **iPhone:** abre la app en Safari → Compartir → *Agregar a pantalla de inicio*.
- **Mac:** app de escritorio (Tauri) que abre esta misma página.
- **Datos:** Supabase (proyecto `cuentas-produccion`, São Paulo). Cada fila está protegida por usuario (RLS); en este repositorio no hay contraseñas, solo la clave publicable.

## Cómo hacer cambios
1. Edita los archivos de `src/` (`app.js`, `estilos.css`, `plantilla.html`).
2. Arma la app: `python3 src/build.py` (genera `index.html` y actualiza la versión de `sw.js`).
3. Prueba: `python3 tests/probar.py` (Playwright con un Supabase simulado).
4. Sube a `main`: GitHub Pages la publica en 1–2 minutos.

## Archivos
- `src/` — código fuente de la app.
- `index.html` — la app armada (no editar a mano).
- `tests/` — pruebas automáticas.
- `plataforma.js` — inicio de sesión con correo y contraseña, conexión con Supabase y descargas.
- `sw.js`, `manifest.webmanifest`, `icons/` — app instalable.
- `vendor/` — supabase-js 2 y jsPDF 2.5.1.
- `.github/workflows/mantener-activo.yml` — evita la pausa de Supabase por inactividad.
