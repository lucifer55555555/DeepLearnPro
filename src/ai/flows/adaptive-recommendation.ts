
'use server';

/**
 * @fileOverview Adaptive learning recommendation flow.
 * Analyzes mastery scores and weak areas to recommend personalized next steps.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AdaptiveRecommendationInputSchema = z.object({
    topicMastery: z.array(z.object({
        topicName: z.string(),
        score: z.number(),
        quizzesTaken: z.number(),
    })).describe('Mastery scores for each topic.'),
    completedCourses: z.array(z.string()).describe('IDs of completed courses.'),
    completedProjects: z.array(z.string()).describe('IDs of solved projects.'),
    weakTopics: z.array(z.string()).describe('Topics where score is below 60%.'),
    streakDays: z.number().describe('Current learning streak in days.'),
});
export type AdaptiveRecommendationInput = z.infer<typeof AdaptiveRecommendationInputSchema>;

const AdaptiveRecommendationOutputSchema = z.object({
    nextStep: z.string().describe('The single most important next action.'),
    reason: z.string().describe('Why this is recommended.'),
    weakAreaAdvice: z.string().optional().describe('Advice for improving weak areas.'),
    motivationalMessage: z.string().describe('An encouraging message about their progress.'),
});
export type AdaptiveRecommendationOutput = z.infer<typeof AdaptiveRecommendationOutputSchema>;

export async function getAdaptiveRecommendation(input: AdaptiveRecommendationInput): Promise<AdaptiveRecommendationOutput> {
    return adaptiveRecommendationFlow(input);
}

const prompt = ai.definePrompt({
    name: 'adaptiveRecommendationPrompt',
    model: 'googleai/gemini-1.5-flash-latest',
    input: { schema: AdaptiveRecommendationInputSchema },
    output: { schema: AdaptiveRecommendationOutputSchema },
    prompt: `You are DeepLearn Pro's adaptive learning engine. Analyze the learner's profile and provide a personalized recommendation.

LEARNER PROFILE:
- Topic Mastery: {{#each topicMastery}}{{topicName}}: {{score}}% ({{quizzesTaken}} quizzes taken), {{/each}}
- Completed Courses: {{completedCourses}}
- Completed Projects: {{completedProjects}}
- Weak Topics (below 60%): {{weakTopics}}
- Learning Streak: {{streakDays}} days

RULES:
1. If they have weak topics, prioritize recommending revision content for those topics.
2. If all topics are strong (>80%), recommend advanced projects.
3. If they haven't started any courses, recommend starting with ML Foundations.
4. The "nextStep" should be a specific action (e.g., "Take the Neural Networks quiz" or "Start the Computer Vision course").
5. Keep "reason" to 1-2 sentences.
6. The "motivationalMessage" should reference their streak and celebrate progress.
7. Keep responses concise — this is for a dashboard card, not a long essay.`,
});

const adaptiveRecommendationFlow = ai.defineFlow(
    {
        name: 'adaptiveRecommendationFlow',
        inputSchema: AdaptiveRecommendationInputSchema,
        outputSchema: AdaptiveRecommendationOutputSchema,
    },
    async input => {
        const { output } = await prompt(input);
        return output!;
    }
);
