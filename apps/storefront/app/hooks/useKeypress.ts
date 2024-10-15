// adapted from: https://usehooks.com/useKeyPress/

import { useEffect, useState } from 'react';

export const useKeyPress = (targetKey: string | string[], callBack?: () => void) => {
  // State for keeping track of whether key is pressed
  const [keyPressed, setKeyPressed] = useState<boolean>(false);

  useEffect(() => {
    if (keyPressed === true && typeof callBack === 'function') callBack();
  }, [keyPressed, callBack]);

  // Add event listeners
  useEffect(() => {
    // If pressed key is our target key then set to true
    const downHandler = ({ key }: KeyboardEvent) => {
      if (Array.isArray(targetKey)) {
        if (targetKey.includes(key)) setKeyPressed(true);
      } else if (key === targetKey) setKeyPressed(true);
    };
    // If released key is our target key then set to false
    const upHandler = ({ key }: KeyboardEvent) => {
      if (Array.isArray(targetKey)) {
        if (targetKey.includes(key)) setKeyPressed(false);
      } else if (key === targetKey) setKeyPressed(false);
    };

    window.addEventListener('keydown', downHandler);
    window.addEventListener('keyup', upHandler);
    // Remove event listeners on cleanup
    return () => {
      window.removeEventListener('keydown', downHandler);
      window.removeEventListener('keyup', upHandler);
    };
  }, [targetKey]); // Empty array ensures that effect is only run on mount and unmount

  return keyPressed;
};
