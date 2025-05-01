import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import Sidebar from "./components/Sidebar";
import GameArea from "./components/GameArea";

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  const onCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  const onToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-100 flex">
      {/* Sidebar */}
      <div
        className={`fixed h-full bg-zinc-800 transition-all duration-300 ease-in-out z-50 w-64 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar
          currentLevel={currentLevel}
          setCurrentLevel={setCurrentLevel}
          isMuted={isMuted}
          setIsMuted={setIsMuted}
          onClose={onCloseSidebar}
        />
      </div>

      {/* Main Content */}
      <div
        className={
          "flex-1 transition-all duration-300 ease-in-out" +
          (isSidebarOpen ? " ml-64" : "")
        }
      >
        <button
          onClick={onToggleSidebar}
          className={`fixed top-4 left-4 z-50 p-2 bg-zinc-700 rounded-md hover:bg-zinc-600 transition-all duration-500 ease-in-out ${
            !isSidebarOpen ? "translate-x-0" : "-translate-x-24"
          }`}
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <main className="container mx-auto px-4 py-8">
          <GameArea level={currentLevel} isMuted={isMuted} />
        </main>
      </div>
    </div>
  );
}

export default App;
