
'use server';

/**
 * @fileOverview Provides AI-powered feedback on project submissions.
 *
 * - projectSubmissionFeedback - A function that handles the feedback process.
 * - ProjectSubmissionFeedbackInput - The input type for the projectSubmissionFeedback function.
 * - ProjectSubmissionFeedbackOutput - The return type for the projectsubmissionfeedback function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ProjectSubmissionFeedbackInputSchema = z.object({
  projectTitle: z.string().describe('The title of the project being submitted.'),
  userCode: z.string().describe('The code submitted by the user.'),
  solutionCode: z.string().describe('The official solution code for the project.'),
});
export type ProjectSubmissionFeedbackInput = z.infer<typeof ProjectSubmissionFeedbackInputSchema>;

const ProjectSubmissionFeedbackOutputSchema = z.object({
  isCorrect: z.boolean().describe("Whether the user's code is functionally equivalent to the solution."),
  positiveFeedback: z.string().describe("Specific, encouraging feedback on what the user did well. Be positive and highlight their strengths."),
  areasForImprovement: z.string().describe("Constructive feedback on what could be improved. If the code is incorrect, explain the errors clearly and gently. If the code is correct, suggest alternative approaches or best practices."),
  keyTakeaways: z.array(z.string()).describe("A bulleted list summarizing the 2-3 most important points from the feedback. Focus on the most critical corrections or concepts the user should focus on."),
  suggestedSolution: z.string().describe("A clean, corrected version of the user's code if it was incorrect, or a slightly improved/alternative version if it was correct. This should be just the code, without explanation."),
});
export type ProjectSubmissionFeedbackOutput = z.infer<typeof ProjectSubmissionFeedbackOutputSchema>;

export async function projectSubmissionFeedback(input: ProjectSubmissionFeedbackInput): Promise<ProjectSubmissionFeedbackOutput> {
  return projectSubmissionFeedbackFlow(input);
}

const prompt = ai.definePrompt({
  name: 'projectSubmissionFeedbackPrompt',
  model: 'googleai/gemini-1.5-flash-latest',
  input: { schema: ProjectSubmissionFeedbackInputSchema },
  output: { schema: ProjectSubmissionFeedbackOutputSchema },
  prompt: `You are an expert, friendly, and encouraging code reviewer for a machine learning education platform. Your task is to provide a detailed, structured, and constructive evaluation of a user's project submission against the official solution.

Project: {{{projectTitle}}}

Official Solution Code:
\`\`\`python
{{{solutionCode}}}
\`\`\`

User's Submitted Code:
\`\`\`python
{{{userCode}}}
\`\`\`

Please perform the following steps and structure your output according to the schema:

1.  **Analyze Functionality**: First, determine if the user's code is functionally correct. Does it achieve the same result as the solution, even if the implementation is different? Minor style differences are acceptable.

2.  **Set 'isCorrect'**: Set this to \`true\` if the code is a valid, working solution. Otherwise, set it to \`false\`.

3.  **Write 'positiveFeedback'**: Start with an encouraging sentence. If the code is correct, highlight what they did well (e.g., "Great use of list comprehensions!"). If incorrect, find something positive to say (e.g., "You've got the data loading part right, which is a great start!").

4.  **Write 'areasForImprovement'**:
    *   **If the code is correct:** Offer a small suggestion for a best practice or an alternative, more Pythonic way they could have approached it. Compare their method to the official solution if it's different and a/docs/backend.jsonucational.
    *   **If the code is incorrect:** Clearly but gently state that the solution isn't quite right. Pinpoint the specific error(s). Explain *why* it's an error (e.g., "This line causes a \`NameError\` because the variable was not defined," or "The logic here doesn't correctly handle edge cases like..."). Provide a clear, actionable suggestion on how to fix it.
    
5.  **Write 'keyTakeaways'**: Generate 2 or 3 bullet points that are the most important takeaways from the feedback. This should be a high-level summary of the most critical corrections or concepts the user should focus on.

6. **Write 'suggestedSolution'**:
    *  **If the code is incorrect:** Provide the corrected version of their code.
    *  **If the code is correct:** You can provide a slightly refactored version or an alternative implementation based on your feedback. This should be only the code block.
`,
});

const projectSubmissionFeedbackFlow = ai.defineFlow(
  {
    name: 'projectSubmissionFeedbackFlow',
    inputSchema: ProjectSubmissionFeedbackInputSchema,
    outputSchema: ProjectSubmissionFeedbackOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
