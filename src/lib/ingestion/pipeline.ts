// Pipeline execution logic for ingestion stages

import type {
  CorpusSource,
  S3ObjectWithContent,
  Document,
  DocumentVersion,
  Section,
  SectionVersion,
  VectorChunk,
  IngestionGraphNode,
  IngestionGraphEdge,
} from './types';
import { CORPUS_DATASETS } from './datasets';
import { chunkText, estimateTokenCount } from './chunking';
import { generateFakeEmbedding, generateChecksum } from './embeddings';

// Utility for simulating async delays
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Stage A: Raw Capture → S3 (mock implementation)
export async function runStageA(
  corpus: CorpusSource,
  onProgress: (progress: number) => void
): Promise<S3ObjectWithContent[]> {
  const dataset = CORPUS_DATASETS[corpus];
  const s3Objects: S3ObjectWithContent[] = [];

  for (let i = 0; i < dataset.length; i++) {
    await delay(300 + Math.random() * 200); // Simulate network latency

    const doc = dataset[i];
    const timestamp = new Date().toISOString();

    s3Objects.push({
      id: `mock-s3-${doc.id}`,
      key: `${corpus}/${doc.id}/release_${Date.now()}.json`,
      source: corpus,
      fetchedAt: timestamp,
      checksum: generateChecksum(doc.rawText),
      contentType: 'application/json',
      createdAt: timestamp,
      rawText: doc.rawText,
    });

    onProgress(Math.round(((i + 1) / dataset.length) * 100));
  }

  return s3Objects;
}

// Stage B: Parse + Metadata → Postgres (mock implementation)
export async function runStageB(
  corpus: CorpusSource,
  s3Objects: S3ObjectWithContent[],
  onProgress: (progress: number) => void
): Promise<{
  documents: Document[];
  documentVersions: DocumentVersion[];
  sections: Section[];
  sectionVersions: SectionVersion[];
}> {
  const dataset = CORPUS_DATASETS[corpus];
  const documents: Document[] = [];
  const documentVersions: DocumentVersion[] = [];
  const sections: Section[] = [];
  const sectionVersions: SectionVersion[] = [];

  const totalSteps = dataset.length;
  let currentStep = 0;

  for (let i = 0; i < dataset.length; i++) {
    await delay(200 + Math.random() * 150);

    const raw = dataset[i];
    const s3Object = s3Objects[i];
    const timestamp = new Date().toISOString();

    // Create Document
    const documentId = `doc-${raw.id}`;
    const versionId = `ver-${raw.id}-v1`;

    documents.push({
      id: documentId,
      title: raw.title,
      jurisdiction: raw.jurisdiction,
      authorityLevel: raw.authorityLevel,
      source: corpus,
      effectiveFrom: raw.effectiveFrom,
      effectiveTo: null,
      currentVersionId: versionId,
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    // Create DocumentVersion
    documentVersions.push({
      id: versionId,
      documentId,
      versionNumber: 1,
      effectiveFrom: raw.effectiveFrom,
      effectiveTo: null,
      ingestedAt: timestamp,
      s3ObjectId: s3Object.id,
      createdAt: timestamp,
    });

    // Create Sections and SectionVersions
    const docSections = raw.sections || [
      {
        id: `${raw.id}-main`,
        heading: raw.title,
        citation: raw.citation,
        text: raw.rawText,
      },
    ];

    for (const sec of docSections) {
      const sectionId = `sec-${sec.id}`;
      const sectionVersionId = `secver-${sec.id}-v1`;

      sections.push({
        id: sectionId,
        documentId,
        citation: sec.citation,
        heading: sec.heading,
        createdAt: timestamp,
      });

      sectionVersions.push({
        id: sectionVersionId,
        sectionId,
        documentVersionId: versionId,
        text: sec.text,
        tokenCount: estimateTokenCount(sec.text),
        createdAt: timestamp,
      });
    }

    currentStep++;
    onProgress(Math.round((currentStep / totalSteps) * 100));
  }

  return { documents, documentVersions, sections, sectionVersions };
}

// Stage C: Chunk + Embed → Vector DB (mock implementation)
export async function runStageC(
  sectionVersions: SectionVersion[],
  sections: Section[],
  documents: Document[],
  onProgress: (progress: number) => void
): Promise<VectorChunk[]> {
  const chunks: VectorChunk[] = [];
  const totalSections = sectionVersions.length;
  const timestamp = new Date().toISOString();

  for (let i = 0; i < sectionVersions.length; i++) {
    await delay(150 + Math.random() * 100);

    const secVer = sectionVersions[i];
    const section = sections.find((s) => s.id === secVer.sectionId);
    const document = documents.find((d) => d.id === section?.documentId);

    if (!section || !document) continue;

    // Chunk the text
    const textChunks = chunkText(secVer.text, {
      targetTokens: 200,
      minTokens: 80,
      maxTokens: 400,
      overlapTokens: 30,
    });

    for (const chunk of textChunks) {
      const chunkId = `chunk-${secVer.id}-${chunk.chunkIndex}`;

      chunks.push({
        id: chunkId,
        sectionVersionId: secVer.id,
        chunkIndex: chunk.chunkIndex,
        text: chunk.text,
        tokenCount: chunk.tokenCount,
        embedding: generateFakeEmbedding(chunk.text),
        metadata: {
          jurisdiction: document.jurisdiction,
          authorityLevel: document.authorityLevel,
          effectiveFrom: document.effectiveFrom,
          citation: section.citation,
          documentId: document.id,
          heading: section.heading,
          chunkIndex: chunk.chunkIndex,
        },
        createdAt: timestamp,
      });
    }

    onProgress(Math.round(((i + 1) / totalSections) * 100));
  }

  return chunks;
}

// Stage D: Build Graph → Knowledge Graph (mock implementation)
export async function runStageD(
  documents: Document[],
  sections: Section[],
  corpus: CorpusSource,
  onProgress: (progress: number) => void
): Promise<{
  graphNodes: IngestionGraphNode[];
  graphEdges: IngestionGraphEdge[];
}> {
  const graphNodes: IngestionGraphNode[] = [];
  const graphEdges: IngestionGraphEdge[] = [];

  const totalItems = documents.length + sections.length;
  let processedItems = 0;

  // Create nodes for documents
  for (const doc of documents) {
    await delay(100);

    graphNodes.push({
      id: doc.id,
      label: doc.title,
      nodeType: 'document',
      jurisdiction: doc.jurisdiction,
      authorityLevel: doc.authorityLevel,
      citation: undefined,
      effectiveFrom: doc.effectiveFrom,
    });

    processedItems++;
    onProgress(Math.round((processedItems / totalItems) * 50));
  }

  // Create nodes for key sections
  for (const section of sections) {
    await delay(50);

    const doc = documents.find((d) => d.id === section.documentId);
    if (!doc) continue;

    graphNodes.push({
      id: section.id,
      label: section.heading,
      nodeType: 'section',
      jurisdiction: doc.jurisdiction,
      authorityLevel: doc.authorityLevel,
      citation: section.citation,
      effectiveFrom: doc.effectiveFrom,
    });

    // Create edge from document to section
    graphEdges.push({
      id: `edge-${doc.id}-${section.id}`,
      source: doc.id,
      target: section.id,
      type: 'AUTHORIZES',
    });

    processedItems++;
    onProgress(Math.round(50 + (processedItems / totalItems) * 25));
  }

  // Create authority and conflict edges based on jurisdiction hierarchy
  await delay(200);
  const authorityEdges = createAuthorityEdges(documents);
  graphEdges.push(...authorityEdges);

  await delay(200);
  const conflictEdges = createConflictEdges(documents, sections);
  graphEdges.push(...conflictEdges);

  onProgress(100);

  return { graphNodes, graphEdges };
}

// Create authority edges based on legal hierarchy
function createAuthorityEdges(documents: Document[]): IngestionGraphEdge[] {
  const edges: IngestionGraphEdge[] = [];

  const federalDocs = documents.filter((d) => d.jurisdiction === 'federal');
  const stateDocs = documents.filter((d) => d.jurisdiction === 'state');
  const municipalDocs = documents.filter((d) => d.jurisdiction === 'municipal');

  // Federal statutes authorize federal regulations
  const federalStatutes = federalDocs.filter((d) => d.authorityLevel === 'statute');
  const federalRegs = federalDocs.filter((d) => d.authorityLevel === 'regulation');

  for (const statute of federalStatutes) {
    for (const reg of federalRegs) {
      edges.push({
        id: `auth-${statute.id}-${reg.id}`,
        source: statute.id,
        target: reg.id,
        type: 'AUTHORIZES',
      });
    }
  }

  // State derives authority from federal
  for (const statDoc of stateDocs) {
    if (federalStatutes.length > 0) {
      edges.push({
        id: `derives-${statDoc.id}-federal`,
        source: statDoc.id,
        target: federalStatutes[0].id,
        type: 'DERIVES_AUTHORITY_FROM',
      });
    }
  }

  // Municipal derives authority from state
  for (const munDoc of municipalDocs) {
    if (stateDocs.length > 0) {
      edges.push({
        id: `derives-${munDoc.id}-state`,
        source: munDoc.id,
        target: stateDocs[0].id,
        type: 'DERIVES_AUTHORITY_FROM',
      });
    }
  }

  return edges;
}

// Create conflict edges for known conflicts
function createConflictEdges(
  documents: Document[],
  sections: Section[]
): IngestionGraphEdge[] {
  const edges: IngestionGraphEdge[] = [];

  // Look for Austin STR ordinance vs Texas Property Code conflict
  const austinSTR = documents.find((d) => d.id.includes('austin-25-2-788'));
  const texasProperty = documents.find((d) => d.id.includes('tex-prop'));

  if (austinSTR && texasProperty) {
    // Find the specific conflicting sections
    const strSection = sections.find(
      (s) => s.documentId === austinSTR.id && s.citation.includes('788')
    );
    const propSection = sections.find(
      (s) => s.documentId === texasProperty.id && s.citation.includes('5.003')
    );

    if (strSection && propSection) {
      edges.push({
        id: `conflict-${strSection.id}-${propSection.id}`,
        source: strSection.id,
        target: propSection.id,
        type: 'CONFLICTS_WITH',
        severity: 'high',
        rationale:
          'Austin owner-occupancy requirement may violate Texas Property Code § 5.003 which prohibits municipalities from requiring owner occupancy as a condition of renting.',
      });
    } else {
      // Fallback to document-level conflict
      edges.push({
        id: `conflict-${austinSTR.id}-${texasProperty.id}`,
        source: austinSTR.id,
        target: texasProperty.id,
        type: 'CONFLICTS_WITH',
        severity: 'high',
        rationale:
          'Municipal STR owner-occupancy requirement may conflict with state property rights protections.',
      });
    }
  }

  // Look for Austin environmental ordinance potential preemption
  const austinEnv = documents.find((d) => d.id.includes('austin-env'));
  const epaRegs = documents.find(
    (d) => d.jurisdiction === 'federal' && d.authorityLevel === 'regulation'
  );

  if (austinEnv && epaRegs) {
    edges.push({
      id: `conflict-${austinEnv.id}-${epaRegs.id}`,
      source: austinEnv.id,
      target: epaRegs.id,
      type: 'CONFLICTS_WITH',
      severity: 'medium',
      rationale:
        'Additional local environmental requirements beyond federal standards may face preemption challenges.',
    });
  }

  return edges;
}

// Main pipeline orchestrator (mock implementation - kept for backward compatibility)
export async function runFullPipeline(
  corpus: CorpusSource,
  callbacks: {
    onStageStart: (stageId: string) => void;
    onStageProgress: (stageId: string, progress: number) => void;
    onStageComplete: (stageId: string, outputCount: number) => void;
    onStageError: (stageId: string, error: string) => void;
    onOutputs: (outputs: {
      s3Objects: S3ObjectWithContent[];
      documents: Document[];
      documentVersions: DocumentVersion[];
      sections: Section[];
      sectionVersions: SectionVersion[];
      chunks: VectorChunk[];
      graphNodes: IngestionGraphNode[];
      graphEdges: IngestionGraphEdge[];
    }) => void;
  }
): Promise<void> {
  try {
    // Stage A: Raw Capture
    callbacks.onStageStart('s3');
    const s3Objects = await runStageA(corpus, (progress) =>
      callbacks.onStageProgress('s3', progress)
    );
    callbacks.onStageComplete('s3', s3Objects.length);

    // Stage B: Parse + Metadata
    callbacks.onStageStart('postgres');
    const { documents, documentVersions, sections, sectionVersions } = await runStageB(
      corpus,
      s3Objects,
      (progress) => callbacks.onStageProgress('postgres', progress)
    );
    callbacks.onStageComplete(
      'postgres',
      documents.length + sections.length + sectionVersions.length
    );

    // Stage C: Chunk + Embed
    callbacks.onStageStart('vector');
    const chunks = await runStageC(sectionVersions, sections, documents, (progress) =>
      callbacks.onStageProgress('vector', progress)
    );
    callbacks.onStageComplete('vector', chunks.length);

    // Stage D: Build Graph
    callbacks.onStageStart('graph');
    const { graphNodes, graphEdges } = await runStageD(
      documents,
      sections,
      corpus,
      (progress) => callbacks.onStageProgress('graph', progress)
    );
    callbacks.onStageComplete('graph', graphNodes.length + graphEdges.length);

    // Output all results
    callbacks.onOutputs({
      s3Objects,
      documents,
      documentVersions,
      sections,
      sectionVersions,
      chunks,
      graphNodes,
      graphEdges,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    callbacks.onStageError('pipeline', errorMessage);
    throw error;
  }
}
