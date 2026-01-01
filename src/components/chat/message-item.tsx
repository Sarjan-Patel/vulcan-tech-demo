import { User, Bot } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ReasoningChain } from './reasoning-chain';
import { ConflictCard } from './conflict-card';
import { SuggestionCard } from './suggestion-card';
import type { Message } from '@/lib/types';
import { cn } from '@/lib/utils';

interface MessageItemProps {
  message: Message;
}

export function MessageItem({ message }: MessageItemProps) {
  const isUser = message.role === 'user';

  return (
    <div className={cn(
      'flex gap-4 p-4 rounded-lg',
      isUser ? 'bg-bg-elevated' : 'bg-bg-card'
    )}>
      {/* Avatar */}
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback className={cn(
          isUser ? 'bg-brand text-primary-foreground' : 'bg-accent-purple text-bg-primary'
        )}>
          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>

      {/* Content */}
      <div className="flex-1 space-y-4 min-w-0">
        {/* Role label */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-text-primary">
            {isUser ? 'You' : 'Vulcan'}
          </span>
          <span className="text-xs text-text-muted">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        {/* Message content */}
        {isUser ? (
          <p className="text-text-primary whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div className="space-y-6">
            {/* Summary */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-text-muted uppercase tracking-wider">
                Analysis Summary
              </h3>
              <p className="text-text-primary">{message.content}</p>
            </div>

            {/* Analysis details */}
            {message.analysis && (
              <>
                {/* Conflicts */}
                {message.analysis.conflicts.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-text-muted uppercase tracking-wider">
                      Conflicts Found ({message.analysis.conflicts.length})
                    </h3>
                    {message.analysis.conflicts.map((conflict) => (
                      <ConflictCard key={conflict.id} conflict={conflict} />
                    ))}
                  </div>
                )}

                {/* Reasoning Chain */}
                {message.analysis.reasoningChain.length > 0 && (
                  <ReasoningChain steps={message.analysis.reasoningChain} />
                )}

                {/* Suggestions */}
                {message.analysis.suggestions.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-text-muted uppercase tracking-wider">
                      Suggested Revisions ({message.analysis.suggestions.length})
                    </h3>
                    {message.analysis.suggestions.map((suggestion) => (
                      <SuggestionCard key={suggestion.id} suggestion={suggestion} />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
