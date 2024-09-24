import { useCallback } from 'react';
import { isBrowser } from '../../../../../markethaus/utils/browser';

export const isGoogleAnalyticsLoaded = () => isBrowser() && 'gtag' in window && typeof window.gtag === 'function';

export const useSendGAEvent = <T>() =>
  useCallback(async (action: string, params: T) => {
    if (!isGoogleAnalyticsLoaded()) return Promise.reject('Google Analytics is not loaded');
    window.gtag('event', action, params as Gtag.ControlParams | Gtag.EventParams | Gtag.CustomParams);
    return Promise.resolve(params);
  }, []);
