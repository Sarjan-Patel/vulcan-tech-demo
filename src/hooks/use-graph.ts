'use client';

import { useState, useCallback } from 'react';
import type { LegalNode } from '@/lib/types';

interface UseGraphReturn {
  selectedNode: LegalNode | null;
  isDetailPanelOpen: boolean;
  selectNode: (node: LegalNode | null) => void;
  closeDetailPanel: () => void;
}

export function useGraph(): UseGraphReturn {
  const [selectedNode, setSelectedNode] = useState<LegalNode | null>(null);
  const [isDetailPanelOpen, setIsDetailPanelOpen] = useState(false);

  const selectNode = useCallback((node: LegalNode | null) => {
    setSelectedNode(node);
    setIsDetailPanelOpen(node !== null);
  }, []);

  const closeDetailPanel = useCallback(() => {
    setIsDetailPanelOpen(false);
    setSelectedNode(null);
  }, []);

  return {
    selectedNode,
    isDetailPanelOpen,
    selectNode,
    closeDetailPanel,
  };
}
