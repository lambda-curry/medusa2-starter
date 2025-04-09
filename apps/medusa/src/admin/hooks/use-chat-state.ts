import { useState, useCallback } from 'react';

export type ChatStatus = 'closed' | 'drawer' | 'modal';
export type LastOpenStatus = 'drawer' | 'modal';
export type DrawerDirection = 'left' | 'right';

const CHAT_OPEN_KEY = 'medusa_ai_chat_status';
const CHAT_LAST_OPEN_KEY = 'medusa_ai_chat_last_open';
const CHAT_DRAWER_DIRECTION_KEY = 'medusa_ai_chat_drawer_direction';

export const useChatState = () => {
  const [status, setStatus] = useState<ChatStatus>(() => {
    if (typeof window === 'undefined') return 'closed';
    return (sessionStorage.getItem(CHAT_OPEN_KEY) as ChatStatus) || 'closed';
  });

  const [lastOpenStatus, setLastOpenStatus] = useState<LastOpenStatus>(() => {
    if (typeof window === 'undefined') return 'drawer';
    return (localStorage.getItem(CHAT_LAST_OPEN_KEY) as LastOpenStatus) || 'drawer';
  });

  const [drawerDirection, setDrawerDirection] = useState<DrawerDirection>(() => {
    if (typeof window === 'undefined') return 'right';
    return (localStorage.getItem(CHAT_DRAWER_DIRECTION_KEY) as DrawerDirection) || 'right';
  });

  const handleStatusChange = useCallback((newStatus: ChatStatus) => {
    setStatus(newStatus);
    sessionStorage.setItem(CHAT_OPEN_KEY, newStatus);

    if (newStatus !== 'closed') {
      setLastOpenStatus(newStatus as LastOpenStatus);
      localStorage.setItem(CHAT_LAST_OPEN_KEY, newStatus);
    }
  }, []);

  const handleChatToggle = useCallback(() => {
    console.log('handleChatToggle', status, lastOpenStatus);
    const newStatus = status === 'closed' ? lastOpenStatus : 'closed';
    handleStatusChange(newStatus);
  }, [status, lastOpenStatus, handleStatusChange]);

  const handleViewToggle = useCallback(() => {
    if (status === 'closed') {
      return;
    }

    const newStatus = status === 'drawer' ? 'modal' : 'drawer';
    handleStatusChange(newStatus);
  }, [status, handleStatusChange]);

  const handleDirectionToggle = useCallback(() => {
    const newDirection = drawerDirection === 'right' ? 'left' : 'right';
    setDrawerDirection(newDirection);
    localStorage.setItem(CHAT_DRAWER_DIRECTION_KEY, newDirection);
  }, [drawerDirection]);

  const handleDrawerDirectionChange = useCallback((direction: DrawerDirection) => {
    setDrawerDirection(direction);
    localStorage.setItem(CHAT_DRAWER_DIRECTION_KEY, direction);
  }, []);

  return {
    status,
    setStatus: handleStatusChange,
    lastOpenStatus,
    drawerDirection,
    setDrawerDirection: handleDrawerDirectionChange,
    handleChatToggle,
    handleViewToggle,
    handleDirectionToggle,
  } as const;
};
