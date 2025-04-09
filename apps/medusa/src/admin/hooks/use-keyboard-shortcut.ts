import { useEffect, useRef } from 'react';

type KeySequence = string[];
type ShortcutAction = () => void;

interface UseKeyboardShortcutProps {
  /**
   * Keys that need to be pressed:
   * - For 2+ keys: order doesn't matter except last key (e.g., ['cmd', 'shift', '.'])
   */
  keys: string[];
  /**
   * Function to execute when shortcut is triggered
   */
  callback: () => void;
  /**
   * Time in ms to wait before resetting key sequence
   * @default 150
   */
  timeWindow?: number;
}

const modifierKeys = ['cmd', 'ctrl', 'meta', 'control'];

export const useKeyboardShortcut = ({ keys, callback, timeWindow = 150 }: UseKeyboardShortcutProps) => {
  // Track pressed keys using a Set for order-independent comparison
  const pressedKeys = useRef(new Set<string>());
  // Track the last pressed key for sequence validation
  const lastPressedKey = useRef<string | null>(null);
  // Track timeout for sequence reset
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const firstKey = keys[0]?.toLowerCase();
      const isModifierShortcut = modifierKeys.includes(firstKey);

      // Skip if user is typing in an input element
      if (
        !isModifierShortcut &&
        event.target instanceof HTMLElement &&
        (event.target.tagName === 'INPUT' ||
          event.target.tagName === 'TEXTAREA' ||
          event.target.contentEditable === 'true')
      ) {
        return;
      }

      const normalizedKeys = keys.map((k) => k.toLowerCase());
      const lastRequiredKey = normalizedKeys[normalizedKeys.length - 1];
      const key = event.key.toLowerCase();

      // Check if the shortcut includes cmd/ctrl
      const requiresCmd = normalizedKeys.includes('cmd') || normalizedKeys.includes('meta');
      const requiresCtrl = normalizedKeys.includes('ctrl') || normalizedKeys.includes('control');

      // If cmd/ctrl is required but not pressed, return early
      if ((requiresCmd && !event.metaKey) || (requiresCtrl && !event.ctrlKey)) {
        return;
      }

      // Add lowercase key to set, excluding cmd/ctrl as they're handled separately
      if (key !== 'meta' && key !== 'control') {
        pressedKeys.current.add(key);
        lastPressedKey.current = key;
      }

      // Get all required keys except cmd/ctrl and the last key
      const requiredKeys = new Set(normalizedKeys.filter((k) => k !== 'cmd' && k !== 'ctrl' && k !== lastRequiredKey));

      // Check if all modifier keys are pressed and the last key matches
      const allModifiersPressed = Array.from(requiredKeys).every((k) => pressedKeys.current.has(k));
      const isLastKey = key === lastRequiredKey;

      // Calculate the expected number of pressed keys (excluding cmd/ctrl)
      const expectedKeyCount = normalizedKeys.filter((k) => k !== 'cmd' && k !== 'ctrl').length;
      const hasExactKeyCount = pressedKeys.current.size === expectedKeyCount;

      if (allModifiersPressed && isLastKey && hasExactKeyCount) {
        event.stopPropagation();
        event.preventDefault();
        clearTimeout(timeoutRef.current);
        callback();
        pressedKeys.current.clear();
        lastPressedKey.current = null;
        return;
      }

      // Only set a new timeout if we haven't executed a command
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        pressedKeys.current.clear();
        lastPressedKey.current = null;
      }, timeWindow);
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (key !== 'meta' && key !== 'control') {
        pressedKeys.current.delete(key);
        if (lastPressedKey.current === key) {
          lastPressedKey.current = null;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      clearTimeout(timeoutRef.current);
    };
  }, [keys, callback, timeWindow]);

  return {};
};
