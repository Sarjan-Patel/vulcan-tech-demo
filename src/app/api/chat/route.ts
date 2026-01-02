// API route for chat history operations
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

// GET - Fetch all chat sessions or a specific session's messages
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId');

  try {
    if (sessionId) {
      // Fetch messages for a specific session
      const { data: messages, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return NextResponse.json({ messages });
    } else {
      // Fetch all sessions
      const { data: sessions, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      return NextResponse.json({ sessions });
    }
  } catch (error) {
    console.error('[Chat API] GET error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch chat history' },
      { status: 500 }
    );
  }
}

// POST - Create a new session or add a message
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, sessionId, role, content, analysis, title } = body;

    if (action === 'createSession') {
      // Create a new chat session
      const { data: session, error } = await (supabase
        .from('chat_sessions') as any)
        .insert({ title: title || 'New Chat' })
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({ session });
    } else if (action === 'addMessage') {
      // Add a message to an existing session
      if (!sessionId || !role || !content) {
        return NextResponse.json(
          { error: 'sessionId, role, and content are required' },
          { status: 400 }
        );
      }

      const { data: message, error: messageError } = await (supabase
        .from('chat_messages') as any)
        .insert({
          session_id: sessionId,
          role,
          content,
          analysis: analysis || null,
        })
        .select()
        .single();

      if (messageError) throw messageError;

      // Update session's updated_at and title if it's the first user message
      const updateData: { updated_at: string; title?: string } = {
        updated_at: new Date().toISOString(),
      };

      // If it's a user message and no title provided, use a truncated version of the message
      if (role === 'user' && title) {
        updateData.title = title;
      }

      await (supabase
        .from('chat_sessions') as any)
        .update(updateData)
        .eq('id', sessionId);

      return NextResponse.json({ message });
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "createSession" or "addMessage"' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('[Chat API] POST error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to save chat' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a session
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId');

  if (!sessionId) {
    return NextResponse.json(
      { error: 'sessionId is required' },
      { status: 400 }
    );
  }

  try {
    const { error } = await supabase
      .from('chat_sessions')
      .delete()
      .eq('id', sessionId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Chat API] DELETE error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete session' },
      { status: 500 }
    );
  }
}
