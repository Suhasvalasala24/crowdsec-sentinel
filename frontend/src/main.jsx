import React from "react";
import ReactDOM from "react-dom/client";
import AlertsDashboard from "./AlertsDashboard";
import "leaflet/dist/leaflet.css";

// Render the dashboard into the root element
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AlertsDashboard />
  </React.StrictMode>
);
