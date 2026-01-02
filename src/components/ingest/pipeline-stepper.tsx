'use client';

import { Check, Loader2, AlertCircle, HardDrive, Database, Cpu, Network } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { PipelineStage, StageId, StageStatus } from '@/lib/ingestion/types';

const stageIcons: Record<StageId, typeof HardDrive> = {
  s3: HardDrive,
  postgres: Database,
  vector: Cpu,
  graph: Network,
};

const stageDescriptions: Record<StageId, string> = {
  s3: 'Fetch raw documents from source and store in S3 bucket',
  postgres: 'Parse documents, extract metadata, and store in PostgreSQL',
  vector: 'Chunk text and generate vector embeddings',
  graph: 'Build knowledge graph with authority and conflict relationships',
};

interface StepIndicatorProps {
  status: StageStatus;
  Icon: typeof HardDrive;
}

function StepIndicator({ status, Icon }: StepIndicatorProps) {
  const baseClasses =
    'w-12 h-12 rounded-xl flex items-center justify-center border-2 transition-all duration-300';

  switch (status) {
    case 'completed':
      return (
        <div className={cn(baseClasses, 'bg-status-success/20 border-status-success')}>
          <Check className="w-6 h-6 text-status-success" />
        </div>
      );
    case 'in_progress':
      return (
        <div className={cn(baseClasses, 'border-brand bg-brand/10')}>
          <Loader2 className="w-6 h-6 text-brand animate-spin" />
        </div>
      );
    case 'error':
      return (
        <div className={cn(baseClasses, 'bg-status-error/20 border-status-error')}>
          <AlertCircle className="w-6 h-6 text-status-error" />
        </div>
      );
    default:
      return (
        <div className={cn(baseClasses, 'border-border-default bg-bg-elevated')}>
          <Icon className="w-6 h-6 text-text-muted" />
        </div>
      );
  }
}

interface PipelineStepProps {
  stage: PipelineStage;
  isLast: boolean;
}

function PipelineStep({ stage, isLast }: PipelineStepProps) {
  const Icon = stageIcons[stage.id];
  const description = stageDescriptions[stage.id];

  return (
    <div className="relative">
      <div className="flex gap-4">
        {/* Step Indicator */}
        <div className="flex flex-col items-center">
          <StepIndicator status={stage.status} Icon={Icon} />
          {/* Connector Line */}
          {!isLast && (
            <div
              className={cn(
                'w-0.5 flex-1 min-h-[40px] mt-2',
                stage.status === 'completed' ? 'bg-status-success' : 'bg-border-default'
              )}
            />
          )}
        </div>

        {/* Step Content */}
        <div className="flex-1 pb-6">
          <div className="flex items-center justify-between">
            <h3
              className={cn(
                'text-base font-medium',
                stage.status === 'in_progress' && 'text-brand',
                stage.status === 'completed' && 'text-status-success',
                stage.status === 'error' && 'text-status-error',
                stage.status === 'pending' && 'text-text-muted'
              )}
            >
              {stage.label}
            </h3>
            {stage.status === 'completed' && stage.outputCount > 0 && (
              <span className="text-xs text-text-muted bg-bg-elevated px-2 py-1 rounded">
                {stage.outputCount} items
              </span>
            )}
          </div>

          <p className="text-sm text-text-muted mt-1">{description}</p>

          {/* Progress Bar */}
          {stage.status === 'in_progress' && (
            <div className="mt-3">
              <Progress value={stage.progress} className="h-2" />
              <p className="text-xs text-text-muted mt-1">{stage.progress}% complete</p>
            </div>
          )}

          {/* Error Message */}
          {stage.status === 'error' && stage.error && (
            <div className="mt-2 p-2 rounded bg-status-error/10 border border-status-error/30">
              <p className="text-sm text-status-error">{stage.error}</p>
            </div>
          )}

          {/* Completion Time */}
          {stage.status === 'completed' && stage.completedAt && (
            <p className="text-xs text-text-muted mt-2">
              Completed at {new Date(stage.completedAt).toLocaleTimeString()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

interface PipelineStepperProps {
  stages: PipelineStage[];
}

export function PipelineStepper({ stages }: PipelineStepperProps) {
  const completedCount = stages.filter((s) => s.status === 'completed').length;
  const isComplete = completedCount === stages.length;
  const isRunning = stages.some((s) => s.status === 'in_progress');

  return (
    <Card className="bg-bg-card border-border-default">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-text-primary">Pipeline Progress</CardTitle>
          <span
            className={cn(
              'text-sm px-3 py-1 rounded-full',
              isComplete && 'bg-status-success/20 text-status-success',
              isRunning && 'bg-brand/20 text-brand',
              !isComplete && !isRunning && 'bg-bg-elevated text-text-muted'
            )}
          >
            {isComplete
              ? 'Complete'
              : isRunning
                ? 'Running...'
                : `${completedCount}/${stages.length} stages`}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-0">
          {stages.map((stage, index) => (
            <PipelineStep key={stage.id} stage={stage} isLast={index === stages.length - 1} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
