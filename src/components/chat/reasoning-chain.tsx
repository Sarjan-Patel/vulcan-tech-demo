'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, CheckCircle } from 'lucide-react';
import { CitationBadge } from '@/components/citation/citation-badge';
import type { ReasoningStep } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ReasoningChainProps {
  steps: ReasoningStep[];
}

export function ReasoningChain({ steps }: ReasoningChainProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const displayedSteps = isExpanded ? steps : steps.slice(0, 2);

  return (
    <div className="space-y-3">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
      >
        <span>Reasoning Chain</span>
        <span className="text-text-muted">({steps.length} steps)</span>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>

      <div className="space-y-0">
        {displayedSteps.map((step, index) => (
          <div key={step.step} className="relative pl-8">
            {/* Connector line */}
            {index < displayedSteps.length - 1 && (
              <div className="absolute left-[11px] top-6 w-0.5 h-[calc(100%+4px)] bg-border-default" />
            )}

            {/* Step indicator */}
            <div className="absolute left-0 top-0.5 flex items-center justify-center w-6 h-6 rounded-full bg-bg-elevated border border-border-default">
              {step.confidence && step.confidence > 0.8 ? (
                <CheckCircle className="h-3.5 w-3.5 text-status-success" />
              ) : (
                <span className="text-xs font-medium text-text-muted">{step.step}</span>
              )}
            </div>

            {/* Step content */}
            <div className="pb-4">
              <p className="text-sm text-text-primary mb-2">
                {step.description}
              </p>

              {/* Confidence indicator */}
              {step.confidence && (
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex-1 h-1.5 bg-bg-elevated rounded-full overflow-hidden max-w-[100px]">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all',
                        step.confidence > 0.8 ? 'bg-status-success' :
                        step.confidence > 0.6 ? 'bg-status-warning' :
                        'bg-status-error'
                      )}
                      style={{ width: `${step.confidence * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-text-muted">
                    {Math.round(step.confidence * 100)}% confidence
                  </span>
                </div>
              )}

              {/* Citations */}
              {step.citations.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {step.citations.map((citation) => (
                    <CitationBadge key={citation.id} citation={citation} />
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {steps.length > 2 && !isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="text-sm text-brand hover:text-brand/80 transition-colors"
        >
          Show {steps.length - 2} more steps
        </button>
      )}
    </div>
  );
}
