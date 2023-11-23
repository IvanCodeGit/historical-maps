import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ToolsProvider } from "./providers/ToolsProvider.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ToolsProvider>
      <App />
    </ToolsProvider>
  </React.StrictMode>
);
