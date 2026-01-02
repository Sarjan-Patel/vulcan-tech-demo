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
import { FileJson, Eye } from 'lucide-react';
import type { S3ObjectWithContent } from '@/lib/ingestion/types';

interface S3ObjectsTabProps {
  s3Objects: S3ObjectWithContent[];
}

export function S3ObjectsTab({ s3Objects }: S3ObjectsTabProps) {
  const [selectedObject, setSelectedObject] = useState<S3ObjectWithContent | null>(null);

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-text-muted">
          <FileJson className="w-4 h-4" />
          <span>Raw documents stored in AWS S3 bucket</span>
        </div>

        <div className="border border-border-default rounded-lg overflow-hidden">
          <Table>
            <TableHeader className="bg-bg-elevated">
              <TableRow>
                <TableHead className="text-text-secondary">Key</TableHead>
                <TableHead className="text-text-secondary">Source</TableHead>
                <TableHead className="text-text-secondary">Fetched</TableHead>
                <TableHead className="text-text-secondary">Type</TableHead>
                <TableHead className="text-text-secondary w-[80px]">View</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {s3Objects.map((obj) => (
                <TableRow
                  key={obj.id}
                  className="hover:bg-bg-elevated/50 cursor-pointer"
                  onClick={() => setSelectedObject(obj)}
                >
                  <TableCell className="font-mono text-xs text-text-primary">
                    {obj.key.length > 40 ? `...${obj.key.slice(-40)}` : obj.key}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {obj.source}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-text-muted text-sm">
                    {new Date(obj.fetchedAt).toLocaleTimeString()}
                  </TableCell>
                  <TableCell className="text-text-muted text-sm">{obj.contentType}</TableCell>
                  <TableCell>
                    <button
                      className="p-2 rounded hover:bg-bg-elevated text-text-muted hover:text-brand transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedObject(obj);
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

        <div className="text-xs text-text-muted">
          Checksum validation ensures data integrity during transfer
        </div>
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selectedObject} onOpenChange={() => setSelectedObject(null)}>
        <DialogContent className="max-w-2xl bg-bg-card border-border-default">
          <DialogHeader>
            <DialogTitle className="text-text-primary flex items-center gap-2">
              <FileJson className="w-5 h-5 text-brand" />
              S3 Object Details
            </DialogTitle>
            <DialogDescription className="text-text-muted font-mono text-xs">
              {selectedObject?.key}
            </DialogDescription>
          </DialogHeader>

          {selectedObject && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-text-muted">Source:</span>
                  <span className="ml-2 text-text-primary">{selectedObject.source}</span>
                </div>
                <div>
                  <span className="text-text-muted">Content Type:</span>
                  <span className="ml-2 text-text-primary">{selectedObject.contentType}</span>
                </div>
                <div>
                  <span className="text-text-muted">Fetched At:</span>
                  <span className="ml-2 text-text-primary">
                    {new Date(selectedObject.fetchedAt).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-text-muted">Checksum:</span>
                  <span className="ml-2 text-text-primary font-mono text-xs">
                    {selectedObject.checksum}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-sm text-text-muted block mb-2">Raw Content:</span>
                <ScrollArea className="h-[300px] rounded-lg border border-border-default bg-bg-elevated p-4">
                  <pre className="text-xs text-text-secondary whitespace-pre-wrap font-mono">
                    {selectedObject.rawText}
                  </pre>
                </ScrollArea>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
