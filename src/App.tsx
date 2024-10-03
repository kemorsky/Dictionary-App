import "./App.css";
import { useState, useEffect } from "react";
import GetWords from "./components/GetWords";
import image from "./assets/image.png";

function App() {
  const [darkMode, setDarkMode] = useState("light");

  useEffect(() => {
    // SETUP DARK MODE AS THE PREFERRED MODE IF THE USER HAS THAT SETTING IN THEIR BROWSER
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setDarkMode("dark");
    }
  }, []);

  useEffect(() => {
    // MAIN PART OF SWITCHING BETWEEN THE TWO MODES
    if (darkMode === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const handleSwitch = () => {
    // LIGHT/DARK MODE SWITCH
    setDarkMode(darkMode === "light" ? "dark" : "light");
  };

  return (
    <>
      <main className="mind-w-lg bg-gray-200 dark:bg-gray-800 p-4 border rounded-xl grid grid-cols-1">
        <img
          className="w-12 justify-self-end"
          onClick={handleSwitch}
          src={image}
          alt="swap"
        />
        <h1 className="text-black dark:text-white">Dictionary</h1>
        <GetWords />
      </main>
    </>
  );
}

export default App;
