import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_GOOGLE_GENAI_API_KEY;

if (!apiKey) {
  console.warn('WARNING: No AI API key found! Please set VITE_GEMINI_API_KEY or VITE_GOOGLE_GENAI_API_KEY in your environment variables.');
}

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: apiKey,
    }),
  ],
});
