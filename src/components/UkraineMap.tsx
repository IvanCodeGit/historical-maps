import { FC } from "react";
import { ReactSVG } from "react-svg";
import map from "../assets/UkraineMap.svg";

const UkraineMap: FC = () => {
  return (
    <div className="absolute flex items-center justify-center w-full h-full">
      <ReactSVG src={map} />
    </div>
  );
};

export default UkraineMap;
