import { invoke } from "@tauri-apps/api/core";
import { X } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";

export default function PopupWindow() {
  return (
    <div
      className="fixed inset-0 p-6"
      style={{
        paddingTop: 32,
        height: "100%",
        width: "100%",
      }}
    >
      {/* This invisible div fills the title bar area and enables window dragging */}
      <div
        data-tauri-drag-region
        className="absolute top-0 left-0 right-0 h-8"
        style={{ WebkitAppRegion: "drag" } as React.CSSProperties}
      />

      <div className="flex justify-between items-center pb-4">
        <div className="text-sm font-medium text-foreground">Popup Window</div>
        <Button
          onClick={() => invoke("close_popup_window").catch(console.error)}
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-full"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
      </div>

      <Card className="bg-card/30 backdrop-blur-sm border border-border/50">
        <CardHeader>
          <CardTitle>Transparent Popup</CardTitle>
          <CardDescription>
            A beautifully styled popup with transparency and vibrancy
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This popup window uses the window-vibrancy crate to create a
            beautiful backdrop effect. It has rounded corners, stays on top of
            other windows, and supports transparency effects on both macOS and
            Windows.
          </p>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            className="bg-primary/10 hover:bg-primary/20 transition-colors"
          >
            Action Button
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
