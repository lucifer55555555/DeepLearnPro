
'use server';

/**
 * @fileOverview Enhanced AI Learning Mentor — multi-mode chatbot.
 * Modes: explain, study-plan, test-me, general Q&A
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AIChatbotAssistanceInputSchema = z.object({
  question: z.string().describe('The user question or request.'),
  learningMaterial: z.string().describe('The learning material to use as context.'),
  mode: z.enum(['explain', 'study-plan', 'test-me', 'general']).describe('The conversation mode.'),
  userProgress: z.string().optional().describe('Summary of user progress (completed courses, quiz scores, etc).'),
});
export type AIChatbotAssistanceInput = z.infer<typeof AIChatbotAssistanceInputSchema>;

const AIChatbotAssistanceOutputSchema = z.object({
  answer: z.string().describe('The AI response formatted in markdown.'),
});
export type AIChatbotAssistanceOutput = z.infer<typeof AIChatbotAssistanceOutputSchema>;

export async function aiChatbotAssistance(input: AIChatbotAssistanceInput): Promise<AIChatbotAssistanceOutput> {
  return aiChatbotAssistanceFlow(input);
}

const modeInstructions: Record<string, string> = {
  explain: `MODE: EXPLAIN
You are a patient, friendly teacher. The user wants you to explain a concept.
- Use simple language and relatable analogies (e.g., "A neural network is like a team of decision-makers...")
- Structure your response with headers and bullet points
- Add a "🔑 Key Takeaway" at the end
- If the concept is complex, break it into numbered steps`,

  'study-plan': `MODE: STUDY PLAN
The user wants a personalized study plan. Generate a structured learning schedule.
- Consider their current progress when creating the plan
- Use a clear day-by-day or week-by-week format with checkboxes
- Include specific topics, resources from the platform, and estimated time per session
- Add milestones and review sessions
- Format as a neat markdown table or checklist`,

  'test-me': `MODE: TEST ME
Generate a mini-quiz to test the user's knowledge.
- Create exactly 5 multiple-choice questions based on the learning material
- Number each question clearly
- Provide 4 options labeled A, B, C, D
- At the END, provide an "Answer Key" section with brief explanations
- Cover different difficulty levels (2 easy, 2 medium, 1 hard)`,

  general: `MODE: GENERAL Q&A
Answer the user's question about machine learning or deep learning accurately and concisely.
- Use the learning material for context
- Format with markdown headers and bullet points for readability
- Include code examples if relevant (use python code blocks)`,
};

const prompt = ai.definePrompt({
  name: 'aiMentorPrompt',
  model: 'googleai/gemini-1.5-flash',
  input: { schema: AIChatbotAssistanceInputSchema },
  output: { schema: AIChatbotAssistanceOutputSchema },
  prompt: `You are DeepLearn Pro's AI Learning Mentor — an expert, encouraging deep learning coach.

{{{modeInstruction}}}

{{#if userProgress}}
USER'S PROGRESS:
{{{userProgress}}}
{{/if}}

REFERENCE MATERIAL:
{{{learningMaterial}}}

USER'S REQUEST:
{{{question}}}

Respond in well-formatted markdown. Be encouraging and professional.`,
});

const aiChatbotAssistanceFlow = ai.defineFlow(
  {
    name: 'aiChatbotAssistanceFlow',
    inputSchema: AIChatbotAssistanceInputSchema,
    outputSchema: AIChatbotAssistanceOutputSchema,
  },
  async input => {
    const modeInstruction = modeInstructions[input.mode] || modeInstructions.general;
    const { output } = await prompt({ ...input, modeInstruction } as any);
    return output!;
  }
);
