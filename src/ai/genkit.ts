import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

const apiKey = process.env.GOOGLE_GENAI_API_KEY;

if (!apiKey) {
  console.warn('WARNING: No AI API key found! Please set GOOGLE_GENAI_API_KEY in your environment variables.');
}

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: apiKey,
    }),
  ],
});
