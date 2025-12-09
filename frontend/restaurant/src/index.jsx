/**
 * Point d'entrée de l'application React - Restaurant
 * @notice Initialise React et rend l'application dans le DOM
 * @dev Importe les styles globaux et le composant App
 */

import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";

// Styles globaux Tailwind
import "./index.css";

// Récupérer l'élément root
const rootElement = document.getElementById("root");

// Vérifier que root existe
if (!rootElement) {
  throw new Error(
    'Root element not found. Make sure index.html has <div id="root"></div>'
  );
}

// Créer root React 18
const root = ReactDOM.createRoot(rootElement);

// Rendre l'application
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
