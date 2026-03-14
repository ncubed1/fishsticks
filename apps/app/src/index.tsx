import React from "react";
import ReactDOM from "react-dom/client";
import "virtual:terminal";
import Home from "./page";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  // <React.StrictMode>
  <Home />,
  // </React.StrictMode>
);
