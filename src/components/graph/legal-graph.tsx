'use client';

import { useCallback, useMemo } from 'react';
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
import { mockGraphNodes, mockGraphEdges } from '@/lib/mock-data';
import type { LegalNode as LegalNodeType, LegalNodeData, LegalEdge } from '@/lib/types';

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

  // Transform and layout nodes
  const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(() => {
    const flowNodes = transformToFlowNodes(mockGraphNodes);
    const flowEdges = transformToFlowEdges(mockGraphEdges);
    return getLayoutedElements(flowNodes, flowEdges);
  }, []);

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);

  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      const legalNode = mockGraphNodes.find((n) => n.id === node.id);
      if (legalNode) {
        selectNode(legalNode);
      }
    },
    [selectNode]
  );

  const onPaneClick = useCallback(() => {
    closeDetailPanel();
  }, [closeDetailPanel]);

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Graph area */}
      <div className="flex-1 relative">
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
