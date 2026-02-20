import Scene from "./components/3d/Scene";
import EditorSidebar from "./components/editor/EditorSidebar";
import ControlBar from "./components/ui/ControlBar";

function App() {
  return (
    <div className="w-full h-full relative overflow-hidden">
      {/* 3D World — fills entire viewport */}
      <div className="absolute inset-0">
        <Scene />
      </div>

      {/* UI Controls (floating or dock) */}
      <ControlBar />

      {/* Editor Sidebar */}
      <EditorSidebar />
    </div>
  );
}

export default App;
