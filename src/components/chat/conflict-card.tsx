import { AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { CitationBadge } from '@/components/citation/citation-badge';
import type { Conflict } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ConflictCardProps {
  conflict: Conflict;
}

const severityConfig = {
  high: {
    icon: AlertTriangle,
    color: 'text-status-error',
    bgColor: 'bg-status-error/5',
    borderColor: 'border-status-error/30',
    label: 'High Severity',
  },
  medium: {
    icon: AlertCircle,
    color: 'text-status-warning',
    bgColor: 'bg-status-warning/5',
    borderColor: 'border-status-warning/30',
    label: 'Medium Severity',
  },
  low: {
    icon: Info,
    color: 'text-status-info',
    bgColor: 'bg-status-info/5',
    borderColor: 'border-status-info/30',
    label: 'Low Severity',
  },
};

const conflictTypeLabels = {
  direct: 'Direct Conflict',
  preemption: 'Preemption',
  implicit: 'Implicit Conflict',
};

export function ConflictCard({ conflict }: ConflictCardProps) {
  const config = severityConfig[conflict.severity];
  const Icon = config.icon;

  return (
    <div className={cn(
      'rounded-lg border p-4',
      config.bgColor,
      config.borderColor
    )}>
      <div className="flex items-start gap-3">
        <Icon className={cn('h-5 w-5 shrink-0 mt-0.5', config.color)} />
        <div className="flex-1 space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1">
              <h4 className="font-medium text-text-primary">Conflict Detected</h4>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className={cn('text-xs', config.color)}>
                  {config.label}
                </Badge>
                <Badge variant="outline" className="text-xs text-text-muted">
                  {conflictTypeLabels[conflict.conflictType]}
                </Badge>
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-text-secondary">
            {conflict.description}
          </p>

          {/* Local Rule */}
          <div className="space-y-1">
            <span className="text-xs font-medium text-text-muted uppercase tracking-wider">
              Local Rule
            </span>
            <p className="text-sm text-text-primary bg-bg-elevated/50 rounded-md p-2 border border-border-default">
              {conflict.localRule}
            </p>
          </div>

          {/* Higher Law */}
          <div className="space-y-1">
            <span className="text-xs font-medium text-text-muted uppercase tracking-wider">
              Higher Authority
            </span>
            <div className="flex items-center gap-2">
              <CitationBadge citation={conflict.higherLaw} showGraphLink />
            </div>
            {conflict.higherLaw.excerpt && (
              <p className="text-sm text-text-secondary italic bg-bg-elevated/50 rounded-md p-2 border border-border-default">
                &quot;{conflict.higherLaw.excerpt}&quot;
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
