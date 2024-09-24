export const isBrowser = () => typeof window !== 'undefined';

export const isLocalhost = () => isBrowser() && window.location.hostname === 'localhost';
