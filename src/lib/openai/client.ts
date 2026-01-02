import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  console.warn('[OpenAI] Warning: OPENAI_API_KEY is not set');
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export const LEGAL_ANALYSIS_MODEL = 'gpt-4o';
