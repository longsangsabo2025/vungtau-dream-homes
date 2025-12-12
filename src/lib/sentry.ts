import * as Sentry from "@sentry/react";

export const initSentry = () => {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  const isProduction = import.meta.env.PROD;
  const isLocalPreview = window.location.hostname === 'localhost' && window.location.port === '4173';
  
  // Enable Sentry in production or local preview
  const shouldEnable = !!dsn && (isProduction || isLocalPreview);
  
  if (!shouldEnable) {
    console.log('[Sentry] Disabled - no DSN or not in production/preview');
    return;
  }

  console.log('[Sentry] Initializing error tracking...');
  
  Sentry.init({
    dsn,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],
    // Performance Monitoring
    tracesSampleRate: 1.0,
    // Session Replay
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    // Environment
    environment: window.location.hostname === 'localhost' ? 'local-preview' : import.meta.env.MODE,
    enabled: shouldEnable,
    // Debug mode for local
    debug: window.location.hostname === 'localhost',
    // Tags
    tags: {
      project: 'vungtau-dream-homes',
    },
  });
};

export default Sentry;
