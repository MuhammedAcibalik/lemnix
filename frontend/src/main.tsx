import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import {
  initWebVitals,
  observeLongTasks,
} from "./shared/lib/monitoring/webVitals";
import { initializeSentry } from "./shared/lib/monitoring/sentry";

// Initialize Sentry error tracking (must be first)
initializeSentry();

// Initialize Web Vitals monitoring
initWebVitals();
observeLongTasks();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
