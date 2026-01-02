'use client';

import { useState, useCallback, useEffect } from 'react';
import type { Message, AnalysisResponse } from '@/lib/types';

interface ChatSession {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

interface UseChatReturn {
  messages: Message[];
  sessions: ChatSession[];
  currentSessionId: string | null;
  isLoading: boolean;
  isLoadingSessions: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
  loadSession: (sessionId: string) => Promise<void>;
  startNewSession: () => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
}

export function useChat(): UseChatReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load sessions on mount
  useEffect(() => {
    loadSessions();
  }, []);

  // Load all chat sessions
  const loadSessions = async () => {
    try {
      setIsLoadingSessions(true);
      const response = await fetch('/api/chat');
      const data = await response.json();

      if (data.sessions) {
        setSessions(data.sessions);
        // If there are sessions and no current session, load the most recent one
        if (data.sessions.length > 0 && !currentSessionId) {
          await loadSession(data.sessions[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load sessions:', err);
    } finally {
      setIsLoadingSessions(false);
    }
  };

  // Load a specific session's messages
  const loadSession = useCallback(async (sessionId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/chat?sessionId=${sessionId}`);
      const data = await response.json();

      if (data.messages) {
        const formattedMessages: Message[] = data.messages.map((msg: {
          id: string;
          role: 'user' | 'assistant';
          content: string;
          analysis?: AnalysisResponse;
          created_at: string;
        }) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          analysis: msg.analysis,
          timestamp: new Date(msg.created_at),
        }));

        setMessages(formattedMessages);
        setCurrentSessionId(sessionId);
      }
    } catch (err) {
      console.error('Failed to load session:', err);
      setError('Failed to load chat history');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Start a new chat session
  const startNewSession = useCallback(async () => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'createSession' }),
      });

      const data = await response.json();

      if (data.session) {
        setCurrentSessionId(data.session.id);
        setMessages([]);
        setSessions((prev) => [data.session, ...prev]);
      }
    } catch (err) {
      console.error('Failed to create session:', err);
      setError('Failed to create new chat');
    }
  }, []);

  // Delete a session
  const deleteSession = useCallback(async (sessionId: string) => {
    try {
      await fetch(`/api/chat?sessionId=${sessionId}`, {
        method: 'DELETE',
      });

      setSessions((prev) => prev.filter((s) => s.id !== sessionId));

      // If we deleted the current session, start a new one
      if (sessionId === currentSessionId) {
        setMessages([]);
        setCurrentSessionId(null);
      }
    } catch (err) {
      console.error('Failed to delete session:', err);
    }
  }, [currentSessionId]);

  // Send a message
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    let sessionId = currentSessionId;

    // Create a new session if we don't have one
    if (!sessionId) {
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'createSession' }),
        });

        const data = await response.json();

        if (data.session) {
          sessionId = data.session.id;
          setCurrentSessionId(sessionId);
          setSessions((prev) => [data.session, ...prev]);
        }
      } catch (err) {
        console.error('Failed to create session:', err);
        setError('Failed to start chat');
        return;
      }
    }

    // Create user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      // Save user message to database
      await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'addMessage',
          sessionId,
          role: 'user',
          content: content.trim(),
          title: content.trim().slice(0, 50) + (content.length > 50 ? '...' : ''),
        }),
      });

      // Update session title in local state
      setSessions((prev) =>
        prev.map((s) =>
          s.id === sessionId
            ? { ...s, title: content.trim().slice(0, 50) + (content.length > 50 ? '...' : ''), updated_at: new Date().toISOString() }
            : s
        )
      );

      // Call the analysis API
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: content.trim() }),
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const analysisResponse: AnalysisResponse = await response.json();

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: analysisResponse.summary,
        analysis: analysisResponse,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Save assistant message to database
      await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'addMessage',
          sessionId,
          role: 'assistant',
          content: analysisResponse.summary,
          analysis: analysisResponse,
        }),
      });
    } catch (err) {
      setError('Failed to analyze. Please try again.');
      console.error('Chat error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentSessionId]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setCurrentSessionId(null);
    setError(null);
  }, []);

  return {
    messages,
    sessions,
    currentSessionId,
    isLoading,
    isLoadingSessions,
    error,
    sendMessage,
    clearMessages,
    loadSession,
    startNewSession,
    deleteSession,
  };
}
