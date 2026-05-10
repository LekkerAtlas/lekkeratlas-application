import React from "react";
import ReactDOM from "react-dom/client";
import { AppAuthProvider } from "@/app/providers/AppAuthProvider";
import { App } from "@/app/App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppAuthProvider>
      <App />
    </AppAuthProvider>
  </React.StrictMode>,
);