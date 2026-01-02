'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { HardDrive, Database, Cpu, Network, Info } from 'lucide-react';
import type { PipelineStage, IngestionOutputs } from '@/lib/ingestion/types';
import { S3ObjectsTab } from './tabs/s3-objects-tab';
import { MetadataTab } from './tabs/metadata-tab';
import { VectorIndexTab } from './tabs/vector-index-tab';
import { GraphSummaryTab } from './tabs/graph-summary-tab';

interface OutputsTabsProps {
  outputs: IngestionOutputs;
  stages: PipelineStage[];
  hasOutputs: boolean;
}

export function OutputsTabs({ outputs, stages, hasOutputs }: OutputsTabsProps) {
  const isS3Complete = stages.find((s) => s.id === 's3')?.status === 'completed';
  const isPostgresComplete = stages.find((s) => s.id === 'postgres')?.status === 'completed';
  const isVectorComplete = stages.find((s) => s.id === 'vector')?.status === 'completed';
  const isGraphComplete = stages.find((s) => s.id === 'graph')?.status === 'completed';

  if (!hasOutputs) {
    return (
      <Card className="bg-bg-card border-border-default">
        <CardHeader>
          <CardTitle className="text-text-primary">Pipeline Outputs</CardTitle>
          <CardDescription className="text-text-muted">
            Select a corpus and run the pipeline to see outputs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-bg-elevated flex items-center justify-center mb-4">
              <Info className="w-8 h-8 text-text-muted" />
            </div>
            <h3 className="text-lg font-medium text-text-primary mb-2">No Data Yet</h3>
            <p className="text-sm text-text-muted max-w-sm">
              Run the ingestion pipeline to generate S3 objects, metadata, vector embeddings, and
              knowledge graph relationships.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-bg-card border-border-default">
      <CardHeader className="pb-3">
        <CardTitle className="text-text-primary">Pipeline Outputs</CardTitle>
        <CardDescription className="text-text-muted">
          Explore the data generated at each stage
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="s3" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-bg-elevated">
            <TabsTrigger
              value="s3"
              disabled={!isS3Complete}
              className="data-[state=active]:bg-bg-card data-[state=active]:text-brand"
            >
              <HardDrive className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">S3</span>
              {isS3Complete && (
                <span className="ml-1 text-xs text-text-muted">({outputs.s3Objects.length})</span>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="metadata"
              disabled={!isPostgresComplete}
              className="data-[state=active]:bg-bg-card data-[state=active]:text-brand"
            >
              <Database className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Meta</span>
              {isPostgresComplete && (
                <span className="ml-1 text-xs text-text-muted">({outputs.documents.length})</span>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="vector"
              disabled={!isVectorComplete}
              className="data-[state=active]:bg-bg-card data-[state=active]:text-brand"
            >
              <Cpu className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Vector</span>
              {isVectorComplete && (
                <span className="ml-1 text-xs text-text-muted">({outputs.chunks.length})</span>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="graph"
              disabled={!isGraphComplete}
              className="data-[state=active]:bg-bg-card data-[state=active]:text-brand"
            >
              <Network className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Graph</span>
              {isGraphComplete && (
                <span className="ml-1 text-xs text-text-muted">
                  ({outputs.graphNodes.length})
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="s3" className="mt-4">
            <S3ObjectsTab s3Objects={outputs.s3Objects} />
          </TabsContent>

          <TabsContent value="metadata" className="mt-4">
            <MetadataTab
              documents={outputs.documents}
              documentVersions={outputs.documentVersions}
              sections={outputs.sections}
              sectionVersions={outputs.sectionVersions}
            />
          </TabsContent>

          <TabsContent value="vector" className="mt-4">
            <VectorIndexTab chunks={outputs.chunks} />
          </TabsContent>

          <TabsContent value="graph" className="mt-4">
            <GraphSummaryTab graphNodes={outputs.graphNodes} graphEdges={outputs.graphEdges} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
