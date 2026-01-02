// Ingestion Pipeline Type Definitions

export type CorpusSource = 'us-code' | 'ecfr' | 'texas-statutes' | 'austin-ordinances';

export type StageStatus = 'pending' | 'in_progress' | 'completed' | 'error';

export type StageId = 's3' | 'postgres' | 'vector' | 'graph';

export type Jurisdiction = 'federal' | 'state' | 'municipal';

export type AuthorityLevel = 'constitution' | 'statute' | 'regulation' | 'ordinance';

export type EdgeType = 'AUTHORIZES' | 'DERIVES_AUTHORITY_FROM' | 'CONFLICTS_WITH' | 'AMENDS';

export type NodeType = 'document' | 'section';

export type SeverityLevel = 'low' | 'medium' | 'high';

// Pipeline Stage
export interface PipelineStage {
  id: StageId;
  label: string;
  description: string;
  status: StageStatus;
  progress: number; // 0-100
  outputCount: number;
  startedAt?: string;
  completedAt?: string;
  error?: string;
}

// File upload input
export interface UploadedFile {
  file: File;
  content: string;
  contentType: 'application/json' | 'text/xml' | 'text/html' | 'text/plain';
}

// Parsed document input (from uploaded file)
export interface ParsedDocumentInput {
  title: string;
  citation: string;
  jurisdiction: Jurisdiction;
  authorityLevel: AuthorityLevel;
  effectiveFrom: string;
  rawText: string;
  sections?: {
    heading: string;
    citation: string;
    text: string;
  }[];
}

// Raw document for mock data (used by datasets.ts)
export interface RawDocument {
  id: string;
  title: string;
  citation: string;
  jurisdiction: Jurisdiction;
  authorityLevel: AuthorityLevel;
  effectiveFrom: string;
  rawText: string;
  sections?: {
    id: string;
    heading: string;
    citation: string;
    text: string;
  }[];
}

// Layer 1: S3 bucket (raw corpus) - matches database schema
export interface S3Object {
  id: string; // UUID
  key: string;
  source: CorpusSource;
  fetchedAt: string;
  checksum: string;
  contentType: string;
  fileSizeBytes?: number;
  createdAt: string;
}

// For display purposes (includes raw text from S3)
export interface S3ObjectWithContent extends S3Object {
  rawText: string;
}

// Layer 2: Postgres metadata (structured + versioned) - matches database schema
export interface Document {
  id: string; // UUID
  title: string;
  jurisdiction: Jurisdiction;
  authorityLevel: AuthorityLevel;
  source: CorpusSource;
  effectiveFrom: string;
  effectiveTo?: string | null;
  currentVersionId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentVersion {
  id: string; // UUID
  documentId: string;
  versionNumber: number;
  effectiveFrom: string;
  effectiveTo?: string | null;
  ingestedAt: string;
  s3ObjectId?: string | null;
  createdAt: string;
}

export interface Section {
  id: string; // UUID
  documentId: string;
  citation: string;
  heading: string;
  createdAt: string;
}

export interface SectionVersion {
  id: string; // UUID
  sectionId: string;
  documentVersionId: string;
  text: string;
  tokenCount: number;
  createdAt: string;
}

// Layer 3: Vector index (semantic retrieval) - matches database schema
export interface VectorChunk {
  id: string; // UUID
  sectionVersionId: string;
  chunkIndex: number;
  text: string;
  tokenCount: number;
  embedding: number[];
  metadata: {
    jurisdiction: Jurisdiction;
    authorityLevel: AuthorityLevel;
    effectiveFrom: string;
    citation: string;
    documentId: string;
    heading?: string;
    chunkIndex: number;
  };
  createdAt: string;
}

// Knowledge Graph Layer - matches database schema
export interface GraphNode {
  id: string; // UUID
  label: string;
  nodeType: NodeType;
  jurisdiction: Jurisdiction;
  authorityLevel: AuthorityLevel;
  citation?: string | null;
  effectiveFrom?: string | null;
  documentId?: string | null;
  sectionId?: string | null;
  createdAt: string;
}

export interface GraphEdge {
  id: string; // UUID
  sourceNodeId: string;
  targetNodeId: string;
  edgeType: EdgeType;
  severity?: SeverityLevel | null;
  rationale?: string | null;
  createdAt: string;
}

// Legacy interfaces for backward compatibility with existing components
export interface IngestionGraphNode {
  id: string;
  label: string;
  nodeType: NodeType;
  jurisdiction: Jurisdiction;
  authorityLevel: AuthorityLevel;
  citation?: string;
  effectiveFrom?: string;
}

export interface IngestionGraphEdge {
  id: string;
  source: string;
  target: string;
  type: EdgeType;
  severity?: SeverityLevel;
  rationale?: string;
}

// Ingestion outputs (for UI display)
export interface IngestionOutputs {
  s3Objects: S3ObjectWithContent[];
  documents: Document[];
  documentVersions: DocumentVersion[];
  sections: Section[];
  sectionVersions: SectionVersion[];
  chunks: VectorChunk[];
  graphNodes: IngestionGraphNode[];
  graphEdges: IngestionGraphEdge[];
}

// Corpus source display info
export interface CorpusInfo {
  id: CorpusSource;
  label: string;
  description: string;
  jurisdiction: Jurisdiction;
  acceptedFileTypes: string[];
}

export const CORPUS_OPTIONS: CorpusInfo[] = [
  {
    id: 'us-code',
    label: 'U.S. Code (Federal Statutes)',
    description: 'Federal statutory law',
    jurisdiction: 'federal',
    acceptedFileTypes: ['.json', '.xml', '.txt'],
  },
  {
    id: 'ecfr',
    label: 'eCFR (Federal Regulations)',
    description: 'Code of Federal Regulations',
    jurisdiction: 'federal',
    acceptedFileTypes: ['.json', '.xml', '.txt'],
  },
  {
    id: 'texas-statutes',
    label: 'Texas Statutes (State Law)',
    description: 'Texas state statutory law',
    jurisdiction: 'state',
    acceptedFileTypes: ['.json', '.xml', '.txt'],
  },
  {
    id: 'austin-ordinances',
    label: 'Austin Ordinances (Municipal Law)',
    description: 'City of Austin municipal ordinances',
    jurisdiction: 'municipal',
    acceptedFileTypes: ['.json', '.xml', '.txt'],
  },
];

// Default pipeline stages
export const DEFAULT_STAGES: PipelineStage[] = [
  {
    id: 's3',
    label: 'Upload to S3',
    description: 'Upload raw document to S3 bucket',
    status: 'pending',
    progress: 0,
    outputCount: 0,
  },
  {
    id: 'postgres',
    label: 'Parse + Metadata',
    description: 'Extract structure and store in Supabase',
    status: 'pending',
    progress: 0,
    outputCount: 0,
  },
  {
    id: 'vector',
    label: 'Chunk + Embed',
    description: 'Create chunks and generate embeddings',
    status: 'pending',
    progress: 0,
    outputCount: 0,
  },
  {
    id: 'graph',
    label: 'Build Graph',
    description: 'Create knowledge graph relationships',
    status: 'pending',
    progress: 0,
    outputCount: 0,
  },
];

// Database insert types (snake_case for Supabase)
export interface S3ObjectInsert {
  key: string;
  source: CorpusSource;
  fetched_at?: string;
  checksum: string;
  content_type: string;
  file_size_bytes?: number;
}

export interface DocumentInsert {
  title: string;
  jurisdiction: Jurisdiction;
  authority_level: AuthorityLevel;
  source: CorpusSource;
  effective_from: string;
  effective_to?: string | null;
  current_version_id?: string | null;
}

export interface DocumentVersionInsert {
  document_id: string;
  version_number?: number;
  effective_from: string;
  effective_to?: string | null;
  s3_object_id?: string | null;
}

export interface SectionInsert {
  document_id: string;
  citation: string;
  heading: string;
}

export interface SectionVersionInsert {
  section_id: string;
  document_version_id: string;
  text: string;
  token_count: number;
}

export interface VectorChunkInsert {
  section_version_id: string;
  chunk_index: number;
  text: string;
  token_count: number;
  embedding: number[];
  metadata: Record<string, unknown>;
}

export interface GraphNodeInsert {
  label: string;
  node_type: NodeType;
  jurisdiction: Jurisdiction;
  authority_level: AuthorityLevel;
  citation?: string | null;
  effective_from?: string | null;
  document_id?: string | null;
  section_id?: string | null;
}

export interface GraphEdgeInsert {
  source_node_id: string;
  target_node_id: string;
  edge_type: EdgeType;
  severity?: SeverityLevel | null;
  rationale?: string | null;
}
