// Cuentas para Mac: una ventana propia que abre la app web (misma base de datos que el iPhone).
// Los enlaces externos (WhatsApp, Google, Google Calendar) se abren en el navegador.
// Los PDF se guardan en Descargas y se muestran en el Finder.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::menu::{Menu, MenuItem, PredefinedMenuItem, Submenu};
use tauri::webview::{DownloadEvent, NewWindowResponse};
use tauri::{Manager, Url, WebviewUrl, WebviewWindowBuilder};
use tauri_plugin_opener::OpenerExt;

const APP_URL: &str = "https://josepayva.github.io/cuentas-produccion/";

fn es_de_la_app(u: &Url) -> bool {
    match u.scheme() {
        "https" => u.host_str() == Some("josepayva.github.io") && u.path().starts_with("/cuentas-produccion"),
        "about" | "blob" | "data" | "tauri" => true,
        _ => false,
    }
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            // Menú en español
            let recargar = MenuItem::with_id(app, "recargar", "Recargar", true, Some("CmdOrCtrl+R"))?;
            let menu = Menu::with_items(
                app,
                &[
                    &Submenu::with_items(
                        app,
                        "Cuentas",
                        true,
                        &[
                            &PredefinedMenuItem::about(app, Some("Acerca de Cuentas"), None)?,
                            &PredefinedMenuItem::separator(app)?,
                            &PredefinedMenuItem::hide(app, Some("Ocultar Cuentas"))?,
                            &PredefinedMenuItem::hide_others(app, Some("Ocultar otras"))?,
                            &PredefinedMenuItem::show_all(app, Some("Mostrar todo"))?,
                            &PredefinedMenuItem::separator(app)?,
                            &PredefinedMenuItem::quit(app, Some("Salir de Cuentas"))?,
                        ],
                    )?,
                    &Submenu::with_items(
                        app,
                        "Edición",
                        true,
                        &[
                            &PredefinedMenuItem::undo(app, Some("Deshacer"))?,
                            &PredefinedMenuItem::redo(app, Some("Rehacer"))?,
                            &PredefinedMenuItem::separator(app)?,
                            &PredefinedMenuItem::cut(app, Some("Cortar"))?,
                            &PredefinedMenuItem::copy(app, Some("Copiar"))?,
                            &PredefinedMenuItem::paste(app, Some("Pegar"))?,
                            &PredefinedMenuItem::select_all(app, Some("Seleccionar todo"))?,
                        ],
                    )?,
                    &Submenu::with_items(
                        app,
                        "Ver",
                        true,
                        &[&recargar, &PredefinedMenuItem::fullscreen(app, Some("Pantalla completa"))?],
                    )?,
                    &Submenu::with_items(
                        app,
                        "Ventana",
                        true,
                        &[
                            &PredefinedMenuItem::minimize(app, Some("Minimizar"))?,
                            &PredefinedMenuItem::maximize(app, Some("Zoom"))?,
                            &PredefinedMenuItem::close_window(app, Some("Cerrar ventana"))?,
                        ],
                    )?,
                ],
            )?;
            app.set_menu(menu)?;
            app.on_menu_event(|app, ev| {
                if ev.id().as_ref() == "recargar" {
                    if let Some(w) = app.get_webview_window("main") {
                        let _ = w.eval("location.reload()");
                    }
                }
            });

            let h_nav = app.handle().clone();
            let h_win = app.handle().clone();
            WebviewWindowBuilder::new(app, "main", WebviewUrl::External(APP_URL.parse().expect("dirección de la app")))
                .title("Cuentas")
                .inner_size(1280.0, 820.0)
                .min_inner_size(900.0, 600.0)
                .on_navigation(move |u| {
                    if es_de_la_app(u) {
                        true
                    } else {
                        let _ = h_nav.opener().open_url(u.as_str(), None::<&str>);
                        false
                    }
                })
                .on_new_window(move |u, _features| {
                    let _ = h_win.opener().open_url(u.as_str(), None::<&str>);
                    NewWindowResponse::Deny
                })
                .on_download(|_webview, ev| {
                    if let DownloadEvent::Finished { path: Some(p), success: true, .. } = ev {
                        let _ = std::process::Command::new("open").arg("-R").arg(p).spawn();
                    }
                    true
                })
                .build()?;
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("no se pudo iniciar Cuentas");
}
