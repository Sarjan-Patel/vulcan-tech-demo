// API route to clear all ingested data (for testing/demo reset)
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function POST() {
  try {
    console.log('[Clear Data] Starting database cleanup...');

    // Delete in reverse order of dependencies
    // 1. Graph edges (references graph_nodes)
    const { error: edgeError } = await supabase
      .from('graph_edges')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (edgeError) {
      console.error('[Clear Data] Error deleting graph edges:', edgeError);
    } else {
      console.log('[Clear Data] Deleted graph edges');
    }

    // 2. Graph nodes (references documents, sections)
    const { error: nodeError } = await supabase
      .from('graph_nodes')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (nodeError) {
      console.error('[Clear Data] Error deleting graph nodes:', nodeError);
    } else {
      console.log('[Clear Data] Deleted graph nodes');
    }

    // 3. Vector chunks (references section_versions)
    const { error: chunkError } = await supabase
      .from('vector_chunks')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (chunkError) {
      console.error('[Clear Data] Error deleting vector chunks:', chunkError);
    } else {
      console.log('[Clear Data] Deleted vector chunks');
    }

    // 4. Section versions (references sections, document_versions)
    const { error: secVerError } = await supabase
      .from('section_versions')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (secVerError) {
      console.error('[Clear Data] Error deleting section versions:', secVerError);
    } else {
      console.log('[Clear Data] Deleted section versions');
    }

    // 5. Sections (references documents)
    const { error: sectionError } = await supabase
      .from('sections')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (sectionError) {
      console.error('[Clear Data] Error deleting sections:', sectionError);
    } else {
      console.log('[Clear Data] Deleted sections');
    }

    // 6. Document versions (references documents, s3_objects)
    const { error: docVerError } = await supabase
      .from('document_versions')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (docVerError) {
      console.error('[Clear Data] Error deleting document versions:', docVerError);
    } else {
      console.log('[Clear Data] Deleted document versions');
    }

    // 7. Documents
    const { error: docError } = await supabase
      .from('documents')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (docError) {
      console.error('[Clear Data] Error deleting documents:', docError);
    } else {
      console.log('[Clear Data] Deleted documents');
    }

    // 8. S3 objects
    const { error: s3Error } = await supabase
      .from('s3_objects')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (s3Error) {
      console.error('[Clear Data] Error deleting S3 objects:', s3Error);
    } else {
      console.log('[Clear Data] Deleted S3 objects');
    }

    console.log('[Clear Data] Database cleanup complete!');

    return NextResponse.json({
      success: true,
      message: 'All ingested data has been cleared',
    });

  } catch (error) {
    console.error('[Clear Data] Fatal error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST to clear all ingested data. WARNING: This is destructive!',
  });
}
