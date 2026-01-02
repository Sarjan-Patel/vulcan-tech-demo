'use client';

import { useRef } from 'react';
import { Database, Play, RotateCcw, Upload, FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { CorpusSource } from '@/lib/ingestion/types';
import { CORPUS_OPTIONS } from '@/lib/ingestion/types';
import { useIngestionStore } from '@/lib/ingestion/store';

interface SourceSelectorProps {
  selectedCorpus: CorpusSource | null;
  onSelect: (corpus: CorpusSource | null) => void;
  onStart: () => void;
  isRunning: boolean;
  selectedFile: File | null;
  onFileSelect: (file: File | null) => void;
}

export function SourceSelector({
  selectedCorpus,
  onSelect,
  onStart,
  isRunning,
  selectedFile,
  onFileSelect,
}: SourceSelectorProps) {
  const { reset, outputs } = useIngestionStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasOutputs = outputs.s3Objects.length > 0;

  const selectedCorpusInfo = CORPUS_OPTIONS.find((o) => o.id === selectedCorpus);

  const handleReset = () => {
    reset();
    onFileSelect(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const handleRemoveFile = () => {
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const getAcceptedTypes = () => {
    if (!selectedCorpusInfo) return '.json,.xml,.txt,.html';
    return selectedCorpusInfo.acceptedFileTypes.join(',');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Card className="bg-bg-card border-border-default">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-brand" />
          <CardTitle className="text-text-primary">Source Selection</CardTitle>
        </div>
        <CardDescription className="text-text-muted">
          Choose a legal corpus and upload a document to ingest
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Corpus Dropdown */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-secondary">Corpus Source</label>
          <Select
            value={selectedCorpus || ''}
            onValueChange={(value) => onSelect(value as CorpusSource)}
            disabled={isRunning}
          >
            <SelectTrigger className="w-full bg-bg-elevated border-border-default">
              <SelectValue placeholder="Select a corpus..." />
            </SelectTrigger>
            <SelectContent className="bg-bg-elevated border-border-default">
              {CORPUS_OPTIONS.map((option) => (
                <SelectItem
                  key={option.id}
                  value={option.id}
                  className="focus:bg-bg-card focus:text-text-primary"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{option.label}</span>
                    <span className="text-xs text-text-muted">{option.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Selected Corpus Info */}
        {selectedCorpus && (
          <div className="rounded-lg bg-bg-elevated p-3 border border-border-default">
            <p className="text-sm text-text-secondary">{selectedCorpusInfo?.description}</p>
            <p className="text-xs text-text-muted mt-1">
              Jurisdiction:{' '}
              <span className="capitalize">{selectedCorpusInfo?.jurisdiction}</span>
            </p>
            <p className="text-xs text-text-muted mt-1">
              Accepted files: {selectedCorpusInfo?.acceptedFileTypes.join(', ')}
            </p>
          </div>
        )}

        {/* File Upload */}
        {selectedCorpus && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-secondary">Upload Document</label>

            {!selectedFile ? (
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border-default rounded-lg p-6 text-center cursor-pointer hover:border-brand/50 hover:bg-bg-elevated/50 transition-colors"
              >
                <Upload className="h-8 w-8 mx-auto text-text-muted mb-2" />
                <p className="text-sm text-text-secondary">
                  Drop a file here or click to browse
                </p>
                <p className="text-xs text-text-muted mt-1">
                  Supports {selectedCorpusInfo?.acceptedFileTypes.join(', ')}
                </p>
              </div>
            ) : (
              <div className="border border-border-default rounded-lg p-3 bg-bg-elevated">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 min-w-0">
                    <FileText className="h-5 w-5 text-brand flex-shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-sm text-text-primary truncate">{selectedFile.name}</p>
                      <p className="text-xs text-text-muted">
                        {formatFileSize(selectedFile.size)}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveFile}
                    disabled={isRunning}
                    className="h-6 w-6 p-0 hover:bg-status-error/20"
                  >
                    <X className="h-4 w-4 text-text-muted hover:text-status-error" />
                  </Button>
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept={getAcceptedTypes()}
              onChange={handleFileChange}
              className="hidden"
              disabled={isRunning}
            />
          </div>
        )}

        {/* Start Button */}
        <Button
          onClick={onStart}
          disabled={!selectedCorpus || !selectedFile || isRunning}
          className="w-full bg-brand hover:bg-brand/90 text-bg-primary"
        >
          {isRunning ? (
            <>
              <span className="animate-spin mr-2">
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              </span>
              Ingesting...
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Start Ingestion
            </>
          )}
        </Button>

        {/* Validation message */}
        {selectedCorpus && !selectedFile && (
          <p className="text-xs text-text-muted text-center">
            Please upload a document to start ingestion
          </p>
        )}

        {/* Reset Button */}
        {hasOutputs && !isRunning && (
          <Button
            onClick={handleReset}
            variant="outline"
            className="w-full border-border-default text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset Pipeline
          </Button>
        )}

        {/* Status Info */}
        {hasOutputs && (
          <div className="text-xs text-text-muted text-center pt-2 border-t border-border-default">
            Last ingestion completed with {outputs.chunks.length} chunks
          </div>
        )}
      </CardContent>
    </Card>
  );
}
