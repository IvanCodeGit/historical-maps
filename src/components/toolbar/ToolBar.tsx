import { FC, useState } from "react";
import {
  Circle,
  Edit2,
  Image,
  Menu,
  MousePointer,
  Square,
  Trash2,
  Triangle,
  Type,
  XCircle,
} from "react-feather";
import { useTools } from "../../hooks/useTools";

const ToolBar: FC = () => {
  const [toolsAreShown, setToolsAreShown] = useState(true);

  const toogleToolsAreShown = () => {
    setToolsAreShown(!toolsAreShown);
  };

  const { selectedTool, selectTool, removeAll } = useTools();

  return (
    <div className="bg-white shadow-md m-2 lg:m-6 w-min h-min rounded-lg items-center content-center flex flex-col">
      <div
        className="items-center content-center p-6 cursor-pointer"
        onClick={toogleToolsAreShown}
      >
        <Menu />
      </div>
      {toolsAreShown && (
        <ul className="items-center content-center space-y-4 p-4 flex flex-col">
          <li
            className={
              selectedTool === "cursor" ? "toolBarItemSelected" : "toolBarItem"
            }
            onClick={() => selectTool("cursor")}
          >
            <MousePointer />
          </li>
          {/* <li
            className={
              selectedTool === "arrow" ? "toolBarItemSelected" : "toolBarItem"
            }
            onClick={() => selectTool("arrow")}
          >
            <ArrowUpRight />
          </li> */}
          <li
            className={
              selectedTool === "draw" ? "toolBarItemSelected" : "toolBarItem"
            }
            onClick={() => selectTool("draw")}
          >
            <Edit2 />
          </li>
          <li
            className={
              selectedTool === "square"
                ? "flex toolBarItemSelected"
                : "flex toolBarItem"
            }
            onClick={() => selectTool("square")}
          >
            <Square />
          </li>
          <li
            className={
              selectedTool === "circle"
                ? "flex toolBarItemSelected"
                : "flex toolBarItem"
            }
            onClick={() => selectTool("circle")}
          >
            <Circle />
          </li>
          <li
            className={
              selectedTool === "triangle"
                ? "flex toolBarItemSelected"
                : "flex toolBarItem"
            }
            onClick={() => selectTool("triangle")}
          >
            <Triangle />
          </li>
          <li
            className={
              selectedTool === "text" ? "toolBarItemSelected" : "toolBarItem"
            }
            onClick={() => selectTool("text")}
          >
            <Type />
          </li>
          <li
            className={
              selectedTool === "picture" ? "toolBarItemSelected" : "toolBarItem"
            }
            onClick={() => selectTool("picture")}
          >
            <Image />
          </li>
          <li
            className={
              selectedTool === "eraser" ? "toolBarItemSelected" : "toolBarItem"
            }
            onClick={() => selectTool("eraser")}
          >
            <XCircle />
          </li>
          <li className={"toolBarItemDeleteAll"} onClick={() => removeAll()}>
            <Trash2 />
          </li>
        </ul>
      )}
    </div>
  );
};

export default ToolBar;
