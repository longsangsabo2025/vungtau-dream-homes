/**
 * Analytics Provider
 * Tự động track page views cho mọi route
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '@/hooks/useGoogleAnalytics';

interface AnalyticsProviderProps {
  children: React.ReactNode;
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  const location = useLocation();

  useEffect(() => {
    // Track page view on every route change
    const url = window.location.href;
    const title = document.title;
    
    // Delay slightly to ensure title is updated
    const timer = setTimeout(() => {
      trackPageView(window.location.href, document.title);
    }, 100);

    return () => clearTimeout(timer);
  }, [location.pathname, location.search]);

  return <>{children}</>;
}
