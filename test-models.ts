import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

const ai = genkit({
    plugins: [googleAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY })]
});

async function testModel(modelName: string) {
    console.log(`Testing model: ${modelName}`);
    try {
        const result = await ai.generate({
            model: modelName,
            prompt: 'Say hi'
        });
        console.log(`[SUCCESS] ${modelName} works!`);
    } catch (e: any) {
        console.error(`[FAIL] ${modelName}:`, e.message);
    }
}

async function run() {
    await testModel('gemini-1.5-flash');
    await testModel('googleai/gemini-1.5-flash');
    await testModel('googleai/gemini-1.5-flash-latest');
    await testModel('googleai/gemini-1.5-flash-001');
    await testModel('googleai/gemini-1.5-flash-002');
    await testModel('googleai/gemini-2.5-flash');
}

run();
