'use client';

import { useCallback, useMemo, useEffect, useState } from 'react';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  BackgroundVariant,
  Node,
  Edge,
  ConnectionLineType,
} from '@xyflow/react';
import dagre from '@dagrejs/dagre';
import '@xyflow/react/dist/style.css';

import { LegalNode } from './legal-node';
import { GraphLegend } from './graph-legend';
import { NodeDetailPanel } from './node-detail-panel';
import { useGraph } from '@/hooks/use-graph';
import { getGraphNodesLegacy, getGraphEdgesLegacy } from '@/lib/supabase/ingestion-service';
import { convertToLegalNodes, convertToLegalEdges } from '@/lib/ingestion/graph-adapter';
import type { LegalNode as LegalNodeType, LegalNodeData, LegalEdge } from '@/lib/types';
import type { IngestionGraphNode, IngestionGraphEdge } from '@/lib/ingestion/types';
import { Database, Upload } from 'lucide-react';
import Link from 'next/link';

const nodeTypes = {
  legal: LegalNode,
};

const nodeWidth = 200;
const nodeHeight = 100;

// Create dagre graph for layout
function getLayoutedElements(
  nodes: Node<LegalNodeData>[],
  edges: Edge[],
  direction: 'TB' | 'LR' = 'TB'
) {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: direction, nodesep: 50, ranksep: 100 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
}

// Transform mock data to React Flow format
function transformToFlowNodes(legalNodes: LegalNodeType[]): Node<LegalNodeData>[] {
  return legalNodes.map((node) => ({
    id: node.id,
    type: 'legal',
    position: { x: 0, y: 0 }, // Will be set by dagre
    data: {
      title: node.title,
      citation: node.citation,
      jurisdiction: node.jurisdiction,
      type: node.type,
      status: node.status,
      effectiveDate: node.effectiveDate,
    },
  }));
}

function transformToFlowEdges(legalEdges: LegalEdge[]): Edge[] {
  return legalEdges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    type: 'smoothstep',
    animated: edge.relationship === 'conflicts',
    style: {
      stroke: edge.relationship === 'conflicts' ? '#FCA5A5' : '#FFFFFF33',
      strokeWidth: 2,
      strokeDasharray: edge.relationship === 'conflicts' ? '5,5' : undefined,
    },
    label: edge.relationship === 'conflicts' ? 'conflicts' : undefined,
    labelStyle: { fill: '#FCA5A5', fontSize: 10 },
    labelBgStyle: { fill: '#0A1322', fillOpacity: 0.8 },
  }));
}

export function LegalGraph() {
  const { selectedNode, isDetailPanelOpen, selectNode, closeDetailPanel } = useGraph();

  // State for Supabase data
  const [supabaseNodes, setSupabaseNodes] = useState<IngestionGraphNode[]>([]);
  const [supabaseEdges, setSupabaseEdges] = useState<IngestionGraphEdge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data from Supabase on mount
  useEffect(() => {
    async function fetchGraphData() {
      try {
        setIsLoading(true);
        setError(null);

        const [nodes, edges] = await Promise.all([
          getGraphNodesLegacy(),
          getGraphEdgesLegacy(),
        ]);

        setSupabaseNodes(nodes);
        setSupabaseEdges(edges);
      } catch (err) {
        console.error('Failed to fetch graph data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load graph data');
      } finally {
        setIsLoading(false);
      }
    }

    fetchGraphData();
  }, []);

  // Use Supabase data only - no mock fallback
  const hasData = supabaseNodes.length > 0;
  const graphNodes = useMemo(() => {
    return convertToLegalNodes(supabaseNodes);
  }, [supabaseNodes]);

  const graphEdges = useMemo(() => {
    return convertToLegalEdges(supabaseEdges);
  }, [supabaseEdges]);

  // Transform and layout nodes
  const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(() => {
    const flowNodes = transformToFlowNodes(graphNodes);
    const flowEdges = transformToFlowEdges(graphEdges);
    return getLayoutedElements(flowNodes, flowEdges);
  }, [graphNodes, graphEdges]);

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);

  // Update nodes and edges when Supabase data changes
  useEffect(() => {
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [layoutedNodes, layoutedEdges, setNodes, setEdges]);

  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      const legalNode = graphNodes.find((n) => n.id === node.id);
      if (legalNode) {
        selectNode(legalNode);
      }
    },
    [selectNode, graphNodes]
  );

  const onPaneClick = useCallback(() => {
    closeDetailPanel();
  }, [closeDetailPanel]);

  // Refresh data from Supabase
  const handleRefresh = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [nodes, edges] = await Promise.all([
        getGraphNodesLegacy(),
        getGraphEdgesLegacy(),
      ]);

      setSupabaseNodes(nodes);
      setSupabaseEdges(edges);
    } catch (err) {
      console.error('Failed to refresh graph data:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh graph data');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Graph area */}
      <div className="flex-1 relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-bg-primary/80 z-10">
            <div className="flex flex-col items-center gap-2">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand border-t-transparent" />
              <p className="text-sm text-text-secondary">Loading knowledge graph...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute top-4 left-4 right-4 z-10">
            <div className="p-3 rounded-lg border border-status-error/30 bg-status-error/10">
              <p className="text-sm text-status-error">{error}</p>
              <button
                onClick={handleRefresh}
                className="mt-2 text-xs text-brand hover:text-brand/80 underline"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          nodeTypes={nodeTypes}
          connectionLineType={ConnectionLineType.SmoothStep}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.5}
          maxZoom={1.5}
          defaultEdgeOptions={{
            type: 'smoothstep',
          }}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={24}
            size={1}
            color="#FFFFFF1A"
          />
          <Controls
            showInteractive={false}
            className="!bg-bg-elevated !border-border-default"
          />
        </ReactFlow>

        <GraphLegend />

        {/* Data source indicator */}
        {hasData && (
          <div className="absolute top-4 left-4 hidden md:block">
            <div className="px-3 py-1.5 rounded-lg border border-brand/30 bg-brand/10">
              <div className="flex items-center gap-2">
                <Database className="w-3 h-3 text-brand" />
                <p className="text-xs text-brand">
                  {graphNodes.length} nodes, {graphEdges.length} edges
                </p>
                <button
                  onClick={handleRefresh}
                  disabled={isLoading}
                  className="text-xs text-text-muted hover:text-text-secondary underline disabled:opacity-50"
                >
                  Refresh
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Empty state when no data */}
        {!isLoading && !hasData && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center max-w-md p-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-bg-elevated border border-border-default flex items-center justify-center">
                <Database className="w-8 h-8 text-text-muted" />
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-2">
                No Documents Ingested
              </h3>
              <p className="text-text-secondary mb-6">
                Ingest legal documents to build the knowledge graph. The graph will visualize the authority hierarchy and detect conflicts across jurisdictions.
              </p>
              <Link
                href="/ingest"
                className="inline-flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand/90 transition-colors"
              >
                <Upload className="w-4 h-4" />
                Go to Ingestion
              </Link>
            </div>
          </div>
        )}

        {/* Mobile warning */}
        <div className="absolute top-4 left-4 right-4 md:hidden">
          <div className="p-3 rounded-lg border border-status-warning/30 bg-status-warning/10">
            <p className="text-sm text-status-warning">
              For best experience, view the graph on a larger screen.
            </p>
          </div>
        </div>
      </div>

      {/* Detail panel */}
      {isDetailPanelOpen && selectedNode && (
        <NodeDetailPanel node={selectedNode} onClose={closeDetailPanel} />
      )}
    </div>
  );
}
