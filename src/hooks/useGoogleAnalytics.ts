/**
 * Google Analytics Hook
 * Sử dụng để track page views và custom events
 */

import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

// Google Analytics Measurement ID
// Thay thế bằng ID thực của bạn từ Google Analytics 4
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX';

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

/**
 * Initialize Google Analytics
 */
export function initGA() {
  if (typeof window === 'undefined') return;
  
  // Không init nếu là dev mode và không có ID
  if (GA_MEASUREMENT_ID === 'G-XXXXXXXXXX') {
    console.log('[GA] Analytics disabled - no measurement ID');
    return;
  }

  // Load gtag.js script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  // Initialize dataLayer
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };

  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, {
    page_location: window.location.href,
    page_title: document.title,
  });

  console.log('[GA] Analytics initialized:', GA_MEASUREMENT_ID);
}

/**
 * Track page view
 */
export function trackPageView(url: string, title?: string) {
  if (typeof window === 'undefined' || !window.gtag) return;
  if (GA_MEASUREMENT_ID === 'G-XXXXXXXXXX') return;

  window.gtag('config', GA_MEASUREMENT_ID, {
    page_location: url,
    page_title: title || document.title,
  });
}

/**
 * Track custom event
 */
export function trackEvent(
  eventName: string,
  parameters?: Record<string, any>
) {
  if (typeof window === 'undefined' || !window.gtag) return;
  if (GA_MEASUREMENT_ID === 'G-XXXXXXXXXX') return;

  window.gtag('event', eventName, parameters);
}

/**
 * Hook để tự động track page views khi navigation
 */
export function useGoogleAnalytics() {
  const location = useLocation();

  useEffect(() => {
    // Track page view mỗi khi location thay đổi
    trackPageView(window.location.href);
  }, [location]);

  // Track property view
  const trackPropertyView = useCallback((property: {
    id: string;
    title: string;
    type: string;
    price: number;
    location: string;
  }) => {
    trackEvent('view_item', {
      currency: 'VND',
      value: property.price,
      items: [{
        item_id: property.id,
        item_name: property.title,
        item_category: property.type,
        item_variant: property.location,
        price: property.price,
      }],
    });
  }, []);

  // Track search
  const trackSearch = useCallback((query: string, resultsCount?: number) => {
    trackEvent('search', {
      search_term: query,
      results_count: resultsCount,
    });
  }, []);

  // Track contact click
  const trackContact = useCallback((method: 'phone' | 'zalo' | 'form' | 'email', propertyId?: string) => {
    trackEvent('contact', {
      method,
      property_id: propertyId,
    });
  }, []);

  // Track property post
  const trackPropertyPost = useCallback((propertyType: string, price: number) => {
    trackEvent('post_property', {
      property_type: propertyType,
      price_range: getPriceRange(price),
    });
  }, []);

  // Track share
  const trackShare = useCallback((platform: string, propertyId: string) => {
    trackEvent('share', {
      method: platform,
      content_type: 'property',
      item_id: propertyId,
    });
  }, []);

  // Track signup/login
  const trackAuth = useCallback((action: 'sign_up' | 'login', method: string) => {
    trackEvent(action, {
      method,
    });
  }, []);

  return {
    trackPropertyView,
    trackSearch,
    trackContact,
    trackPropertyPost,
    trackShare,
    trackAuth,
  };
}

// Helper function
function getPriceRange(price: number): string {
  if (price < 1000000000) return 'under_1b';
  if (price < 3000000000) return '1b_3b';
  if (price < 5000000000) return '3b_5b';
  if (price < 10000000000) return '5b_10b';
  return 'over_10b';
}
