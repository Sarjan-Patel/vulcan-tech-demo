import { Metadata } from 'next';
import { ArchitectureDiagram } from '@/components/architecture/architecture-diagram';

export const metadata: Metadata = {
  title: 'AI Agent Architecture | Vulcan Legal',
  description: 'Understand the AI agent orchestration architecture powering Vulcan Legal.',
};

export default function ArchitecturePage() {
  return <ArchitectureDiagram />;
}
