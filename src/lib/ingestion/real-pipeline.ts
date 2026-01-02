// Real pipeline execution with S3 and Supabase storage

import type {
  CorpusSource,
  Jurisdiction,
  AuthorityLevel,
  S3ObjectWithContent,
  Document,
  DocumentVersion,
  Section,
  SectionVersion,
  VectorChunk,
  IngestionGraphNode,
  IngestionGraphEdge,
  ParsedDocumentInput,
} from './types';
import { chunkText, estimateTokenCount } from './chunking';
import { generateFakeEmbedding } from './embeddings';
import {
  insertS3Object,
  insertDocument,
  insertDocumentVersion,
  updateDocumentCurrentVersion,
  insertSection,
  insertSectionVersion,
  insertVectorChunk,
  insertGraphNode,
  insertGraphEdge,
  getDocumentNodes,
  edgeExists,
} from '../supabase/ingestion-service';
import type { GraphNode } from '../supabase/ingestion-service';

// Stage A: Upload file to S3
export async function runStageA(
  file: File,
  source: CorpusSource,
  onProgress: (progress: number) => void
): Promise<S3ObjectWithContent> {
  onProgress(10);

  // Upload file to S3 via API route
  const formData = new FormData();
  formData.append('file', file);
  formData.append('source', source);

  onProgress(30);

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to upload file');
  }

  onProgress(70);

  const uploadResult = await response.json();

  // Insert S3 object record into Supabase
  const s3Object = await insertS3Object({
    key: uploadResult.key,
    source: source,
    checksum: uploadResult.checksum,
    contentType: uploadResult.contentType,
    fileSizeBytes: uploadResult.fileSizeBytes,
  });

  onProgress(100);

  return {
    ...s3Object,
    rawText: uploadResult.content,
  };
}

// Parse uploaded document content
export function parseDocumentContent(
  content: string,
  source: CorpusSource,
  filename: string
): ParsedDocumentInput {
  // Try to parse as JSON first
  try {
    const parsed = JSON.parse(content);

    // Check if it has the expected structure
    if (parsed.title && parsed.jurisdiction && parsed.authorityLevel) {
      return {
        title: parsed.title,
        citation: parsed.citation || filename,
        jurisdiction: parsed.jurisdiction as Jurisdiction,
        authorityLevel: parsed.authorityLevel as AuthorityLevel,
        effectiveFrom: parsed.effectiveFrom || new Date().toISOString().split('T')[0],
        rawText: parsed.text || parsed.content || content,
        sections: parsed.sections,
      };
    }
  } catch {
    // Not JSON, try to extract info from content
  }

  // Default parsing based on source
  const jurisdictionMap: Record<CorpusSource, Jurisdiction> = {
    'us-code': 'federal',
    'ecfr': 'federal',
    'texas-statutes': 'state',
    'austin-ordinances': 'municipal',
  };

  const authorityMap: Record<CorpusSource, AuthorityLevel> = {
    'us-code': 'statute',
    'ecfr': 'regulation',
    'texas-statutes': 'statute',
    'austin-ordinances': 'ordinance',
  };

  // Extract title from first line or filename
  const lines = content.split('\n').filter(line => line.trim());
  const title = lines[0]?.substring(0, 200) || filename.replace(/\.[^.]+$/, '');

  return {
    title,
    citation: filename.replace(/\.[^.]+$/, ''),
    jurisdiction: jurisdictionMap[source],
    authorityLevel: authorityMap[source],
    effectiveFrom: new Date().toISOString().split('T')[0],
    rawText: content,
  };
}

// Stage B: Parse and store metadata in Supabase
export async function runStageB(
  s3Object: S3ObjectWithContent,
  parsed: ParsedDocumentInput,
  onProgress: (progress: number) => void
): Promise<{
  document: Document;
  documentVersion: DocumentVersion;
  sections: Section[];
  sectionVersions: SectionVersion[];
}> {
  onProgress(10);

  // Create Document
  const document = await insertDocument({
    title: parsed.title,
    jurisdiction: parsed.jurisdiction,
    authorityLevel: parsed.authorityLevel,
    source: s3Object.source,
    effectiveFrom: parsed.effectiveFrom,
  });

  onProgress(30);

  // Create DocumentVersion
  const documentVersion = await insertDocumentVersion({
    documentId: document.id,
    effectiveFrom: parsed.effectiveFrom,
    s3ObjectId: s3Object.id,
    versionNumber: 1,
  });

  // Update document's current version
  await updateDocumentCurrentVersion(document.id, documentVersion.id);

  onProgress(50);

  // Create Sections
  const sections: Section[] = [];
  const sectionVersions: SectionVersion[] = [];

  if (parsed.sections && parsed.sections.length > 0) {
    // Use provided sections
    for (const sec of parsed.sections) {
      const section = await insertSection({
        documentId: document.id,
        citation: sec.citation,
        heading: sec.heading,
      });
      sections.push(section);

      const sectionVersion = await insertSectionVersion({
        sectionId: section.id,
        documentVersionId: documentVersion.id,
        text: sec.text,
        tokenCount: estimateTokenCount(sec.text),
      });
      sectionVersions.push(sectionVersion);
    }
  } else {
    // Create single section from full document
    const section = await insertSection({
      documentId: document.id,
      citation: parsed.citation,
      heading: parsed.title,
    });
    sections.push(section);

    const sectionVersion = await insertSectionVersion({
      sectionId: section.id,
      documentVersionId: documentVersion.id,
      text: parsed.rawText,
      tokenCount: estimateTokenCount(parsed.rawText),
    });
    sectionVersions.push(sectionVersion);
  }

  onProgress(100);

  return { document, documentVersion, sections, sectionVersions };
}

// Stage C: Chunk and embed, store in Supabase vector_chunks
export async function runStageC(
  sectionVersions: SectionVersion[],
  sections: Section[],
  document: Document,
  onProgress: (progress: number) => void
): Promise<VectorChunk[]> {
  const chunks: VectorChunk[] = [];

  // First pass: count total chunks for accurate progress
  let totalChunks = 0;
  const allTextChunks: { secVer: SectionVersion; section: Section; chunks: ReturnType<typeof chunkText> }[] = [];

  console.log(`[Stage C] Processing ${sectionVersions.length} section versions...`);

  for (const secVer of sectionVersions) {
    const section = sections.find((s) => s.id === secVer.sectionId);
    if (!section) continue;

    const textChunks = chunkText(secVer.text, {
      targetTokens: 200,
      minTokens: 80,
      maxTokens: 400,
      overlapTokens: 30,
    });

    allTextChunks.push({ secVer, section, chunks: textChunks });
    totalChunks += textChunks.length;
  }

  console.log(`[Stage C] Total chunks to embed: ${totalChunks}`);
  onProgress(5); // Initial progress after counting

  // Second pass: process each chunk with granular progress
  let processedChunks = 0;

  for (const { secVer, section, chunks: textChunks } of allTextChunks) {
    for (const chunk of textChunks) {
      console.log(`[Stage C] Embedding chunk ${processedChunks + 1}/${totalChunks}...`);

      const vectorChunk = await insertVectorChunk({
        sectionVersionId: secVer.id,
        chunkIndex: chunk.chunkIndex,
        text: chunk.text,
        tokenCount: chunk.tokenCount,
        embedding: generateFakeEmbedding(chunk.text), // Still using fake embeddings for now
        metadata: {
          jurisdiction: document.jurisdiction,
          authorityLevel: document.authorityLevel,
          effectiveFrom: document.effectiveFrom,
          citation: section.citation,
          documentId: document.id,
          heading: section.heading,
          chunkIndex: chunk.chunkIndex,
        },
      });

      chunks.push(vectorChunk);
      processedChunks++;

      // Update progress after each chunk (5% reserved for initial counting)
      const progressPercent = 5 + Math.round((processedChunks / totalChunks) * 95);
      onProgress(progressPercent);
    }
  }

  console.log(`[Stage C] Complete! Generated ${chunks.length} embeddings.`);
  return chunks;
}

// Jurisdiction hierarchy (higher index = higher authority)
const JURISDICTION_HIERARCHY: Record<Jurisdiction, number> = {
  federal: 3,
  state: 2,
  municipal: 1,
};

// Authority level hierarchy (higher index = higher authority)
const AUTHORITY_HIERARCHY: Record<AuthorityLevel, number> = {
  constitution: 4,
  statute: 3,
  regulation: 2,
  ordinance: 1,
};

// Stage D: Build graph nodes and edges in Supabase
export async function runStageD(
  document: Document,
  sections: Section[],
  onProgress: (progress: number) => void
): Promise<{
  graphNodes: IngestionGraphNode[];
  graphEdges: IngestionGraphEdge[];
}> {
  const graphNodes: IngestionGraphNode[] = [];
  const graphEdges: IngestionGraphEdge[] = [];

  console.log(`[Stage D] Building knowledge graph for: ${document.title}`);
  onProgress(5);

  // Step 1: Create document node
  const docNode = await insertGraphNode({
    label: document.title,
    nodeType: 'document',
    jurisdiction: document.jurisdiction,
    authorityLevel: document.authorityLevel,
    effectiveFrom: document.effectiveFrom,
    documentId: document.id,
  });

  graphNodes.push({
    id: docNode.id,
    label: docNode.label,
    nodeType: docNode.nodeType,
    jurisdiction: docNode.jurisdiction,
    authorityLevel: docNode.authorityLevel,
    effectiveFrom: docNode.effectiveFrom || undefined,
  });

  console.log(`[Stage D] Created document node: ${docNode.id}`);
  onProgress(15);

  // Step 2: Create section nodes and document-to-section edges
  for (const section of sections) {
    const sectionNode = await insertGraphNode({
      label: section.heading,
      nodeType: 'section',
      jurisdiction: document.jurisdiction,
      authorityLevel: document.authorityLevel,
      citation: section.citation,
      effectiveFrom: document.effectiveFrom,
      documentId: document.id,
      sectionId: section.id,
    });

    graphNodes.push({
      id: sectionNode.id,
      label: sectionNode.label,
      nodeType: sectionNode.nodeType,
      jurisdiction: sectionNode.jurisdiction,
      authorityLevel: sectionNode.authorityLevel,
      citation: sectionNode.citation || undefined,
      effectiveFrom: sectionNode.effectiveFrom || undefined,
    });

    // AUTHORIZES edge from document to section
    const edge = await insertGraphEdge({
      sourceNodeId: docNode.id,
      targetNodeId: sectionNode.id,
      edgeType: 'AUTHORIZES',
    });

    graphEdges.push({
      id: edge.id,
      source: edge.sourceNodeId,
      target: edge.targetNodeId,
      type: edge.edgeType,
    });
  }

  console.log(`[Stage D] Created ${sections.length} section nodes`);
  onProgress(40);

  // Step 3: Get existing document nodes and build cross-document relationships
  const existingDocNodes = await getDocumentNodes();
  console.log(`[Stage D] Found ${existingDocNodes.length} existing document nodes`);

  // Filter out the current document
  const otherDocNodes = existingDocNodes.filter((n) => n.id !== docNode.id);

  onProgress(50);

  // Step 4: Build authority chain edges (DERIVES_AUTHORITY_FROM)
  // Lower jurisdiction/authority documents derive from higher ones
  for (const otherNode of otherDocNodes) {
    const currentJurLevel = JURISDICTION_HIERARCHY[document.jurisdiction];
    const otherJurLevel = JURISDICTION_HIERARCHY[otherNode.jurisdiction];
    const currentAuthLevel = AUTHORITY_HIERARCHY[document.authorityLevel];
    const otherAuthLevel = AUTHORITY_HIERARCHY[otherNode.authorityLevel];

    // Check if edge already exists
    const exists = await edgeExists(docNode.id, otherNode.id);
    if (exists) continue;

    // Case 1: Same jurisdiction, different authority levels
    // e.g., Federal Regulation derives from Federal Statute
    if (otherJurLevel === currentJurLevel && otherAuthLevel > currentAuthLevel) {
      const edge = await insertGraphEdge({
        sourceNodeId: docNode.id,
        targetNodeId: otherNode.id,
        edgeType: 'DERIVES_AUTHORITY_FROM',
      });
      graphEdges.push({
        id: edge.id,
        source: edge.sourceNodeId,
        target: edge.targetNodeId,
        type: edge.edgeType,
      });
      console.log(`[Stage D] Created DERIVES_AUTHORITY_FROM: ${document.title} -> ${otherNode.label}`);
    }

    // Case 2: Lower jurisdiction derives from higher jurisdiction (same or higher authority)
    // e.g., State Statute derives from Federal Constitution
    // e.g., Municipal Ordinance derives from State Statute
    if (otherJurLevel > currentJurLevel) {
      // Municipal derives from State, State derives from Federal
      // Only create edge to the immediate higher jurisdiction or Constitution
      const isImmediateHigher = otherJurLevel === currentJurLevel + 1;
      const isConstitution = otherNode.authorityLevel === 'constitution';

      if (isImmediateHigher || isConstitution) {
        const edge = await insertGraphEdge({
          sourceNodeId: docNode.id,
          targetNodeId: otherNode.id,
          edgeType: 'DERIVES_AUTHORITY_FROM',
        });
        graphEdges.push({
          id: edge.id,
          source: edge.sourceNodeId,
          target: edge.targetNodeId,
          type: edge.edgeType,
        });
        console.log(`[Stage D] Created DERIVES_AUTHORITY_FROM (cross-jurisdiction): ${document.title} -> ${otherNode.label}`);
      }
    }
  }

  onProgress(70);

  // Step 5: Detect potential conflicts (CONFLICTS_WITH)
  // Look for municipal ordinances that may conflict with state laws
  if (document.jurisdiction === 'municipal') {
    const stateNodes = otherDocNodes.filter((n) => n.jurisdiction === 'state');
    const documentText = document.title.toLowerCase();

    for (const stateNode of stateNodes) {
      const stateText = stateNode.label.toLowerCase();
      let conflictDetected = false;
      let rationale = '';

      // Pattern 1: STR/rental ordinances vs property codes
      const isRentalRelated = documentText.includes('rental') || documentText.includes('str') || documentText.includes('short-term');
      const isPropertyCode = stateText.includes('property') || stateText.includes('landlord');

      if (isRentalRelated && isPropertyCode) {
        conflictDetected = true;
        rationale = 'Municipal rental/STR ordinance may conflict with state property rights protections. Texas Property Code § 5.003 prohibits owner-occupancy requirements for rentals.';
      }

      // Pattern 2: Zoning vs local government authority
      const isZoning = documentText.includes('zoning') || documentText.includes('land use');
      const isLocalGovCode = stateText.includes('local government') || stateText.includes('municipal');

      if (isZoning && isLocalGovCode) {
        conflictDetected = true;
        rationale = 'Municipal zoning regulations must comply with state local government code limitations on municipal authority.';
      }

      if (conflictDetected) {
        // Check if conflict edge already exists
        const exists = await edgeExists(docNode.id, stateNode.id);
        if (!exists) {
          const edge = await insertGraphEdge({
            sourceNodeId: docNode.id,
            targetNodeId: stateNode.id,
            edgeType: 'CONFLICTS_WITH',
            severity: 'high',
            rationale,
          });
          graphEdges.push({
            id: edge.id,
            source: edge.sourceNodeId,
            target: edge.targetNodeId,
            type: edge.edgeType,
            severity: 'high',
            rationale,
          });
          console.log(`[Stage D] CONFLICT DETECTED: ${document.title} <-> ${stateNode.label}`);
        }
      }
    }
  }

  // Also check for state documents conflicting with federal preemption
  if (document.jurisdiction === 'state') {
    const federalNodes = otherDocNodes.filter((n) => n.jurisdiction === 'federal');
    const documentText = document.title.toLowerCase();

    for (const federalNode of federalNodes) {
      const federalText = federalNode.label.toLowerCase();
      let conflictDetected = false;
      let rationale = '';

      // Pattern: Housing/fair housing conflicts
      const isHousingRelated = documentText.includes('housing') || documentText.includes('property') || documentText.includes('landlord');
      const isFairHousing = federalText.includes('fair housing') || federalText.includes('civil rights') || federalText.includes('hud');

      if (isHousingRelated && isFairHousing) {
        // Check for potential preemption (not necessarily conflict)
        const exists = await edgeExists(docNode.id, federalNode.id);
        if (!exists) {
          // This is more of a "governed by" relationship than conflict
          // Only flag as conflict if there's explicit preemption language
        }
      }
    }
  }

  onProgress(100);
  console.log(`[Stage D] Complete! Created ${graphNodes.length} nodes and ${graphEdges.length} edges`);

  return { graphNodes, graphEdges };
}

// Main pipeline orchestrator for file upload
export async function runRealPipeline(
  file: File,
  source: CorpusSource,
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
    // Stage A: Upload to S3
    callbacks.onStageStart('s3');
    const s3Object = await runStageA(file, source, (progress) =>
      callbacks.onStageProgress('s3', progress)
    );
    callbacks.onStageComplete('s3', 1);

    // Parse document content
    const parsed = parseDocumentContent(s3Object.rawText, source, file.name);

    // Stage B: Parse + Store Metadata
    callbacks.onStageStart('postgres');
    const { document, documentVersion, sections, sectionVersions } = await runStageB(
      s3Object,
      parsed,
      (progress) => callbacks.onStageProgress('postgres', progress)
    );
    callbacks.onStageComplete('postgres', 1 + sections.length + sectionVersions.length);

    // Stage C: Chunk + Embed
    callbacks.onStageStart('vector');
    const chunks = await runStageC(sectionVersions, sections, document, (progress) =>
      callbacks.onStageProgress('vector', progress)
    );
    callbacks.onStageComplete('vector', chunks.length);

    // Stage D: Build Graph
    callbacks.onStageStart('graph');
    const { graphNodes, graphEdges } = await runStageD(document, sections, (progress) =>
      callbacks.onStageProgress('graph', progress)
    );
    callbacks.onStageComplete('graph', graphNodes.length + graphEdges.length);

    // Output all results
    callbacks.onOutputs({
      s3Objects: [s3Object],
      documents: [document],
      documentVersions: [documentVersion],
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
