import { defineRouteConfig } from '@medusajs/admin-sdk';
import { ChatBubbleLeftRight } from '@medusajs/icons';
import './styles.css';
import { AiChat } from './components/ai-chat';
import { ChatPortal } from './components/ChatPortal/chat-portal';

const ChatPage = () => {
  return <AiChat showHeader className="-m-3" />;
};

export const config = defineRouteConfig({
  label: 'AI Chat',
  icon: () => {
    return (
      <>
        <ChatBubbleLeftRight />
        <ChatPortal />
      </>
    );
  },
});

export default ChatPage;
