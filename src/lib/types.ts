// Legal Reasoning Platform Type Definitions

export type JurisdictionLevel = 'federal' | 'state' | 'municipal';
export type ConflictSeverity = 'high' | 'medium' | 'low';
export type MessageRole = 'user' | 'assistant';
export type ConflictType = 'direct' | 'preemption' | 'implicit';
export type LegalDocumentType = 'constitution' | 'statute' | 'regulation' | 'ordinance';
export type LegalStatus = 'active' | 'conflicting' | 'superseded';
export type RelationshipType = 'authorizes' | 'conflicts' | 'amends' | 'derives';

export interface Citation {
  id: string;
  title: string;
  citation: string; // e.g., "42 U.S.C. § 1983"
  jurisdiction: JurisdictionLevel;
  year: number;
  excerpt?: string;
  url?: string;
}

export interface Conflict {
  id: string;
  severity: ConflictSeverity;
  description: string;
  localRule: string;
  higherLaw: Citation;
  conflictType: ConflictType;
}

export interface ReasoningStep {
  step: number;
  description: string;
  citations: Citation[];
  confidence?: number;
}

export interface Suggestion {
  id: string;
  original: string;
  compliant: string;
  justification: string;
}

export interface AnalysisResponse {
  id: string;
  query: string;
  summary: string;
  conflicts: Conflict[];
  reasoningChain: ReasoningStep[];
  suggestions: Suggestion[];
  citations: Citation[];
  timestamp: Date;
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  analysis?: AnalysisResponse;
  timestamp: Date;
}

export interface LegalNode {
  id: string;
  title: string;
  citation: string;
  jurisdiction: JurisdictionLevel;
  type: LegalDocumentType;
  status: LegalStatus;
  effectiveDate?: string;
  excerpt?: string;
}

export interface LegalEdge {
  id: string;
  source: string;
  target: string;
  relationship: RelationshipType;
}

// React Flow node data type - uses index signature for React Flow compatibility
export type LegalNodeData = {
  title: string;
  citation: string;
  jurisdiction: JurisdictionLevel;
  type: LegalDocumentType;
  status: LegalStatus;
  effectiveDate?: string;
  [key: string]: unknown;
}

// Chat state
export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

// Graph state
export interface GraphState {
  selectedNodeId: string | null;
  isDetailPanelOpen: boolean;
}
