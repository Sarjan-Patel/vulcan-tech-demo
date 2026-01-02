// API route to bulk ingest demo files in correct order
import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';

import type {
  CorpusSource,
} from '@/lib/ingestion/types';

// Extended type to handle demo file format (uses 'text' instead of 'rawText')
interface DemoDocumentInput {
  title: string;
  citation: string;
  jurisdiction: 'federal' | 'state' | 'municipal';
  authorityLevel: 'constitution' | 'statute' | 'regulation' | 'ordinance';
  effectiveFrom: string;
  text: string; // Demo files use 'text' not 'rawText'
  sections?: {
    heading: string;
    citation: string;
    text: string;
  }[];
}
import { chunkText, estimateTokenCount } from '@/lib/ingestion/chunking';
import { generateFakeEmbedding } from '@/lib/ingestion/embeddings';
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
  s3ObjectExistsByChecksum,
  documentExistsByTitle,
} from '@/lib/supabase/ingestion-service';

// Demo files in order of authority (highest first)
const DEMO_FILES = [
  // Federal - Constitution
  { file: '01-us-constitution-supremacy.json', corpus: 'us-code' as CorpusSource },
  // Federal - Statutes
  { file: '02-fair-housing-act.json', corpus: 'us-code' as CorpusSource },
  { file: '03-civil-rights-act.json', corpus: 'us-code' as CorpusSource },
  // Federal - Regulations
  { file: '04-hud-fair-housing-regulations.json', corpus: 'ecfr' as CorpusSource },
  // State - Constitution
  { file: '05-texas-constitution-property.json', corpus: 'texas-statutes' as CorpusSource },
  // State - Statutes
  { file: '06-texas-property-code.json', corpus: 'texas-statutes' as CorpusSource },
  { file: '07-texas-local-gov-code.json', corpus: 'texas-statutes' as CorpusSource },
  // Municipal - Ordinances (these will create conflict edges)
  { file: '08-austin-str-ordinance.json', corpus: 'austin-ordinances' as CorpusSource },
  { file: '09-austin-zoning-code.json', corpus: 'austin-ordinances' as CorpusSource },
  { file: '10-austin-fair-housing.json', corpus: 'austin-ordinances' as CorpusSource },
];

// Jurisdiction and authority hierarchy
const JURISDICTION_HIERARCHY: Record<string, number> = {
  federal: 3,
  state: 2,
  municipal: 1,
};

const AUTHORITY_HIERARCHY: Record<string, number> = {
  constitution: 4,
  statute: 3,
  regulation: 2,
  ordinance: 1,
};

function generateChecksum(content: string): string {
  return crypto.createHash('sha256').update(content).digest('hex').slice(0, 16);
}

export async function POST() {
  const results: {
    file: string;
    status: 'success' | 'skipped' | 'error';
    message: string;
  }[] = [];

  try {
    const demoDataDir = path.join(process.cwd(), 'demo-data');

    for (const { file, corpus } of DEMO_FILES) {
      try {
        const filePath = path.join(demoDataDir, file);
        const content = await fs.readFile(filePath, 'utf-8');
        const parsed: DemoDocumentInput = JSON.parse(content);
        const checksum = generateChecksum(content);

        // Check for duplicates
        const checksumExists = await s3ObjectExistsByChecksum(checksum);
        const titleExists = await documentExistsByTitle(parsed.title);

        if (checksumExists || titleExists) {
          results.push({
            file,
            status: 'skipped',
            message: `Already ingested: ${titleExists ? 'title exists' : 'checksum exists'}`,
          });
          continue;
        }

        console.log(`[Bulk Ingest] Processing: ${file} (${parsed.title})`);

        // Stage A: Create S3 object record
        const s3Object = await insertS3Object({
          key: `demo/${corpus}/${file}`,
          source: corpus,
          checksum,
          contentType: 'application/json',
          fileSizeBytes: Buffer.byteLength(content, 'utf-8'),
        });

        // Stage B: Create document and sections
        const document = await insertDocument({
          title: parsed.title,
          jurisdiction: parsed.jurisdiction,
          authorityLevel: parsed.authorityLevel,
          source: corpus,
          effectiveFrom: parsed.effectiveFrom,
        });

        const documentVersion = await insertDocumentVersion({
          documentId: document.id,
          effectiveFrom: parsed.effectiveFrom,
          s3ObjectId: s3Object.id,
          versionNumber: 1,
        });

        await updateDocumentCurrentVersion(document.id, documentVersion.id);

        // Create sections
        const sections = [];
        const sectionVersions = [];

        if (parsed.sections && parsed.sections.length > 0) {
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
          const section = await insertSection({
            documentId: document.id,
            citation: parsed.citation,
            heading: parsed.title,
          });
          sections.push(section);

          const sectionVersion = await insertSectionVersion({
            sectionId: section.id,
            documentVersionId: documentVersion.id,
            text: parsed.text,
            tokenCount: estimateTokenCount(parsed.text),
          });
          sectionVersions.push(sectionVersion);
        }

        // Stage C: Create vector chunks
        for (const secVer of sectionVersions) {
          const section = sections.find((s) => s.id === secVer.sectionId);
          if (!section) continue;

          const textChunks = chunkText(secVer.text, {
            targetTokens: 200,
            minTokens: 80,
            maxTokens: 400,
            overlapTokens: 30,
          });

          for (const chunk of textChunks) {
            await insertVectorChunk({
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
            });
          }
        }

        // Stage D: Create graph nodes and edges
        const docNode = await insertGraphNode({
          label: document.title,
          nodeType: 'document',
          jurisdiction: document.jurisdiction,
          authorityLevel: document.authorityLevel,
          effectiveFrom: document.effectiveFrom,
          documentId: document.id,
        });

        // Create section nodes
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

          await insertGraphEdge({
            sourceNodeId: docNode.id,
            targetNodeId: sectionNode.id,
            edgeType: 'AUTHORIZES',
          });
        }

        // Build cross-document relationships
        const existingDocNodes = await getDocumentNodes();
        const otherDocNodes = existingDocNodes.filter((n) => n.id !== docNode.id);

        for (const otherNode of otherDocNodes) {
          const currentJurLevel = JURISDICTION_HIERARCHY[document.jurisdiction];
          const otherJurLevel = JURISDICTION_HIERARCHY[otherNode.jurisdiction];
          const currentAuthLevel = AUTHORITY_HIERARCHY[document.authorityLevel];
          const otherAuthLevel = AUTHORITY_HIERARCHY[otherNode.authorityLevel];

          const exists = await edgeExists(docNode.id, otherNode.id);
          if (exists) continue;

          // Same jurisdiction, lower authority derives from higher
          if (otherJurLevel === currentJurLevel && otherAuthLevel > currentAuthLevel) {
            await insertGraphEdge({
              sourceNodeId: docNode.id,
              targetNodeId: otherNode.id,
              edgeType: 'DERIVES_AUTHORITY_FROM',
            });
          }

          // Lower jurisdiction derives from higher
          if (otherJurLevel > currentJurLevel) {
            const isImmediateHigher = otherJurLevel === currentJurLevel + 1;
            const isConstitution = otherNode.authorityLevel === 'constitution';

            if (isImmediateHigher || isConstitution) {
              await insertGraphEdge({
                sourceNodeId: docNode.id,
                targetNodeId: otherNode.id,
                edgeType: 'DERIVES_AUTHORITY_FROM',
              });
            }
          }
        }

        // Conflict detection for municipal documents
        if (document.jurisdiction === 'municipal') {
          const stateNodes = otherDocNodes.filter((n) => n.jurisdiction === 'state');
          const documentText = document.title.toLowerCase();

          for (const stateNode of stateNodes) {
            const stateText = stateNode.label.toLowerCase();
            let conflictDetected = false;
            let rationale = '';

            const isRentalRelated = documentText.includes('rental') || documentText.includes('str') || documentText.includes('short-term');
            const isPropertyCode = stateText.includes('property') || stateText.includes('landlord');

            if (isRentalRelated && isPropertyCode) {
              conflictDetected = true;
              rationale = 'Municipal rental/STR ordinance may conflict with state property rights protections. Texas Property Code § 5.003 prohibits owner-occupancy requirements for rentals.';
            }

            const isZoning = documentText.includes('zoning') || documentText.includes('land use');
            const isLocalGovCode = stateText.includes('local government') || stateText.includes('municipal');

            if (isZoning && isLocalGovCode) {
              conflictDetected = true;
              rationale = 'Municipal zoning regulations must comply with state local government code limitations on municipal authority.';
            }

            if (conflictDetected) {
              const exists = await edgeExists(docNode.id, stateNode.id);
              if (!exists) {
                await insertGraphEdge({
                  sourceNodeId: docNode.id,
                  targetNodeId: stateNode.id,
                  edgeType: 'CONFLICTS_WITH',
                  severity: 'high',
                  rationale,
                });
                console.log(`[Bulk Ingest] CONFLICT: ${document.title} <-> ${stateNode.label}`);
              }
            }
          }
        }

        results.push({
          file,
          status: 'success',
          message: `Ingested: ${parsed.title}`,
        });

      } catch (fileError) {
        console.error(`[Bulk Ingest] Error processing ${file}:`, fileError);
        results.push({
          file,
          status: 'error',
          message: fileError instanceof Error ? fileError.message : 'Unknown error',
        });
      }
    }

    const successCount = results.filter((r) => r.status === 'success').length;
    const skippedCount = results.filter((r) => r.status === 'skipped').length;
    const errorCount = results.filter((r) => r.status === 'error').length;

    return NextResponse.json({
      success: true,
      summary: {
        total: DEMO_FILES.length,
        ingested: successCount,
        skipped: skippedCount,
        errors: errorCount,
      },
      results,
    });

  } catch (error) {
    console.error('[Bulk Ingest] Fatal error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        results,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST to ingest all demo files',
    files: DEMO_FILES.map((f) => ({ file: f.file, corpus: f.corpus })),
  });
}
