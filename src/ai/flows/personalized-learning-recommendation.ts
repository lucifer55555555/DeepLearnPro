
'use server';

/**
 * @fileOverview A personalized learning recommendation AI agent.
 *
 * - personalizedLearningRecommendation - A function that provides personalized learning recommendations.
 * - PersonalizedLearningRecommendationInput - The input type for the personalizedLearningRecommendation function.
 * - PersonalizedLearningRecommendationOutput - The return type for the personalizedLearningRecommendation function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const PersonalizedLearningRecommendationInputSchema = z.object({
  userName: z.string().describe('The name of the learner.'),
  coursesCompleted: z.number().describe('The number of courses the learner has completed.'),
  solvedProjects: z.number().describe('The number of projects the learner has solved.'),
  quizPerformance: z.string().describe('A summary of the learner\'s recent quiz performance.'),
  availableCourses: z.array(z.string()).describe('A list of available courses.'),
  availableProjects: z.array(z.string()).describe('A list of available projects.'),
});
export type PersonalizedLearningRecommendationInput = z.infer<typeof PersonalizedLearningRecommendationInputSchema>;

const PersonalizedLearningRecommendationOutputSchema = z.object({
  recommendation: z.string().describe('A personalized recommendation for what the learner should focus on next, including specific courses or projects.'),
});
export type PersonalizedLearningRecommendationOutput = z.infer<typeof PersonalizedLearningRecommendationOutputSchema>;

export async function personalizedLearningRecommendation(input: PersonalizedLearningRecommendationInput): Promise<PersonalizedLearningRecommendationOutput> {
  return personalizedLearningRecommendationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedLearningRecommendationPrompt',
  model: 'googleai/gemini-1.5-flash',
  input: { schema: PersonalizedLearningRecommendationInputSchema },
  output: { schema: PersonalizedLearningRecommendationOutputSchema },
  prompt: `You are an AI career coach for aspiring machine learning engineers. Your goal is to provide a personalized recommendation for what a learner, {{userName}}, should do next.

Analyze the learner's profile:
- Courses Completed: {{coursesCompleted}}
- Projects Solved: {{solvedProjects}}
- Recent Quiz Performance: {{{quizPerformance}}}

Here are the available learning materials:
- Courses: {{availableCourses}}
- Projects: {{availableProjects}}

Based on their progress, provide a single, actionable next step. Be encouraging and specific. For example, if they have finished theory but not projects, recommend a specific project. If they are struggling with a topic, suggest a specific course.
The recommendation should be concise and no more than 100 words.
Recommendation:`,
});

const personalizedLearningRecommendationFlow = ai.defineFlow(
  {
    name: 'personalizedLearningRecommendationFlow',
    inputSchema: PersonalizedLearningRecommendationInputSchema,
    outputSchema: PersonalizedLearningRecommendationOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
