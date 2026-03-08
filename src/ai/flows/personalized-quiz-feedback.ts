
'use server';

/**
 * @fileOverview A personalized quiz feedback AI agent.
 *
 * - personalizedQuizFeedback - A function that provides personalized feedback based on quiz performance.
 * - PersonalizedQuizFeedbackInput - The input type for the personalizedQuizFeedback function.
 * - PersonalizedQuizFeedbackOutput - The return type for the personalizedQuizFeedback function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const PersonalizedQuizFeedbackInputSchema = z.object({
  quizTopic: z.string().describe('The topic of the quiz (e.g., Machine Learning, Deep Learning).'),
  userAnswers: z.record(z.string(), z.string()).describe('A record of the user\u2019s answers to the quiz questions, where the key is the question ID and the value is the user\u2019s answer.'),
  correctAnswers: z.record(z.string(), z.string()).describe('A record of the correct answers to the quiz questions, where the key is the question ID and the value is the correct answer.'),
  learningNotes: z.string().describe('The curated learning notes on the quiz topic.'),
});
export type PersonalizedQuizFeedbackInput = z.infer<typeof PersonalizedQuizFeedbackInputSchema>;

const PersonalizedQuizFeedbackOutputSchema = z.object({
  feedback: z.string().describe('Personalized feedback on the user\u2019s quiz performance, highlighting areas for improvement.'),
});
export type PersonalizedQuizFeedbackOutput = z.infer<typeof PersonalizedQuizFeedbackOutputSchema>;

export async function personalizedQuizFeedback(input: PersonalizedQuizFeedbackInput): Promise<PersonalizedQuizFeedbackOutput> {
  return personalizedQuizFeedbackFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedQuizFeedbackPrompt',
  model: 'googleai/gemini-1.5-flash-latest',
  input: { schema: PersonalizedQuizFeedbackInputSchema },
  output: { schema: PersonalizedQuizFeedbackOutputSchema },
  prompt: `You are an AI-powered learning assistant that provides personalized feedback to students based on their quiz performance.

  Analyze the user's answers compared to the correct answers, and provide specific feedback on areas where the user needs to improve. Use the learning notes as a reference to identify relevant concepts and provide targeted guidance.

  Quiz Topic: {{{quizTopic}}}
  User Answers: {{userAnswers}}
  Correct Answers: {{correctAnswers}}
  Learning Notes: {{{learningNotes}}}

  Provide feedback that is encouraging and actionable, focusing on specific concepts or ares where the user can focus their learning efforts. The feedback should be no more than 200 words.
  Feedback:
`,
});

const personalizedQuizFeedbackFlow = ai.defineFlow(
  {
    name: 'personalizedQuizFeedbackFlow',
    inputSchema: PersonalizedQuizFeedbackInputSchema,
    outputSchema: PersonalizedQuizFeedbackOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
