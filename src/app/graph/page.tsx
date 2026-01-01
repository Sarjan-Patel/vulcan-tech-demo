import { Metadata } from 'next';
import { LegalGraph } from '@/components/graph/legal-graph';

export const metadata: Metadata = {
  title: 'Explore | Vulcan Legal',
  description: 'Visualize the legal hierarchy and relationships between federal, state, and municipal laws.',
};

export default function GraphPage() {
  return <LegalGraph />;
}
