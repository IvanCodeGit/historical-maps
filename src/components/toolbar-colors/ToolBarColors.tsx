import { Sketch } from "@uiw/react-color";
import { FC, useState } from "react";
import { Menu } from "react-feather";
import { useTools } from "../../hooks/useTools";

const ToolBarColors: FC = () => {
  const [toolsAreShown, setToolsAreShown] = useState(true);

  const [textColorSelectorIsShown, setTextColorSelectorIsShown] =
    useState(false);

  const [fillColorSelectionIsShown, setFillColorSelectionIsShown] =
    useState(false);

  const [borderColorSelectionIsShown, setBorderColorSelectionIsShown] =
    useState(false);

  const toogleToolsAreShown = () => {
    setToolsAreShown(!toolsAreShown);
  };

  const toogleTextColorSelector = () => {
    setTextColorSelectorIsShown(!textColorSelectorIsShown);
    setFillColorSelectionIsShown(false);
    setBorderColorSelectionIsShown(false);
  };

  const toogleFillColorSelector = () => {
    setFillColorSelectionIsShown(!fillColorSelectionIsShown);
    setTextColorSelectorIsShown(false);
    setBorderColorSelectionIsShown(false);
  };

  const toogleBorderColorSelector = () => {
    setBorderColorSelectionIsShown(!borderColorSelectionIsShown);
    setFillColorSelectionIsShown(false);
    setTextColorSelectorIsShown(false);
  };

  const {
    fillColor,
    strokeColor,
    textColor,
    changeFillColor,
    changeStrokeColor,
    changeTextColor,
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
          <li className="cursor-pointer">
            <div
              className="w-8 h-8 rounded-sm"
              style={{
                backgroundColor: fillColor,
              }}
              onClick={toogleFillColorSelector}
            ></div>
            {fillColorSelectionIsShown && (
              <Sketch
                className="absolute"
                color={fillColor}
                onChange={(color) => changeFillColor(color.hex)}
              />
            )}
          </li>
          <li className="cursor-pointer">
            <div
              className="w-8 h-8 rounded-sm border-2"
              style={{
                borderColor: strokeColor,
                borderWidth: 2,
              }}
              onClick={toogleBorderColorSelector}
            ></div>
            {borderColorSelectionIsShown && (
              <Sketch
                className="absolute"
                color={strokeColor}
                onChange={(color) => changeStrokeColor(color.hex)}
              />
            )}
          </li>
          <li className="cursor-pointer">
            <p
              className="text-lg"
              style={{
                color: textColor,
              }}
              onClick={toogleTextColorSelector}
            >
              Aa
            </p>
            {textColorSelectorIsShown && (
              <Sketch
                className="absolute"
                color={textColor}
                onChange={(color) => changeTextColor(color.hex)}
              />
            )}
          </li>
        </ul>
      )}
    </div>
  );
};

export default ToolBarColors;
