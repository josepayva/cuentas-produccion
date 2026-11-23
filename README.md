# Cuentas de producción

App para llevar las cobranzas, gastos y rodajes de los trabajos de producción (videoclips).

- **iPhone:** abre la app en Safari → Compartir → *Agregar a pantalla de inicio*.
- **Mac:** app de escritorio (Tauri) que abre esta misma página.
- **Datos:** Supabase (proyecto `cuentas-produccion`, São Paulo). Cada fila está protegida por usuario (RLS); en este repositorio no hay contraseñas, solo la clave publicable.

## Archivos
- `index.html` — la app.
- `plataforma.js` — inicio de sesión con correo y contraseña, conexión con Supabase y descargas.
- `sw.js`, `manifest.webmanifest`, `icons/` — app instalable.
- `vendor/` — supabase-js 2 y jsPDF 2.5.1.
- `.github/workflows/mantener-activo.yml` — evita la pausa de Supabase por inactividad.
