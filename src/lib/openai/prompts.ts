// System prompt for legal conflict analysis
export const LEGAL_ANALYSIS_SYSTEM_PROMPT = `You are a legal analyst AI specializing in detecting conflicts between laws at different jurisdictional levels (Federal, State, Municipal). Your role is to:

1. Analyze legal documents and identify potential conflicts between local rules and higher-level laws
2. Apply the legal doctrine of preemption (higher laws supersede lower laws)
3. Trace authority chains showing how laws derive power from higher authorities
4. Provide clear, structured reasoning with citations

Jurisdiction Hierarchy (highest to lowest):
- Federal: US Constitution, Federal Statutes (US Code), Federal Regulations (CFR)
- State: State Constitution, State Statutes, State Regulations
- Municipal: City Ordinances, Local Regulations

Conflict Types:
- Express Preemption: Higher law explicitly prohibits lower law
- Implied Preemption: Lower law conflicts with higher law's purpose
- Field Preemption: Higher law occupies entire regulatory field

Always cite specific sections and provide confidence levels for your analysis.`;

// Function to build the analysis prompt
export function buildAnalysisPrompt(
  query: string,
  documents: {
    title: string;
    citation: string;
    jurisdiction: string;
    authorityLevel: string;
    text: string;
  }[]
): string {
  const docsContext = documents
    .map(
      (doc, i) => `
[Document ${i + 1}]
Title: ${doc.title}
Citation: ${doc.citation}
Jurisdiction: ${doc.jurisdiction}
Authority Level: ${doc.authorityLevel}
Text:
${doc.text}
`
    )
    .join('\n---\n');

  return `Analyze the following legal question using the provided documents.

USER QUESTION: ${query}

AVAILABLE LEGAL DOCUMENTS:
${docsContext || 'No documents found for this query.'}

Provide your analysis in the following JSON format:
{
  "summary": "A clear 2-3 sentence summary answering the user's question",
  "conflicts": [
    {
      "severity": "high" | "medium" | "low",
      "description": "Detailed explanation of the conflict",
      "localRule": "The lower-level law/rule name",
      "higherLaw": {
        "title": "Higher law name",
        "citation": "Specific citation",
        "jurisdiction": "federal" | "state" | "municipal"
      },
      "conflictType": "preemption" | "direct" | "implicit"
    }
  ],
  "reasoningChain": [
    {
      "step": 1,
      "description": "What you analyzed in this step",
      "citations": ["Citation 1", "Citation 2"],
      "confidence": 0.0-1.0
    }
  ],
  "suggestions": [
    {
      "original": "The problematic provision",
      "compliant": "Suggested compliant alternative",
      "justification": "Why this change would resolve the conflict"
    }
  ],
  "citations": [
    {
      "title": "Document title",
      "citation": "Specific citation",
      "jurisdiction": "federal" | "state" | "municipal",
      "excerpt": "Relevant excerpt from the document",
      "relevance": "Why this citation is relevant"
    }
  ]
}

Important:
- If no conflicts exist, return an empty conflicts array and explain why in the summary
- Always provide reasoning steps showing your analysis process
- Include relevant citations even if no conflicts are found
- Be specific about legal doctrines and precedents when applicable
- If documents are insufficient to answer, say so clearly`;
}

// Response type for parsing OpenAI response
export interface AIAnalysisResponse {
  summary: string;
  conflicts: {
    severity: 'high' | 'medium' | 'low';
    description: string;
    localRule: string;
    higherLaw: {
      title: string;
      citation: string;
      jurisdiction: 'federal' | 'state' | 'municipal';
    };
    conflictType: 'preemption' | 'direct' | 'implicit';
  }[];
  reasoningChain: {
    step: number;
    description: string;
    citations: string[];
    confidence: number;
  }[];
  suggestions: {
    original: string;
    compliant: string;
    justification: string;
  }[];
  citations: {
    title: string;
    citation: string;
    jurisdiction: 'federal' | 'state' | 'municipal';
    excerpt: string;
    relevance: string;
  }[];
}
