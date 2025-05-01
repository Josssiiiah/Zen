use tauri::{AppHandle, Manager, Result, Runtime, Size, Position, Theme, WebviewUrl};
use window_vibrancy::{apply_blur, apply_vibrancy, NSVisualEffectMaterial};

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
        let builder = tauri::WebviewWindowBuilder::new(&app, "popup", WebviewUrl::App("popup.html".into()))
            .title("Popup Window")
            .inner_size(400.0, 300.0)
            .position(100.0, 100.0)
            .transparent(true) // Enable transparency just for the popup
            .decorations(false)
            .resizable(true)
            .skip_taskbar(true)
            .focused(true)
            .always_on_top(true); // Ensure popup stays on top

        // Create the window
        let window = builder.build()?;
        
        // Apply platform-specific vibrancy effects
        #[cfg(target_os = "macos")]
        {
            apply_vibrancy(&window, NSVisualEffectMaterial::HudWindow, None, None)
                .expect("Failed to apply vibrancy effect on macOS");
        }
        
        #[cfg(target_os = "windows")]
        {
            apply_blur(&window, Some((18, 18, 18, 125)))
                .expect("Failed to apply blur effect on Windows");
        }
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
