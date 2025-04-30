use tauri::{AppHandle, Manager, Result, Runtime};

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
async fn open_popup_window<R: Runtime>(app: AppHandle<R>) -> Result<()> {
    // Check if the window already exists
    if let Some(window) = app.get_webview_window("popup") {
        // If it exists, bring it to the front
        window.set_focus()?;
    } else {
        // If it doesn't exist, create it
        let builder = tauri::WebviewWindowBuilder::new(&app, "popup", tauri::WebviewUrl::App("index.html".into()))
            .title("Popup Window")
            .decorations(false)
            .inner_size(400.0, 250.0) // Adjust size as needed
            .position(100.0, 100.0) // Optional: Set initial position
            .resizable(true)
            .always_on_top(true)
            .focused(true);

        #[cfg(target_os = "macos")]
        let builder = builder
            .hidden_title(true) // Necessary for TitleBarStyle::Overlay to work well
            .title_bar_style(tauri::TitleBarStyle::Overlay);

        #[cfg(not(target_os = "macos"))]
        let builder = builder.decorations(false);

        builder.build()?;
    }
    Ok(())
}

#[tauri::command]
async fn close_popup_window<R: Runtime>(app: AppHandle<R>) -> Result<()> {
    if let Some(window) = app.get_webview_window("popup") {
        window.close()?;
    }
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_os::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            open_popup_window,
            close_popup_window
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
