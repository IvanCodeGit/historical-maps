import { useContext } from "react";
import { ToolsContext } from "../providers/ToolsProvider";

export const useTools = () => useContext(ToolsContext);
