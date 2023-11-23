import { FC } from "react";
import ToolBar from "./components/toolbar/ToolBar";
import ToolBarColors from "./components/toolbar-colors/ToolBarColors";
import UkraineMap from "./components/map/UkraineMap";
import ToolBarStyles from "./components/toolbar-styles/ToolBarStyles";
import { useTools } from "./hooks/useTools";

const App: FC = () => {
  const {
    selectedTool,
    canvasRef,
    setPos,
    draw,
    drawRectangle,
    drawCircle,
    drawTriangle,
    erase,
  } = useTools();

  return (
    <div>
      <div className="flex">
        <div className="z-10">
          <ToolBar />
          <ToolBarStyles />
          <ToolBarColors />
        </div>
        <UkraineMap />
        {selectedTool === "draw" ? (
          <canvas
            className="absolute"
            ref={canvasRef}
            onMouseEnter={(e) => setPos(e)}
            onMouseMove={(e) => setPos(e)}
            onMouseDown={(e) => setPos(e)}
            onMouseMoveCapture={(e) => draw(e)}
          ></canvas>
        ) : selectedTool === "eraser" ? (
          <canvas
            className="absolute"
            ref={canvasRef}
            onMouseEnter={(e) => setPos(e)}
            onMouseMove={(e) => setPos(e)}
            onMouseDown={(e) => setPos(e)}
            onMouseMoveCapture={(e) => erase(e)}
          ></canvas>
        ) : selectedTool === "square" ? (
          <canvas
            className="absolute"
            ref={canvasRef}
            onMouseDown={(e) => drawRectangle(e)}
          ></canvas>
        ) : selectedTool === "circle" ? (
          <canvas
            className="absolute"
            ref={canvasRef}
            onMouseDown={(e) => drawCircle(e)}
          ></canvas>
        ) : selectedTool === "triangle" ? (
          <canvas
            className="absolute"
            ref={canvasRef}
            onMouseDown={(e) => drawTriangle(e)}
          ></canvas>
        ) : (
          <canvas className="absolute" ref={canvasRef}></canvas>
        )}
      </div>
    </div>
  );
};

export default App;
