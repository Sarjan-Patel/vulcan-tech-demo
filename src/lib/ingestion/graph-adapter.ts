// Adapter to convert ingestion graph data to LegalGraph format

import type { IngestionGraphNode, IngestionGraphEdge } from './types';
import type { LegalNode, LegalEdge, LegalDocumentType, LegalStatus, RelationshipType, JurisdictionLevel } from '../types';

/**
 * Convert ingestion graph nodes to LegalNode format for React Flow visualization
 */
export function convertToLegalNodes(ingestionNodes: IngestionGraphNode[]): LegalNode[] {
  return ingestionNodes.map((node) => ({
    id: node.id,
    title: node.label,
    citation: node.citation || node.id,
    jurisdiction: node.jurisdiction as JurisdictionLevel,
    type: mapAuthorityToDocumentType(node.authorityLevel),
    status: 'active' as LegalStatus, // Default to active, could be enhanced
    effectiveDate: undefined,
    excerpt: undefined,
  }));
}

/**
 * Convert ingestion graph edges to LegalEdge format
 */
export function convertToLegalEdges(ingestionEdges: IngestionGraphEdge[]): LegalEdge[] {
  return ingestionEdges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    relationship: mapEdgeTypeToRelationship(edge.type),
  }));
}

/**
 * Map authority level to document type
 */
function mapAuthorityToDocumentType(authorityLevel: string): LegalDocumentType {
  switch (authorityLevel.toLowerCase()) {
    case 'constitution':
      return 'constitution';
    case 'statute':
      return 'statute';
    case 'regulation':
      return 'regulation';
    case 'ordinance':
      return 'ordinance';
    case 'code':
      return 'statute';
    default:
      return 'statute';
  }
}

/**
 * Map edge type to relationship type
 */
function mapEdgeTypeToRelationship(edgeType: string): RelationshipType {
  switch (edgeType) {
    case 'AUTHORIZES':
      return 'authorizes';
    case 'DERIVES_AUTHORITY_FROM':
      return 'derives';
    case 'CONFLICTS_WITH':
      return 'conflicts';
    case 'AMENDS':
      return 'amends';
    default:
      return 'derives';
  }
}
