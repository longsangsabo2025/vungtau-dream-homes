// import './lib/error-reporter'; // DISABLED: Causes CORS issues with longsang-admin.vercel.app
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initSentry } from "./lib/sentry";
import { errorHandler } from "./lib/errorHandler";
import { ErrorBoundary } from "@sentry/react";
import { initGA } from "./hooks/useGoogleAnalytics";

// Initialize Sentry BEFORE React render (CRITICAL for error tracking)
// Enable for: production builds OR local preview (port 4173)
const isLocalPreview = window.location.hostname === 'localhost' && window.location.port === '4173';
if (import.meta.env.PROD || isLocalPreview) {
  initSentry();
}

// Initialize Google Analytics
if (import.meta.env.PROD) {
  initGA();
}

// Initialize error handler
errorHandler.initialize().catch(err => {
  console.warn('Failed to initialize error handler:', err);
});

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary fallback={<div>Something went wrong. Please refresh the page.</div>}>
    <App />
  </ErrorBoundary>
);
