'use client';

import { useCallback, useState } from 'react';
import { useIngestionStore } from '@/lib/ingestion/store';
import { runRealPipeline } from '@/lib/ingestion/real-pipeline';
import type { StageId } from '@/lib/ingestion/types';
import { SourceSelector } from './source-selector';
import { PipelineStepper } from './pipeline-stepper';
import { OutputsTabs } from './outputs-tabs';
import { Database, Trash2, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

export function IngestDashboard() {
  const {
    currentCorpus,
    stages,
    isRunning,
    outputs,
    setCorpus,
    setIsRunning,
    updateStage,
    setOutputs,
    resetStages,
  } = useIngestionStore();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [bulkIngestStatus, setBulkIngestStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [bulkIngestMessage, setBulkIngestMessage] = useState<string>('');
  const [clearStatus, setClearStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleStartPipeline = useCallback(async () => {
    if (!currentCorpus || !selectedFile || isRunning) return;

    // Reset stages before starting
    resetStages();
    setIsRunning(true);

    try {
      await runRealPipeline(selectedFile, currentCorpus, {
        onStageStart: (stageId) => {
          updateStage(stageId as StageId, {
            status: 'in_progress',
            progress: 0,
            startedAt: new Date().toISOString(),
          });
        },
        onStageProgress: (stageId, progress) => {
          updateStage(stageId as StageId, { progress });
        },
        onStageComplete: (stageId, outputCount) => {
          updateStage(stageId as StageId, {
            status: 'completed',
            progress: 100,
            outputCount,
            completedAt: new Date().toISOString(),
          });
        },
        onStageError: (stageId, error) => {
          updateStage(stageId as StageId, {
            status: 'error',
            error,
          });
        },
        onOutputs: (pipelineOutputs) => {
          setOutputs(pipelineOutputs);
        },
      });
    } catch (error) {
      console.error('Pipeline error:', error);
    } finally {
      setIsRunning(false);
    }
  }, [currentCorpus, selectedFile, isRunning, resetStages, setIsRunning, updateStage, setOutputs]);

  // Bulk ingest all demo files
  const handleBulkIngest = useCallback(async () => {
    setBulkIngestStatus('loading');
    setBulkIngestMessage('Ingesting demo documents...');

    try {
      const response = await fetch('/api/ingest-demo', { method: 'POST' });
      const data = await response.json();

      if (data.success) {
        setBulkIngestStatus('success');
        setBulkIngestMessage(
          `Ingested ${data.summary.ingested} documents, skipped ${data.summary.skipped} duplicates`
        );
      } else {
        setBulkIngestStatus('error');
        setBulkIngestMessage(data.error || 'Failed to ingest demo files');
      }
    } catch (error) {
      setBulkIngestStatus('error');
      setBulkIngestMessage(error instanceof Error ? error.message : 'Unknown error');
    }

    // Reset status after 5 seconds
    setTimeout(() => {
      setBulkIngestStatus('idle');
      setBulkIngestMessage('');
    }, 5000);
  }, []);

  // Clear all data
  const handleClearData = useCallback(async () => {
    if (!confirm('Are you sure you want to clear ALL ingested data? This cannot be undone.')) {
      return;
    }

    setClearStatus('loading');

    try {
      const response = await fetch('/api/clear-data', { method: 'POST' });
      const data = await response.json();

      if (data.success) {
        setClearStatus('success');
        // Reset local state
        resetStages();
        setOutputs({
          s3Objects: [],
          documents: [],
          documentVersions: [],
          sections: [],
          sectionVersions: [],
          chunks: [],
          graphNodes: [],
          graphEdges: [],
        });
      } else {
        setClearStatus('error');
      }
    } catch (error) {
      setClearStatus('error');
    }

    setTimeout(() => setClearStatus('idle'), 3000);
  }, [resetStages, setOutputs]);

  const hasOutputs = outputs.s3Objects.length > 0;

  return (
    <div className="min-h-screen bg-bg-primary pt-20 pb-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-text-primary">Ingestion Pipeline</h1>
              <p className="mt-2 text-text-secondary">
                Upload legal documents to ingest through our 4-stage data pipeline: Upload to S3 → Parse
                & Store Metadata → Chunk & Embed → Build Knowledge Graph
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-3">
              {/* Bulk Ingest Demo Button */}
              <button
                onClick={handleBulkIngest}
                disabled={bulkIngestStatus === 'loading'}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  bulkIngestStatus === 'loading'
                    ? 'bg-brand/20 text-brand cursor-wait'
                    : bulkIngestStatus === 'success'
                    ? 'bg-status-success/20 text-status-success'
                    : bulkIngestStatus === 'error'
                    ? 'bg-status-error/20 text-status-error'
                    : 'bg-brand/10 text-brand hover:bg-brand/20 border border-brand/30'
                }`}
              >
                {bulkIngestStatus === 'loading' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : bulkIngestStatus === 'success' ? (
                  <CheckCircle className="w-4 h-4" />
                ) : bulkIngestStatus === 'error' ? (
                  <AlertCircle className="w-4 h-4" />
                ) : (
                  <Database className="w-4 h-4" />
                )}
                {bulkIngestStatus === 'loading'
                  ? 'Ingesting...'
                  : bulkIngestStatus === 'success'
                  ? 'Done!'
                  : bulkIngestStatus === 'error'
                  ? 'Failed'
                  : 'Ingest Demo Data'}
              </button>

              {/* Clear Data Button */}
              <button
                onClick={handleClearData}
                disabled={clearStatus === 'loading'}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  clearStatus === 'loading'
                    ? 'bg-status-error/20 text-status-error cursor-wait'
                    : clearStatus === 'success'
                    ? 'bg-status-success/20 text-status-success'
                    : 'bg-bg-elevated text-text-muted hover:text-status-error hover:bg-status-error/10 border border-border-default'
                }`}
              >
                {clearStatus === 'loading' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : clearStatus === 'success' ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                {clearStatus === 'loading' ? 'Clearing...' : clearStatus === 'success' ? 'Cleared!' : 'Clear All'}
              </button>
            </div>
          </div>

          {/* Bulk ingest status message */}
          {bulkIngestMessage && (
            <div
              className={`mt-4 px-4 py-2 rounded-lg text-sm ${
                bulkIngestStatus === 'success'
                  ? 'bg-status-success/10 text-status-success border border-status-success/30'
                  : bulkIngestStatus === 'error'
                  ? 'bg-status-error/10 text-status-error border border-status-error/30'
                  : 'bg-brand/10 text-brand border border-brand/30'
              }`}
            >
              {bulkIngestMessage}
            </div>
          )}
        </div>

        {/* Main Layout: 3 panels */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Panel: Source Selection */}
          <div className="lg:col-span-3">
            <div className="sticky top-24">
              <SourceSelector
                selectedCorpus={currentCorpus}
                onSelect={setCorpus}
                onStart={handleStartPipeline}
                isRunning={isRunning}
                selectedFile={selectedFile}
                onFileSelect={setSelectedFile}
              />
            </div>
          </div>

          {/* Center Panel: Pipeline Stepper */}
          <div className="lg:col-span-4">
            <PipelineStepper stages={stages} />
          </div>

          {/* Right Panel: Outputs Preview */}
          <div className="lg:col-span-5">
            <OutputsTabs outputs={outputs} stages={stages} hasOutputs={hasOutputs} />
          </div>
        </div>
      </div>
    </div>
  );
}
