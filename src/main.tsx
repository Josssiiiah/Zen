import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { type } from "@tauri-apps/plugin-os";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";

import PopupWindow from "./components/PopupWindow"; // Adjusted path
import { getCurrentWindow } from "@tauri-apps/api/window";
// Assuming global styles are imported elsewhere or not needed for this minimal example
// import "./global.css";
// Assuming ThemeProvider is not strictly needed yet based on instructions
// import { ThemeProvider } from "./components/theme-provider";
// import { type Theme } from "@tauri-apps/api/window";

// Hide decorations here because it doesn't work in Rust for some reason (bug?)
const osType = type();
if (osType !== "macos") {
  await getCurrentWebviewWindow().setDecorations(false);
}

const Main = () => {
  // const [theme, setTheme] = useState<Theme>("system"); // Theme handling deferred
  const [isPopup, setIsPopup] = useState(false);

  useEffect(() => {
    const win = getCurrentWindow();
    // pick up the OS/window theme - deferred
    // win.theme().then((t) => setTheme(t as Theme));
    // check your label (set by Tauri on creation)
    setIsPopup(win.label === "popup");
  }, []);

  // Render based on label, wrapping with ThemeProvider if/when needed
  // return (
  //   <ThemeProvider defaultTheme="system">
  //     {isPopup ? <PopupWindow /> : <App />}
  //   </ThemeProvider>
  // );

  return isPopup ? <PopupWindow /> : <App />;
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Main />
  </React.StrictMode>
);
