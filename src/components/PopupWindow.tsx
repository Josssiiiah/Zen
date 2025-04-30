import { invoke } from "@tauri-apps/api/core";
import { X } from "lucide-react";
import React from "react";

export default function PopupWindow() {
  // Ensure html and body are transparent for window transparency to work
  React.useEffect(() => {
    document.documentElement.style.background = "transparent";
    document.body.style.background = "transparent";
  }, []);

  return (
    <div
      // Use a semi-transparent background with blur, rounded corners, and border
      className="flex flex-col h-screen bg-slate-900/90 backdrop-blur-sm rounded-lg overflow-hidden border border-slate-700 text-slate-50 relative select-none"
    >
      {/* This invisible div fills the potential title bar area and is draggable */}
      <div
        data-tauri-drag-region
        className="absolute top-0 left-0 right-0 h-8 w-full cursor-move" // Ensure it covers the top area and indicates movability
      />

      {/* Close button positioned top-right */}
      <div className="absolute top-1.5 right-1.5 z-10">
        {" "}
        {/* Container for button */}
        <button
          onClick={() => invoke("close_popup_window").catch(console.error)}
          className="p-1 rounded-full text-slate-400 hover:text-slate-100 hover:bg-slate-700/50 focus:outline-none focus:ring-2 focus:ring-slate-500"
          aria-label="Close"
        >
          <X size={16} />
        </button>
      </div>

      {/* Content Area - Added padding top to avoid drag region/button */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 pt-10 text-center">
        <h2 className="text-lg font-semibold mb-2">Popup Window</h2>
        <p className="text-sm text-slate-400">
          This window should be transparent, rounded, resizable, and movable via
          the top bar.
        </p>
      </div>
    </div>
  );
}
