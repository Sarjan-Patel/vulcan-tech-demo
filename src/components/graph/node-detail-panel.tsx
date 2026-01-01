'use client';

import { X, ExternalLink, FileText, Calendar, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { LegalNode } from '@/lib/types';
import { cn } from '@/lib/utils';

interface NodeDetailPanelProps {
  node: LegalNode;
  onClose: () => void;
}

const jurisdictionColors = {
  federal: 'text-federal border-federal/30 bg-federal/10',
  state: 'text-state border-state/30 bg-state/10',
  municipal: 'text-municipal border-municipal/30 bg-municipal/10',
};

const statusConfig = {
  active: {
    icon: CheckCircle,
    label: 'Active',
    color: 'text-status-success',
  },
  conflicting: {
    icon: AlertTriangle,
    label: 'Conflicting',
    color: 'text-status-warning',
  },
  superseded: {
    icon: FileText,
    label: 'Superseded',
    color: 'text-text-muted',
  },
};

export function NodeDetailPanel({ node, onClose }: NodeDetailPanelProps) {
  const StatusIcon = statusConfig[node.status].icon;

  return (
    <div className="w-80 h-full border-l border-border-default bg-bg-card overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border-default">
        <h2 className="font-semibold text-text-primary">Details</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Title and Citation */}
        <div>
          <h3 className="text-lg font-semibold text-text-primary mb-1">
            {node.title}
          </h3>
          <p className="text-sm text-text-muted font-mono">
            {node.citation}
          </p>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className={cn(jurisdictionColors[node.jurisdiction], 'capitalize')}>
            {node.jurisdiction}
          </Badge>
          <Badge variant="outline" className="capitalize">
            {node.type}
          </Badge>
          <Badge variant="outline" className={cn('flex items-center gap-1', statusConfig[node.status].color)}>
            <StatusIcon className="h-3 w-3" />
            {statusConfig[node.status].label}
          </Badge>
        </div>

        <Separator />

        {/* Effective Date */}
        {node.effectiveDate && (
          <div className="flex items-start gap-3">
            <Calendar className="h-4 w-4 text-text-muted mt-0.5" />
            <div>
              <p className="text-sm font-medium text-text-secondary">Effective Date</p>
              <p className="text-sm text-text-muted">
                {new Date(node.effectiveDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
        )}

        {/* Excerpt */}
        {node.excerpt && (
          <div>
            <p className="text-sm font-medium text-text-secondary mb-2">Excerpt</p>
            <p className="text-sm text-text-muted bg-bg-elevated p-3 rounded-lg border border-border-default italic">
              &quot;{node.excerpt}&quot;
            </p>
          </div>
        )}

        <Separator />

        {/* Actions */}
        <div className="space-y-2">
          <Button variant="outline" className="w-full justify-start" disabled>
            <ExternalLink className="h-4 w-4 mr-2" />
            View Full Text
          </Button>
          <Button variant="outline" className="w-full justify-start" disabled>
            <FileText className="h-4 w-4 mr-2" />
            Related Documents
          </Button>
        </div>

        {/* Conflict Warning */}
        {node.status === 'conflicting' && (
          <div className="p-3 rounded-lg border border-status-warning/30 bg-status-warning/5">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-status-warning shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-text-primary">Potential Conflict</p>
                <p className="text-xs text-text-muted mt-1">
                  This document may conflict with higher authorities. Use the chat to analyze in detail.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
