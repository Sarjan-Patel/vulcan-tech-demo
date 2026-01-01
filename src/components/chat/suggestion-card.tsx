'use client';

import { useState } from 'react';
import { Lightbulb, Copy, Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Suggestion } from '@/lib/types';

interface SuggestionCardProps {
  suggestion: Suggestion;
}

export function SuggestionCard({ suggestion }: SuggestionCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(suggestion.compliant);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-lg border border-status-success/30 bg-status-success/5 p-4">
      <div className="flex items-start gap-3">
        <Lightbulb className="h-5 w-5 text-status-success shrink-0 mt-0.5" />
        <div className="flex-1 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-text-primary">Suggested Revision</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-8 px-2 text-text-muted hover:text-text-primary"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-1 text-status-success" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </>
              )}
            </Button>
          </div>

          {/* Before/After comparison */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Original */}
            <div className="space-y-2">
              <span className="text-xs font-medium text-status-error uppercase tracking-wider flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-status-error" />
                Original
              </span>
              <p className="text-sm text-text-secondary bg-bg-elevated/50 rounded-md p-3 border border-border-default line-through decoration-status-error/50">
                {suggestion.original}
              </p>
            </div>

            {/* Arrow for desktop */}
            <div className="hidden md:flex items-center justify-center absolute left-1/2 -translate-x-1/2">
              <ArrowRight className="h-5 w-5 text-text-muted" />
            </div>

            {/* Compliant */}
            <div className="space-y-2">
              <span className="text-xs font-medium text-status-success uppercase tracking-wider flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-status-success" />
                Compliant
              </span>
              <p className="text-sm text-text-primary bg-bg-elevated/50 rounded-md p-3 border border-status-success/30">
                {suggestion.compliant}
              </p>
            </div>
          </div>

          {/* Justification */}
          <div className="pt-2 border-t border-border-default">
            <p className="text-sm text-text-muted">
              <span className="font-medium text-text-secondary">Why: </span>
              {suggestion.justification}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
