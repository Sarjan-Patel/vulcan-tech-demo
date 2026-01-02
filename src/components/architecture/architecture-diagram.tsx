'use client';

import { useState } from 'react';
import {
  MessageSquare,
  Search,
  Database,
  Brain,
  GitBranch,
  FileText,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  ArrowDown,
  Sparkles,
  Network,
  Layers,
  Zap,
  Bot,
  Wrench,
  Code,
  Eye,
  PenTool,
  Upload,
  HardDrive,
  Boxes,
  Binary,
  Split,
  Link2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FlowNodeProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  isActive?: boolean;
  onClick?: () => void;
  id?: string;
  details?: string[];
  compact?: boolean;
}

function FlowNode({ icon, title, description, isActive, onClick, compact }: FlowNodeProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'relative rounded-xl border-2 transition-all duration-300 cursor-pointer flex-shrink-0',
        'hover:scale-[1.02] hover:shadow-lg',
        compact ? 'p-3 min-w-[200px]' : 'p-4 min-w-[220px]',
        isActive
          ? 'border-brand bg-brand/10 shadow-lg shadow-brand/20'
          : 'border-border-default bg-bg-card hover:border-brand/50'
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'rounded-lg flex-shrink-0',
            compact ? 'p-1.5' : 'p-2',
            isActive ? 'bg-brand/20' : 'bg-bg-elevated'
          )}
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className={cn('font-semibold text-text-primary', compact ? 'text-xs' : 'text-sm')}>{title}</h4>
          <p className={cn('text-text-secondary mt-0.5', compact ? 'text-[10px]' : 'text-xs')}>{description}</p>
        </div>
      </div>
    </div>
  );
}

function AnimatedArrow({ direction = 'right' }: { direction?: 'right' | 'down' }) {
  const Arrow = direction === 'right' ? ArrowRight : ArrowDown;
  return (
    <div className={cn('flex items-center justify-center flex-shrink-0', direction === 'down' ? 'py-1' : 'px-1')}>
      <Arrow className="w-4 h-4 text-brand animate-pulse" />
    </div>
  );
}

const architectureSteps = [
  {
    id: 'input',
    icon: <MessageSquare className="w-4 h-4 text-brand" />,
    title: '1. User Query',
    description: 'Legal question or ordinance text',
    details: [
      'Natural language question input',
      'Support for pasting full ordinance text',
      'Example queries for quick start',
    ],
  },
  {
    id: 'keywords',
    icon: <Search className="w-4 h-4 text-federal" />,
    title: '2. Keyword Extraction',
    description: 'Extract legal topics & terms',
    details: [
      'Topic classification (rental, zoning, fair housing)',
      'Keyword matching against topic dictionaries',
      'Query term normalization',
    ],
  },
  {
    id: 'retrieval',
    icon: <Database className="w-4 h-4 text-state" />,
    title: '3. Document Retrieval',
    description: 'Search Supabase for documents',
    details: [
      'Full-text search across section_versions',
      'Join with documents, sections metadata',
      'Filter by jurisdiction and authority level',
      'Return document text with citations',
    ],
  },
  {
    id: 'context',
    icon: <Layers className="w-4 h-4 text-municipal" />,
    title: '4. Context Assembly',
    description: 'Build prompt with documents',
    details: [
      'Format documents with metadata',
      'Include jurisdiction hierarchy context',
      'Add conflict detection instructions',
      'Structure for JSON response format',
    ],
  },
  {
    id: 'llm',
    icon: <Brain className="w-4 h-4 text-accent-purple" />,
    title: '5. LLM Analysis',
    description: 'GPT-4o conflict analysis',
    details: [
      'System prompt: Legal analyst persona',
      'Preemption doctrine knowledge',
      'Structured JSON output format',
      'Temperature 0.3 for consistency',
    ],
  },
  {
    id: 'conflicts',
    icon: <AlertTriangle className="w-4 h-4 text-status-error" />,
    title: '6. Conflict Detection',
    description: 'Identify legal conflicts',
    details: [
      'Express preemption detection',
      'Implied preemption analysis',
      'Severity classification (high/medium/low)',
      'Citation extraction',
    ],
  },
  {
    id: 'reasoning',
    icon: <GitBranch className="w-4 h-4 text-status-warning" />,
    title: '7. Reasoning Chain',
    description: 'Step-by-step legal reasoning',
    details: [
      'Multi-step analysis breakdown',
      'Confidence scoring per step',
      'Citation linking',
      'Authority chain tracing',
    ],
  },
  {
    id: 'response',
    icon: <CheckCircle className="w-4 h-4 text-status-success" />,
    title: '8. Response',
    description: 'Summary, conflicts, suggestions',
    details: [
      'Executive summary',
      'Conflict cards with severity',
      'Compliance suggestions',
      'Cited legal provisions',
    ],
  },
];

const agentTools = [
  {
    name: 'search_documents',
    description: 'Full-text search across legal documents',
    icon: <Search className="w-4 h-4" />,
    color: 'text-federal',
  },
  {
    name: 'query_graph',
    description: 'Traverse knowledge graph relationships',
    icon: <Network className="w-4 h-4" />,
    color: 'text-state',
  },
  {
    name: 'analyze_conflict',
    description: 'Detect preemption & legal conflicts',
    icon: <AlertTriangle className="w-4 h-4" />,
    color: 'text-status-error',
  },
  {
    name: 'generate_reasoning',
    description: 'Build step-by-step reasoning chain',
    icon: <GitBranch className="w-4 h-4" />,
    color: 'text-status-warning',
  },
];

const techStack = [
  { name: 'Next.js 14', description: 'React framework with App Router', color: 'text-text-primary' },
  { name: 'Supabase', description: 'PostgreSQL + vector storage', color: 'text-state' },
  { name: 'OpenAI GPT-4o', description: 'LLM for analysis', color: 'text-accent-purple' },
  { name: 'React Flow', description: 'Graph visualization', color: 'text-federal' },
  { name: 'Tailwind CSS', description: 'Utility-first styling', color: 'text-brand' },
];

const ingestionStages = [
  {
    id: 'stage-a',
    stage: 'A',
    title: 'Raw Capture',
    target: 'S3',
    icon: <HardDrive className="w-4 h-4 text-federal" />,
    color: 'federal',
    description: 'Fetch documents from corpus sources',
    details: [
      'Load from US Code, eCFR, Texas Statutes, Austin Ordinances',
      'Generate SHA-256 checksum for deduplication',
      'Store raw text with metadata (source, timestamp)',
      'S3-style paths: corpus/doc-id/release_timestamp.json',
    ],
    output: 'S3Object[]',
  },
  {
    id: 'stage-b',
    stage: 'B',
    title: 'Parse & Metadata',
    target: 'PostgreSQL',
    icon: <Database className="w-4 h-4 text-state" />,
    color: 'state',
    description: 'Extract structure and create versions',
    details: [
      'Create Document with jurisdiction, authorityLevel',
      'Create DocumentVersion linked to S3 object',
      'Extract Section[] from document structure',
      'Create SectionVersion with token counts',
    ],
    output: 'Document[], Section[], SectionVersion[]',
  },
  {
    id: 'stage-c',
    stage: 'C',
    title: 'Chunk & Embed',
    target: 'Vector DB',
    icon: <Binary className="w-4 h-4 text-accent-purple" />,
    color: 'accent-purple',
    description: 'Split text and generate embeddings',
    details: [
      'Split by sentences: /(?<=[.!?])\\s+/',
      'Target: 200-300 tokens per chunk',
      'Overlap: 30-50 tokens for context',
      'Generate 384-dim embeddings per chunk',
    ],
    output: 'VectorChunk[]',
  },
  {
    id: 'stage-d',
    stage: 'D',
    title: 'Build Graph',
    target: 'Knowledge Graph',
    icon: <Network className="w-4 h-4 text-brand" />,
    color: 'brand',
    description: 'Create nodes, edges, detect conflicts',
    details: [
      'Document nodes + Section nodes',
      'AUTHORIZES edges (doc → section)',
      'DERIVES_AUTHORITY_FROM edges (hierarchy)',
      'CONFLICTS_WITH edges (rule-based detection)',
    ],
    output: 'GraphNode[], GraphEdge[]',
  },
];

const graphEdgeTypes = [
  {
    type: 'AUTHORIZES',
    description: 'Document authorizes its sections; statute authorizes regulations',
    example: 'Fair Housing Act → 42 U.S.C. § 3604(a)',
    color: 'text-text-muted',
  },
  {
    type: 'DERIVES_AUTHORITY_FROM',
    description: 'Lower jurisdiction derives from higher; state from federal',
    example: 'Texas Property Code → U.S. Constitution',
    color: 'text-brand',
  },
  {
    type: 'CONFLICTS_WITH',
    description: 'Cross-jurisdictional conflict with severity rating',
    example: 'Austin STR Ordinance ↔ Texas Property Code § 5.003',
    color: 'text-status-error',
  },
  {
    type: 'AMENDS',
    description: 'Temporal relationship tracking document amendments',
    example: 'Version 2 amends Version 1',
    color: 'text-municipal',
  },
];

export function ArchitectureDiagram() {
  const [activeStep, setActiveStep] = useState<string | null>(null);
  const activeStepData = architectureSteps.find((s) => s.id === activeStep);

  return (
    <div className="min-h-screen bg-bg-primary pt-20 pb-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand/10 text-brand text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            AI Agent Orchestration
          </div>
          <h1 className="text-4xl font-bold text-text-primary mb-4">
            How Vulcan Analyzes Legal Conflicts
          </h1>
          <p className="text-text-secondary max-w-2xl mx-auto">
            An end-to-end view of the AI-powered legal analysis pipeline, from user query
            to conflict detection and compliance recommendations.
          </p>
        </div>

        {/* Main Architecture Flow */}
        <div className="mb-10">
          <h2 className="text-xl font-semibold text-text-primary mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-brand" />
            Analysis Pipeline
          </h2>

          <div className="bg-bg-card rounded-2xl border border-border-default p-5 overflow-x-auto">
            {/* Row 1: Steps 1-4 */}
            <div className="flex items-center gap-1 mb-3 min-w-max">
              {architectureSteps.slice(0, 4).map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <FlowNode
                    {...step}
                    compact
                    isActive={activeStep === step.id}
                    onClick={() => setActiveStep(activeStep === step.id ? null : step.id)}
                  />
                  {index < 3 && <AnimatedArrow />}
                </div>
              ))}
            </div>

            {/* Arrow down */}
            <div className="flex justify-end pr-8 mb-3">
              <AnimatedArrow direction="down" />
            </div>

            {/* Row 2: Steps 8-5 (reversed) */}
            <div className="flex items-center gap-1 min-w-max">
              {[...architectureSteps.slice(4, 8)].reverse().map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <FlowNode
                    {...step}
                    compact
                    isActive={activeStep === step.id}
                    onClick={() => setActiveStep(activeStep === step.id ? null : step.id)}
                  />
                  {index < 3 && <AnimatedArrow />}
                </div>
              ))}
            </div>
          </div>

          {/* Step Details Panel */}
          {activeStepData && (
            <div className="mt-4 p-5 rounded-xl bg-bg-elevated border border-brand/30 animate-in slide-in-from-top-2">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-brand/10">
                  {activeStepData.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-text-primary mb-2">
                    {activeStepData.title}
                  </h3>
                  <p className="text-text-secondary mb-3">{activeStepData.description}</p>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {activeStepData.details.map((detail, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-text-secondary">
                        <div className="w-1.5 h-1.5 rounded-full bg-brand flex-shrink-0" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* AI Agent Internal Architecture */}
        <div className="mb-10">
          <h2 className="text-xl font-semibold text-text-primary mb-4 flex items-center gap-2">
            <Bot className="w-5 h-5 text-accent-purple" />
            AI Agent Internal Architecture
          </h2>

          <div className="bg-bg-card rounded-2xl border border-border-default p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Agent Core */}
              <div className="lg:col-span-1">
                <div className="bg-accent-purple/10 border-2 border-accent-purple/30 rounded-xl p-5 h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 rounded-lg bg-accent-purple/20">
                      <Brain className="w-6 h-6 text-accent-purple" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-text-primary">Legal Analysis Agent</h3>
                      <p className="text-xs text-text-muted">GPT-4o Orchestrator</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="p-3 rounded-lg bg-bg-elevated">
                      <div className="flex items-center gap-2 mb-1">
                        <Eye className="w-3.5 h-3.5 text-brand" />
                        <span className="text-xs font-medium text-text-primary">Perceive</span>
                      </div>
                      <p className="text-[10px] text-text-muted">Parse user query, identify legal topics</p>
                    </div>
                    <div className="p-3 rounded-lg bg-bg-elevated">
                      <div className="flex items-center gap-2 mb-1">
                        <Brain className="w-3.5 h-3.5 text-accent-purple" />
                        <span className="text-xs font-medium text-text-primary">Reason</span>
                      </div>
                      <p className="text-[10px] text-text-muted">Apply legal doctrine, detect conflicts</p>
                    </div>
                    <div className="p-3 rounded-lg bg-bg-elevated">
                      <div className="flex items-center gap-2 mb-1">
                        <PenTool className="w-3.5 h-3.5 text-state" />
                        <span className="text-xs font-medium text-text-primary">Act</span>
                      </div>
                      <p className="text-[10px] text-text-muted">Call tools, generate response</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tool Calls */}
              <div className="lg:col-span-2">
                <h4 className="text-sm font-medium text-text-primary mb-3 flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-text-muted" />
                  Available Tools
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {agentTools.map((tool) => (
                    <div key={tool.name} className="p-4 rounded-lg bg-bg-elevated border border-border-default">
                      <div className="flex items-start gap-3">
                        <div className={cn('p-2 rounded-lg bg-bg-card', tool.color)}>
                          {tool.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <code className="text-xs font-mono text-brand">{tool.name}()</code>
                          <p className="text-xs text-text-muted mt-1">{tool.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Agent Execution Flow */}
                <div className="mt-4 p-4 rounded-lg bg-bg-elevated border border-border-default">
                  <h4 className="text-sm font-medium text-text-primary mb-3 flex items-center gap-2">
                    <Code className="w-4 h-4 text-text-muted" />
                    Execution Flow
                  </h4>
                  <div className="font-mono text-xs space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-text-muted">1.</span>
                      <span className="text-accent-purple">agent</span>
                      <span className="text-text-muted">receives</span>
                      <span className="text-brand">user_query</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-text-muted">2.</span>
                      <span className="text-accent-purple">agent</span>
                      <span className="text-text-muted">→</span>
                      <span className="text-federal">search_documents</span>
                      <span className="text-text-muted">(keywords)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-text-muted">3.</span>
                      <span className="text-accent-purple">agent</span>
                      <span className="text-text-muted">→</span>
                      <span className="text-state">query_graph</span>
                      <span className="text-text-muted">(doc_ids)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-text-muted">4.</span>
                      <span className="text-accent-purple">agent</span>
                      <span className="text-text-muted">→</span>
                      <span className="text-status-error">analyze_conflict</span>
                      <span className="text-text-muted">(context)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-text-muted">5.</span>
                      <span className="text-accent-purple">agent</span>
                      <span className="text-text-muted">→</span>
                      <span className="text-status-warning">generate_reasoning</span>
                      <span className="text-text-muted">(conflicts)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-text-muted">6.</span>
                      <span className="text-accent-purple">agent</span>
                      <span className="text-text-muted">returns</span>
                      <span className="text-status-success">structured_response</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Document Ingestion Pipeline */}
        <div className="mb-10">
          <h2 className="text-xl font-semibold text-text-primary mb-4 flex items-center gap-2">
            <Upload className="w-5 h-5 text-brand" />
            Document Ingestion Pipeline
          </h2>

          <div className="bg-bg-card rounded-2xl border border-border-default p-6">
            <p className="text-sm text-text-secondary mb-6">
              A 4-stage ETL pipeline transforms raw legal documents into a queryable knowledge graph.
              Each stage outputs data that feeds into the next.
            </p>

            {/* Pipeline Stages */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {ingestionStages.map((stage, index) => (
                <div key={stage.id} className="relative">
                  <div className={cn(
                    'p-4 rounded-xl border-2 h-full',
                    `border-${stage.color}/30 bg-${stage.color}/5`
                  )} style={{
                    borderColor: stage.color === 'federal' ? 'rgba(59, 130, 246, 0.3)' :
                                 stage.color === 'state' ? 'rgba(16, 185, 129, 0.3)' :
                                 stage.color === 'accent-purple' ? 'rgba(168, 85, 247, 0.3)' :
                                 'rgba(56, 189, 248, 0.3)',
                    backgroundColor: stage.color === 'federal' ? 'rgba(59, 130, 246, 0.05)' :
                                     stage.color === 'state' ? 'rgba(16, 185, 129, 0.05)' :
                                     stage.color === 'accent-purple' ? 'rgba(168, 85, 247, 0.05)' :
                                     'rgba(56, 189, 248, 0.05)',
                  }}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-bg-elevated flex items-center justify-center font-bold text-sm text-brand">
                        {stage.stage}
                      </div>
                      <div>
                        <h4 className="font-semibold text-text-primary text-sm">{stage.title}</h4>
                        <p className="text-[10px] text-text-muted">→ {stage.target}</p>
                      </div>
                    </div>
                    <p className="text-xs text-text-secondary mb-3">{stage.description}</p>
                    <ul className="space-y-1">
                      {stage.details.map((detail, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-[10px] text-text-muted">
                          <div className="w-1 h-1 rounded-full bg-text-muted mt-1.5 flex-shrink-0" />
                          {detail}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-3 pt-2 border-t border-border-default">
                      <code className="text-[10px] text-brand">{stage.output}</code>
                    </div>
                  </div>
                  {index < ingestionStages.length - 1 && (
                    <div className="hidden lg:flex absolute top-1/2 -right-2 transform -translate-y-1/2 z-10">
                      <ArrowRight className="w-4 h-4 text-brand" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Data Flow Diagram */}
            <div className="p-4 rounded-lg bg-bg-elevated border border-border-default">
              <h4 className="text-sm font-medium text-text-primary mb-3 flex items-center gap-2">
                <Boxes className="w-4 h-4 text-text-muted" />
                Data Flow Architecture
              </h4>
              <div className="font-mono text-xs space-y-2 overflow-x-auto">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-1 rounded bg-federal/10 text-federal">RawDocument</span>
                  <span className="text-text-muted">→</span>
                  <span className="px-2 py-1 rounded bg-federal/10 text-federal">S3Object</span>
                  <span className="text-text-muted">→</span>
                  <span className="px-2 py-1 rounded bg-state/10 text-state">Document</span>
                  <span className="text-text-muted">+</span>
                  <span className="px-2 py-1 rounded bg-state/10 text-state">Section</span>
                  <span className="text-text-muted">→</span>
                  <span className="px-2 py-1 rounded bg-accent-purple/10 text-accent-purple">VectorChunk</span>
                  <span className="text-text-muted">→</span>
                  <span className="px-2 py-1 rounded bg-brand/10 text-brand">GraphNode</span>
                  <span className="text-text-muted">+</span>
                  <span className="px-2 py-1 rounded bg-brand/10 text-brand">GraphEdge</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Parsing & Extraction */}
        <div className="mb-10">
          <h2 className="text-xl font-semibold text-text-primary mb-4 flex items-center gap-2">
            <Split className="w-5 h-5 text-state" />
            Parsing & Extraction Process
          </h2>

          <div className="bg-bg-card rounded-2xl border border-border-default p-6 space-y-6">
            {/* Source Data Structure */}
            <div>
              <h3 className="text-base font-semibold text-text-primary mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-federal" />
                Source Data Structure
              </h3>
              <p className="text-sm text-text-secondary mb-4">
                Documents are defined with metadata and pre-structured sections in the mock dataset.
              </p>
              <div className="bg-bg-elevated rounded-lg p-4 font-mono text-xs overflow-x-auto">
                <div className="text-text-muted">{'{'}</div>
                <div className="ml-4">
                  <span className="text-federal">&quot;id&quot;</span>: <span className="text-state">&quot;austin-25-2-788&quot;</span>,
                </div>
                <div className="ml-4">
                  <span className="text-federal">&quot;title&quot;</span>: <span className="text-state">&quot;Austin Short-Term Rental Ordinance&quot;</span>,
                </div>
                <div className="ml-4">
                  <span className="text-federal">&quot;citation&quot;</span>: <span className="text-state">&quot;Austin Code § 25-2-788&quot;</span>,
                </div>
                <div className="ml-4">
                  <span className="text-federal">&quot;jurisdiction&quot;</span>: <span className="text-municipal">&quot;municipal&quot;</span>,
                  <span className="text-text-muted ml-4">// federal | state | municipal</span>
                </div>
                <div className="ml-4">
                  <span className="text-federal">&quot;authorityLevel&quot;</span>: <span className="text-municipal">&quot;ordinance&quot;</span>,
                  <span className="text-text-muted ml-4">// constitution | statute | regulation | ordinance</span>
                </div>
                <div className="ml-4">
                  <span className="text-federal">&quot;effectiveFrom&quot;</span>: <span className="text-state">&quot;2022-01-01&quot;</span>,
                </div>
                <div className="ml-4">
                  <span className="text-federal">&quot;rawText&quot;</span>: <span className="text-state">&quot;AUSTIN CITY CODE...&quot;</span>,
                </div>
                <div className="ml-4">
                  <span className="text-federal">&quot;sections&quot;</span>: <span className="text-text-muted">[</span>
                </div>
                <div className="ml-8 text-text-muted">{'{'} id, heading, citation, text {'}'}</div>
                <div className="ml-4 text-text-muted">]</div>
                <div className="text-text-muted">{'}'}</div>
              </div>
            </div>

            {/* Parsing Steps */}
            <div>
              <h3 className="text-base font-semibold text-text-primary mb-3 flex items-center gap-2">
                <Database className="w-4 h-4 text-state" />
                Stage B: Parsing Steps
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    step: 1,
                    title: 'Create Document',
                    desc: 'Extract metadata: title, jurisdiction, authorityLevel, effectiveFrom',
                    code: 'documents.push({ id, title, jurisdiction, authorityLevel, source, effectiveFrom })',
                  },
                  {
                    step: 2,
                    title: 'Create DocumentVersion',
                    desc: 'Link document to S3 source for audit trail',
                    code: 'documentVersions.push({ documentId, versionNumber: 1, s3ObjectId })',
                  },
                  {
                    step: 3,
                    title: 'Extract Sections',
                    desc: 'Loop through sections[] or create single section from rawText',
                    code: 'sections.push({ documentId, citation, heading })',
                  },
                  {
                    step: 4,
                    title: 'Create SectionVersion',
                    desc: 'Store text with estimated token count',
                    code: 'sectionVersions.push({ sectionId, text, tokenCount })',
                  },
                ].map((item) => (
                  <div key={item.step} className="p-4 rounded-lg bg-bg-elevated border border-border-default">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-state/20 flex items-center justify-center">
                        <span className="text-xs font-bold text-state">{item.step}</span>
                      </div>
                      <span className="text-sm font-medium text-text-primary">{item.title}</span>
                    </div>
                    <p className="text-xs text-text-secondary mb-2">{item.desc}</p>
                    <code className="text-[10px] text-state block bg-bg-card p-2 rounded overflow-x-auto">
                      {item.code}
                    </code>
                  </div>
                ))}
              </div>
            </div>

            {/* Chunking Algorithm */}
            <div>
              <h3 className="text-base font-semibold text-text-primary mb-3 flex items-center gap-2">
                <Split className="w-4 h-4 text-accent-purple" />
                Stage C: Chunking Algorithm
              </h3>
              <p className="text-sm text-text-secondary mb-4">
                Text is split into overlapping chunks for optimal retrieval. Token estimation uses ~1.3 tokens per word.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                {[
                  { label: 'Target', value: '200-300', unit: 'tokens' },
                  { label: 'Minimum', value: '80-100', unit: 'tokens' },
                  { label: 'Maximum', value: '400-600', unit: 'tokens' },
                  { label: 'Overlap', value: '30-50', unit: 'tokens' },
                ].map((config) => (
                  <div key={config.label} className="p-3 rounded-lg bg-accent-purple/5 border border-accent-purple/20 text-center">
                    <div className="text-lg font-bold text-accent-purple">{config.value}</div>
                    <div className="text-[10px] text-text-muted">{config.label} {config.unit}</div>
                  </div>
                ))}
              </div>
              <div className="p-4 rounded-lg bg-bg-elevated border border-border-default">
                <h4 className="text-xs font-medium text-text-primary mb-2">Algorithm Steps:</h4>
                <ol className="space-y-1.5 text-xs text-text-secondary">
                  <li className="flex items-start gap-2">
                    <span className="text-accent-purple font-bold">1.</span>
                    Split text into sentences: <code className="text-accent-purple">/(?{'<'}=[.!?])\s+/</code>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent-purple font-bold">2.</span>
                    Accumulate sentences until approaching maxTokens
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent-purple font-bold">3.</span>
                    Save chunk and create overlap from last N tokens
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent-purple font-bold">4.</span>
                    Force-split at word boundaries if single sentence exceeds max
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent-purple font-bold">5.</span>
                    Merge undersized final chunks with previous
                  </li>
                </ol>
              </div>
            </div>

            {/* Token Estimation */}
            <div className="p-4 rounded-lg bg-brand/5 border border-brand/20">
              <h4 className="text-xs font-semibold text-brand mb-2">Token Estimation Formula</h4>
              <code className="text-xs text-text-secondary">
                tokens = ceil(words × 1.3 + punctuation × 0.3)
              </code>
              <p className="text-[10px] text-text-muted mt-2">
                English text averages ~1.3 tokens per word. Punctuation adds ~0.3 tokens each.
              </p>
            </div>
          </div>
        </div>

        {/* Knowledge Graph Construction */}
        <div className="mb-10">
          <h2 className="text-xl font-semibold text-text-primary mb-4 flex items-center gap-2">
            <Network className="w-5 h-5 text-brand" />
            Knowledge Graph Construction
          </h2>

          <div className="bg-bg-card rounded-2xl border border-border-default p-6 space-y-6">
            {/* Node Types */}
            <div>
              <h3 className="text-base font-semibold text-text-primary mb-3 flex items-center gap-2">
                <Boxes className="w-4 h-4 text-federal" />
                Node Types
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-federal/5 border border-federal/20">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-federal" />
                    <h4 className="text-sm font-semibold text-federal">Document Nodes</h4>
                  </div>
                  <p className="text-xs text-text-secondary mb-2">
                    Complete legal documents with jurisdiction hierarchy
                  </p>
                  <code className="text-[10px] text-text-muted block">
                    {'{'}id, label, nodeType: &quot;document&quot;, jurisdiction, authorityLevel{'}'}
                  </code>
                </div>
                <div className="p-4 rounded-lg bg-state/5 border border-state/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Split className="w-4 h-4 text-state" />
                    <h4 className="text-sm font-semibold text-state">Section Nodes</h4>
                  </div>
                  <p className="text-xs text-text-secondary mb-2">
                    Individual provisions with legal citations
                  </p>
                  <code className="text-[10px] text-text-muted block">
                    {'{'}id, label, nodeType: &quot;section&quot;, citation, documentId{'}'}
                  </code>
                </div>
              </div>
            </div>

            {/* Edge Types */}
            <div>
              <h3 className="text-base font-semibold text-text-primary mb-3 flex items-center gap-2">
                <Link2 className="w-4 h-4 text-brand" />
                Edge Types
              </h3>
              <div className="space-y-3">
                {graphEdgeTypes.map((edge) => (
                  <div key={edge.type} className="p-3 rounded-lg bg-bg-elevated border border-border-default">
                    <div className="flex items-start gap-3">
                      <div className={cn('w-16 h-1 mt-2 rounded',
                        edge.color === 'text-status-error' ? 'bg-status-error' :
                        edge.color === 'text-brand' ? 'bg-brand' :
                        edge.color === 'text-municipal' ? 'bg-municipal' :
                        'bg-text-muted'
                      )} style={edge.type === 'CONFLICTS_WITH' ? { backgroundImage: 'repeating-linear-gradient(90deg, currentColor, currentColor 4px, transparent 4px, transparent 8px)' } : {}} />
                      <div className="flex-1">
                        <code className={cn('text-xs font-mono font-bold', edge.color)}>{edge.type}</code>
                        <p className="text-xs text-text-secondary mt-1">{edge.description}</p>
                        <p className="text-[10px] text-text-muted mt-1">
                          <span className="text-brand">Example:</span> {edge.example}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Authority Hierarchy */}
            <div>
              <h3 className="text-base font-semibold text-text-primary mb-3 flex items-center gap-2">
                <Layers className="w-4 h-4 text-accent-purple" />
                Authority Hierarchy (for edge creation)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-bg-elevated">
                  <h4 className="text-xs font-medium text-text-primary mb-3">Jurisdiction Weight</h4>
                  <div className="space-y-2">
                    {[
                      { level: 'Federal', weight: 3, color: 'federal' },
                      { level: 'State', weight: 2, color: 'state' },
                      { level: 'Municipal', weight: 1, color: 'municipal' },
                    ].map((j) => (
                      <div key={j.level} className="flex items-center gap-3">
                        <span className={cn('px-2 py-1 rounded text-xs font-medium', `bg-${j.color}/10 text-${j.color}`)}
                          style={{
                            backgroundColor: j.color === 'federal' ? 'rgba(59, 130, 246, 0.1)' :
                                            j.color === 'state' ? 'rgba(16, 185, 129, 0.1)' :
                                            'rgba(245, 158, 11, 0.1)',
                            color: j.color === 'federal' ? '#3B82F6' :
                                   j.color === 'state' ? '#10B981' :
                                   '#F59E0B',
                          }}>
                          {j.level}
                        </span>
                        <span className="text-xs text-text-muted">weight: {j.weight}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-bg-elevated">
                  <h4 className="text-xs font-medium text-text-primary mb-3">Authority Level Weight</h4>
                  <div className="space-y-2">
                    {[
                      { level: 'Constitution', weight: 4 },
                      { level: 'Statute', weight: 3 },
                      { level: 'Regulation', weight: 2 },
                      { level: 'Ordinance', weight: 1 },
                    ].map((a) => (
                      <div key={a.level} className="flex items-center gap-3">
                        <span className="px-2 py-1 rounded text-xs font-medium bg-brand/10 text-brand">
                          {a.level}
                        </span>
                        <span className="text-xs text-text-muted">weight: {a.weight}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Conflict Detection */}
            <div>
              <h3 className="text-base font-semibold text-text-primary mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-status-error" />
                Conflict Detection Rules
              </h3>
              <p className="text-sm text-text-secondary mb-4">
                Municipal documents are checked against state/federal law using keyword-based pattern matching.
              </p>
              <div className="space-y-3">
                {[
                  {
                    pattern: 'STR / Rental',
                    condition: 'title contains "rental" OR "str" OR "short-term"',
                    match: 'State doc contains "property" OR "landlord"',
                    severity: 'HIGH',
                  },
                  {
                    pattern: 'Zoning',
                    condition: 'doc contains "zoning" OR "land use"',
                    match: 'State contains "local government" OR "municipal"',
                    severity: 'HIGH',
                  },
                  {
                    pattern: 'Environmental',
                    condition: 'doc contains "environmental" OR "water quality"',
                    match: 'Federal regulation exists',
                    severity: 'MEDIUM',
                  },
                ].map((rule) => (
                  <div key={rule.pattern} className="p-3 rounded-lg bg-status-error/5 border border-status-error/20">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-semibold text-status-error">{rule.pattern} Conflicts</span>
                      <span className={cn(
                        'text-[10px] px-1.5 py-0.5 rounded font-medium',
                        rule.severity === 'HIGH' ? 'bg-status-error/20 text-status-error' : 'bg-status-warning/20 text-status-warning'
                      )}>
                        {rule.severity}
                      </span>
                    </div>
                    <div className="text-[10px] text-text-muted space-y-1">
                      <div><span className="text-municipal font-medium">IF:</span> {rule.condition}</div>
                      <div><span className="text-state font-medium">AND:</span> {rule.match}</div>
                      <div><span className="text-status-error font-medium">THEN:</span> Create CONFLICTS_WITH edge</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Example Conflict */}
            <div className="p-4 rounded-lg bg-status-error/5 border border-status-error/20">
              <h4 className="text-xs font-semibold text-status-error mb-3">Real Conflict Example</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 rounded bg-municipal/5 border border-municipal/20">
                  <div className="text-xs font-medium text-municipal mb-1">Austin Code § 25-2-788(B)</div>
                  <p className="text-[10px] text-text-muted italic">
                    &quot;The owner or a designated operator resides on the property&quot;
                  </p>
                </div>
                <div className="p-3 rounded bg-state/5 border border-state/20">
                  <div className="text-xs font-medium text-state mb-1">Texas Prop. Code § 5.003</div>
                  <p className="text-[10px] text-text-muted italic">
                    &quot;A municipality may not...require a property owner to occupy the owner&apos;s property as a condition of renting&quot;
                  </p>
                </div>
              </div>
              <div className="mt-3 p-2 rounded bg-bg-elevated">
                <span className="text-[10px] font-medium text-status-error">CONFLICT: </span>
                <span className="text-[10px] text-text-muted">
                  Direct prohibition - Texas law explicitly forbids what Austin ordinance requires (Severity: HIGH)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Deep Dive: analyze_conflict() Tool */}
        <div className="mb-10">
          <h2 className="text-xl font-semibold text-text-primary mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-status-error" />
            Deep Dive: Conflict Analysis Engine
          </h2>

          <div className="bg-bg-card rounded-2xl border border-border-default p-6 space-y-6">
            {/* Preemption Doctrine */}
            <div>
              <h3 className="text-base font-semibold text-text-primary mb-3 flex items-center gap-2">
                <Layers className="w-4 h-4 text-federal" />
                Preemption Doctrine
              </h3>
              <p className="text-sm text-text-secondary mb-4">
                The LLM applies constitutional preemption doctrine: higher-level laws supersede lower-level laws when they conflict.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-4 rounded-lg bg-status-error/5 border border-status-error/20">
                  <h4 className="text-sm font-semibold text-status-error mb-2">Express Preemption</h4>
                  <p className="text-xs text-text-muted">Higher law explicitly prohibits local regulation in this area</p>
                  <div className="mt-2 p-2 rounded bg-bg-elevated">
                    <code className="text-[10px] text-text-secondary">&quot;No local government may regulate...&quot;</code>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-status-warning/5 border border-status-warning/20">
                  <h4 className="text-sm font-semibold text-status-warning mb-2">Implied Preemption</h4>
                  <p className="text-xs text-text-muted">Local law conflicts with the purpose or intent of higher law</p>
                  <div className="mt-2 p-2 rounded bg-bg-elevated">
                    <code className="text-[10px] text-text-secondary">State promotes X, local restricts X</code>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-municipal/5 border border-municipal/20">
                  <h4 className="text-sm font-semibold text-municipal mb-2">Field Preemption</h4>
                  <p className="text-xs text-text-muted">Higher law occupies the entire regulatory field</p>
                  <div className="mt-2 p-2 rounded bg-bg-elevated">
                    <code className="text-[10px] text-text-secondary">Federal immigration law = no state laws</code>
                  </div>
                </div>
              </div>
            </div>

            {/* Conflict Output Structure */}
            <div>
              <h3 className="text-base font-semibold text-text-primary mb-3 flex items-center gap-2">
                <Code className="w-4 h-4 text-brand" />
                Conflict Output Structure
              </h3>
              <div className="bg-bg-elevated rounded-lg p-4 font-mono text-xs overflow-x-auto">
                <div className="text-text-muted">{'{'}</div>
                <div className="ml-4">
                  <span className="text-status-error">&quot;severity&quot;</span>: <span className="text-status-warning">&quot;high&quot;</span><span className="text-text-muted">,</span>
                  <span className="text-text-muted ml-4">// high = likely unenforceable</span>
                </div>
                <div className="ml-4">
                  <span className="text-status-error">&quot;description&quot;</span>: <span className="text-state">&quot;Austin owner-occupancy requirement conflicts with Texas Property Code&quot;</span><span className="text-text-muted">,</span>
                </div>
                <div className="ml-4">
                  <span className="text-status-error">&quot;localRule&quot;</span>: <span className="text-state">&quot;Austin Code § 25-2-1(B)(3)&quot;</span><span className="text-text-muted">,</span>
                </div>
                <div className="ml-4">
                  <span className="text-status-error">&quot;higherLaw&quot;</span>: <span className="text-text-muted">{'{'}</span>
                </div>
                <div className="ml-8">
                  <span className="text-federal">&quot;title&quot;</span>: <span className="text-state">&quot;Texas Property Code&quot;</span><span className="text-text-muted">,</span>
                </div>
                <div className="ml-8">
                  <span className="text-federal">&quot;citation&quot;</span>: <span className="text-state">&quot;Tex. Prop. Code § 5.003&quot;</span><span className="text-text-muted">,</span>
                </div>
                <div className="ml-8">
                  <span className="text-federal">&quot;jurisdiction&quot;</span>: <span className="text-state">&quot;state&quot;</span>
                </div>
                <div className="ml-4 text-text-muted">{'},'}</div>
                <div className="ml-4">
                  <span className="text-status-error">&quot;conflictType&quot;</span>: <span className="text-status-warning">&quot;preemption&quot;</span>
                  <span className="text-text-muted ml-4">// preemption | direct | implicit</span>
                </div>
                <div className="text-text-muted">{'}'}</div>
              </div>
            </div>

            {/* Reasoning Chain */}
            <div>
              <h3 className="text-base font-semibold text-text-primary mb-3 flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-status-warning" />
                Reasoning Chain Generation
              </h3>
              <p className="text-sm text-text-secondary mb-4">
                The LLM generates step-by-step legal reasoning, similar to how a lawyer would analyze a case. Each step includes confidence scoring.
              </p>
              <div className="space-y-3">
                {[
                  { step: 1, title: 'Identify Local Provision', desc: 'Austin STR ordinance requires owner-occupancy for Type 2 licenses', confidence: 0.98, color: 'text-municipal' },
                  { step: 2, title: 'Find Relevant State Law', desc: 'Texas Property Code § 5.003 grants property rental rights', confidence: 0.92, color: 'text-state' },
                  { step: 3, title: 'Apply Preemption Analysis', desc: 'State law preempts conflicting local ordinances under supremacy principle', confidence: 0.85, color: 'text-federal' },
                  { step: 4, title: 'Conclusion', desc: 'Owner-occupancy requirement likely faces preemption challenges', confidence: 0.88, color: 'text-status-success' },
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-3 p-3 rounded-lg bg-bg-elevated">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-brand/20 flex items-center justify-center">
                      <span className="text-xs font-bold text-brand">{item.step}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={cn('text-sm font-medium', item.color)}>{item.title}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-bg-card text-text-muted">
                          {Math.round(item.confidence * 100)}% confidence
                        </span>
                      </div>
                      <p className="text-xs text-text-secondary">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 rounded-lg bg-brand/5 border border-brand/20">
                <h4 className="text-xs font-semibold text-brand mb-2">Confidence Score Meaning</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[10px]">
                  <div><span className="text-status-success font-medium">90%+</span> <span className="text-text-muted">Clear statutory language</span></div>
                  <div><span className="text-state font-medium">70-89%</span> <span className="text-text-muted">Strong precedent</span></div>
                  <div><span className="text-status-warning font-medium">50-69%</span> <span className="text-text-muted">Needs interpretation</span></div>
                  <div><span className="text-status-error font-medium">&lt;50%</span> <span className="text-text-muted">Speculative</span></div>
                </div>
              </div>
            </div>

            {/* Suggestions */}
            <div>
              <h3 className="text-base font-semibold text-text-primary mb-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-status-success" />
                Compliance Suggestions
              </h3>
              <p className="text-sm text-text-secondary mb-4">
                For each conflict, the LLM suggests how to make the local provision compliant with higher law.
              </p>
              <div className="p-4 rounded-lg bg-bg-elevated border border-border-default">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-status-error" />
                      <span className="text-xs font-semibold text-status-error">Original (Problematic)</span>
                    </div>
                    <div className="p-3 rounded bg-status-error/5 border border-status-error/20">
                      <p className="text-xs text-text-secondary italic">
                        &quot;The property owner must occupy the short-term rental property as their primary residence.&quot;
                      </p>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-status-success" />
                      <span className="text-xs font-semibold text-status-success">Suggested (Compliant)</span>
                    </div>
                    <div className="p-3 rounded bg-status-success/5 border border-status-success/20">
                      <p className="text-xs text-text-secondary italic">
                        &quot;STR operators must register with the city, maintain liability insurance, and provide a local contact available within 60 minutes.&quot;
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-3 p-2 rounded bg-brand/5 border border-brand/20">
                  <span className="text-[10px] font-medium text-brand">Justification: </span>
                  <span className="text-[10px] text-text-muted">
                    Removes occupancy restriction while achieving accountability through registration and local contact requirements, which courts have upheld as valid local regulations.
                  </span>
                </div>
              </div>
            </div>

            {/* LLM Configuration */}
            <div>
              <h3 className="text-base font-semibold text-text-primary mb-3 flex items-center gap-2">
                <Brain className="w-4 h-4 text-accent-purple" />
                LLM Configuration
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-accent-purple/5 border border-accent-purple/20">
                  <code className="text-xs text-accent-purple">model: &quot;gpt-4o&quot;</code>
                  <p className="text-[10px] text-text-muted mt-1">Best reasoning for legal analysis</p>
                </div>
                <div className="p-3 rounded-lg bg-accent-purple/5 border border-accent-purple/20">
                  <code className="text-xs text-accent-purple">temperature: 0.3</code>
                  <p className="text-[10px] text-text-muted mt-1">Low = consistent, factual responses</p>
                </div>
                <div className="p-3 rounded-lg bg-accent-purple/5 border border-accent-purple/20">
                  <code className="text-xs text-accent-purple">response_format: json</code>
                  <p className="text-[10px] text-text-muted mt-1">Structured output for UI components</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Data Flow Diagram */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          {/* Database Schema */}
          <div className="bg-bg-card rounded-2xl border border-border-default p-5">
            <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
              <Database className="w-5 h-5 text-state" />
              Data Layer (Supabase)
            </h3>
            <div className="space-y-2">
              {[
                { name: 'documents', desc: 'Legal document metadata' },
                { name: 'sections', desc: 'Document sections with citations' },
                { name: 'section_versions', desc: 'Full text content' },
                { name: 'vector_chunks', desc: 'Embedded text for semantic search' },
                { name: 'graph_nodes', desc: 'Knowledge graph nodes' },
                { name: 'graph_edges', desc: 'AUTHORIZES, DERIVES_FROM, CONFLICTS_WITH' },
                { name: 'chat_sessions', desc: 'Chat history sessions' },
                { name: 'chat_messages', desc: 'Messages with analysis JSON' },
              ].map((table) => (
                <div key={table.name} className="flex items-center gap-3 p-2.5 rounded-lg bg-bg-elevated">
                  <code className="text-xs font-mono text-brand bg-brand/10 px-2 py-0.5 rounded">
                    {table.name}
                  </code>
                  <span className="text-xs text-text-secondary">{table.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Knowledge Graph */}
          <div className="bg-bg-card rounded-2xl border border-border-default p-5">
            <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
              <Network className="w-5 h-5 text-federal" />
              Knowledge Graph Structure
            </h3>
            <div className="space-y-4">
              {/* Jurisdiction Hierarchy */}
              <div>
                <h4 className="text-sm font-medium text-text-primary mb-2">Jurisdiction Hierarchy</h4>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-3 py-1.5 rounded-lg bg-federal/10 text-federal text-sm font-medium">Federal</span>
                  <ArrowRight className="w-4 h-4 text-text-muted" />
                  <span className="px-3 py-1.5 rounded-lg bg-state/10 text-state text-sm font-medium">State</span>
                  <ArrowRight className="w-4 h-4 text-text-muted" />
                  <span className="px-3 py-1.5 rounded-lg bg-municipal/10 text-municipal text-sm font-medium">Municipal</span>
                </div>
              </div>

              {/* Edge Types */}
              <div>
                <h4 className="text-sm font-medium text-text-primary mb-2">Edge Types</h4>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-0.5 bg-text-muted" />
                    <span className="text-xs text-text-secondary">AUTHORIZES</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-0.5 bg-brand" />
                    <span className="text-xs text-text-secondary">DERIVES_AUTHORITY_FROM</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-0.5 bg-status-error" style={{ borderStyle: 'dashed' }} />
                    <span className="text-xs text-text-secondary">CONFLICTS_WITH</span>
                  </div>
                </div>
              </div>

              {/* Conflict Example */}
              <div className="p-3 rounded-lg bg-status-error/5 border border-status-error/20">
                <h4 className="text-xs font-medium text-status-error mb-1">Example Conflict</h4>
                <p className="text-xs text-text-secondary">
                  <span className="text-municipal font-medium">Austin STR Ordinance</span>
                  {' → '}
                  <span className="text-status-error">CONFLICTS</span>
                  {' → '}
                  <span className="text-state font-medium">Texas Property Code § 5.003</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tech Stack & API */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tech Stack */}
          <div className="bg-bg-card rounded-2xl border border-border-default p-5">
            <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
              <Layers className="w-5 h-5 text-brand" />
              Technology Stack
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {techStack.map((tech) => (
                <div key={tech.name} className="p-3 rounded-lg bg-bg-elevated text-center">
                  <h4 className={cn('font-semibold text-sm', tech.color)}>{tech.name}</h4>
                  <p className="text-xs text-text-muted mt-0.5">{tech.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* API Endpoints */}
          <div className="bg-bg-card rounded-2xl border border-border-default p-5">
            <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-accent-purple" />
              API Endpoints
            </h3>
            <div className="space-y-2">
              {[
                { method: 'POST', path: '/api/analyze', desc: 'AI-powered legal analysis' },
                { method: 'GET/POST', path: '/api/chat', desc: 'Chat history CRUD' },
                { method: 'POST', path: '/api/ingest-demo', desc: 'Bulk ingest documents' },
                { method: 'POST', path: '/api/clear-data', desc: 'Reset data' },
              ].map((endpoint) => (
                <div key={endpoint.path} className="flex items-center gap-2 p-2.5 rounded-lg bg-bg-elevated">
                  <code className={cn(
                    'text-xs font-mono px-1.5 py-0.5 rounded',
                    endpoint.method.includes('POST') ? 'bg-state/10 text-state' : 'bg-federal/10 text-federal'
                  )}>
                    {endpoint.method}
                  </code>
                  <code className="text-xs font-mono text-text-primary">{endpoint.path}</code>
                  <span className="text-xs text-text-muted ml-auto hidden sm:inline">{endpoint.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
