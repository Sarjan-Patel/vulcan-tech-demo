'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Network, Circle, ArrowRight, AlertTriangle, Link2 } from 'lucide-react';
import type { IngestionGraphNode, IngestionGraphEdge } from '@/lib/ingestion/types';

interface GraphSummaryTabProps {
  graphNodes: IngestionGraphNode[];
  graphEdges: IngestionGraphEdge[];
}

const jurisdictionColors: Record<string, string> = {
  federal: 'bg-federal/20 text-federal border-federal/30',
  state: 'bg-state/20 text-state border-state/30',
  municipal: 'bg-municipal/20 text-municipal border-municipal/30',
};

const nodeTypeColors: Record<string, string> = {
  document: 'bg-brand/20 text-brand border-brand/30',
  section: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
};

const edgeTypeColors: Record<string, string> = {
  AUTHORIZES: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  DERIVES_AUTHORITY_FROM: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  CONFLICTS_WITH: 'bg-status-error/20 text-status-error border-status-error/30',
  AMENDS: 'bg-green-500/20 text-green-400 border-green-500/30',
};

const severityColors: Record<string, string> = {
  high: 'bg-status-error/20 text-status-error border-status-error/30',
  medium: 'bg-status-warning/20 text-status-warning border-status-warning/30',
  low: 'bg-status-success/20 text-status-success border-status-success/30',
};

export function GraphSummaryTab({ graphNodes, graphEdges }: GraphSummaryTabProps) {
  const [selectedNode, setSelectedNode] = useState<IngestionGraphNode | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<IngestionGraphEdge | null>(null);

  // Calculate stats
  const documentNodes = graphNodes.filter((n) => n.nodeType === 'document').length;
  const sectionNodes = graphNodes.filter((n) => n.nodeType === 'section').length;
  const conflictEdges = graphEdges.filter((e) => e.type === 'CONFLICTS_WITH').length;
  const authorityEdges = graphEdges.filter((e) => e.type === 'AUTHORIZES' || e.type === 'DERIVES_AUTHORITY_FROM').length;
  const referenceEdges = graphEdges.filter((e) => e.type === 'AMENDS').length;

  // Get connected edges for a node
  const getNodeEdges = (nodeId: string) => {
    return graphEdges.filter((e) => e.source === nodeId || e.target === nodeId);
  };

  // Get node by ID
  const getNode = (nodeId: string) => {
    return graphNodes.find((n) => n.id === nodeId);
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-text-muted">
            <Network className="w-4 h-4" />
            <span>Knowledge graph with authority and conflict relationships</span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1 text-brand">
              <Circle className="w-2 h-2 fill-current" />
              {documentNodes} docs
            </span>
            <span className="flex items-center gap-1 text-purple-400">
              <Circle className="w-2 h-2 fill-current" />
              {sectionNodes} sections
            </span>
            <span className="flex items-center gap-1 text-status-error">
              <AlertTriangle className="w-3 h-3" />
              {conflictEdges} conflicts
            </span>
          </div>
        </div>

        <Tabs defaultValue="nodes" className="w-full">
          <TabsList className="w-full grid grid-cols-2 bg-bg-elevated h-auto">
            <TabsTrigger value="nodes" className="text-xs py-2">
              <Circle className="w-3 h-3 mr-1" />
              Nodes ({graphNodes.length})
            </TabsTrigger>
            <TabsTrigger value="edges" className="text-xs py-2">
              <ArrowRight className="w-3 h-3 mr-1" />
              Edges ({graphEdges.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="nodes" className="mt-4">
            <ScrollArea className="h-[300px]">
              <div className="border border-border-default rounded-lg overflow-hidden">
                <Table>
                  <TableHeader className="bg-bg-elevated sticky top-0">
                    <TableRow>
                      <TableHead className="text-text-secondary">Label</TableHead>
                      <TableHead className="text-text-secondary">Type</TableHead>
                      <TableHead className="text-text-secondary">Jurisdiction</TableHead>
                      <TableHead className="text-text-secondary">Authority</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {graphNodes.map((node) => (
                      <TableRow
                        key={node.id}
                        className="hover:bg-bg-elevated/50 cursor-pointer"
                        onClick={() => setSelectedNode(node)}
                      >
                        <TableCell className="text-text-primary text-sm max-w-[200px] truncate">
                          {node.label}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={nodeTypeColors[node.nodeType]}>
                            {node.nodeType}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={jurisdictionColors[node.jurisdiction]}>
                            {node.jurisdiction}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-text-muted text-sm capitalize">
                          {node.authorityLevel}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="edges" className="mt-4">
            <ScrollArea className="h-[300px]">
              <div className="border border-border-default rounded-lg overflow-hidden">
                <Table>
                  <TableHeader className="bg-bg-elevated sticky top-0">
                    <TableRow>
                      <TableHead className="text-text-secondary">From → To</TableHead>
                      <TableHead className="text-text-secondary">Type</TableHead>
                      <TableHead className="text-text-secondary">Severity</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {graphEdges.map((edge) => {
                      const sourceNode = getNode(edge.source);
                      const targetNode = getNode(edge.target);
                      return (
                        <TableRow
                          key={edge.id}
                          className="hover:bg-bg-elevated/50 cursor-pointer"
                          onClick={() => setSelectedEdge(edge)}
                        >
                          <TableCell className="text-sm">
                            <span className="text-text-primary">
                              {sourceNode?.label.slice(0, 25) || edge.source.slice(0, 15)}
                            </span>
                            <ArrowRight className="w-3 h-3 inline mx-1 text-text-muted" />
                            <span className="text-text-secondary">
                              {targetNode?.label.slice(0, 25) || edge.target.slice(0, 15)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={edgeTypeColors[edge.type]}>
                              {edge.type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {edge.severity && (
                              <Badge variant="outline" className={severityColors[edge.severity]}>
                                {edge.severity}
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="rounded-lg bg-blue-500/10 border border-blue-500/30 p-2 text-center">
            <span className="text-blue-400 font-medium">{authorityEdges}</span>
            <span className="text-text-muted ml-1">Authority</span>
          </div>
          <div className="rounded-lg bg-status-error/10 border border-status-error/30 p-2 text-center">
            <span className="text-status-error font-medium">{conflictEdges}</span>
            <span className="text-text-muted ml-1">Conflicts</span>
          </div>
          <div className="rounded-lg bg-green-500/10 border border-green-500/30 p-2 text-center">
            <span className="text-green-400 font-medium">{referenceEdges}</span>
            <span className="text-text-muted ml-1">References</span>
          </div>
        </div>

        <div className="text-xs text-text-muted">
          Graph enables traversal for conflict detection and authority chain analysis
        </div>
      </div>

      {/* Node Detail Dialog */}
      <Dialog open={!!selectedNode} onOpenChange={() => setSelectedNode(null)}>
        <DialogContent className="max-w-lg bg-bg-card border-border-default">
          <DialogHeader>
            <DialogTitle className="text-text-primary flex items-center gap-2">
              <Circle className="w-5 h-5 text-brand fill-current" />
              Graph Node Details
            </DialogTitle>
            <DialogDescription className="text-text-muted font-mono text-xs">
              {selectedNode?.id}
            </DialogDescription>
          </DialogHeader>

          {selectedNode && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-text-muted">Label:</span>
                  <span className="ml-2 text-text-primary">{selectedNode.label}</span>
                </div>
                <div>
                  <span className="text-text-muted">Type:</span>
                  <Badge variant="outline" className={`ml-2 ${nodeTypeColors[selectedNode.nodeType]}`}>
                    {selectedNode.nodeType}
                  </Badge>
                </div>
                <div>
                  <span className="text-text-muted">Jurisdiction:</span>
                  <Badge
                    variant="outline"
                    className={`ml-2 ${jurisdictionColors[selectedNode.jurisdiction]}`}
                  >
                    {selectedNode.jurisdiction}
                  </Badge>
                </div>
                <div>
                  <span className="text-text-muted">Authority:</span>
                  <span className="ml-2 text-text-primary capitalize">
                    {selectedNode.authorityLevel}
                  </span>
                </div>
                {selectedNode.citation && (
                  <div className="col-span-2">
                    <span className="text-text-muted">Citation:</span>
                    <span className="ml-2 text-brand font-mono">{selectedNode.citation}</span>
                  </div>
                )}
              </div>

              <div>
                <span className="text-sm text-text-muted block mb-2 flex items-center gap-1">
                  <Link2 className="w-4 h-4" />
                  Connected Edges ({getNodeEdges(selectedNode.id).length}):
                </span>
                <ScrollArea className="h-[120px] rounded-lg border border-border-default bg-bg-elevated p-2">
                  <div className="space-y-1">
                    {getNodeEdges(selectedNode.id).map((edge) => {
                      const otherNodeId =
                        edge.source === selectedNode.id ? edge.target : edge.source;
                      const otherNode = getNode(otherNodeId);
                      const isOutgoing = edge.source === selectedNode.id;
                      return (
                        <div
                          key={edge.id}
                          className="flex items-center gap-2 text-xs p-1 rounded hover:bg-bg-card"
                        >
                          <Badge variant="outline" className={`text-[10px] ${edgeTypeColors[edge.type]}`}>
                            {edge.type}
                          </Badge>
                          <span className="text-text-muted">{isOutgoing ? '→' : '←'}</span>
                          <span className="text-text-secondary truncate">
                            {otherNode?.label || otherNodeId}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edge Detail Dialog */}
      <Dialog open={!!selectedEdge} onOpenChange={() => setSelectedEdge(null)}>
        <DialogContent className="max-w-lg bg-bg-card border-border-default">
          <DialogHeader>
            <DialogTitle className="text-text-primary flex items-center gap-2">
              <ArrowRight className="w-5 h-5 text-brand" />
              Graph Edge Details
            </DialogTitle>
            <DialogDescription className="text-text-muted font-mono text-xs">
              {selectedEdge?.id}
            </DialogDescription>
          </DialogHeader>

          {selectedEdge && (
            <div className="space-y-4">
              <div className="rounded-lg bg-bg-elevated p-3 border border-border-default">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex-1">
                    <span className="text-text-muted text-xs">Source</span>
                    <p className="text-text-primary">
                      {getNode(selectedEdge.source)?.label || selectedEdge.source}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-text-muted mx-2" />
                  <div className="flex-1 text-right">
                    <span className="text-text-muted text-xs">Target</span>
                    <p className="text-text-primary">
                      {getNode(selectedEdge.target)?.label || selectedEdge.target}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-text-muted">Type:</span>
                  <Badge variant="outline" className={`ml-2 ${edgeTypeColors[selectedEdge.type]}`}>
                    {selectedEdge.type}
                  </Badge>
                </div>
                {selectedEdge.severity && (
                  <div>
                    <span className="text-text-muted">Severity:</span>
                    <Badge
                      variant="outline"
                      className={`ml-2 ${severityColors[selectedEdge.severity]}`}
                    >
                      {selectedEdge.severity}
                    </Badge>
                  </div>
                )}
              </div>

              {selectedEdge.rationale && (
                <div>
                  <span className="text-sm text-text-muted block mb-2">Rationale:</span>
                  <div className="rounded-lg border border-border-default bg-bg-elevated p-3">
                    <p className="text-sm text-text-secondary">{selectedEdge.rationale}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
