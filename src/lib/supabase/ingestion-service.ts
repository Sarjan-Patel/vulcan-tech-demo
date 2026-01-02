// Supabase ingestion service for database operations

import { supabase } from './client';
import type {
  CorpusSource,
  Jurisdiction,
  AuthorityLevel,
  EdgeType,
  NodeType,
  SeverityLevel,
  Document,
  DocumentVersion,
  Section,
  SectionVersion,
  VectorChunk,
  GraphNode,
  GraphEdge,
  IngestionGraphNode,
  IngestionGraphEdge,
  S3Object,
} from '../ingestion/types';

// Re-export types needed by other modules
export type { GraphNode };

// Helper to convert snake_case database rows to camelCase
function toCamelCase<T>(obj: Record<string, unknown>): T {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    result[camelKey] = value;
  }
  return result as T;
}

// =============================================================================
// S3 Objects
// =============================================================================

export async function insertS3Object(data: {
  key: string;
  source: CorpusSource;
  checksum: string;
  contentType: string;
  fileSizeBytes?: number;
}): Promise<S3Object> {
  const { data: result, error } = await supabase
    .from('s3_objects')
    .insert({
      key: data.key,
      source: data.source,
      checksum: data.checksum,
      content_type: data.contentType,
      file_size_bytes: data.fileSizeBytes,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to insert S3 object: ${error.message}`);
  return toCamelCase<S3Object>(result);
}

export async function getS3Objects(): Promise<S3Object[]> {
  const { data, error } = await supabase
    .from('s3_objects')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to fetch S3 objects: ${error.message}`);
  return (data || []).map((row) => toCamelCase<S3Object>(row));
}

// Check if S3 object with same checksum already exists (duplicate detection)
export async function s3ObjectExistsByChecksum(checksum: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('s3_objects')
    .select('id')
    .eq('checksum', checksum)
    .limit(1);

  if (error) throw new Error(`Failed to check S3 object existence: ${error.message}`);
  return (data || []).length > 0;
}

// =============================================================================
// Documents
// =============================================================================

export async function insertDocument(data: {
  title: string;
  jurisdiction: Jurisdiction;
  authorityLevel: AuthorityLevel;
  source: CorpusSource;
  effectiveFrom: string;
  effectiveTo?: string | null;
}): Promise<Document> {
  const { data: result, error } = await supabase
    .from('documents')
    .insert({
      title: data.title,
      jurisdiction: data.jurisdiction,
      authority_level: data.authorityLevel,
      source: data.source,
      effective_from: data.effectiveFrom,
      effective_to: data.effectiveTo,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to insert document: ${error.message}`);
  return toCamelCase<Document>(result);
}

export async function updateDocumentCurrentVersion(
  documentId: string,
  versionId: string
): Promise<void> {
  const { error } = await supabase
    .from('documents')
    .update({ current_version_id: versionId })
    .eq('id', documentId);

  if (error) throw new Error(`Failed to update document version: ${error.message}`);
}

export async function getDocuments(): Promise<Document[]> {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to fetch documents: ${error.message}`);
  return (data || []).map((row) => toCamelCase<Document>(row));
}

// Check if document with same title already exists (duplicate detection)
export async function documentExistsByTitle(title: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('documents')
    .select('id')
    .eq('title', title)
    .limit(1);

  if (error) throw new Error(`Failed to check document existence: ${error.message}`);
  return (data || []).length > 0;
}

// =============================================================================
// Document Versions
// =============================================================================

export async function insertDocumentVersion(data: {
  documentId: string;
  effectiveFrom: string;
  effectiveTo?: string | null;
  s3ObjectId?: string | null;
  versionNumber?: number;
}): Promise<DocumentVersion> {
  const { data: result, error } = await supabase
    .from('document_versions')
    .insert({
      document_id: data.documentId,
      effective_from: data.effectiveFrom,
      effective_to: data.effectiveTo,
      s3_object_id: data.s3ObjectId,
      version_number: data.versionNumber ?? 1,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to insert document version: ${error.message}`);
  return toCamelCase<DocumentVersion>(result);
}

export async function getDocumentVersions(): Promise<DocumentVersion[]> {
  const { data, error } = await supabase
    .from('document_versions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to fetch document versions: ${error.message}`);
  return (data || []).map((row) => toCamelCase<DocumentVersion>(row));
}

// =============================================================================
// Sections
// =============================================================================

export async function insertSection(data: {
  documentId: string;
  citation: string;
  heading: string;
}): Promise<Section> {
  const { data: result, error } = await supabase
    .from('sections')
    .insert({
      document_id: data.documentId,
      citation: data.citation,
      heading: data.heading,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to insert section: ${error.message}`);
  return toCamelCase<Section>(result);
}

export async function getSections(): Promise<Section[]> {
  const { data, error } = await supabase
    .from('sections')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to fetch sections: ${error.message}`);
  return (data || []).map((row) => toCamelCase<Section>(row));
}

// =============================================================================
// Section Versions
// =============================================================================

export async function insertSectionVersion(data: {
  sectionId: string;
  documentVersionId: string;
  text: string;
  tokenCount: number;
}): Promise<SectionVersion> {
  const { data: result, error } = await supabase
    .from('section_versions')
    .insert({
      section_id: data.sectionId,
      document_version_id: data.documentVersionId,
      text: data.text,
      token_count: data.tokenCount,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to insert section version: ${error.message}`);
  return toCamelCase<SectionVersion>(result);
}

export async function getSectionVersions(): Promise<SectionVersion[]> {
  const { data, error } = await supabase
    .from('section_versions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to fetch section versions: ${error.message}`);
  return (data || []).map((row) => toCamelCase<SectionVersion>(row));
}

// =============================================================================
// Vector Chunks
// =============================================================================

export async function insertVectorChunk(data: {
  sectionVersionId: string;
  chunkIndex: number;
  text: string;
  tokenCount: number;
  embedding: number[];
  metadata: Record<string, unknown>;
}): Promise<VectorChunk> {
  // Convert embedding array to Postgres vector format
  const embeddingStr = `[${data.embedding.join(',')}]`;

  const { data: result, error } = await supabase
    .from('vector_chunks')
    .insert({
      section_version_id: data.sectionVersionId,
      chunk_index: data.chunkIndex,
      text: data.text,
      token_count: data.tokenCount,
      embedding: embeddingStr,
      metadata: data.metadata,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to insert vector chunk: ${error.message}`);

  // Parse embedding back to array (Supabase returns it as a string)
  const chunk = toCamelCase<VectorChunk>(result);
  const embeddingValue = chunk.embedding as unknown;
  if (typeof embeddingValue === 'string') {
    chunk.embedding = JSON.parse(embeddingValue);
  }
  return chunk;
}

export async function getVectorChunks(): Promise<VectorChunk[]> {
  const { data, error } = await supabase
    .from('vector_chunks')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to fetch vector chunks: ${error.message}`);

  return (data || []).map((row) => {
    const chunk = toCamelCase<VectorChunk>(row);
    // Parse embedding if it's a string (Supabase returns vectors as strings)
    const embeddingValue = chunk.embedding as unknown;
    if (typeof embeddingValue === 'string') {
      try {
        chunk.embedding = JSON.parse(embeddingValue);
      } catch {
        chunk.embedding = [];
      }
    }
    return chunk;
  });
}

// =============================================================================
// Graph Nodes
// =============================================================================

export async function insertGraphNode(data: {
  label: string;
  nodeType: NodeType;
  jurisdiction: Jurisdiction;
  authorityLevel: AuthorityLevel;
  citation?: string | null;
  effectiveFrom?: string | null;
  documentId?: string | null;
  sectionId?: string | null;
}): Promise<GraphNode> {
  const { data: result, error } = await supabase
    .from('graph_nodes')
    .insert({
      label: data.label,
      node_type: data.nodeType,
      jurisdiction: data.jurisdiction,
      authority_level: data.authorityLevel,
      citation: data.citation,
      effective_from: data.effectiveFrom,
      document_id: data.documentId,
      section_id: data.sectionId,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to insert graph node: ${error.message}`);
  return toCamelCase<GraphNode>(result);
}

export async function getGraphNodes(): Promise<GraphNode[]> {
  const { data, error } = await supabase
    .from('graph_nodes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to fetch graph nodes: ${error.message}`);
  return (data || []).map((row) => toCamelCase<GraphNode>(row));
}

// Convert to legacy format for existing components
export async function getGraphNodesLegacy(): Promise<IngestionGraphNode[]> {
  const nodes = await getGraphNodes();
  return nodes.map((node) => ({
    id: node.id,
    label: node.label,
    nodeType: node.nodeType,
    jurisdiction: node.jurisdiction,
    authorityLevel: node.authorityLevel,
    citation: node.citation || undefined,
    effectiveFrom: node.effectiveFrom || undefined,
  }));
}

// =============================================================================
// Graph Edges
// =============================================================================

export async function insertGraphEdge(data: {
  sourceNodeId: string;
  targetNodeId: string;
  edgeType: EdgeType;
  severity?: SeverityLevel | null;
  rationale?: string | null;
}): Promise<GraphEdge> {
  const { data: result, error } = await supabase
    .from('graph_edges')
    .insert({
      source_node_id: data.sourceNodeId,
      target_node_id: data.targetNodeId,
      edge_type: data.edgeType,
      severity: data.severity,
      rationale: data.rationale,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to insert graph edge: ${error.message}`);
  return toCamelCase<GraphEdge>(result);
}

export async function getGraphEdges(): Promise<GraphEdge[]> {
  const { data, error } = await supabase
    .from('graph_edges')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to fetch graph edges: ${error.message}`);
  return (data || []).map((row) => toCamelCase<GraphEdge>(row));
}

// Convert to legacy format for existing components
export async function getGraphEdgesLegacy(): Promise<IngestionGraphEdge[]> {
  const edges = await getGraphEdges();
  return edges.map((edge) => ({
    id: edge.id,
    source: edge.sourceNodeId,
    target: edge.targetNodeId,
    type: edge.edgeType,
    severity: edge.severity || undefined,
    rationale: edge.rationale || undefined,
  }));
}

// =============================================================================
// Aggregate Queries
// =============================================================================

export async function getAllIngestionData() {
  const [
    s3Objects,
    documents,
    documentVersions,
    sections,
    sectionVersions,
    chunks,
    graphNodes,
    graphEdges,
  ] = await Promise.all([
    getS3Objects(),
    getDocuments(),
    getDocumentVersions(),
    getSections(),
    getSectionVersions(),
    getVectorChunks(),
    getGraphNodesLegacy(),
    getGraphEdgesLegacy(),
  ]);

  return {
    s3Objects,
    documents,
    documentVersions,
    sections,
    sectionVersions,
    chunks,
    graphNodes,
    graphEdges,
  };
}

export async function getIngestionStats() {
  const [
    { count: s3Count },
    { count: docCount },
    { count: sectionCount },
    { count: chunkCount },
    { count: nodeCount },
    { count: edgeCount },
  ] = await Promise.all([
    supabase.from('s3_objects').select('*', { count: 'exact', head: true }),
    supabase.from('documents').select('*', { count: 'exact', head: true }),
    supabase.from('sections').select('*', { count: 'exact', head: true }),
    supabase.from('vector_chunks').select('*', { count: 'exact', head: true }),
    supabase.from('graph_nodes').select('*', { count: 'exact', head: true }),
    supabase.from('graph_edges').select('*', { count: 'exact', head: true }),
  ]);

  return {
    s3Objects: s3Count || 0,
    documents: docCount || 0,
    sections: sectionCount || 0,
    chunks: chunkCount || 0,
    graphNodes: nodeCount || 0,
    graphEdges: edgeCount || 0,
  };
}

// =============================================================================
// Graph Relationship Helpers
// =============================================================================

// Get all document-type nodes for building cross-document relationships
export async function getDocumentNodes(): Promise<GraphNode[]> {
  const { data, error } = await supabase
    .from('graph_nodes')
    .select('*')
    .eq('node_type', 'document')
    .order('created_at', { ascending: true });

  if (error) throw new Error(`Failed to fetch document nodes: ${error.message}`);
  return (data || []).map((row) => toCamelCase<GraphNode>(row));
}

// Check if an edge already exists between two nodes
export async function edgeExists(sourceId: string, targetId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('graph_edges')
    .select('id')
    .eq('source_node_id', sourceId)
    .eq('target_node_id', targetId)
    .limit(1);

  if (error) throw new Error(`Failed to check edge existence: ${error.message}`);
  return (data || []).length > 0;
}
