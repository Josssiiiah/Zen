import { invoke } from "@tauri-apps/api/core";
// Removed useState as greetMsg and name are no longer used
// import { useState } from "react";
import "./App.css";
import { Button } from "./components/ui/button";

function App() {
  // Removed unused state and greet function
  // const [greetMsg, setGreetMsg] = useState("");
  // const [name, setName] = useState("");
  //
  // async function greet() {
  //   // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
  //   setGreetMsg(await invoke("greet", { name }));
  // }

  const openPopup = () => {
    invoke("open_popup_window").catch(console.error);
  };

  return (
    <main className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-2xl font-bold mb-4">Welcome to Tauri + React</h1>
      <p className="text-muted-foreground mb-6">
        Click the button below to open a transparent, rounded popup window.
      </p>

      {/* Removed the form */}
      {/* <form
        className="row"
        onSubmit={(e) => {
          e.preventDefault();
          greet();
        }}
      >
        <input
          id="greet-input"
          onChange={(e) => setName(e.currentTarget.value)}
          placeholder="Enter a name..."
        />
        <button type="submit">Greet</button>
      </form>
      <p>{greetMsg}</p> */}

      {/* Added button to open popup */}
      <Button onClick={openPopup} className="bg-primary hover:bg-primary/90">
        Open Transparent Popup
      </Button>
    </main>
  );
}

export default App;
