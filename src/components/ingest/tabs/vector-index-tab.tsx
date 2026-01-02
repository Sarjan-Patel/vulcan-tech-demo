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
import { Cpu, Eye, Hash, FileText } from 'lucide-react';
import type { VectorChunk } from '@/lib/ingestion/types';

interface VectorIndexTabProps {
  chunks: VectorChunk[];
}

const jurisdictionColors: Record<string, string> = {
  federal: 'bg-federal/20 text-federal border-federal/30',
  state: 'bg-state/20 text-state border-state/30',
  municipal: 'bg-municipal/20 text-municipal border-municipal/30',
};

export function VectorIndexTab({ chunks }: VectorIndexTabProps) {
  const [selectedChunk, setSelectedChunk] = useState<VectorChunk | null>(null);

  // Calculate some stats
  const totalTokens = chunks.reduce((sum, c) => sum + c.tokenCount, 0);
  const avgTokens = chunks.length > 0 ? Math.round(totalTokens / chunks.length) : 0;
  const embeddingDim = chunks[0]?.embedding.length || 384;

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-text-muted">
            <Cpu className="w-4 h-4" />
            <span>Vector embeddings stored in Supabase pgvector</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-text-muted">
            <span className="flex items-center gap-1">
              <Hash className="w-3 h-3" />
              {chunks.length} chunks
            </span>
            <span>{totalTokens.toLocaleString()} total tokens</span>
            <span>{avgTokens} avg/chunk</span>
            <span>{embeddingDim}d vectors</span>
          </div>
        </div>

        <div className="border border-border-default rounded-lg overflow-hidden">
          <Table>
            <TableHeader className="bg-bg-elevated">
              <TableRow>
                <TableHead className="text-text-secondary">Chunk ID</TableHead>
                <TableHead className="text-text-secondary">Citation</TableHead>
                <TableHead className="text-text-secondary">Tokens</TableHead>
                <TableHead className="text-text-secondary">Jurisdiction</TableHead>
                <TableHead className="text-text-secondary w-[80px]">View</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {chunks.slice(0, 50).map((chunk) => (
                <TableRow
                  key={chunk.id}
                  className="hover:bg-bg-elevated/50 cursor-pointer"
                  onClick={() => setSelectedChunk(chunk)}
                >
                  <TableCell className="font-mono text-xs text-text-primary">
                    {chunk.id.slice(0, 20)}...
                  </TableCell>
                  <TableCell className="font-mono text-xs text-brand">
                    {chunk.metadata.citation || 'N/A'}
                  </TableCell>
                  <TableCell className="text-text-muted text-sm">
                    {chunk.tokenCount}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={jurisdictionColors[chunk.metadata.jurisdiction]}
                    >
                      {chunk.metadata.jurisdiction}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <button
                      className="p-2 rounded hover:bg-bg-elevated text-text-muted hover:text-brand transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedChunk(chunk);
                      }}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {chunks.length > 50 && (
          <div className="text-xs text-text-muted text-center">
            Showing 50 of {chunks.length} chunks
          </div>
        )}

        <div className="text-xs text-text-muted">
          Embeddings enable semantic search across legal documents
        </div>
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selectedChunk} onOpenChange={() => setSelectedChunk(null)}>
        <DialogContent className="max-w-2xl bg-bg-card border-border-default">
          <DialogHeader>
            <DialogTitle className="text-text-primary flex items-center gap-2">
              <Cpu className="w-5 h-5 text-brand" />
              Vector Chunk Details
            </DialogTitle>
            <DialogDescription className="text-text-muted font-mono text-xs">
              {selectedChunk?.id}
            </DialogDescription>
          </DialogHeader>

          {selectedChunk && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-text-muted">Citation:</span>
                  <span className="ml-2 text-brand font-mono">
                    {selectedChunk.metadata.citation || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-text-muted">Token Count:</span>
                  <span className="ml-2 text-text-primary">
                    {selectedChunk.tokenCount} tokens
                  </span>
                </div>
                <div>
                  <span className="text-text-muted">Jurisdiction:</span>
                  <Badge
                    variant="outline"
                    className={`ml-2 ${jurisdictionColors[selectedChunk.metadata.jurisdiction]}`}
                  >
                    {selectedChunk.metadata.jurisdiction}
                  </Badge>
                </div>
                <div>
                  <span className="text-text-muted">Heading:</span>
                  <span className="ml-2 text-text-primary">
                    {selectedChunk.metadata.heading || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-text-muted">Chunk Index:</span>
                  <span className="ml-2 text-text-primary">
                    {selectedChunk.metadata.chunkIndex}
                  </span>
                </div>
                <div>
                  <span className="text-text-muted">Embedding Dim:</span>
                  <span className="ml-2 text-text-primary">
                    {selectedChunk.embedding.length}d
                  </span>
                </div>
              </div>

              <div>
                <span className="text-sm text-text-muted block mb-2 flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  Chunk Text:
                </span>
                <ScrollArea className="h-[150px] rounded-lg border border-border-default bg-bg-elevated p-4">
                  <pre className="text-xs text-text-secondary whitespace-pre-wrap font-mono">
                    {selectedChunk.text}
                  </pre>
                </ScrollArea>
              </div>

              <div>
                <span className="text-sm text-text-muted block mb-2 flex items-center gap-1">
                  <Hash className="w-4 h-4" />
                  Embedding Preview (first 20 dimensions):
                </span>
                <ScrollArea className="h-[80px] rounded-lg border border-border-default bg-bg-elevated p-4">
                  <div className="flex flex-wrap gap-1">
                    {selectedChunk.embedding.slice(0, 20).map((val, idx) => (
                      <span
                        key={idx}
                        className="text-xs font-mono px-1.5 py-0.5 rounded bg-brand/10 text-brand"
                      >
                        {val.toFixed(4)}
                      </span>
                    ))}
                    <span className="text-xs text-text-muted">
                      ... +{selectedChunk.embedding.length - 20} more
                    </span>
                  </div>
                </ScrollArea>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
