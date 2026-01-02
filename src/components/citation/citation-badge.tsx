'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ExternalLink, Network } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { Citation } from '@/lib/types';
import { cn } from '@/lib/utils';

interface CitationBadgeProps {
  citation: Citation;
  onClick?: () => void;
  showGraphLink?: boolean;
  onViewInGraph?: () => void;
}

const jurisdictionColors = {
  federal: 'text-federal border-federal/30 bg-federal/10 hover:bg-federal/20',
  state: 'text-state border-state/30 bg-state/10 hover:bg-state/20',
  municipal: 'text-municipal border-municipal/30 bg-municipal/10 hover:bg-municipal/20',
};

export function CitationBadge({ citation, onClick, showGraphLink = false, onViewInGraph }: CitationBadgeProps) {
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();

  const handleViewInGraph = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onViewInGraph) {
      onViewInGraph();
    } else {
      // Navigate to graph page with citation info as query params
      router.push(`/graph?highlight=${encodeURIComponent(citation.citation)}`);
    }
  };

  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <button
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={cn(
              'inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium border transition-colors cursor-pointer',
              jurisdictionColors[citation.jurisdiction]
            )}
          >
            <span>{citation.citation}</span>
            {isHovered && (
              <ExternalLink className="h-3 w-3" />
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-sm">
          <div className="space-y-2">
            <div className="font-medium">{citation.title}</div>
            <div className="text-xs text-text-muted">{citation.citation} ({citation.year})</div>
            {citation.excerpt && (
              <p className="text-xs text-text-secondary line-clamp-3">
                &quot;{citation.excerpt}&quot;
              </p>
            )}
            <div className="flex items-center gap-2 pt-1">
              <Badge variant="outline" className="text-xs capitalize">
                {citation.jurisdiction}
              </Badge>
              {showGraphLink && (
                <button
                  onClick={handleViewInGraph}
                  className="flex items-center gap-1 text-xs text-brand hover:text-brand/80 hover:underline cursor-pointer"
                >
                  <Network className="h-3 w-3" />
                  View in graph
                </button>
              )}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
