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
  fontSize: number;
  changeFontSize: (size: number) => void;
  strokeSize: number;
  changeStrokeSize: (size: number) => void;
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
  selectShape: (e: any) => void;
  moveShape: (e: any) => void;
  addText: (e: any) => void;
  selectText: (e: any) => void;
  moveText: (e: any) => void;
  uploadImage: (e: any) => void;
  selectImage: (e: any) => void;
  moveImage: (e: any) => void;
  erase: (e: any) => void;
  eraseSize: number;
  changeEraseSize: (size: number) => void;
  removeAll: () => void;
}

export const ToolsContext = createContext<Context>({} as Context);

interface Provider {
  children: React.ReactNode;
}

interface DrawnPath {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  color: string;
  lineSize: number;
}

interface Shape {
  type: "rectangle" | "circle" | "triangle";
  width: number;
  height: number;
  color: string;
  strokeColor: string;
  strokeSize: number;
  coords: { x: number; y: number };
}

interface Text {
  content: string;
  size: number;
  color: string;
  coords: { x: number; y: number };
}

interface Image {
  img: any;
  coords: { x: number; y: number };
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
  const [strokeSize, setStorkeSize] = useState(1);
  const [fontSize, setFontSize] = useState(16);
  const [eraseSize, setEraseSize] = useState(12);

  // colors
  const [fillColor, setFillColor] = useState("#6b7280");
  const [strokeColor, setStrokeColor] = useState("#6b7280");
  const [textColor, setTextColor] = useState("#6b7280");

  // canvas
  const [mouseData, setMouseData] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<any>(null);
  const [canvasCTX, setCanvasCTX] = useState<any>(null);

  const [drawnPaths, setDrawnPaths] = useState<Array<DrawnPath>>([]);

  const [shapes, setShapes] = useState<Array<Shape>>([]);
  const [selectedShape, setSelectedShape] = useState<number | null>(null);
  const [isMovingShape, setIsMovingShape] = useState(false);

  const [textes, setTextes] = useState<Array<Text>>([]);
  const [selectedText, setSelectedText] = useState<number | null>(null);
  const [isMovingText, setIsMovingText] = useState(false);

  const [images, setImages] = useState<Array<Image>>([]);
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [isMovingImage, setIsMovingImage] = useState(false);

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

  const changeStrokeSize = (size: number) => {
    setStorkeSize(size);
  };

  const changeFontSize = (size: number) => {
    setFontSize(size);
  };

  const changeEraseSize = (size: number) => {
    setEraseSize(size);
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
    drawnPaths.push({
      startX: mouseData.x,
      startY: mouseData.y,
      endX: e.clientX,
      endY: e.clientY,
      color: fillColor,
      lineSize: lineSize,
    });
    setDrawnPaths([...drawnPaths]);
  };

  const renderDrawnPaths = () => {
    if (drawnPaths.length > 0) {
      const ctx = canvasCTX;
      ctx.globalCompositeOperation = "source-over";
      drawnPaths.map((path: DrawnPath) => {
        ctx.beginPath();
        ctx.moveTo(path.startX, path.startY);
        ctx.lineTo(path.endX, path.endY);
        ctx.strokeStyle = path.color;
        ctx.lineWidth = path.lineSize;
        ctx.lineCap = "round";
        ctx.stroke();
      });
    }
  };

  const drawRectangle = (e: any) => {
    shapes.push({
      type: "rectangle",
      width: 20,
      height: 20,
      color: fillColor,
      strokeColor: strokeColor,
      strokeSize: strokeSize,
      coords: {
        x: e.clientX,
        y: e.clientY,
      },
    });
    setShapes([...shapes]);
  };

  const drawCircle = (e: any) => {
    shapes.push({
      type: "circle",
      width: 20,
      height: 20,
      color: fillColor,
      strokeColor: strokeColor,
      strokeSize: strokeSize,
      coords: {
        x: e.clientX,
        y: e.clientY,
      },
    });
    setShapes([...shapes]);
  };

  const drawTriangle = (e: any) => {
    shapes.push({
      type: "triangle",
      width: 20,
      height: 20,
      color: fillColor,
      strokeColor: strokeColor,
      strokeSize: strokeSize,
      coords: {
        x: e.clientX,
        y: e.clientY,
      },
    });
    setShapes([...shapes]);
  };

  const renderShapes = () => {
    if (shapes.length > 0) {
      const ctx = canvasCTX;
      ctx.globalCompositeOperation = "source-over";
      shapes.map((shp: Shape) => {
        if (shp.type === "rectangle") {
          ctx.fillStyle = shp.color;
          ctx.strokeStyle = shp.strokeColor;
          ctx.lineWidth = shp.strokeSize;
          ctx.beginPath();
          ctx.rect(shp.coords.x, shp.coords.y, shp.width, shp.height);
          ctx.fill();
          ctx.stroke();
        } else if (shp.type === "circle") {
          ctx.fillStyle = shp.color;
          ctx.strokeStyle = shp.strokeColor;
          ctx.lineWidth = shp.strokeSize;
          ctx.beginPath();
          ctx.arc(shp.coords.x, shp.coords.y, 10, 0, 2 * Math.PI);
          ctx.fill();
          ctx.stroke();
        } else if (shp.type === "triangle") {
          ctx.fillStyle = shp.color;
          ctx.strokeStyle = shp.strokeColor;
          ctx.lineWidth = shp.strokeSize;
          var path = new Path2D();
          path.moveTo(shp.coords.x + shp.width, shp.coords.y);
          path.lineTo(shp.coords.x, shp.coords.y - shp.height);
          path.lineTo(shp.coords.x - shp.width, shp.coords.y);
          ctx.fill(path);
          ctx.stroke(path);
        }
      });
    }
  };

  const selectShape = (e: any) => {
    if (isMovingShape === false) {
      shapes.map((shp: Shape, idx: number) => {
        const shpX = shp.coords.x;
        const shpY = shp.type === "triangle" ? shp.coords.y - 20 : shp.coords.y;
        const shpWidth = 20;
        const shpHeight = 20;

        if (
          e.clientX >= shpX &&
          e.clientX <= shpX + shpWidth &&
          e.clientY >= shpY &&
          e.clientY <= shpY + shpHeight
        ) {
          setSelectedShape(idx);
        }
      });
    } else {
      setSelectedShape(null);
      setIsMovingShape(false);
    }
  };

  const moveShape = (e: any) => {
    if (selectedShape !== null) {
      setIsMovingShape(true);
      shapes[selectedShape] = {
        type: shapes[selectedShape].type,
        width: shapes[selectedShape].width,
        height: shapes[selectedShape].height,
        color: shapes[selectedShape].color,
        strokeColor: shapes[selectedShape].strokeColor,
        strokeSize: shapes[selectedShape].strokeSize,
        coords: {
          x: e.clientX,
          y: e.clientY,
        },
      };
      setShapes([...shapes]);
    }
  };

  const addText = (e: any) => {
    const userText = prompt("Введіть текст: ");
    if (userText) {
      textes.push({
        content: userText,
        size: fontSize,
        color: textColor,
        coords: {
          x: e.clientX,
          y: e.clientY,
        },
      });
      setTextes([...textes]);
    }
  };

  const renderTextes = () => {
    if (textes.length > 0) {
      const ctx = canvasCTX;
      textes.map((txt: Text) => {
        ctx.font = `${txt.size}px Arial`;
        ctx.fillStyle = txt.color;
        ctx.fillText(txt.content, txt.coords.x, txt.coords.y);
      });
    }
  };

  const selectText = (e: any) => {
    if (isMovingText === false) {
      textes.map((txt: Text, idx: number) => {
        const txtX = txt.coords.x;
        const txtY = txt.coords.y;
        const txtWidth = txt.size;
        const txtHeight = txt.size;

        if (
          e.clientX >= txtX &&
          e.clientX <= txtX + txtWidth &&
          e.clientY >= txtY &&
          e.clientY <= txtY + txtHeight
        ) {
          setSelectedText(idx);
        }
      });
    } else {
      setSelectedText(null);
      setIsMovingText(false);
    }
  };

  const moveText = (e: any) => {
    if (selectedText !== null) {
      setIsMovingText(true);
      textes[selectedText] = {
        content: textes[selectedText].content,
        size: textes[selectedText].size,
        color: textes[selectedText].color,
        coords: {
          x: e.clientX,
          y: e.clientY,
        },
      };
      setTextes([...textes]);
    }
  };

  const uploadImage = (e: any) => {
    const ctx = canvasCTX;
    ctx.globalCompositionOperation = "source-over";
    const file = e.target.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = function (e: any) {
        const img = new Image();
        img.onload = function () {
          images.push({ img: img, coords: { x: 150, y: 150 } });
          setImages([...images]);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const renderImages = () => {
    if (images.length > 0) {
      const ctx = canvasCTX;
      ctx.globalCompositionOperation = "source-over";

      images.map((img: Image) => {
        ctx.drawImage(img.img, img.coords.x, img.coords.y);
      });
    }
  };

  const selectImage = (e: any) => {
    if (isMovingImage === false) {
      images.map((img: Image, idx: number) => {
        const imgX = img.coords.x;
        const imgY = img.coords.y;
        const imgWidth = img.img.width;
        const imgHeight = img.img.height;

        if (
          e.clientX >= imgX &&
          e.clientX <= imgX + imgWidth &&
          e.clientY >= imgY &&
          e.clientY <= imgY + imgHeight
        ) {
          setSelectedImage(idx);
        }
      });
    } else {
      setSelectedImage(null);
      setIsMovingImage(false);
    }
  };

  const moveImage = (e: any) => {
    if (selectedImage !== null) {
      setIsMovingImage(true);
      images[selectedImage] = {
        img: images[selectedImage].img,
        coords: {
          x: e.clientX,
          y: e.clientY,
        },
      };
      setImages([...images]);
    }
  };

  const erase = (e: any) => {
    // if (e.buttons !== 1) return;
    // const ctx = canvasCTX;
    // ctx.beginPath();
    // ctx.globalCompositeOperation = "destination-out";
    // ctx.arc(e.clientX, e.clientY, 20, 0, Math.PI * 2);
    // ctx.fill();
    if (e.buttons !== 1) return;
    const ctx = canvasCTX;
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.moveTo(mouseData.x, mouseData.y);
    setMouseData({
      x: e.clientX,
      y: e.clientY,
    });
    ctx.lineTo(e.clientX, e.clientY);
    ctx.lineWidth = eraseSize;
    ctx.lineCap = "round";
    ctx.stroke();
  };

  const removeAll = () => {
    const ctx = canvasCTX;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setDrawnPaths([]);
    setSelectedShape(null);
    setShapes([]);
    setTextes([]);
    setSelectedImage(null);
    setImages([]);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    setCanvasCTX(ctx);

    renderImages();
    renderDrawnPaths();
    renderShapes();
    renderTextes();
  }, [canvasRef, drawnPaths, shapes, textes, images]);

  const value = useMemo(
    () => ({
      selectedTool,
      selectTool,
      lineSize,
      changeLineSize,
      fontSize,
      changeFontSize,
      strokeSize,
      changeStrokeSize,
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
      selectShape,
      moveShape,
      addText,
      selectText,
      moveText,
      uploadImage,
      selectImage,
      moveImage,
      erase,
      eraseSize,
      changeEraseSize,
      removeAll,
    }),
    [
      selectedTool,
      lineSize,
      fontSize,
      strokeSize,
      eraseSize,
      fillColor,
      strokeColor,
      textColor,
      canvasRef,
      mouseData,
      textes,
      selectedText,
      isMovingText,
      shapes,
      selectedShape,
      isMovingShape,
      images,
      selectedImage,
      isMovingImage,
    ]
  );

  return (
    <ToolsContext.Provider value={value}>{children}</ToolsContext.Provider>
  );
};
