'use server';

/**
 * @fileOverview An AI Legal Assistant for answering questions about COMELEC rules.
 *
 * - askLegalQuestion - A function that handles the legal question answering process.
 * - AskLegalQuestionInput - The input type for the askLegalQuestion function.
 * - AskLegalQuestionOutput - The return type for the askLegalQuestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AskLegalQuestionInputSchema = z.object({
  question: z.string().describe('The legal question about COMELEC rules.'),
});
export type AskLegalQuestionInput = z.infer<typeof AskLegalQuestionInputSchema>;

const AskLegalQuestionOutputSchema = z.object({
  answer: z.string().describe('The AI-generated answer to the legal question.'),
});
export type AskLegalQuestionOutput = z.infer<typeof AskLegalQuestionOutputSchema>;

export async function askLegalQuestion(input: AskLegalQuestionInput): Promise<AskLegalQuestionOutput> {
  return askLegalQuestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'askLegalQuestionPrompt',
  input: {schema: AskLegalQuestionInputSchema},
  output: {schema: AskLegalQuestionOutputSchema},
  prompt: `You are an AI Legal Assistant specializing in COMELEC (Commission on Elections) rules and regulations in the Philippines. Answer the following legal question to the best of your ability, providing accurate and helpful information. If you are unsure, state that you are unsure. Be as comprehensive as possible.\n\nQuestion: {{{question}}}`,
});

const askLegalQuestionFlow = ai.defineFlow(
  {
    name: 'askLegalQuestionFlow',
    inputSchema: AskLegalQuestionInputSchema,
    outputSchema: AskLegalQuestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
