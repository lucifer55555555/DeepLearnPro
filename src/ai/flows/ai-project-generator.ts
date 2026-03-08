'use server';

/**
 * @fileOverview AI Project Generator flow.
 * Analyzes completed topics and generates a personalized project idea with dataset and starter code.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AIProjectGeneratorInputSchema = z.object({
    completedTopics: z.array(z.string()).describe('Topics the user has mastered.'),
    preferredDomain: z.string().optional().describe('Optional domain of interest (e.g., Healthcare, Finance).'),
});
export type AIProjectGeneratorInput = z.infer<typeof AIProjectGeneratorInputSchema>;

const AIProjectGeneratorOutputSchema = z.object({
    title: z.string().describe('Catchy title for the project.'),
    description: z.string().describe('2-3 sentence description of the project goal.'),
    difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']).describe('Estimated difficulty level.'),
    datasetSuggestion: z.object({
        name: z.string(),
        description: z.string(),
    }).describe('Suggested publicly available dataset (e.g., from Kaggle or HuggingFace).'),
    steps: z.array(z.string()).describe('High level step-by-step guide to complete the project (4-6 steps).'),
    starterCode: z.string().describe('Python starter code template to get them going.'),
});
export type AIProjectGeneratorOutput = z.infer<typeof AIProjectGeneratorOutputSchema>;

export async function generateAiProject(input: AIProjectGeneratorInput): Promise<AIProjectGeneratorOutput> {
    return aiProjectGeneratorFlow(input);
}

const prompt = ai.definePrompt({
    name: 'aiProjectGeneratorPrompt',
    model: 'googleai/gemini-1.5-flash-latest',
    input: { schema: AIProjectGeneratorInputSchema },
    output: { schema: AIProjectGeneratorOutputSchema },
    prompt: `You are an expert Data Science Project Manager. Generate a unique, portfolio-ready project idea for a student.

USER SKILLS (Completed Topics):
{{completedTopics}}

{{#if preferredDomain}}
PREFERRED DOMAIN:
{{preferredDomain}}
{{/if}}

RULES:
1. The project must be achievable but challenging, utilizing the skills they have learned.
2. If no skills are provided, assume basic Python and ML foundations.
3. The dataset suggestion must be a real, known public dataset.
4. The starter code should set up the imports, load the (mock or real) data, and define the structure of the model/pipeline, leaving the core logic for the student. Focus on PyTorch or TensorFlow depending on the topics.
5. Keep the description exciting and recruiter-friendly.`,
});

const aiProjectGeneratorFlow = ai.defineFlow(
    {
        name: 'aiProjectGeneratorFlow',
        inputSchema: AIProjectGeneratorInputSchema,
        outputSchema: AIProjectGeneratorOutputSchema,
    },
    async input => {
        const { output } = await prompt(input);
        return output!;
    }
);
