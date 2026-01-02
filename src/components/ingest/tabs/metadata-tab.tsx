'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Database, FileText, Layers, BookOpen } from 'lucide-react';
import type { Document, DocumentVersion, Section, SectionVersion } from '@/lib/ingestion/types';

interface MetadataTabProps {
  documents: Document[];
  documentVersions: DocumentVersion[];
  sections: Section[];
  sectionVersions: SectionVersion[];
}

const jurisdictionColors: Record<string, string> = {
  federal: 'bg-federal/20 text-federal border-federal/30',
  state: 'bg-state/20 text-state border-state/30',
  municipal: 'bg-municipal/20 text-municipal border-municipal/30',
};

export function MetadataTab({
  documents,
  documentVersions,
  sections,
  sectionVersions,
}: MetadataTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-text-muted">
        <Database className="w-4 h-4" />
        <span>Structured metadata stored in Supabase PostgreSQL</span>
      </div>

      <Tabs defaultValue="documents" className="w-full">
        <TabsList className="w-full grid grid-cols-4 bg-bg-elevated h-auto">
          <TabsTrigger value="documents" className="text-xs py-2">
            <FileText className="w-3 h-3 mr-1" />
            Docs ({documents.length})
          </TabsTrigger>
          <TabsTrigger value="versions" className="text-xs py-2">
            <Layers className="w-3 h-3 mr-1" />
            Vers ({documentVersions.length})
          </TabsTrigger>
          <TabsTrigger value="sections" className="text-xs py-2">
            <BookOpen className="w-3 h-3 mr-1" />
            Secs ({sections.length})
          </TabsTrigger>
          <TabsTrigger value="secversions" className="text-xs py-2">
            <Layers className="w-3 h-3 mr-1" />
            SecV ({sectionVersions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="mt-4">
          <ScrollArea className="h-[300px]">
            <div className="border border-border-default rounded-lg overflow-hidden">
              <Table>
                <TableHeader className="bg-bg-elevated sticky top-0">
                  <TableRow>
                    <TableHead className="text-text-secondary">Title</TableHead>
                    <TableHead className="text-text-secondary">Jurisdiction</TableHead>
                    <TableHead className="text-text-secondary">Authority</TableHead>
                    <TableHead className="text-text-secondary">Effective</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.map((doc) => (
                    <TableRow key={doc.id} className="hover:bg-bg-elevated/50">
                      <TableCell className="text-text-primary text-sm max-w-[200px] truncate">
                        {doc.title}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={jurisdictionColors[doc.jurisdiction]}
                        >
                          {doc.jurisdiction}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-text-muted text-sm capitalize">
                        {doc.authorityLevel}
                      </TableCell>
                      <TableCell className="text-text-muted text-sm">
                        {new Date(doc.effectiveFrom).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="versions" className="mt-4">
          <ScrollArea className="h-[300px]">
            <div className="border border-border-default rounded-lg overflow-hidden">
              <Table>
                <TableHeader className="bg-bg-elevated sticky top-0">
                  <TableRow>
                    <TableHead className="text-text-secondary">Version ID</TableHead>
                    <TableHead className="text-text-secondary">Doc ID</TableHead>
                    <TableHead className="text-text-secondary">Version #</TableHead>
                    <TableHead className="text-text-secondary">Ingested</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documentVersions.map((ver) => (
                    <TableRow key={ver.id} className="hover:bg-bg-elevated/50">
                      <TableCell className="font-mono text-xs text-text-primary">
                        {ver.id.slice(0, 20)}...
                      </TableCell>
                      <TableCell className="font-mono text-xs text-text-muted">
                        {ver.documentId.slice(0, 15)}...
                      </TableCell>
                      <TableCell className="text-text-primary">v{ver.versionNumber}</TableCell>
                      <TableCell className="text-text-muted text-sm">
                        {new Date(ver.ingestedAt).toLocaleTimeString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="sections" className="mt-4">
          <ScrollArea className="h-[300px]">
            <div className="border border-border-default rounded-lg overflow-hidden">
              <Table>
                <TableHeader className="bg-bg-elevated sticky top-0">
                  <TableRow>
                    <TableHead className="text-text-secondary">Citation</TableHead>
                    <TableHead className="text-text-secondary">Heading</TableHead>
                    <TableHead className="text-text-secondary">Document</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sections.map((sec) => (
                    <TableRow key={sec.id} className="hover:bg-bg-elevated/50">
                      <TableCell className="font-mono text-xs text-brand">
                        {sec.citation}
                      </TableCell>
                      <TableCell className="text-text-primary text-sm max-w-[200px] truncate">
                        {sec.heading}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-text-muted">
                        {sec.documentId.slice(0, 15)}...
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="secversions" className="mt-4">
          <ScrollArea className="h-[300px]">
            <div className="border border-border-default rounded-lg overflow-hidden">
              <Table>
                <TableHeader className="bg-bg-elevated sticky top-0">
                  <TableRow>
                    <TableHead className="text-text-secondary">Section Ver ID</TableHead>
                    <TableHead className="text-text-secondary">Tokens</TableHead>
                    <TableHead className="text-text-secondary">Preview</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sectionVersions.map((secVer) => (
                    <TableRow key={secVer.id} className="hover:bg-bg-elevated/50">
                      <TableCell className="font-mono text-xs text-text-primary">
                        {secVer.id.slice(0, 20)}...
                      </TableCell>
                      <TableCell className="text-text-muted text-sm">
                        {secVer.tokenCount} tokens
                      </TableCell>
                      <TableCell className="text-text-secondary text-sm max-w-[200px] truncate">
                        {secVer.text.slice(0, 60)}...
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      <div className="text-xs text-text-muted">
        Immutable versioning preserves historical data for temporal queries
      </div>
    </div>
  );
}
