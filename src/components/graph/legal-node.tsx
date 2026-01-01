'use client';

import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { FileText, Scale, ScrollText, Building2, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LegalNodeData, JurisdictionLevel, LegalDocumentType, LegalStatus } from '@/lib/types';

interface LegalNodeProps {
  data: LegalNodeData;
  selected?: boolean;
}

const jurisdictionColors: Record<JurisdictionLevel, string> = {
  federal: 'border-federal bg-federal/10 hover:bg-federal/20',
  state: 'border-state bg-state/10 hover:bg-state/20',
  municipal: 'border-municipal bg-municipal/10 hover:bg-municipal/20',
};

const jurisdictionTextColors: Record<JurisdictionLevel, string> = {
  federal: 'text-federal',
  state: 'text-state',
  municipal: 'text-municipal',
};

const typeIcons: Record<LegalDocumentType, typeof FileText> = {
  constitution: Scale,
  statute: FileText,
  regulation: ScrollText,
  ordinance: Building2,
};

const statusStyles: Record<LegalStatus, string> = {
  active: '',
  conflicting: 'ring-2 ring-status-warning ring-offset-2 ring-offset-bg-primary',
  superseded: 'opacity-50',
};

function LegalNodeComponent({ data, selected }: LegalNodeProps) {
  const Icon = typeIcons[data.type];

  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-border-strong !w-3 !h-3 !border-2 !border-bg-primary"
      />

      <div
        className={cn(
          'px-4 py-3 rounded-lg border-2 min-w-[180px] max-w-[220px] transition-all cursor-pointer',
          jurisdictionColors[data.jurisdiction],
          statusStyles[data.status],
          selected && 'ring-2 ring-brand ring-offset-2 ring-offset-bg-primary'
        )}
      >
        {/* Status indicator */}
        {data.status === 'conflicting' && (
          <div className="absolute -top-2 -right-2">
            <div className="w-5 h-5 rounded-full bg-status-warning flex items-center justify-center">
              <AlertTriangle className="h-3 w-3 text-bg-primary" />
            </div>
          </div>
        )}

        {/* Icon and jurisdiction */}
        <div className="flex items-center gap-2 mb-2">
          <Icon className={cn('h-4 w-4', jurisdictionTextColors[data.jurisdiction])} />
          <span className={cn('text-xs font-medium uppercase tracking-wider', jurisdictionTextColors[data.jurisdiction])}>
            {data.jurisdiction}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-sm font-semibold text-text-primary mb-1 line-clamp-2">
          {data.title}
        </h3>

        {/* Citation */}
        <p className="text-xs text-text-muted truncate">
          {data.citation}
        </p>

        {/* Effective date */}
        {data.effectiveDate && (
          <p className="text-xs text-text-muted mt-1">
            Eff. {new Date(data.effectiveDate).toLocaleDateString()}
          </p>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-border-strong !w-3 !h-3 !border-2 !border-bg-primary"
      />
    </>
  );
}

export const LegalNode = memo(LegalNodeComponent);
