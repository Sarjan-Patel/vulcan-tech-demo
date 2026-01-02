# Vulcan Legal Platform - Project Explanation

## Overview

Vulcan is an AI-powered legal conflict analysis platform that helps municipalities, legal teams, and policy makers identify potential conflicts between local ordinances and higher-level laws (federal and state). The core problem it solves is **legal preemption detection** - when a local law might be invalidated because it conflicts with state or federal law.

For example, if Austin passes a short-term rental ordinance requiring owner-occupancy, but Texas state law prohibits such requirements, Vulcan would detect this conflict and explain why the local ordinance may be unenforceable.

---

## Tech Stack

| Layer | Technology | Why I Chose It |
|-------|------------|----------------|
| **Frontend** | Next.js 14 (App Router) | Server components, excellent DX, built-in API routes |
| **Styling** | Tailwind CSS v4 | Utility-first, fast iteration, dark theme support |
| **UI Components** | shadcn/ui | Accessible, customizable, works great with Tailwind |
| **Database** | Supabase (PostgreSQL) | Real-time, great DX, built-in auth, vector support |
| **LLM** | OpenAI GPT-4o | Best reasoning capabilities for legal analysis |
| **Graph Visualization** | React Flow | Interactive node-based diagrams |
| **Language** | TypeScript | Type safety, better maintainability |

---

## Architecture Overview

The system follows a **RAG (Retrieval Augmented Generation)** architecture with an **AI Agent** at its core. Here's the high-level flow:

```
User Query → Keyword Extraction → Document Retrieval → Context Assembly → LLM Analysis → Response
```

Let me break down each component:

---

## 1. RAG Implementation

### What is RAG?

RAG stands for **Retrieval Augmented Generation**. Instead of relying solely on the LLM's training data, we:
1. **Retrieve** relevant documents from our database based on the user's query
2. **Augment** the LLM's prompt with this retrieved context
3. **Generate** a response that's grounded in actual legal documents

This approach is critical for legal analysis because:
- Laws change frequently - the LLM's training data may be outdated
- We need citations to specific legal provisions
- Hallucination in legal contexts is unacceptable

### How It Works in Vulcan

#### Step 1: Keyword Extraction

When a user submits a query like "Can Austin require short-term rental hosts to live on-site?", I extract relevant legal topics:

```typescript
// src/app/api/analyze/route.ts
const legalTopics: Record<string, string[]> = {
  'rental': ['rental', 'tenant', 'landlord', 'lease', 'housing', 'rent'],
  'zoning': ['zoning', 'land use', 'building', 'construction', 'permit'],
  'fair_housing': ['discrimination', 'fair housing', 'protected class'],
  'short_term_rental': ['short-term', 'str', 'airbnb', 'vacation rental', 'host'],
  'preemption': ['preemption', 'preempt', 'supersede', 'conflict', 'override'],
};
```

The query matches `short_term_rental`, `rental`, and potentially `preemption` topics.

#### Step 2: Document Retrieval

I query Supabase to find relevant legal documents:

```typescript
const { data: relevantDocs } = await supabase
  .from('section_versions')
  .select(`
    id,
    content,
    effective_date,
    sections!inner (
      id,
      citation,
      heading,
      documents!inner (
        id,
        title,
        jurisdiction,
        authority_level
      )
    )
  `)
  .or(keywords.map(kw => `content.ilike.%${kw}%`).join(','))
  .limit(10);
```

This returns documents from federal (Fair Housing Act), state (Texas Property Code), and municipal (Austin Ordinances) levels.

#### Step 3: Context Assembly

I format the retrieved documents into a structured prompt:

```typescript
function buildAnalysisPrompt(query: string, documents: RetrievedDocument[]): string {
  const docContext = documents.map(doc => `
## ${doc.title}
- **Jurisdiction**: ${doc.jurisdiction}
- **Authority Level**: ${doc.authority_level}
- **Citation**: ${doc.citation}
- **Content**: ${doc.content}
`).join('\n\n');

  return `
## User Query
${query}

## Retrieved Legal Documents
${docContext}

## Instructions
Analyze these documents for conflicts. Consider the legal hierarchy:
Federal Law > State Law > Municipal Ordinance
...
`;
}
```

#### Step 4: LLM Analysis

The assembled prompt goes to GPT-4o with a specialized system prompt:

```typescript
// src/lib/openai/prompts.ts
export const LEGAL_ANALYSIS_SYSTEM_PROMPT = `You are an expert legal analyst specializing in U.S. constitutional law, statutory interpretation, and regulatory compliance. Your role is to:

1. Analyze legal documents for potential conflicts
2. Apply the doctrine of preemption (federal > state > local)
3. Identify express preemption, implied preemption, and conflict preemption
4. Provide step-by-step legal reasoning with confidence scores
5. Cite specific provisions when identifying conflicts

Always structure your response as valid JSON...`;
```

```typescript
const response = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages: [
    { role: 'system', content: LEGAL_ANALYSIS_SYSTEM_PROMPT },
    { role: 'user', content: analysisPrompt }
  ],
  temperature: 0.3,  // Low temperature for consistent, factual responses
  response_format: { type: 'json_object' }
});
```

I use `temperature: 0.3` because legal analysis requires consistency - we don't want creative interpretations of the law.

---

## 2. AI Agent Orchestration

The AI agent follows a **Perceive → Reason → Act** loop:

### Perceive
- Parse the user's natural language query
- Identify legal topics and jurisdictions mentioned
- Determine what type of analysis is needed

### Reason
- Apply legal doctrine (preemption, statutory interpretation)
- Compare provisions across jurisdiction levels
- Identify conflicts and their severity

### Act
- Call tools to search documents, query the knowledge graph
- Generate structured reasoning chains
- Format the response with citations

### Available Tools

The agent has access to these conceptual tools (implemented as functions):

| Tool | Purpose |
|------|---------|
| `search_documents()` | Full-text search across legal documents |
| `query_graph()` | Traverse knowledge graph relationships |
| `analyze_conflict()` | Detect preemption and legal conflicts |
| `generate_reasoning()` | Build step-by-step reasoning chain |

### Execution Flow

```
1. agent receives user_query
2. agent → search_documents(keywords)      // RAG retrieval
3. agent → query_graph(doc_ids)            // Get relationships
4. agent → analyze_conflict(context)       // Detect conflicts
5. agent → generate_reasoning(conflicts)   // Build reasoning
6. agent returns structured_response
```

### Response Structure

The agent returns a structured JSON response:

```typescript
interface AnalysisResponse {
  summary: string;
  conflicts: Array<{
    id: string;
    title: string;
    severity: 'high' | 'medium' | 'low';
    description: string;
    localProvision: Citation;
    conflictingProvision: Citation;
    conflictType: 'preemption' | 'direct' | 'implicit';
    recommendation: string;
  }>;
  reasoningChain: Array<{
    step: number;
    title: string;
    description: string;
    confidence: number;
    citations: Citation[];
  }>;
  suggestions: string[];
  citedProvisions: Citation[];
}
```

---

## 3. Database Schema (Supabase)

I designed the database to support both document storage and knowledge graph traversal:

### Core Tables

#### `documents`
Stores metadata about legal documents (acts, codes, ordinances).

```sql
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  jurisdiction TEXT NOT NULL,        -- 'Federal', 'Texas', 'Austin'
  authority_level TEXT NOT NULL,     -- 'federal', 'state', 'municipal'
  document_type TEXT,                -- 'statute', 'ordinance', 'regulation'
  effective_date DATE,
  source_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### `sections`
Individual sections within documents (chapters, articles, subsections).

```sql
CREATE TABLE sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id),
  citation TEXT NOT NULL,            -- '42 U.S.C. § 3604'
  heading TEXT,
  parent_section_id UUID REFERENCES sections(id),
  order_index INTEGER
);
```

#### `section_versions`
Full text content with version history.

```sql
CREATE TABLE section_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID REFERENCES sections(id),
  content TEXT NOT NULL,
  effective_date DATE,
  version_number INTEGER DEFAULT 1
);
```

### Knowledge Graph Tables

#### `graph_nodes`
Nodes in the knowledge graph (documents and sections as entities).

```sql
CREATE TABLE graph_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  node_type TEXT NOT NULL,           -- 'document', 'section'
  label TEXT NOT NULL,
  entity_id UUID,                    -- References documents.id or sections.id
  jurisdiction TEXT,
  authority_level TEXT,
  metadata JSONB
);
```

#### `graph_edges`
Relationships between nodes.

```sql
CREATE TABLE graph_edges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_node_id UUID REFERENCES graph_nodes(id),
  target_node_id UUID REFERENCES graph_nodes(id),
  edge_type TEXT NOT NULL,           -- 'AUTHORIZES', 'DERIVES_AUTHORITY_FROM', 'CONFLICTS_WITH'
  severity TEXT,                     -- For conflict edges: 'high', 'medium', 'low'
  rationale TEXT,
  metadata JSONB
);
```

### Edge Types

| Edge Type | Meaning | Example |
|-----------|---------|---------|
| `AUTHORIZES` | Document contains this section | Fair Housing Act → § 3604 |
| `DERIVES_AUTHORITY_FROM` | Lower law derives from higher | Texas Property Code → U.S. Constitution |
| `CONFLICTS_WITH` | Legal conflict detected | Austin STR Ordinance ↔ Texas Property Code |

### Chat Persistence Tables

#### `chat_sessions`
```sql
CREATE TABLE chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### `chat_messages`
```sql
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL,                -- 'user' or 'assistant'
  content TEXT NOT NULL,
  analysis JSONB,                    -- Full analysis response for assistant messages
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 4. Knowledge Graph Visualization

The graph visualization uses React Flow to display legal relationships:

### Jurisdiction Hierarchy

```
Federal (Blue) → State (Green) → Municipal (Amber)
```

Higher-level laws can preempt lower-level laws. The graph visually shows:
- **Solid lines**: Authority relationships (AUTHORIZES, DERIVES_FROM)
- **Dashed red lines**: Conflict relationships (CONFLICTS_WITH)

### Implementation

```typescript
// src/components/graph/graph-view.tsx
const nodeTypes = {
  document: DocumentNode,
  section: SectionNode,
};

const edgeTypes = {
  conflict: ConflictEdge,      // Red, dashed, animated
  authority: AuthorityEdge,    // Gray, solid
  derives: DerivesEdge,        // Blue, solid
};
```

The graph is interactive - users can:
- Click nodes to see details in a side panel
- See conflict warnings highlighted
- Navigate from chat citations directly to graph nodes

---

## 5. Frontend Components

### Chat Interface (`/chat`)

The chat interface includes:

1. **Message List** - Displays conversation history with:
   - User messages
   - AI responses with conflict cards
   - Reasoning chain visualization
   - Citation badges (clickable to view in graph)

2. **Chat Input** - Supports:
   - Natural language questions
   - Pasting full ordinance text for analysis
   - Example queries for quick start

3. **Sidebar** - Chat history with:
   - Session list with timestamps
   - New chat button
   - Delete session functionality

### Analysis Response Components

```typescript
// Conflict Card - Shows detected conflicts with severity badges
<ConflictCard
  title="Owner-Occupancy Requirement Conflict"
  severity="high"
  localProvision={{ citation: "Austin Ordinance § 25-2-1", ... }}
  conflictingProvision={{ citation: "Texas Property Code § 5.003", ... }}
/>

// Reasoning Chain - Step-by-step analysis
<ReasoningChain
  steps={[
    { step: 1, title: "Identify Local Provision", confidence: 0.95, ... },
    { step: 2, title: "Find State Law", confidence: 0.92, ... },
    { step: 3, title: "Apply Preemption Doctrine", confidence: 0.88, ... },
  ]}
/>

// Citation Badge - Clickable link to graph
<CitationBadge
  citation={{ citation: "42 U.S.C. § 3604", jurisdiction: "Federal" }}
  onViewInGraph={() => router.push('/graph?highlight=...')}
/>
```

---

## 6. API Endpoints

### `POST /api/analyze`
Main analysis endpoint that implements the RAG pipeline.

**Request:**
```json
{
  "query": "Can Austin require short-term rental hosts to live on-site?"
}
```

**Response:**
```json
{
  "summary": "The Austin ordinance may face preemption challenges...",
  "conflicts": [...],
  "reasoningChain": [...],
  "suggestions": [...],
  "citedProvisions": [...]
}
```

### `GET/POST /api/chat`
Chat history CRUD operations.

- `GET ?action=sessions` - List all sessions
- `GET ?action=messages&sessionId=...` - Get messages for a session
- `POST { action: 'createSession' }` - Create new session
- `POST { action: 'addMessage', ... }` - Add message to session
- `DELETE ?sessionId=...` - Delete a session

### `POST /api/ingest-demo`
Bulk ingest demo legal documents for testing.

### `POST /api/clear-data`
Reset all ingested data (for demo purposes).

---

## 7. Key Design Decisions

### Why PostgreSQL (Supabase) over a dedicated vector DB?

1. **Simplicity** - One database for everything (documents, graph, chat history)
2. **Supabase's pgvector** - Supports vector embeddings when needed
3. **Full-text search** - PostgreSQL's `ilike` is sufficient for keyword matching
4. **Real-time** - Supabase provides real-time subscriptions if needed later

### Why GPT-4o over other models?

1. **Reasoning capability** - Legal analysis requires complex multi-step reasoning
2. **Structured output** - Reliable JSON mode for consistent responses
3. **Context window** - 128K tokens handles multiple legal documents
4. **Accuracy** - Lower hallucination rate for factual content

### Why Knowledge Graph?

1. **Relationship visualization** - Shows how laws relate to each other
2. **Conflict detection** - Graph edges explicitly model conflicts
3. **Hierarchy representation** - Federal → State → Municipal is naturally a graph
4. **User exploration** - Interactive way to understand legal landscape

---

## 8. Future Enhancements

If I were to continue developing this project:

1. **Vector Search** - Add semantic search using embeddings for better retrieval
2. **Multi-turn Reasoning** - Let the agent ask clarifying questions
3. **Document Upload** - Allow users to upload their own ordinances
4. **Confidence Calibration** - Fine-tune confidence scores based on user feedback
5. **Real-time Updates** - Subscribe to legal database updates
6. **Export Reports** - Generate PDF reports for legal teams

---

## Summary

Vulcan demonstrates:

1. **RAG Architecture** - Retrieval-augmented generation for grounded legal analysis
2. **AI Agent Design** - Perceive → Reason → Act loop with tool calling
3. **Knowledge Graph** - Graph-based representation of legal relationships
4. **Full-Stack Implementation** - Next.js, Supabase, OpenAI integration
5. **Production Patterns** - Chat persistence, error handling, structured outputs

The key insight is that legal analysis is a perfect use case for RAG because:
- Laws are structured documents with citations
- Accuracy is critical (no hallucinations allowed)
- The hierarchy (Federal > State > Local) maps naturally to a graph
- Users need to trace reasoning back to source documents

This project showcases how to combine modern AI capabilities (LLMs, RAG) with traditional software engineering (databases, APIs, UI) to solve a real-world problem.
