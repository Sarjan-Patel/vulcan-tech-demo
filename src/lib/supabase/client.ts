import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Type-safe database types
export type Database = {
  public: {
    Tables: {
      s3_objects: {
        Row: {
          id: string;
          key: string;
          source: 'us-code' | 'ecfr' | 'texas-statutes' | 'austin-ordinances';
          fetched_at: string;
          checksum: string;
          content_type: string;
          file_size_bytes: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          key: string;
          source: 'us-code' | 'ecfr' | 'texas-statutes' | 'austin-ordinances';
          fetched_at?: string;
          checksum: string;
          content_type?: string;
          file_size_bytes?: number | null;
          created_at?: string;
        };
      };
      documents: {
        Row: {
          id: string;
          title: string;
          jurisdiction: 'federal' | 'state' | 'municipal';
          authority_level: 'constitution' | 'statute' | 'regulation' | 'ordinance';
          source: 'us-code' | 'ecfr' | 'texas-statutes' | 'austin-ordinances';
          effective_from: string;
          effective_to: string | null;
          current_version_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          jurisdiction: 'federal' | 'state' | 'municipal';
          authority_level: 'constitution' | 'statute' | 'regulation' | 'ordinance';
          source: 'us-code' | 'ecfr' | 'texas-statutes' | 'austin-ordinances';
          effective_from: string;
          effective_to?: string | null;
          current_version_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      document_versions: {
        Row: {
          id: string;
          document_id: string;
          version_number: number;
          effective_from: string;
          effective_to: string | null;
          ingested_at: string;
          s3_object_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          document_id: string;
          version_number?: number;
          effective_from: string;
          effective_to?: string | null;
          ingested_at?: string;
          s3_object_id?: string | null;
          created_at?: string;
        };
      };
      sections: {
        Row: {
          id: string;
          document_id: string;
          citation: string;
          heading: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          document_id: string;
          citation: string;
          heading: string;
          created_at?: string;
        };
      };
      section_versions: {
        Row: {
          id: string;
          section_id: string;
          document_version_id: string;
          text: string;
          token_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          section_id: string;
          document_version_id: string;
          text: string;
          token_count: number;
          created_at?: string;
        };
      };
      vector_chunks: {
        Row: {
          id: string;
          section_version_id: string;
          chunk_index: number;
          text: string;
          token_count: number;
          embedding: number[] | null;
          metadata: Record<string, unknown>;
          created_at: string;
        };
        Insert: {
          id?: string;
          section_version_id: string;
          chunk_index: number;
          text: string;
          token_count: number;
          embedding?: number[] | null;
          metadata?: Record<string, unknown>;
          created_at?: string;
        };
      };
      graph_nodes: {
        Row: {
          id: string;
          label: string;
          node_type: 'document' | 'section';
          jurisdiction: 'federal' | 'state' | 'municipal';
          authority_level: 'constitution' | 'statute' | 'regulation' | 'ordinance';
          citation: string | null;
          effective_from: string | null;
          document_id: string | null;
          section_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          label: string;
          node_type: 'document' | 'section';
          jurisdiction: 'federal' | 'state' | 'municipal';
          authority_level: 'constitution' | 'statute' | 'regulation' | 'ordinance';
          citation?: string | null;
          effective_from?: string | null;
          document_id?: string | null;
          section_id?: string | null;
          created_at?: string;
        };
      };
      graph_edges: {
        Row: {
          id: string;
          source_node_id: string;
          target_node_id: string;
          edge_type: 'AUTHORIZES' | 'DERIVES_AUTHORITY_FROM' | 'CONFLICTS_WITH' | 'AMENDS';
          severity: 'low' | 'medium' | 'high' | null;
          rationale: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          source_node_id: string;
          target_node_id: string;
          edge_type: 'AUTHORIZES' | 'DERIVES_AUTHORITY_FROM' | 'CONFLICTS_WITH' | 'AMENDS';
          severity?: 'low' | 'medium' | 'high' | null;
          rationale?: string | null;
          created_at?: string;
        };
      };
    };
  };
};
