import { useEffect } from 'react';

// Key for storing input in localStorage
const CHAT_INPUT_VALUE_KEY = 'medusa_ai_chat_input_value';

/**
 * Hook to manage persistent chat input with localStorage
 *
 * @param input - The current input value from useChat
 * @param setInput - The setInput function from useChat
 * @param shouldResetInput - Boolean flag indicating if input should be reset/cleared
 * @returns The same input and setInput functions that were passed in
 */
export const usePersistentInput = (
  input: string,
  setInput: (value: string) => void,
  shouldResetInput: boolean,
): [string, (value: string) => void] => {
  // Set initial input from local storage when component loads
  useEffect(() => {
    const storedInputValue = typeof window !== 'undefined' ? localStorage.getItem(CHAT_INPUT_VALUE_KEY) : null;

    if (storedInputValue) {
      setInput(storedInputValue);
    }
  }, [setInput]);

  // Save input to local storage when it changes
  useEffect(() => {
    if (input && typeof window !== 'undefined') {
      localStorage.setItem(CHAT_INPUT_VALUE_KEY, input);
    }
  }, [input]);

  // Clear input from local storage when shouldResetInput is true
  useEffect(() => {
    if (shouldResetInput && typeof window !== 'undefined') {
      localStorage.removeItem(CHAT_INPUT_VALUE_KEY);
    }
  }, [shouldResetInput]);

  // Return the same input and setInput functions
  return [input, setInput];
};
