'use client';

import { useEffect, useRef } from 'react';
import { MessageSquare, Loader2, Scale } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageItem } from './message-item';
import type { Message } from '@/lib/types';
import { exampleQueries } from '@/lib/mock-data';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  onExampleClick?: (query: string) => void;
}

export function MessageList({ messages, isLoading, onExampleClick }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Empty state
  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-brand/10 flex items-center justify-center mb-6">
          <Scale className="h-8 w-8 text-brand" />
        </div>
        <h2 className="text-xl font-semibold text-text-primary mb-2">
          Legal Conflict Analysis
        </h2>
        <p className="text-text-secondary max-w-md mb-8">
          Paste a local ordinance or draft bill to analyze it against federal, state, and municipal law.
        </p>

        {/* Example queries */}
        <div className="w-full max-w-2xl">
          <p className="text-sm text-text-muted mb-3">Try an example:</p>
          <div className="grid gap-2">
            {exampleQueries.slice(0, 3).map((query, index) => (
              <button
                key={index}
                onClick={() => onExampleClick?.(query)}
                className="flex items-start gap-3 p-3 rounded-lg border border-border-default bg-bg-card hover:bg-bg-elevated transition-colors text-left group"
              >
                <MessageSquare className="h-5 w-5 text-text-muted group-hover:text-brand transition-colors shrink-0 mt-0.5" />
                <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">
                  {query}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1 h-full">
      <div className="space-y-4 p-4 pt-6">
        {messages.map((message) => (
          <MessageItem key={message.id} message={message} />
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex gap-4 p-4 rounded-lg bg-bg-card">
            <div className="h-8 w-8 rounded-full bg-accent-purple flex items-center justify-center">
              <Loader2 className="h-4 w-4 text-bg-primary animate-spin" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-text-primary">Vulcan</span>
                <span className="text-xs text-text-muted">analyzing...</span>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-bg-elevated rounded animate-pulse w-3/4" />
                <div className="h-4 bg-bg-elevated rounded animate-pulse w-1/2" />
                <div className="h-4 bg-bg-elevated rounded animate-pulse w-2/3" />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}
