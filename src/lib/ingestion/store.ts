'use client';

import { create } from 'zustand';
import type { CorpusSource, PipelineStage, StageId, IngestionOutputs } from './types';
import { DEFAULT_STAGES as defaultStages } from './types';

interface IngestionState {
  // State
  currentCorpus: CorpusSource | null;
  stages: PipelineStage[];
  isRunning: boolean;
  outputs: IngestionOutputs;
  lastIngestionAt: string | null;

  // Actions
  setCorpus: (corpus: CorpusSource | null) => void;
  setIsRunning: (isRunning: boolean) => void;
  updateStage: (stageId: StageId, updates: Partial<PipelineStage>) => void;
  setOutputs: (outputs: Partial<IngestionOutputs>) => void;
  reset: () => void;
  resetStages: () => void;
}

const initialOutputs: IngestionOutputs = {
  s3Objects: [],
  documents: [],
  documentVersions: [],
  sections: [],
  sectionVersions: [],
  chunks: [],
  graphNodes: [],
  graphEdges: [],
};

// No localStorage persistence - data is stored in Supabase
export const useIngestionStore = create<IngestionState>()((set) => ({
  // Initial state
  currentCorpus: null,
  stages: [...defaultStages],
  isRunning: false,
  outputs: { ...initialOutputs },
  lastIngestionAt: null,

  // Actions
  setCorpus: (corpus) => set({ currentCorpus: corpus }),

  setIsRunning: (isRunning) => set({ isRunning }),

  updateStage: (stageId, updates) =>
    set((state) => ({
      stages: state.stages.map((stage) =>
        stage.id === stageId ? { ...stage, ...updates } : stage
      ),
    })),

  setOutputs: (outputs) =>
    set((state) => ({
      outputs: { ...state.outputs, ...outputs },
      lastIngestionAt: new Date().toISOString(),
    })),

  reset: () =>
    set({
      currentCorpus: null,
      stages: [...defaultStages],
      isRunning: false,
      outputs: { ...initialOutputs },
      lastIngestionAt: null,
    }),

  resetStages: () =>
    set({
      stages: [...defaultStages],
      isRunning: false,
    }),
}));

// Selectors
export const useCorpus = () => useIngestionStore((s) => s.currentCorpus);
export const useStages = () => useIngestionStore((s) => s.stages);
export const useIsRunning = () => useIngestionStore((s) => s.isRunning);
export const useOutputs = () => useIngestionStore((s) => s.outputs);

export const useStageById = (stageId: StageId) =>
  useIngestionStore((s) => s.stages.find((stage) => stage.id === stageId));

export const useHasIngestionData = () =>
  useIngestionStore((s) => s.outputs.graphNodes.length > 0);

export const usePipelineProgress = () =>
  useIngestionStore((s) => {
    const completedStages = s.stages.filter((stage) => stage.status === 'completed').length;
    return {
      completed: completedStages,
      total: s.stages.length,
      percentage: Math.round((completedStages / s.stages.length) * 100),
    };
  });
