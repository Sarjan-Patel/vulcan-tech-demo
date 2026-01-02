import { Metadata } from 'next';
import { IngestDashboard } from '@/components/ingest/ingest-dashboard';

export const metadata: Metadata = {
  title: 'Ingest | Vulcan Legal',
  description: 'Ingest legal documents into the analysis pipeline.',
};

export default function IngestPage() {
  return <IngestDashboard />;
}
