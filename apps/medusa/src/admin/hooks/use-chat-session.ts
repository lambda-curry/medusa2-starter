import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Message } from 'ai';

export const useChatSession = () => {
  const [chatId, setChatId] = useState<string | null>(null);
  const [initialMessages, setInitialMessages] = useState<Message[]>([]);

  // Fetch current chat ID when component mounts
  useEffect(() => {
    const fetchCurrentChat = async () => {
      try {
        // Fetch from server to get the current chat ID from cookie
        const response = await fetch('/chat');
        const { currentChatId, messages } = await response.json();

        // If there's a current chat ID from the cookie, use it
        if (currentChatId) {
          setChatId(currentChatId);

          // If we have messages, initialize the chat with them
          if (messages && messages.length > 0) {
            setInitialMessages(messages);
          }
        }
      } catch (error) {
        // Failed to fetch current chat
        console.error('Failed to fetch current chat:', error);
      }
    };

    fetchCurrentChat();
  }, []);

  const startNewChat = async () => {
    try {
      // Call the DELETE endpoint to clear the current chat cookie
      await fetch('/chat', { method: 'DELETE' });

      // Reset state
      setChatId(null);
      setInitialMessages([]);

      // Refresh the page to start fresh
      window.location.reload();
    } catch (error) {
      // Failed to start new chat
      console.error('Failed to start new chat:', error);
    }
  };

  const handleChatResponse = async (response: Response) => {
    // When a new chat is created, the API will return a new chatId via cookie
    if (response.status === 200 && !chatId) {
      try {
        // The cookie is handled automatically by the browser
        // We just need to refresh our state after the first message
        const data = await fetch('/chat').then((res) => res.json());
        if (data.currentChatId) {
          setChatId(data.currentChatId);
        }
      } catch (error) {
        // Failed to process response
        console.error('Failed to process response:', error);
      }
    }
  };

  return {
    chatId,
    initialMessages,
    startNewChat,
    handleChatResponse,
  };
};
