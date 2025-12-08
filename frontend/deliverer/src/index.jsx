/**
 * Point d'entrée React
 * @fileoverview Entry point de l'application deliverer
 */

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// Rendu de l'application
const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
