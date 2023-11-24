import { FC, useState } from "react";
import { Menu, Square, Type, XCircle } from "react-feather";
import { useTools } from "../../hooks/useTools";

const ToolBarStyles: FC = () => {
  const [toolsAreShown, setToolsAreShown] = useState(true);

  const toogleToolsAreShown = () => {
    setToolsAreShown(!toolsAreShown);
  };

  const {
    lineSize,
    changeLineSize,
    fontSize,
    changeFontSize,
    strokeSize,
    changeStrokeSize,
    eraseSize,
    changeEraseSize,
  } = useTools();

  return (
    <div className="bg-white shadow-md m-2 lg:m-6 w-min h-min rounded-lg items-center content-center flex flex-col">
      <div
        className="items-center content-center p-6 cursor-pointer"
        onClick={toogleToolsAreShown}
      >
        <Menu />
      </div>
      {toolsAreShown && (
        <ul className="items-center content-center text-center space-y-4 p-4 flex flex-col">
          <li className="cursor-pointer flex flex-col items-center">
            <div className="w-4 h-4 rounded-full bg-black"></div>
            <p>{lineSize.toString()}</p>
            <input
              type="range"
              min="1"
              max="100"
              className="w-12 cursor-grab"
              onChange={(e) => changeLineSize(parseInt(e.target.value))}
              value={lineSize}
            />
          </li>
          <li className="cursor-pointer flex flex-col items-center">
            <Square />
            <p>{strokeSize.toString()}</p>
            <input
              type="range"
              min="0"
              max="100"
              className="w-12 cursor-grab"
              onChange={(e) => changeStrokeSize(parseInt(e.target.value))}
              value={strokeSize}
            />
          </li>
          <li className="cursor-pointer flex flex-col items-center">
            <Type />
            <p>{fontSize.toString()}</p>
            <input
              type="range"
              min="1"
              max="100"
              className="w-12 cursor-grab"
              onChange={(e) => changeFontSize(parseInt(e.target.value))}
              value={fontSize}
            />
          </li>
          <li className="cursor-pointer flex flex-col items-center">
            <XCircle />
            <p>{eraseSize.toString()}</p>
            <input
              type="range"
              min="1"
              max="100"
              className="w-12 cursor-grab"
              onChange={(e) => changeEraseSize(parseInt(e.target.value))}
              value={eraseSize}
            />
          </li>
        </ul>
      )}
    </div>
  );
};

export default ToolBarStyles;
