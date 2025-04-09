/**
 * Detects if the user is using a Mac keyboard based on the platform
 */
export const isMacKeyboard = (): boolean => {
  if (typeof navigator === 'undefined') {
    return false;
  }

  return navigator.platform.toLowerCase().includes('mac');
};
