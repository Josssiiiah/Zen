import { invoke } from "@tauri-apps/api/core";
// Removed useState as greetMsg and name are no longer used
// import { useState } from "react";
import "./App.css";

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
    <main className="container">
      <h1 className="text-xl">Welcome to Tauri + React</h1>
      <p>Click the button below to open the popup.</p>

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
      <button onClick={openPopup}>Open Popup</button>
    </main>
  );
}

export default App;
