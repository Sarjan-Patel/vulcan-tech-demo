/**
 * AI Agent Tools for Legal Analysis
 *
 * These tools are the building blocks of the legal analysis agent.
 * Each tool has a single responsibility and can be composed together
 * in the agent's execution flow:
 *
 * 1. search_documents() - Full-text search across legal documents
 * 2. query_graph()      - Traverse knowledge graph relationships
 * 3. analyze_conflict() - Detect preemption and legal conflicts
 * 4. generate_reasoning() - Build step-by-step reasoning chain
 */

import { supabase } from '@/lib/supabase/client';
import { openai, LEGAL_ANALYSIS_MODEL } from '@/lib/openai/client';
import { LEGAL_ANALYSIS_SYSTEM_PROMPT } from '@/lib/openai/prompts';
import type { JurisdictionLevel } from '@/lib/types';

// ============================================================================
// Types
// ============================================================================

export interface RetrievedDocument {
  id: string;
  title: string;
  citation: string;
  jurisdiction: string;
  authorityLevel: string;
  text: string;
}

export interface GraphNode {
  id: string;
  nodeType: 'document' | 'section';
  label: string;
  jurisdiction: string;
  authorityLevel: string;
}

export interface GraphEdge {
  id: string;
  sourceId: string;
  targetId: string;
  edgeType: 'AUTHORIZES' | 'DERIVES_AUTHORITY_FROM' | 'CONFLICTS_WITH';
  severity?: 'high' | 'medium' | 'low';
  rationale?: string;
}

export interface GraphContext {
  nodes: GraphNode[];
  edges: GraphEdge[];
  conflicts: GraphEdge[];
}

export interface DetectedConflict {
  id: string;
  severity: 'high' | 'medium' | 'low';
  description: string;
  localRule: string;
  higherLaw: {
    title: string;
    citation: string;
    jurisdiction: string;
  };
  conflictType: 'preemption' | 'direct' | 'implicit';
}

export interface ReasoningStep {
  step: number;
  title: string;
  description: string;
  confidence: number;
  citations: string[];
}

export interface AnalysisResult {
  summary: string;
  conflicts: DetectedConflict[];
  reasoningChain: ReasoningStep[];
  suggestions: Array<{
    original: string;
    compliant: string;
    justification: string;
  }>;
  citations: Array<{
    title: string;
    citation: string;
    jurisdiction: string;
    excerpt?: string;
  }>;
}

// ============================================================================
// Tool 1: search_documents()
// Full-text search across legal documents in Supabase
// ============================================================================

const TOPIC_KEYWORDS: Record<string, string[]> = {
  rental: ['rental', 'rent', 'landlord', 'tenant', 'lease', 'housing', 'property', 'str', 'short-term'],
  zoning: ['zoning', 'land use', 'residential', 'commercial', 'district', 'permit'],
  fairHousing: ['fair housing', 'discrimination', 'protected class', 'civil rights'],
  property: ['property', 'owner', 'ownership', 'real estate', 'preemption'],
  constitution: ['constitution', 'supremacy', 'amendment', 'rights'],
};

/**
 * Extract search terms from a natural language query
 */
function extractKeywords(query: string): string[] {
  const lowerQuery = query.toLowerCase();
  const terms: string[] = [];

  // Add topic keywords that match the query
  for (const [, words] of Object.entries(TOPIC_KEYWORDS)) {
    if (words.some((word) => lowerQuery.includes(word))) {
      terms.push(...words);
    }
  }

  // Add significant words from the query (skip common words)
  const stopWords = ['does', 'what', 'with', 'this', 'that', 'from', 'have', 'will', 'the', 'and', 'for'];
  const queryWords = lowerQuery
    .split(/\s+/)
    .filter((word) => word.length > 3 && !stopWords.includes(word))
    .slice(0, 8);
  terms.push(...queryWords);

  return [...new Set(terms)];
}

/**
 * TOOL: search_documents
 *
 * Searches the legal document database using full-text search.
 * Returns documents matching the query keywords with their full text
 * and metadata (jurisdiction, authority level, citations).
 *
 * @param query - Natural language query or keywords
 * @returns Array of retrieved documents with text and metadata
 */
export async function search_documents(query: string): Promise<{
  documents: RetrievedDocument[];
  keywords: string[];
}> {
  console.log('[Tool: search_documents] Query:', query);

  const keywords = extractKeywords(query);
  console.log('[Tool: search_documents] Extracted keywords:', keywords);

  const documents: RetrievedDocument[] = [];

  // Search across multiple terms (limit to top 5 keywords for performance)
  for (const term of keywords.slice(0, 5)) {
    const { data: sections, error } = await (supabase
      .from('section_versions') as any)
      .select(`
        id,
        text,
        section:sections(
          id,
          citation,
          heading,
          document:documents(
            id,
            title,
            jurisdiction,
            authority_level,
            effective_from
          )
        )
      `)
      .ilike('text', `%${term}%`)
      .limit(10);

    if (error) {
      console.error('[Tool: search_documents] Error for term:', term, error);
      continue;
    }

    if (sections) {
      for (const secVer of sections) {
        const sectionData = secVer.section as unknown as {
          id: string;
          citation: string;
          heading: string;
          document: {
            id: string;
            title: string;
            jurisdiction: string;
            authority_level: string;
          } | null;
        } | null;

        if (sectionData?.document) {
          // Avoid duplicates
          const exists = documents.some((d) => d.citation === sectionData.citation);
          if (!exists) {
            documents.push({
              id: sectionData.id,
              title: `${sectionData.document.title} - ${sectionData.heading}`,
              citation: sectionData.citation,
              jurisdiction: sectionData.document.jurisdiction,
              authorityLevel: sectionData.document.authority_level,
              text: secVer.text,
            });
          }
        }
      }
    }
  }

  console.log('[Tool: search_documents] Found', documents.length, 'documents');
  return { documents, keywords };
}

// ============================================================================
// Tool 2: query_graph()
// Traverse knowledge graph to find relationships between documents
// ============================================================================

/**
 * TOOL: query_graph
 *
 * Queries the knowledge graph to find relationships between legal documents.
 * Returns nodes, edges, and specifically identifies CONFLICTS_WITH relationships.
 *
 * @param documentIds - Array of document IDs to find relationships for
 * @returns Graph context with nodes, edges, and conflicts
 */
export async function query_graph(documentIds: string[]): Promise<GraphContext> {
  console.log('[Tool: query_graph] Document IDs:', documentIds);

  // Get nodes for the documents
  const { data: nodes, error: nodesError } = await (supabase
    .from('graph_nodes') as any)
    .select('id, node_type, label, jurisdiction, authority_level')
    .in('entity_id', documentIds);

  if (nodesError) {
    console.error('[Tool: query_graph] Nodes error:', nodesError);
    return { nodes: [], edges: [], conflicts: [] };
  }

  const graphNodes: GraphNode[] = (nodes || []).map((n: any) => ({
    id: n.id,
    nodeType: n.node_type as 'document' | 'section',
    label: n.label,
    jurisdiction: n.jurisdiction || '',
    authorityLevel: n.authority_level || '',
  }));

  // Get all nodes if we don't have specific ones (for conflict detection)
  const { data: allNodes } = await (supabase
    .from('graph_nodes') as any)
    .select('id, node_type, label, jurisdiction, authority_level');

  const allGraphNodes: GraphNode[] = (allNodes || []).map((n: any) => ({
    id: n.id,
    nodeType: n.node_type as 'document' | 'section',
    label: n.label,
    jurisdiction: n.jurisdiction || '',
    authorityLevel: n.authority_level || '',
  }));

  // Get edges (relationships)
  const { data: edges, error: edgesError } = await (supabase
    .from('graph_edges') as any)
    .select('id, source_node_id, target_node_id, edge_type, severity, rationale');

  if (edgesError) {
    console.error('[Tool: query_graph] Edges error:', edgesError);
    return { nodes: allGraphNodes, edges: [], conflicts: [] };
  }

  const graphEdges: GraphEdge[] = (edges || []).map((e: any) => ({
    id: e.id,
    sourceId: e.source_node_id,
    targetId: e.target_node_id,
    edgeType: e.edge_type as 'AUTHORIZES' | 'DERIVES_AUTHORITY_FROM' | 'CONFLICTS_WITH',
    severity: e.severity as 'high' | 'medium' | 'low' | undefined,
    rationale: e.rationale || undefined,
  }));

  // Filter out conflict edges specifically
  const conflicts = graphEdges.filter((e) => e.edgeType === 'CONFLICTS_WITH');

  console.log('[Tool: query_graph] Found', graphNodes.length, 'nodes,', graphEdges.length, 'edges,', conflicts.length, 'conflicts');

  return {
    nodes: allGraphNodes.length > graphNodes.length ? allGraphNodes : graphNodes,
    edges: graphEdges,
    conflicts,
  };
}

// ============================================================================
// Tool 3: analyze_conflict()
// Use LLM to detect preemption and legal conflicts
// ============================================================================

/**
 * TOOL: analyze_conflict
 *
 * Uses GPT-4o to analyze retrieved documents for legal conflicts.
 * Applies preemption doctrine (Federal > State > Municipal) to detect
 * conflicts between different jurisdiction levels.
 *
 * @param query - Original user query
 * @param documents - Retrieved legal documents
 * @param graphContext - Knowledge graph relationships
 * @returns Analysis result with conflicts, reasoning, and suggestions
 */
export async function analyze_conflict(
  query: string,
  documents: RetrievedDocument[],
  graphContext: GraphContext
): Promise<AnalysisResult> {
  console.log('[Tool: analyze_conflict] Analyzing', documents.length, 'documents');

  // Build context string from documents
  const documentContext = documents
    .map((doc) => `
## ${doc.title}
- **Citation**: ${doc.citation}
- **Jurisdiction**: ${doc.jurisdiction}
- **Authority Level**: ${doc.authorityLevel}
- **Text**: ${doc.text}
`).join('\n---\n');

  // Build graph context string
  const graphInfo = graphContext.conflicts.length > 0
    ? `\n## Known Conflicts in Knowledge Graph\n${graphContext.conflicts.map((c) => {
        const sourceNode = graphContext.nodes.find((n) => n.id === c.sourceId);
        const targetNode = graphContext.nodes.find((n) => n.id === c.targetId);
        return `- ${sourceNode?.label || 'Unknown'} CONFLICTS_WITH ${targetNode?.label || 'Unknown'} (Severity: ${c.severity || 'unknown'})`;
      }).join('\n')}`
    : '';

  const analysisPrompt = `
## User Query
${query}

## Retrieved Legal Documents
${documentContext}
${graphInfo}

## Instructions
Analyze these legal documents for conflicts, applying the legal hierarchy:
1. Federal Law (highest authority)
2. State Law
3. Municipal/Local Ordinances (lowest authority)

For each potential conflict, identify:
- The local provision that may be preempted
- The higher law that preempts it
- The type of conflict (express preemption, implied preemption, or direct conflict)
- Severity (high, medium, low)

Provide step-by-step legal reasoning with confidence scores.

Respond in JSON format:
{
  "summary": "Executive summary of the analysis",
  "conflicts": [
    {
      "severity": "high|medium|low",
      "description": "Description of the conflict",
      "localRule": "The local provision",
      "higherLaw": {
        "title": "Name of the higher law",
        "citation": "Legal citation",
        "jurisdiction": "federal|state"
      },
      "conflictType": "preemption|direct|implicit"
    }
  ],
  "reasoningChain": [
    {
      "step": 1,
      "title": "Step title",
      "description": "Detailed reasoning",
      "confidence": 0.95,
      "citations": ["Citation 1", "Citation 2"]
    }
  ],
  "suggestions": [
    {
      "original": "Original problematic language",
      "compliant": "Suggested compliant language",
      "justification": "Why this change helps"
    }
  ],
  "citations": [
    {
      "title": "Document title",
      "citation": "Legal citation",
      "jurisdiction": "federal|state|municipal",
      "excerpt": "Relevant excerpt"
    }
  ]
}
`;

  // Call OpenAI for conflict analysis
  const completion = await openai.chat.completions.create({
    model: LEGAL_ANALYSIS_MODEL,
    messages: [
      { role: 'system', content: LEGAL_ANALYSIS_SYSTEM_PROMPT },
      { role: 'user', content: analysisPrompt },
    ],
    temperature: 0.3,
    response_format: { type: 'json_object' },
  });

  const responseText = completion.choices[0]?.message?.content;
  if (!responseText) {
    throw new Error('No response from LLM');
  }

  const result = JSON.parse(responseText) as AnalysisResult;
  console.log('[Tool: analyze_conflict] Found', result.conflicts.length, 'conflicts');

  return result;
}

// ============================================================================
// Tool 4: generate_reasoning()
// Build step-by-step reasoning chain from analysis
// ============================================================================

/**
 * TOOL: generate_reasoning
 *
 * Takes the raw analysis result and generates a polished reasoning chain
 * with proper citations and confidence scores. This tool can also be used
 * to enhance or expand existing reasoning chains.
 *
 * @param analysisResult - Raw analysis from analyze_conflict
 * @param documents - Original documents for citation linking
 * @returns Enhanced reasoning chain with linked citations
 */
export async function generate_reasoning(
  analysisResult: AnalysisResult,
  documents: RetrievedDocument[]
): Promise<{
  reasoningChain: ReasoningStep[];
  summary: string;
}> {
  console.log('[Tool: generate_reasoning] Processing', analysisResult.reasoningChain.length, 'steps');

  // Enhance reasoning steps with document links
  const enhancedSteps: ReasoningStep[] = analysisResult.reasoningChain.map((step) => {
    // Try to link citations to actual documents
    const linkedCitations = step.citations.map((citStr) => {
      const matchingDoc = documents.find(
        (d) => d.citation.includes(citStr) || citStr.includes(d.citation)
      );
      return matchingDoc ? matchingDoc.citation : citStr;
    });

    return {
      ...step,
      citations: linkedCitations,
    };
  });

  // Generate a structured summary if not present
  let summary = analysisResult.summary;
  if (!summary || summary.length < 50) {
    const conflictCount = analysisResult.conflicts.length;
    const highSeverity = analysisResult.conflicts.filter((c) => c.severity === 'high').length;

    summary = conflictCount > 0
      ? `Analysis identified ${conflictCount} potential legal conflict${conflictCount > 1 ? 's' : ''}, including ${highSeverity} high-severity issue${highSeverity !== 1 ? 's' : ''}. Review the detailed reasoning chain below for specific citations and recommendations.`
      : 'No significant legal conflicts were identified in the analyzed documents. The local provisions appear to be consistent with higher-level laws.';
  }

  console.log('[Tool: generate_reasoning] Generated', enhancedSteps.length, 'enhanced steps');

  return {
    reasoningChain: enhancedSteps,
    summary,
  };
}

// ============================================================================
// Agent Orchestrator
// Coordinates all tools in the proper execution sequence
// ============================================================================

export interface AgentInput {
  query: string;
}

export interface AgentOutput {
  success: boolean;
  result?: AnalysisResult;
  error?: string;
  metadata: {
    documentsRetrieved: number;
    conflictsDetected: number;
    reasoningSteps: number;
    toolCalls: string[];
  };
}

/**
 * AGENT: Legal Analysis Agent
 *
 * Orchestrates all tools in sequence to perform comprehensive legal analysis.
 *
 * Execution Flow:
 * 1. agent receives user_query
 * 2. agent → search_documents(keywords)
 * 3. agent → query_graph(doc_ids)
 * 4. agent → analyze_conflict(context)
 * 5. agent → generate_reasoning(conflicts)
 * 6. agent returns structured_response
 */
export async function runAgent(input: AgentInput): Promise<AgentOutput> {
  const toolCalls: string[] = [];

  try {
    console.log('[Agent] Starting analysis for:', input.query);

    // Step 1: Search for relevant documents
    toolCalls.push('search_documents');
    const { documents, keywords } = await search_documents(input.query);

    if (documents.length === 0) {
      return {
        success: false,
        error: 'No relevant documents found. Please ensure legal documents have been ingested.',
        metadata: {
          documentsRetrieved: 0,
          conflictsDetected: 0,
          reasoningSteps: 0,
          toolCalls,
        },
      };
    }

    // Step 2: Query knowledge graph for relationships
    toolCalls.push('query_graph');
    const documentIds = documents.map((d) => d.id);
    const graphContext = await query_graph(documentIds);

    // Step 3: Analyze for conflicts using LLM
    toolCalls.push('analyze_conflict');
    const analysisResult = await analyze_conflict(input.query, documents, graphContext);

    // Step 4: Generate enhanced reasoning chain
    toolCalls.push('generate_reasoning');
    const { reasoningChain, summary } = await generate_reasoning(analysisResult, documents);

    // Assemble final result
    const finalResult: AnalysisResult = {
      ...analysisResult,
      summary,
      reasoningChain,
    };

    console.log('[Agent] Analysis complete');

    return {
      success: true,
      result: finalResult,
      metadata: {
        documentsRetrieved: documents.length,
        conflictsDetected: finalResult.conflicts.length,
        reasoningSteps: reasoningChain.length,
        toolCalls,
      },
    };

  } catch (error) {
    console.error('[Agent] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      metadata: {
        documentsRetrieved: 0,
        conflictsDetected: 0,
        reasoningSteps: 0,
        toolCalls,
      },
    };
  }
}
