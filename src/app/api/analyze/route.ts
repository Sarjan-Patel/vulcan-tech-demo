/**
 * API Route: /api/analyze
 *
 * AI-powered legal conflict analysis using the Agent orchestration pattern.
 *
 * The agent coordinates four tools:
 * 1. search_documents() - RAG retrieval from Supabase
 * 2. query_graph()      - Knowledge graph traversal
 * 3. analyze_conflict() - LLM-powered conflict detection
 * 4. generate_reasoning() - Reasoning chain generation
 */

import { NextRequest, NextResponse } from 'next/server';
import { runAgent } from '@/lib/agent/tools';
import type {
  AnalysisResponse,
  Conflict,
  ReasoningStep,
  Suggestion,
  Citation,
  JurisdictionLevel,
} from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    console.log('[API: /analyze] Received query:', query);

    // Check if OpenAI is configured
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your-openai-api-key-here') {
      return NextResponse.json(
        { error: 'OpenAI API key is not configured. Please add your key to .env.local' },
        { status: 500 }
      );
    }

    // Run the agent with the user's query
    const agentOutput = await runAgent({ query });

    // Handle agent failure
    if (!agentOutput.success || !agentOutput.result) {
      return NextResponse.json({
        id: `analysis-${Date.now()}`,
        query,
        summary: agentOutput.error || 'Analysis failed',
        conflicts: [],
        reasoningChain: [{
          step: 1,
          description: agentOutput.error || 'No documents found or analysis failed',
          citations: [],
          confidence: 1.0,
        }],
        suggestions: [],
        citations: [],
        timestamp: new Date(),
        metadata: agentOutput.metadata,
      } as AnalysisResponse);
    }

    // Transform agent result to API response format
    const { result, metadata } = agentOutput;

    const conflicts: Conflict[] = result.conflicts.map((c, index) => ({
      id: `conflict-${Date.now()}-${index}`,
      severity: c.severity,
      description: c.description,
      localRule: c.localRule,
      higherLaw: {
        id: `law-${index}`,
        title: c.higherLaw.title,
        citation: c.higherLaw.citation,
        jurisdiction: c.higherLaw.jurisdiction as JurisdictionLevel,
        year: new Date().getFullYear(),
      },
      conflictType: c.conflictType,
    }));

    const reasoningChain: ReasoningStep[] = result.reasoningChain.map((r) => ({
      step: r.step,
      description: r.description,
      citations: r.citations.map((citStr, i) => ({
        id: `cite-${r.step}-${i}`,
        title: citStr,
        citation: citStr,
        jurisdiction: 'federal' as JurisdictionLevel,
        year: new Date().getFullYear(),
      })),
      confidence: r.confidence,
    }));

    const suggestions: Suggestion[] = result.suggestions.map((s, index) => ({
      id: `suggestion-${index}`,
      original: s.original,
      compliant: s.compliant,
      justification: s.justification,
    }));

    const citations: Citation[] = result.citations.map((c, index) => ({
      id: `citation-${index}`,
      title: c.title,
      citation: c.citation,
      jurisdiction: c.jurisdiction as JurisdictionLevel,
      year: new Date().getFullYear(),
      excerpt: c.excerpt,
    }));

    const response: AnalysisResponse = {
      id: `analysis-${Date.now()}`,
      query,
      summary: result.summary,
      conflicts,
      reasoningChain,
      suggestions,
      citations,
      timestamp: new Date(),
      // Include metadata about agent execution
      metadata: {
        documentsRetrieved: metadata.documentsRetrieved,
        conflictsDetected: metadata.conflictsDetected,
        reasoningSteps: metadata.reasoningSteps,
        toolCalls: metadata.toolCalls,
      },
    };

    console.log('[API: /analyze] Success - Tools called:', metadata.toolCalls.join(' → '));

    return NextResponse.json(response);

  } catch (error) {
    console.error('[API: /analyze] Error:', error);

    // Handle specific OpenAI errors
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: 'Invalid OpenAI API key. Please check your configuration.' },
          { status: 401 }
        );
      }
      if (error.message.includes('rate limit')) {
        return NextResponse.json(
          { error: 'OpenAI rate limit exceeded. Please try again in a moment.' },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Analysis failed' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'POST { query: "your question" } to analyze legal documents',
    agent: 'Legal Analysis Agent',
    tools: [
      'search_documents() - Full-text search across legal documents',
      'query_graph() - Traverse knowledge graph relationships',
      'analyze_conflict() - Detect preemption and legal conflicts',
      'generate_reasoning() - Build step-by-step reasoning chain',
    ],
    powered_by: 'OpenAI GPT-4o',
  });
}
