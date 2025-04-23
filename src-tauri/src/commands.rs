// src-tauri/src/commands.rs
use tauri::{Manager, WebviewUrl, WebviewWindowBuilder, TitleBarStyle};

#[tauri::command]
pub fn open_popup_window(app: tauri::AppHandle) -> Result<(), String> {
    let main = app
        .get_webview_window("main")
        .ok_or_else(|| "Main window not found".to_string())?;
    let pos = main.outer_position().map_err(|e| e.to_string())?;
    let sz  = main.outer_size().map_err(|e| e.to_string())?;

    let w = 450.0;
    let h = 350.0;
    let x = pos.x as f64 + (sz.width as f64  - w) / 2.0;
    let y = pos.y as f64 + sz.height as f64 + 5.0; // Position below the main window

    if let Some(popup) = app.get_webview_window("popup") {
        // If popup exists, bring it to focus instead of creating a new one
        popup.set_focus().map_err(|e| e.to_string())?;
    } else {
        // Only create if it doesn't exist
        let app_clone = app.clone(); // Clone app handle for async block
        tauri::async_runtime::spawn(async move {
            let window_builder = WebviewWindowBuilder::new(
                &app_clone,
                "popup",                             // window label
                WebviewUrl::App("index.html".into()), // load same bundle
            )
            .title("Popup Window")
            .hidden_title(true)
            .title_bar_style(TitleBarStyle::Transparent)
            .transparent(true)
            .decorations(false)  // Explicitly remove all window decorations
            .shadow(false)
            .resizable(false)
            .inner_size(w, h)
            .position(x, y)
            .always_on_top(true)
            .focused(true);
            
            let result = window_builder.build();

            if let Err(e) = result {
                 // Log the error if window creation fails
                eprintln!("Failed to build popup window: {}", e);
            }
        });
    }
    Ok(())
}

#[tauri::command]
pub fn close_popup_window(app: tauri::AppHandle) -> Result<(), String> {
    if let Some(popup) = app.get_webview_window("popup") {
        popup.close().map_err(|e| e.to_string())?;
    }
    // It's okay if the window doesn't exist, maybe it was already closed.
    Ok(())
} 