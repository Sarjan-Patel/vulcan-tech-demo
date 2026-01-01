import type { AnalysisResponse, LegalNode, LegalEdge, Citation } from './types';

// Sample citations
export const mockCitations: Citation[] = [
  {
    id: 'cit-001',
    title: 'Texas Property Code',
    citation: 'Tex. Prop. Code § 5.001',
    jurisdiction: 'state',
    year: 2023,
    excerpt: 'A property owner has the right to the unrestricted use of the owner\'s property, subject only to the restrictions agreed to by the owner and to restrictions imposed by law.',
  },
  {
    id: 'cit-002',
    title: 'Fair Housing Act',
    citation: '42 U.S.C. § 3604',
    jurisdiction: 'federal',
    year: 1968,
    excerpt: 'It shall be unlawful to discriminate in the sale or rental of housing on the basis of race, color, religion, sex, familial status, or national origin.',
  },
  {
    id: 'cit-003',
    title: 'Austin Short-Term Rental Ordinance',
    citation: 'Austin Code § 25-2-788',
    jurisdiction: 'municipal',
    year: 2022,
    excerpt: 'Short-term rental registration requires the owner or designated operator to reside on the property.',
  },
  {
    id: 'cit-004',
    title: 'Texas Local Government Code',
    citation: 'Tex. Loc. Gov\'t Code § 51.001',
    jurisdiction: 'state',
    year: 2023,
    excerpt: 'The governing body of a municipality may adopt an ordinance to govern matters related to health, safety, and welfare.',
  },
];

// Sample analysis response
export const mockAnalysisResponse: AnalysisResponse = {
  id: 'analysis-001',
  query: 'Does Austin\'s short-term rental ordinance requiring owner occupancy conflict with Texas state law?',
  summary: 'The Austin ordinance restricting short-term rentals to owner-occupied properties may conflict with Texas Property Code provisions on private property rights. While municipalities have broad police powers, the owner-occupancy requirement appears to restrict property rights beyond what is necessary for health and safety purposes.',
  conflicts: [
    {
      id: 'conflict-001',
      severity: 'medium',
      description: 'Austin\'s mandatory owner-occupancy requirement for short-term rentals may exceed the scope of municipal authority by restricting property rights beyond what is necessary for legitimate health and safety purposes.',
      localRule: 'Austin Code § 25-2-788: Short-term rental registration requires owner to reside on property',
      higherLaw: mockCitations[0],
      conflictType: 'implicit',
    },
  ],
  reasoningChain: [
    {
      step: 1,
      description: 'Identified the local ordinance in question: Austin Code § 25-2-788, which governs short-term rental licensing and requires owner occupancy.',
      citations: [mockCitations[2]],
      confidence: 0.95,
    },
    {
      step: 2,
      description: 'Reviewed Texas Property Code provisions establishing property owners\' rights to use their property, subject to lawful restrictions.',
      citations: [mockCitations[0]],
      confidence: 0.92,
    },
    {
      step: 3,
      description: 'Analyzed Texas Local Government Code provisions granting municipalities authority to regulate health, safety, and welfare.',
      citations: [mockCitations[3]],
      confidence: 0.88,
    },
    {
      step: 4,
      description: 'Evaluated whether the owner-occupancy requirement exceeds the scope of municipal police powers by restricting property rights beyond legitimate public interest.',
      citations: [],
      confidence: 0.75,
    },
  ],
  suggestions: [
    {
      id: 'sug-001',
      original: 'Short-term rental registration requires the owner or designated operator to reside on the property.',
      compliant: 'Short-term rental operators may receive expedited permit processing and reduced fees when the owner or designated operator resides on the property.',
      justification: 'Converting the mandatory requirement to an incentive-based approach preserves property rights while still encouraging owner oversight and neighborhood accountability.',
    },
    {
      id: 'sug-002',
      original: 'Short-term rental registration requires the owner or designated operator to reside on the property.',
      compliant: 'Short-term rental operators must designate a local responsible party available to respond to complaints within one hour.',
      justification: 'This alternative addresses the underlying health and safety concerns without restricting property usage rights.',
    },
  ],
  citations: mockCitations,
  timestamp: new Date(),
};

// Sample graph nodes
export const mockGraphNodes: LegalNode[] = [
  {
    id: 'us-const',
    title: 'U.S. Constitution',
    citation: 'U.S. Const.',
    jurisdiction: 'federal',
    type: 'constitution',
    status: 'active',
    excerpt: 'The supreme law of the United States.',
  },
  {
    id: 'fair-housing',
    title: 'Fair Housing Act',
    citation: '42 U.S.C. § 3604',
    jurisdiction: 'federal',
    type: 'statute',
    status: 'active',
    effectiveDate: '1968-04-11',
    excerpt: 'Prohibits discrimination in housing transactions.',
  },
  {
    id: '42-usc-1983',
    title: 'Civil Rights Act',
    citation: '42 U.S.C. § 1983',
    jurisdiction: 'federal',
    type: 'statute',
    status: 'active',
    effectiveDate: '1871-04-20',
  },
  {
    id: 'tex-const',
    title: 'Texas Constitution',
    citation: 'Tex. Const.',
    jurisdiction: 'state',
    type: 'constitution',
    status: 'active',
  },
  {
    id: 'tex-prop-code',
    title: 'Texas Property Code',
    citation: 'Tex. Prop. Code § 5.001',
    jurisdiction: 'state',
    type: 'statute',
    status: 'active',
    effectiveDate: '2023-09-01',
    excerpt: 'Establishes property owner rights in Texas.',
  },
  {
    id: 'tex-loc-gov',
    title: 'Texas Local Government Code',
    citation: 'Tex. Loc. Gov\'t Code § 51.001',
    jurisdiction: 'state',
    type: 'statute',
    status: 'active',
    excerpt: 'Grants municipalities police powers.',
  },
  {
    id: 'austin-str',
    title: 'Austin STR Ordinance',
    citation: 'Austin Code § 25-2-788',
    jurisdiction: 'municipal',
    type: 'ordinance',
    status: 'conflicting',
    effectiveDate: '2022-01-01',
    excerpt: 'Requires owner occupancy for short-term rentals.',
  },
  {
    id: 'austin-zoning',
    title: 'Austin Zoning Code',
    citation: 'Austin Code § 25-2',
    jurisdiction: 'municipal',
    type: 'ordinance',
    status: 'active',
    excerpt: 'General zoning regulations for the City of Austin.',
  },
];

// Sample graph edges
export const mockGraphEdges: LegalEdge[] = [
  { id: 'e1', source: 'us-const', target: 'fair-housing', relationship: 'authorizes' },
  { id: 'e2', source: 'us-const', target: '42-usc-1983', relationship: 'authorizes' },
  { id: 'e3', source: 'us-const', target: 'tex-const', relationship: 'authorizes' },
  { id: 'e4', source: 'tex-const', target: 'tex-prop-code', relationship: 'authorizes' },
  { id: 'e5', source: 'tex-const', target: 'tex-loc-gov', relationship: 'authorizes' },
  { id: 'e6', source: 'tex-loc-gov', target: 'austin-str', relationship: 'authorizes' },
  { id: 'e7', source: 'tex-loc-gov', target: 'austin-zoning', relationship: 'authorizes' },
  { id: 'e8', source: 'austin-str', target: 'tex-prop-code', relationship: 'conflicts' },
];

// Example queries for the chat
export const exampleQueries = [
  'Does Austin\'s short-term rental ordinance requiring owner occupancy conflict with Texas state law?',
  'Can a city impose stricter environmental regulations than federal EPA standards?',
  'Does our proposed zoning change comply with Fair Housing Act requirements?',
  'Analyze this draft ordinance for potential preemption issues with state law.',
];
