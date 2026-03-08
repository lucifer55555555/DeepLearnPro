import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

// Use a getter so the key is read at runtime, not at build/import time
function getApiKey() {
  return process.env.GOOGLE_GENAI_API_KEY || '';
}

const apiKey = getApiKey();

if (!apiKey) {
  console.warn('WARNING: GOOGLE_GENAI_API_KEY is not set. AI features will not work.');
}

console.log('[Genkit Init] API key loaded:', apiKey ? 'YES (starts with ' + apiKey.substring(0, 8) + '...)' : 'NO - MISSING');

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: apiKey || undefined,
    }),
  ],
});
