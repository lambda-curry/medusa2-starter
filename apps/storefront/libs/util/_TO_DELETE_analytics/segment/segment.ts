// import { useCallback } from 'react';
// import { isBrowser } from '../../browser';
// import { type EventProperties } from '@segment/analytics-next';

// export const isSegmentLoaded = () =>
//   isBrowser() && 'segmentAnalytics' in window && typeof window.segmentAnalytics === 'function';

// export const useSendSegmentEvent = <T>() =>
//   useCallback(async (action: string, params: T) => {
//     if (!isSegmentLoaded()) return Promise.reject('Segment is not loaded');
//     await window.segmentAnalytics.track(action, params as EventProperties);
//     return Promise.resolve(params);
//   }, []);
