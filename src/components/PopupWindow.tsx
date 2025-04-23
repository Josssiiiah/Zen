import { invoke } from "@tauri-apps/api/core";
import { X } from "lucide-react";

export default function PopupWindow() {
  return (
    <div
      className="fixed inset-0 bg-red-500 p-2 rounded-2xl"
      style={{ paddingTop: 32 }}
    >
      {/* This invisible div fills the macOS title bar area */}
      <div
        data-tauri-drag-region
        className="absolute top-0 left-0 right-0 h-8"
        style={{ WebkitAppRegion: "drag" } as React.CSSProperties}
      />

      <div className="flex justify-between items-center pb-2">
        <div className="text-sm font-medium">Popup Window</div>
        <button
          onClick={() => invoke("close_popup_window").catch(console.error)}
          className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">
          Popup Content - Closes only when you press the X button.
        </p>
      </div>
    </div>
  );
}
