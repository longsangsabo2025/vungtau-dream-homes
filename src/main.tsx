import './lib/error-reporter';
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initSentry } from "./lib/sentry";
import { errorHandler } from "./lib/errorHandler";

// Initialize Sentry before React render
if (import.meta.env.PROD) {
  initSentry();
}

// Initialize error handler
errorHandler.initialize().catch(err => {
  console.warn('Failed to initialize error handler:', err);
});

createRoot(document.getElementById("root")!).render(<App />);
