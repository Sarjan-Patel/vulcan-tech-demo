'use client';

import { useChat } from '@/hooks/use-chat';
import { MessageList } from './message-list';
import { ChatInput } from './chat-input';

export function ChatContainer() {
  const { messages, isLoading, error, sendMessage, clearMessages } = useChat();

  const handleExampleClick = (query: string) => {
    sendMessage(query);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-bg-primary">
      {/* Messages area */}
      <MessageList
        messages={messages}
        isLoading={isLoading}
        onExampleClick={handleExampleClick}
      />

      {/* Error display */}
      {error && (
        <div className="px-4 py-2 bg-status-error/10 border-t border-status-error/30">
          <p className="text-sm text-status-error text-center">{error}</p>
        </div>
      )}

      {/* Input area */}
      <ChatInput onSend={sendMessage} isLoading={isLoading} />

      {/* Clear button (only show when there are messages) */}
      {messages.length > 0 && !isLoading && (
        <div className="px-4 pb-4 bg-bg-card">
          <button
            onClick={clearMessages}
            className="text-sm text-text-muted hover:text-text-secondary transition-colors"
          >
            Clear conversation
          </button>
        </div>
      )}
    </div>
  );
}
