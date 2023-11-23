import { FC, createContext, useEffect, useMemo, useRef, useState } from "react";

interface Context {
  selectedTool:
    | "cursor"
    | "arrow"
    | "draw"
    | "square"
    | "circle"
    | "triangle"
    | "text"
    | "picture"
    | "eraser";
  selectTool: (
    tool:
      | "cursor"
      | "arrow"
      | "draw"
      | "square"
      | "circle"
      | "triangle"
      | "text"
      | "picture"
      | "eraser"
  ) => void;
  lineSize: number;
  changeLineSize: (size: number) => void;
  fillColor: string;
  strokeColor: string;
  textColor: string;
  changeFillColor: (color: string) => void;
  changeStrokeColor: (color: string) => void;
  changeTextColor: (color: string) => void;
  canvasRef: any;
  setPos: (e: any) => void;
  draw: (e: any) => void;
  drawRectangle: (e: any) => void;
  drawCircle: (e: any) => void;
  drawTriangle: (e: any) => void;
  erase: (e: any) => void;
  removeAll: () => void;
}

export const ToolsContext = createContext<Context>({} as Context);

interface Provider {
  children: React.ReactNode;
}

export const ToolsProvider: FC<Provider> = ({ children }) => {
  // tools
  const [selectedTool, setSelectedTool] = useState<
    | "cursor"
    | "arrow"
    | "draw"
    | "square"
    | "circle"
    | "triangle"
    | "text"
    | "picture"
    | "eraser"
  >("cursor");

  // styles
  const [lineSize, setLineSize] = useState(8);

  // colors
  const [fillColor, setFillColor] = useState("#6b7280");
  const [strokeColor, setStrokeColor] = useState("#6b7280");
  const [textColor, setTextColor] = useState("#6b7280");

  // canvas
  const [mouseData, setMouseData] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<any>(null);
  const [canvasCTX, setCanvasCTX] = useState<any>(null);
  const [isDrawingArrow, setIsDrawingArrow] = useState(false);
  // tools actions

  const selectTool = (
    tool:
      | "cursor"
      | "arrow"
      | "draw"
      | "square"
      | "circle"
      | "triangle"
      | "text"
      | "picture"
      | "eraser"
  ) => {
    setSelectedTool(tool);
  };

  // styles actions

  const changeLineSize = (size: number) => {
    setLineSize(size);
  };

  // colors actions

  const changeFillColor = (color: string) => {
    setFillColor(color);
  };

  const changeStrokeColor = (color: string) => {
    setStrokeColor(color);
  };

  const changeTextColor = (color: string) => {
    setTextColor(color);
  };

  // canvas actions

  const setPos = (e: any) => {
    setMouseData({
      x: e.clientX,
      y: e.clientY,
    });
  };

  const draw = (e: any) => {
    if (e.buttons !== 1) return;
    const ctx = canvasCTX;
    ctx.globalCompositeOperation = "source-over";
    ctx.beginPath();
    ctx.moveTo(mouseData.x, mouseData.y);
    setMouseData({
      x: e.clientX,
      y: e.clientY,
    });
    ctx.lineTo(e.clientX, e.clientY);
    ctx.strokeStyle = fillColor;
    ctx.lineWidth = lineSize;
    ctx.lineCap = "round";
    ctx.stroke();
    // Свида Іван
  };

  const drawRectangle = (e: any) => {
    if (e.buttons !== 1) return;
    const ctx = canvasCTX;
    ctx.globalCompositeOperation = "source-over";
    ctx.beginPath();
    ctx.fillStyle = fillColor;
    ctx.fillRect(e.clientX, e.clientY, 20, 20);
  };

  const drawCircle = (e: any) => {
    if (e.buttons !== 1) return;
    const ctx = canvasCTX;
    ctx.globalCompositionOperation = "source-over";
    ctx.beginPath();
    ctx.fillStyle = fillColor;
    ctx.arc(e.clientX, e.clientY, 10, 0, 2 * Math.PI);
    ctx.fill();
  };

  const drawTriangle = (e: any) => {
    if (e.buttons !== 1) return;
    const ctx = canvasCTX;
    var path = new Path2D();
    path.moveTo(e.clientX + 10, e.clientY);
    path.lineTo(e.clientX, e.clientY - 15);
    path.lineTo(e.clientX - 10, e.clientY);
    ctx.fillStyle = fillColor;
    ctx.fill(path);
  };

  const erase = (e: any) => {
    if (e.buttons !== 1) return;
    const ctx = canvasCTX;
    ctx.beginPath();
    ctx.globalCompositeOperation = "destination-out";
    ctx.arc(e.clientX, e.clientY, 20, 0, Math.PI * 2);
    ctx.fill();
    // Свида Іван
  };

  const removeAll = () => {
    const ctx = canvasCTX;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    setCanvasCTX(ctx);
  }, [canvasRef]);

  const value = useMemo(
    () => ({
      selectedTool,
      selectTool,
      lineSize,
      changeLineSize,
      fillColor,
      strokeColor,
      textColor,
      changeFillColor,
      changeStrokeColor,
      changeTextColor,
      canvasRef,
      setPos,
      draw,
      drawRectangle,
      drawCircle,
      drawTriangle,
      erase,
      removeAll,
    }),
    [
      selectedTool,
      lineSize,
      fillColor,
      strokeColor,
      textColor,
      canvasRef,
      mouseData,
      isDrawingArrow,
    ]
  );

  return (
    <ToolsContext.Provider value={value}>{children}</ToolsContext.Provider>
  );
};
