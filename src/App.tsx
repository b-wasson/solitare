import { useState } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";
import IntroScreen from "./components/ui/IntroScreen";
import tailwindcss from "@tailwindcss/vite";


function App() {

return <IntroScreen onPlay={() => console.log("deal!")} />;

}

export default App;
