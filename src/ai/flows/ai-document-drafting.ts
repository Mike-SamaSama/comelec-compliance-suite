'use server';
/**
 * @fileOverview An AI-powered document drafting flow.
 *
 * - aiDocumentDrafting - A function that handles the document drafting process.
 * - AIDocumentDraftingInput - The input type for the aiDocumentDrafting function.
 * - AIDocumentDraftingOutput - The return type for the aiDocumentDrafting function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIDocumentDraftingInputSchema = z.object({
  templateName: z.string().describe('The name of the document template to use.'),
  formData: z.record(z.string()).describe('A key-value object containing the form data to populate the template.'),
});
export type AIDocumentDraftingInput = z.infer<typeof AIDocumentDraftingInputSchema>;

const AIDocumentDraftingOutputSchema = z.object({
  draftedDocument: z.string().describe('The generated legal document.'),
});
export type AIDocumentDraftingOutput = z.infer<typeof AIDocumentDraftingOutputSchema>;

export async function aiDocumentDrafting(input: AIDocumentDraftingInput): Promise<AIDocumentDraftingOutput> {
  return aiDocumentDraftingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiDocumentDraftingPrompt',
  input: {schema: AIDocumentDraftingInputSchema},
  output: {schema: AIDocumentDraftingOutputSchema},
  prompt: `You are an AI-powered legal document drafting assistant.

  Your task is to generate a legal document based on a provided template and form data.

  Template Name: {{{templateName}}}
  Form Data: {{#each formData}}{{{@key}}}: {{{this}}}
  {{/each}}

  Please generate the completed legal document, populating the template with the provided form data.
  Make sure to follow the legal guidelines and standards of the Philippines.
  `, // Ensure compliance with the Philippines Data Privacy Act of 2012 (RA 10173)
});

const aiDocumentDraftingFlow = ai.defineFlow(
  {
    name: 'aiDocumentDraftingFlow',
    inputSchema: AIDocumentDraftingInputSchema,
    outputSchema: AIDocumentDraftingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
