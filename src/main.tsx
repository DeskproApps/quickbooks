import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./main.css";
import "simplebar/dist/simplebar.min.css";
import { Scrollbar } from "@deskpro/deskpro-ui";

const root = ReactDOM.createRoot(document.getElementById('root') as Element);
root.render((
  <React.StrictMode>
    <Scrollbar style={{height: "100%", width: "100%"}}><App /></Scrollbar>
  </React.StrictMode>
));
