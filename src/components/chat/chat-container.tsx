'use client';

import { useState } from 'react';
import { useChat } from '@/hooks/use-chat';
import { MessageList } from './message-list';
import { ChatInput } from './chat-input';
import { MessageSquarePlus, History, Trash2, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ChatContainer() {
  const {
    messages,
    sessions,
    currentSessionId,
    isLoading,
    isLoadingSessions,
    error,
    sendMessage,
    clearMessages,
    loadSession,
    startNewSession,
    deleteSession,
  } = useChat();

  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleExampleClick = (query: string) => {
    sendMessage(query);
  };

  const handleSessionClick = (sessionId: string) => {
    if (sessionId !== currentSessionId) {
      loadSession(sessionId);
    }
  };

  const handleDeleteSession = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    if (confirm('Delete this chat?')) {
      deleteSession(sessionId);
    }
  };

  return (
    <div className="flex h-screen pt-16 bg-bg-primary">
      {/* Sidebar - Chat History */}
      <div
        className={cn(
          'bg-bg-card border-r border-border-default transition-all duration-300 flex flex-col h-full',
          sidebarOpen ? 'w-64' : 'w-0 overflow-hidden'
        )}
      >
        {/* Sidebar Header */}
        <div className="p-3 border-b border-border-default flex items-center justify-between">
          <h3 className="text-sm font-medium text-text-primary flex items-center gap-2">
            <History className="w-4 h-4" />
            Chat History
          </h3>
          <button
            onClick={startNewSession}
            className="p-1.5 rounded-md hover:bg-bg-elevated text-text-muted hover:text-text-primary transition-colors"
            title="New Chat"
          >
            <MessageSquarePlus className="w-4 h-4" />
          </button>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto">
          {isLoadingSessions ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="w-5 h-5 animate-spin text-text-muted" />
            </div>
          ) : sessions.length === 0 ? (
            <div className="p-4 text-center">
              <p className="text-sm text-text-muted">No chat history yet</p>
              <p className="text-xs text-text-muted mt-1">Start a conversation below</p>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  onClick={() => handleSessionClick(session.id)}
                  className={cn(
                    'group flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors',
                    session.id === currentSessionId
                      ? 'bg-brand/10 text-brand'
                      : 'hover:bg-bg-elevated text-text-secondary hover:text-text-primary'
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">
                      {session.title || 'New Chat'}
                    </p>
                    <p className="text-xs text-text-muted">
                      {new Date(session.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleDeleteSession(e, session.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-status-error/10 text-text-muted hover:text-status-error transition-all"
                    title="Delete chat"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sidebar Toggle */}
      <div className="relative">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute top-1/2 -translate-y-1/2 -left-3 z-10 p-1 bg-bg-elevated border border-border-default rounded-md hover:bg-bg-card transition-colors"
        >
          {sidebarOpen ? (
            <ChevronLeft className="w-4 h-4 text-text-muted" />
          ) : (
            <ChevronRight className="w-4 h-4 text-text-muted" />
          )}
        </button>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
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
    </div>
  );
}
