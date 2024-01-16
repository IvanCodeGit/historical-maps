import { FC, useEffect, useLayoutEffect, useRef, useState } from "react";
import rough from "roughjs";
import {
  CornerUpLeft,
  CornerUpRight,
  Edit2,
  Edit3,
  Grid,
  MousePointer,
  Square,
  Trash2,
  Type,
} from "react-feather";
import { RoughCanvas } from "roughjs/bin/canvas";
import getStroke from "perfect-freehand";
import { Sketch } from "@uiw/react-color";
import UkraineMap from "./components/UkraineMap";

import Vynychenko from "./assets/portraits/Vynnychenko.jpg";
import Petlura from "./assets/portraits/Petlura.jpg";
import Bolbachan from "./assets/portraits/Bolbochan.jpg";
import Skoropadsky from "./assets/portraits/Skoropadsky.jpg";
import Nestor from "./assets/portraits/Nestor.jpg";
import Hryhorjev from "./assets/portraits/Hryhorjev.jpg";
import Denikin from "./assets/portraits/Denikin.jpg";
import Wrangel from "./assets/portraits/Wrangel.jpg";
import Vitovsky from "./assets/portraits/Vitovsky.jpg";
import Petrushevych from "./assets/portraits/Petrushevych.jpg";
import Kociubynskiy from "./assets/portraits/Kociubynskiy.jpg";
import Bezruczko from "./assets/portraits/Bezruczko.jpg";
import Konovalec from "./assets/portraits/Konovalec.png";

const generator = rough.generator();

const nearPoint = (
  x: number,
  y: number,
  x1: number,
  y1: number,
  name: string,
) => {
  return Math.abs(x - x1) < 5 && Math.abs(y - y1) < 5 ? name : null;
};

const onLine = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  x: number,
  y: number,
  maxDistance = 1,
) => {
  const a = { x: x1, y: y1 };
  const b = { x: x2, y: y2 };
  const c = { x, y };
  const offset = distance(a, b) - (distance(a, c) + distance(b, c));
  return Math.abs(offset) < maxDistance ? "inside" : null;
};

const positionWithElement = (x: number, y: number, element: any) => {
  const { type, x1, x2, y1, y2 } = element;
  const topLeft = nearPoint(x, y, x1, y1, "tl");
  const topRight = nearPoint(x, y, x2, y1, "tr");
  const bottomLeft = nearPoint(x, y, x1, y2, "bl");
  const bottomRight = nearPoint(x, y, x2, y2, "br");
  const inside = x >= x1 && x <= x2 && y >= y1 && y <= y2 ? "inside" : null;
  switch (type) {
    case "line":
      const on = onLine(x1, y1, x2, y2, x, y);
      const start = nearPoint(x, y, x1, y1, "start");
      const end = nearPoint(x, y, x2, y2, "end");
      return start || end || on;
    case "rectangle":
      return topLeft || topRight || bottomLeft || bottomRight || inside;
    case "pencil":
      const betweenAnyPoint = element.points.some((point: any, idx: number) => {
        const nextPoint = element.points[idx + 1];
        if (!nextPoint) return false;
        return (
          onLine(point.x, point.y, nextPoint.x, nextPoint.y, x, y, 5) != null
        );
      });
      return betweenAnyPoint ? "inside" : null;
    case "text":
      return x >= x1 && x <= x2 && y >= y1 && y <= y2 ? "inside" : null;
    case "image":
      return topLeft || topRight || bottomLeft || bottomRight || inside;
    default:
      throw new Error(`Type not recognised: ${type}`);
  }
};

const distance = (a: { x: number; y: number }, b: { x: number; y: number }) =>
  Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));

const getElementAtPosition = (x: number, y: number, elements: any) => {
  return elements
    .map((element: any) => ({
      ...element,
      position: positionWithElement(x, y, element),
    }))
    .find((element: any) => element.position !== null);
};

const adjustElementCoordinates = (element: any) => {
  const { type, x1, y1, x2, y2 } = element;
  if (type === "rectangle") {
    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);
    const minY = Math.min(y1, y2);
    const maxY = Math.max(y1, y2);
    return { x1: minX, y1: minY, x2: maxX, y2: maxY };
  } else {
    if (x1 < x2 || (x1 === x2 && y1 < y2)) {
      return { x1, y1, x2, y2 };
    } else {
      return { x1: x2, y1: y2, x2: x1, y2: y1 };
    }
  }
};

const cursorForPosition = (position: string) => {
  switch (position) {
    case "tl":
    case "br":
    case "start":
    case "end":
      return "nwse-resize";
    case "tr":
    case "bl":
      return "nesw-resize";
    default:
      return "move";
  }
};

const resizedCoordinates = (
  clientX: number,
  clientY: number,
  position: string,
  coordinates: { x1: number; y1: number; x2: number; y2: number },
) => {
  const { x1, y1, x2, y2 } = coordinates;
  switch (position) {
    case "tl":
    case "start":
      return { x1: clientX, y1: clientY, x2, y2 };
    case "tr":
      return { x1, y1: clientY, x2: clientX, y2 };
    case "bl":
      return { x1: clientX, y1, x2, y2: clientY };
    case "br":
    case "end":
      return { x1, y1, x2: clientX, y2: clientY };
    default:
      return { x1, y1, x2, y2 };
  }
};

const useHistory = (initialState: any) => {
  const [index, setIndex] = useState(0);
  const [history, setHistory] = useState([initialState]);

  const setState = (action: any, overwrite = false) => {
    const newState =
      typeof action === "function" ? action(history[index]) : action;
    if (overwrite) {
      const historyCopy = [...history];
      historyCopy[index] = newState;
      setHistory(historyCopy);
    } else {
      const updateState = [...history].slice(0, index + 1);
      setHistory([...updateState, newState]);
      setIndex((prev) => prev + 1);
    }
  };

  const undo = () => index > 0 && setIndex((prev) => prev - 1);
  const redo = () => index < history.length - 1 && setIndex((prev) => prev + 1);

  return [history[index], setState, undo, redo];
};

const getSvgPathFromStroke = (stroke: any) => {
  if (!stroke.length) return "";

  const d = stroke.reduce(
    (acc: any, [x0, y0]: any, i: any, arr: any) => {
      const [x1, y1] = arr[(i + 1) % arr.length];
      acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
      return acc;
    },
    ["M", ...stroke[0], "Q"],
  );

  d.push("Z");
  return d.join(" ");
};

const drawElement = (roughCanvas: RoughCanvas, ctx: any, element: any) => {
  switch (element.type) {
    case "line":
    case "rectangle":
      roughCanvas.draw(element.roughElement);
      break;
    case "pencil":
      const stroke = getSvgPathFromStroke(
        getStroke(element.points, {
          size: element.size,
        }),
      );
      ctx.fillStyle = element.color === "none" ? "black" : element.color;
      ctx.fill(new Path2D(stroke));
      break;
    case "text":
      ctx.textBaseline = "top";
      ctx.font = "24px sans-serif";
      ctx.fillStyle = element.color === "none" ? "black" : element.color;
      ctx.fillText(element.text, element.x1, element.y1);
      break;
    case "image":
      ctx.drawImage(
        element.img,
        element.x1,
        element.y1,
        element.img.width,
        element.img.height,
      );
      break;
    default:
      throw new Error(`Type not recognised: ${element.type}`);
  }
};

const adjustmentRequired = (type: string) =>
  ["line", "rectangle"].includes(type);

interface Tooltip {
  show: boolean;
  type: string;
}

const App: FC = () => {
  const [elements, setElements, undo, redo] = useHistory([]);
  const [action, setAction] = useState("none");
  const [tool, setTool] = useState("selection");
  const [selectedElement, setSelectedElement] = useState<any>(null);

  const [tooltip, setTooltip] = useState<Tooltip>({} as Tooltip);

  const [selectorFillColorIsShown, setSelectorFillColorIsShown] =
    useState(false);
  const [fillColor, setFillColor] = useState("none");

  const [lineSize, setLineSize] = useState(6);

  const [libraryIsShwon, setLibraryIsShown] = useState(false);
  const [selectedImage, setSelectedImage] = useState("none");

  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const createElement = (
    id: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    type: string,
    imageName?: string,
    color = fillColor,
    size = lineSize,
  ) => {
    switch (type) {
      case "line":
        const line = generator.line(x1, y1, x2, y2, {
          stroke: color === "none" ? undefined : color,
        });
        return { id, x1, y1, x2, y2, type, color, roughElement: line };
      case "rectangle":
        const rectangle = generator.rectangle(x1, y1, x2 - x1, y2 - y1, {
          fill: color === "none" ? undefined : color,
        });

        return {
          id,
          x1,
          y1,
          x2,
          y2,
          type,
          color,
          roughElement: rectangle,
        };
      case "pencil":
        color = fillColor;
        return { id, type, points: [{ x: x1, y: y1 }], color, size };
      case "text":
        return { id, type, x1, y1, x2, y2, text: "", color };
      case "image":
        const img = new Image(x2 - x1, y2 - y1);
        switch (imageName) {
          case "Vynychenko":
            img.src = Vynychenko;
            break;
          case "Petlura":
            img.src = Petlura;
            break;
          case "Bolbachan":
            img.src = Bolbachan;
            break;
          case "Skoropadsky":
            img.src = Skoropadsky;
            break;
          case "Nestor":
            img.src = Nestor;
            break;
          case "Hryhorjev":
            img.src = Hryhorjev;
            break;
          case "Denikin":
            img.src = Denikin;
            break;
          case "Wrangel":
            img.src = Wrangel;
            break;
          case "Vitovsky":
            img.src = Vitovsky;
            break;
          case "Petrushevych":
            img.src = Petrushevych;
            break;
          case "Kociubynskiy":
            img.src = Kociubynskiy;
            break;
          case "Bezruczko":
            img.src = Bezruczko;
            break;
          case "Konovalec":
            img.src = Konovalec;
            break;
          default:
            switch (selectedImage) {
              case "Vynychenko":
                img.src = Vynychenko;
                imageName = "Vynychenko";
                break;
              case "Petlura":
                img.src = Petlura;
                imageName = "Petlura";
                break;
              case "Bolbachan":
                img.src = Bolbachan;
                imageName = "Bolbachan";
                break;
              case "Skoropadsky":
                img.src = Skoropadsky;
                imageName = "Skoropadsky";
                break;
              case "Nestor":
                img.src = Nestor;
                imageName = "Nestor";
                break;
              case "Hryhorjev":
                img.src = Hryhorjev;
                imageName = "Hryhorjev";
                break;
              case "Denikin":
                img.src = Denikin;
                imageName = "Denikin";
                break;
              case "Wrangel":
                img.src = Wrangel;
                imageName = "Wrangel";
                break;
              case "Vitovsky":
                img.src = Vitovsky;
                imageName = "Vitovsky";
                break;
              case "Petrushevych":
                img.src = Petrushevych;
                imageName = "Petrushevych";
                break;
              case "Kociubynskiy":
                img.src = Kociubynskiy;
                imageName = "Kociubynskiy";
                break;
              case "Bezruczko":
                img.src = Bezruczko;
                imageName = "Bezruczko";
                break;
              case "Konovalec":
                img.src = Konovalec;
                imageName = "Konovalec";
                break;
            }
        }
        return { id, type, x1, y1, x2, y2, img, imageName };
      default:
        throw new Error(`Type no recognised: ${type}`);
    }
  };

  useLayoutEffect(() => {
    const canvas: any = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    const roughCanvas = rough.canvas(canvas);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    elements.forEach((element: any) => {
      if (action === "writing" && selectedElement.id === element.id) return;
      drawElement(roughCanvas, ctx, element);
    });
  }, [elements, action, selectedElement]);

  useEffect(() => {
    const undoRedoFunction = (e: any) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "z") {
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
    };

    document.addEventListener("keydown", undoRedoFunction);
    return () => {
      document.removeEventListener("keydown", undoRedoFunction);
    };
  }, [undo, redo]);

  useEffect(() => {
    const textArea = textAreaRef.current;
    if (action === "writing" && textArea) {
      setTimeout(() => {
        textArea.focus();
        textArea.value = selectedElement.text;
      }, 0);
    }
  }, [action, selectedElement]);

  const updateElement = (
    id: number,
    x1: any,
    y1: any,
    x2: any,
    y2: any,
    type: string,
    color?: string,
    options?: { text: string },
    imageName?: string,
  ) => {
    const elementsCopy = [...elements];
    switch (type) {
      case "line":
      case "rectangle":
        elementsCopy[id] = createElement(
          id,
          x1,
          y1,
          x2,
          y2,
          type,
          undefined,
          color,
        );
        break;
      case "pencil":
        elementsCopy[id].points = [
          ...elementsCopy[id].points,
          { x: x2, y: y2 },
        ];
        break;
      case "text":
        const canvas: any = document.getElementById("canvas");
        const ctx = canvas.getContext("2d");
        const textWidth = ctx.measureText(options?.text).width;
        const textHeight = 24;
        elementsCopy[id] = {
          ...createElement(
            id,
            x1,
            y1,
            x1 + textWidth,
            y1 + textHeight,
            type,
            undefined,
            color,
          ),
          text: options?.text,
        };
        break;
      case "image":
        elementsCopy[id] = createElement(id, x1, y1, x2, y2, type, imageName);
        break;
      default:
        throw new Error(`Type not recognised: ${type}`);
    }

    setElements(elementsCopy, true);
  };

  const handleMouseDown = (e: any) => {
    if (action === "writing") return;

    const { clientX, clientY } = e;

    if (tool === "selection") {
      const element = getElementAtPosition(clientX, clientY, elements);
      if (element) {
        if (element.type === "pencil") {
          const xOffsets = element.points.map(
            (point: any) => clientX - point.x,
          );
          const yOffsets = element.points.map(
            (point: any) => clientY - point.y,
          );
          setSelectedElement({ ...element, xOffsets, yOffsets });
        } else {
          const offsetX = clientX - element.x1;
          const offsetY = clientY - element.y1;
          setSelectedElement({ ...element, offsetX, offsetY });
        }
        setElements((prev: any) => prev);

        if (element.position === "inside") {
          setAction("moving");
        } else {
          setAction("resizing");
        }
      }
    } else {
      const id = elements.length;
      const element = createElement(
        id,
        clientX,
        clientY,
        clientX,
        clientY,
        tool,
      );
      setElements((prev: any) => [...prev, element]);
      setSelectedElement(element);

      setAction(tool === "text" ? "writing" : "drawing");
    }
  };

  const handleTouchStart = (e: any) => {
    if (action === "writing") return;

    const canvas: any = document.getElementById("canvas");

    const touch = e.touches[0];
    const clientX = touch.clientX - canvas.offsetLeft;
    const clientY = touch.clientY - canvas.offsetTop;

    if (tool === "selection") {
      const element = getElementAtPosition(clientX, clientY, elements);
      if (element) {
        if (element.type === "pencil") {
          const xOffsets = element.points.map(
            (point: any) => clientX - point.x,
          );
          const yOffsets = element.points.map(
            (point: any) => clientY - point.y,
          );
          setSelectedElement({ ...element, xOffsets, yOffsets });
        } else {
          const offsetX = clientX - element.x1;
          const offsetY = clientY - element.y1;
          setSelectedElement({ ...element, offsetX, offsetY });
        }
        setElements((prev: any) => prev);

        if (element.position === "inside") {
          setAction("moving");
        } else {
          setAction("resizing");
        }
      }
    } else {
      const id = elements.length;
      const element = createElement(
        id,
        clientX,
        clientY,
        clientX,
        clientY,
        tool,
      );
      setElements((prev: any) => [...prev, element]);
      setSelectedElement(element);

      setAction(tool === "text" ? "writing" : "drawing");
    }
  };

  const handleMouseMove = (e: any) => {
    const { clientX, clientY } = e;

    if (tool === "selection") {
      const element = getElementAtPosition(clientX, clientY, elements);
      e.target.style.cursor = element
        ? cursorForPosition(element.position)
        : "default";
    }

    if (action === "drawing") {
      const index = elements.length - 1;
      updateElement(
        index,
        elements[index].x1,
        elements[index].y1,
        clientX,
        clientY,
        tool,
      );
    } else if (action === "moving") {
      if (selectedElement.type === "pencil") {
        const newPoints = selectedElement.points.map((_: any, idx: number) => ({
          x: clientX - selectedElement.xOffsets[idx],
          y: clientY - selectedElement.yOffsets[idx],
        }));
        const elementsCopy = [...elements];
        elementsCopy[selectedElement.id] = {
          ...elementsCopy[selectedElement.id],
          points: newPoints,
        };
        setElements(elementsCopy, true);
      } else {
        const { id, x1, x2, y1, y2, type, offsetX, offsetY, color, imageName } =
          selectedElement;
        const width = x2 - x1;
        const height = y2 - y1;
        const offsetX1 = clientX - offsetX;
        const offsetY1 = clientY - offsetY;
        const options =
          type === "text" ? { text: selectedElement.text } : undefined;
        updateElement(
          id,
          offsetX1,
          offsetY1,
          offsetX1 + width,
          offsetY1 + height,
          type,
          color,
          options,
          imageName,
        );
      }
    } else if (action === "resizing") {
      const { id, type, position, imageName, color, fill, ...coordinates } =
        selectedElement;
      const { x1, y1, x2, y2 } = resizedCoordinates(
        e.clientX,
        e.clientY,
        position,
        coordinates,
      );
      updateElement(id, x1, y1, x2, y2, type, color, undefined, imageName);
    }
  };

  const handleTouchMove = (e: any) => {
    const canvas: any = document.getElementById("canvas");

    const touch = e.touches[0];
    const clientX = touch.clientX - canvas.offsetLeft;
    const clientY = touch.clientY - canvas.offsetTop;
    if (tool === "selection") {
      const element = getElementAtPosition(clientX, clientY, elements);
      e.target.style.cursor = element
        ? cursorForPosition(element.position)
        : "default";
    }

    if (action === "drawing") {
      const index = elements.length - 1;
      updateElement(
        index,
        elements[index].x1,
        elements[index].y1,
        clientX,
        clientY,
        tool,
      );
    } else if (action === "moving") {
      if (selectedElement.type === "pencil") {
        const newPoints = selectedElement.points.map((_: any, idx: number) => ({
          x: clientX - selectedElement.xOffsets[idx],
          y: clientY - selectedElement.yOffsets[idx],
        }));
        const elementsCopy = [...elements];
        elementsCopy[selectedElement.id] = {
          ...elementsCopy[selectedElement.id],
          points: newPoints,
        };
        setElements(elementsCopy, true);
      } else {
        const { id, x1, x2, y1, y2, type, offsetX, offsetY, color, imageName } =
          selectedElement;
        const width = x2 - x1;
        const height = y2 - y1;
        const offsetX1 = clientX - offsetX;
        const offsetY1 = clientY - offsetY;
        const options =
          type === "text" ? { text: selectedElement.text } : undefined;
        updateElement(
          id,
          offsetX1,
          offsetY1,
          offsetX1 + width,
          offsetY1 + height,
          type,
          color,
          options,
          imageName,
        );
      }
    } else if (action === "resizing") {
      const { id, type, position, imageName, color, fill, ...coordinates } =
        selectedElement;
      const { x1, y1, x2, y2 } = resizedCoordinates(
        e.clientX,
        e.clientY,
        position,
        coordinates,
      );
      updateElement(id, x1, y1, x2, y2, type, color, undefined, imageName);
    }
  };

  const handleMouseUp = (e: any) => {
    const { clientX, clientY } = e;

    if (selectedElement) {
      if (
        selectedElement.type === "text" &&
        clientX - selectedElement.offsetX === selectedElement.x1 &&
        clientY - selectedElement.offsetY === selectedElement.y1
      ) {
        setAction("writing");
        return;
      }

      const index = selectedElement.id;
      const { id, type, color } = elements[index];
      if (
        (action === "drawing" || action === "resizing") &&
        adjustmentRequired(type)
      ) {
        const { x1, x2, y1, y2 } = adjustElementCoordinates(elements[index]);
        updateElement(id, x1, y1, x2, y2, type, color);
      }
    }

    if (action === "writing") return;

    setAction("none");
    setSelectedElement(null);
  };

  const handleTouchEnd = (e: any) => {
    const canvas: any = document.getElementById("canvas");

    const touch = e.touches[0];
    const clientX = touch.clientX - canvas.offsetLeft;
    const clientY = touch.clientY - canvas.offsetTop;
    if (selectedElement) {
      if (
        selectedElement.type === "text" &&
        clientX - selectedElement.offsetX === selectedElement.x1 &&
        clientY - selectedElement.offsetY === selectedElement.y1
      ) {
        setAction("writing");
        return;
      }

      const index = selectedElement.id;
      const { id, type, color } = elements[index];
      if (
        (action === "drawing" || action === "resizing") &&
        adjustmentRequired(type)
      ) {
        const { x1, x2, y1, y2 } = adjustElementCoordinates(elements[index]);
        updateElement(id, x1, y1, x2, y2, type, color);
      }
    }

    if (action === "writing") return;

    setAction("none");
    setSelectedElement(null);
  };

  const handleBlur = (e: any) => {
    const { id, x1, y1, type, color } = selectedElement;
    setAction("none");
    setSelectedElement(null);
    updateElement(id, x1, y1, null, null, type, color, {
      text: e.target.value,
    });
  };

  const activateTooltip = (type: string) => {
    setTooltip({ ...tooltip, show: true, type: type });
  };

  const diactivateTooltip = () => {
    setTooltip({ ...tooltip, show: false });
  };

  const clearCanvas = () => {
    const canvas: any = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setElements([]);
  };

  const renderTooltip = (type: string) => {
    switch (type) {
      case "selection":
        return <p>Курсор</p>;
      case "pencil":
        return <p>Олівець</p>;
      case "line":
        return <p>Лінія</p>;
      case "rectangle":
        return <p>Квадрат</p>;
      case "text":
        return <p>Текст</p>;
      case "undo":
        return <p>Повернути дію</p>;
      case "redo":
        return <p>Переробити дію</p>;
      case "delete":
        return <p>Видалити все</p>;
      case "fill":
        return <p>Колір заливки</p>;
      case "clear":
        return <p>Прибрати колір заливки</p>;
      case "size":
        return <p>Розмір лінії</p>;
      case "library":
        return <p>Бібліотека</p>;
    }
  };

  return (
    <div>
      <div className="lg:flex fixed z-[2]">
        <div className="lg:m-6 m-2 bg-white shadow-md rounded-lg flex items-center">
          <ul className="flex lg:p-4 p-2 justify-center items-center">
            <li
              className={
                tool === "selection" ? "selectedToolBarItem" : "toolBarItem"
              }
              onClick={() => setTool("selection")}
              onMouseEnter={() => activateTooltip("selection")}
              onMouseLeave={() => diactivateTooltip()}
            >
              <MousePointer />
            </li>
            <li
              className={
                tool === "pencil" ? "selectedToolBarItem" : "toolBarItem"
              }
              onClick={() => setTool("pencil")}
              onMouseEnter={() => activateTooltip("pencil")}
              onMouseLeave={() => diactivateTooltip()}
            >
              <Edit2 />
            </li>
            <li
              className={
                tool === "line" ? "selectedToolBarItem" : "toolBarItem"
              }
              onClick={() => setTool("line")}
              onMouseEnter={() => activateTooltip("line")}
              onMouseLeave={() => diactivateTooltip()}
            >
              <Edit3 />
            </li>
            <li
              className={
                tool === "rectangle" ? "selectedToolBarItem" : "toolBarItem"
              }
              onClick={() => setTool("rectangle")}
              onMouseEnter={() => activateTooltip("rectangle")}
              onMouseLeave={() => diactivateTooltip()}
            >
              <Square />
            </li>
            {/* <li
              className={
                tool === "circle" ? "selectedToolBarItem" : "toolBarItem"
              }
              onClick={() => setTool("circle")}
            >
              <Circle />
            </li>
            <li
              className={
                tool === "triangle" ? "selectedToolBarItem" : "toolBarItem"
              }
              onClick={() => setTool("triangle")}
            >
              <Triangle />
            </li> */}
            <li
              className={
                tool === "text" ? "selectedToolBarItem" : "toolBarItem"
              }
              onClick={() => setTool("text")}
              onMouseEnter={() => activateTooltip("text")}
              onMouseLeave={() => diactivateTooltip()}
            >
              <Type />
            </li>
            <li
              className="toolBarItem"
              onClick={undo}
              onMouseEnter={() => activateTooltip("undo")}
              onMouseLeave={() => diactivateTooltip()}
            >
              <CornerUpLeft />
            </li>
            <li
              className="toolBarItem"
              onClick={redo}
              onMouseEnter={() => activateTooltip("redo")}
              onMouseLeave={() => diactivateTooltip()}
            >
              <CornerUpRight />
            </li>
            <li
              className="toolBarItem"
              onClick={clearCanvas}
              onMouseEnter={() => activateTooltip("delete")}
              onMouseLeave={() => diactivateTooltip()}
            >
              <Trash2 />
            </li>
          </ul>
        </div>
        <div className="flex lg:m-0 m-2">
          <div className="lg:m-6 m-2 ml-0 bg-white shadow-md rounded-lg flex items-center content-center justify-center">
            <ul className="flex justify-center items-center lg:p-4 p-2">
              <li className="lg:p-2 mr-4">
                <div
                  className="w-6 h-6 border-2 rounded-md border-black cursor-pointer"
                  style={{
                    backgroundColor: fillColor === "none" ? "#fff" : fillColor,
                  }}
                  onClick={() =>
                    setSelectorFillColorIsShown(!selectorFillColorIsShown)
                  }
                  onMouseEnter={() => activateTooltip("fill")}
                  onMouseLeave={diactivateTooltip}
                ></div>
                {selectorFillColorIsShown && (
                  <Sketch
                    className="absolute"
                    color={fillColor === "none" ? "#fff" : fillColor}
                    onChange={(color) => setFillColor(color.hex)}
                  />
                )}
              </li>
              <li
                className="lg:p-2"
                onClick={() => setFillColor("none")}
                onMouseEnter={() => activateTooltip("clear")}
                onMouseLeave={diactivateTooltip}
              >
                <div className="w-6 h-6 border-2 rounded-md border-black cursor-pointer text-center items-center justify-center flex">
                  X
                </div>
              </li>
            </ul>
          </div>
          <div className="lg:m-6 m-2 ml-0 bg-white shadow-md rounded-lg items-center content-center justify-center flex">
            <ul className="flex lg:px-4 px-2 content-center items-center justify-center">
              <li
                className="transition-colors rounded-lg content-center items-center justify-center flex flex-col"
                onMouseEnter={() => activateTooltip("size")}
                onMouseLeave={diactivateTooltip}
              >
                <p>{lineSize.toString()}</p>
                <input
                  className="lg:w-auto w-[100px]"
                  type="range"
                  min="1"
                  max="50"
                  value={lineSize}
                  onChange={(e) => setLineSize(parseInt(e.target.value))}
                />
              </li>
            </ul>
          </div>
          <div className="lg:m-6 m-2 ml-0 bg-white shadow-md rounded-lg items-center content-center justify-center">
            <ul className="flex lg:p-4 p-2 content-center items-center justify-center">
              <li
                className="cursor-pointer lg:p-2 p-1 transition-colors hover:bg-blue-300 hover:text-white rounded-lg content-center items-center justify-center"
                onClick={() => setLibraryIsShown(true)}
                onMouseEnter={() => activateTooltip("library")}
                onMouseLeave={diactivateTooltip}
              >
                <Grid />
              </li>
            </ul>
          </div>
        </div>
      </div>
      {action === "writing" ? (
        <textarea
          ref={textAreaRef}
          onBlur={handleBlur}
          style={{
            position: "fixed",
            zIndex: 1,
            top: selectedElement.y1 - 2,
            left: selectedElement.x1,
            font: "24px sans-serif",
            margin: 0,
            padding: 0,
            border: 0,
            outline: 0,
            overflow: "hidden",
            background: "transperant",
          }}
        />
      ) : null}
      <UkraineMap />
      {libraryIsShwon && (
        <div
          className="bg-white shadow-md p-2 rounded-md grid lg:grid-cols-6 grid-cols-4 absolute items-center justify-center z-10 w-full h-full"
          onClick={() => setLibraryIsShown(false)}
        >
          <img
            id="Vynychenko"
            src={Vynychenko}
            className={
              selectedImage === "Vynychenko" ? "selectedPortrait" : "portrait"
            }
            onClick={() => {
              setSelectedImage("Vynychenko"), setTool("image");
            }}
          />
          <img
            id="Petlura"
            src={Petlura}
            className={
              selectedImage === "Petlura" ? "selectedPortrait" : "portrait"
            }
            onClick={() => {
              setSelectedImage("Petlura"), setTool("image");
            }}
          />
          <img
            id="Bolbochan"
            src={Bolbachan}
            className={
              selectedImage === "Bolbachan" ? "selectedPortrait" : "portrait"
            }
            onClick={() => {
              setSelectedImage("Bolbachan"), setTool("image");
            }}
          />
          <img
            id="Skoropadsky"
            src={Skoropadsky}
            className={
              selectedImage === "Skoropadsky" ? "selectedPortrait" : "portrait"
            }
            onClick={() => {
              setSelectedImage("Skoropadsky"), setTool("image");
            }}
          />
          <img
            id="Nestor"
            src={Nestor}
            className={
              selectedImage === "Nestor" ? "selectedPortrait" : "portrait"
            }
            onClick={() => {
              setSelectedImage("Nestor"), setTool("image");
            }}
          />
          <img
            id="Hryhorjev"
            src={Hryhorjev}
            className={
              selectedImage === "Hryhorjev" ? "selectedPortrait" : "portrait"
            }
            onClick={() => {
              setSelectedImage("Hryhorjev"), setTool("image");
            }}
          />
          <img
            id="Denikin"
            src={Denikin}
            className={
              selectedImage === "Denikin" ? "selectedPortrait" : "portrait"
            }
            onClick={() => {
              setSelectedImage("Denikin"), setTool("image");
            }}
          />
          <img
            id="Wrangel"
            src={Wrangel}
            className={
              selectedImage === "Wrangel" ? "selectedPortrait" : "portrait"
            }
            onClick={() => {
              setSelectedImage("Wrangel"), setTool("image");
            }}
          />
          <img
            id="Vitovsky"
            src={Vitovsky}
            className={
              selectedImage === "Vitovsky" ? "selectedPortrait" : "portrait"
            }
            onClick={() => {
              setSelectedImage("Vitovsky"), setTool("image");
            }}
          />
          <img
            id="Petrushevych"
            src={Petrushevych}
            className={
              selectedImage === "Petrushevych" ? "selectedPortrait" : "portrait"
            }
            onClick={() => {
              setSelectedImage("Petrushevych"), setTool("image");
            }}
          />
          <img
            id="Kociubynskiy"
            src={Kociubynskiy}
            className={
              selectedImage === "Kociubynskiy" ? "selectedPortrait" : "portrait"
            }
            onClick={() => {
              setSelectedImage("Kociubynskiy"), setTool("image");
            }}
          />
          <img
            id="Bezruczko"
            src={Bezruczko}
            className={
              selectedImage === "Bezruczko" ? "selectedPortrait" : "portrait"
            }
            onClick={() => {
              setSelectedImage("Bezruczko"), setTool("image");
            }}
          />
          <img
            id="Konovalec"
            src={Konovalec}
            className={
              selectedImage === "Konovalec" ? "selectedPortrait" : "portrait"
            }
            onClick={() => {
              setSelectedImage("Konovalec"), setTool("image");
            }}
          />
        </div>
      )}
      {tooltip.show === true && (
        <div className="absolute lg:top-24 top-[140px] lg:left-6 left-2 bg-white rounded-md shadow-md p-2">
          {renderTooltip(tooltip.type)}
        </div>
      )}
      <canvas
        id="canvas"
        width={window.innerWidth}
        height={window.innerHeight}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="absolute z-[1] w-full h-full"
      ></canvas>
    </div>
  );
};

export default App;
