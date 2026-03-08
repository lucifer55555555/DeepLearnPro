
import { config } from 'dotenv';
config(); // Load .env file

import { ai } from '../ai/genkit';

async function verifyApiKey() {
    console.log('Verifying VITE_GEMINI_API_KEY from .env...');
    if (!process.env.VITE_GEMINI_API_KEY) {
        console.error('--- ERROR ---');
        console.error('VITE_GEMINI_API_KEY not found in .env file.');
        process.exit(1);
    }

    try {
        const response = await ai.generate({
            // We must use a recognized model format 'plugin/model'
            model: 'googleai/gemini-1.5-flash',
            prompt: 'Respond with "API is working!"',
        });
        console.log('--- SUCCESS ---');
        console.log('AI Response:', response.text);
        console.log('Your VITE_GEMINI_API_KEY is VALID.');
    } catch (error: any) {
        console.error('--- ERROR ---');
        console.error('Error verifying API key:', error.message);
        if (error.message.includes('API_KEY_INVALID') || error.message.includes('403')) {
            console.error('The provided VITE_GEMINI_API_KEY appears to be INVALID or has insufficient permissions.');
        } else {
            console.error('Unexpected Error:', error);
        }
        process.exit(1);
    }
}

verifyApiKey();
