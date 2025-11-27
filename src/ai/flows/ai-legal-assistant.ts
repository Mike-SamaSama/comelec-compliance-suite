'use server';
/**
 * @fileOverview An AI Legal Assistant for answering questions about COMELEC rules,
 * now implemented as a Retrieval-Augmented Generation (RAG) system.
 *
 * - askLegalQuestion - A function that handles the legal question answering process.
 * - AskLegalQuestionInput - The input type for the askLegalQuestion function.
 * - AskLegalQuestionOutput - The return type for the askLegalQuestion function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import {
  defineIndexer,
  defineRetriever,
  index,
  retrieve,
} from '@genkit-ai/ai/retriever';
import { textEmbeddingGecko } from '@genkit-ai/google-genai';
import { MemoryVectorStore } from 'genkit/vectors';

// //////////////////////////////////////////////////////////////////////////////
// 1. Data Source & Schema
//    In a real app, this would come from a database or uploaded files.
//    Here, we are hardcoding sample COMELEC rules.
// //////////////////////////////////////////////////////////////////////////////

const COMELEC_RULES = [
  {
    docId: 'rule_101',
    content:
      'Rule 101: Filing of Candidacy. All candidates for national positions must file their certificate of candidacy at the main office of the Commission on Elections in Manila. Candidates for local positions must file in the local COMELEC office of their respective constituency. The filing period is from October 1 to October 8 of the year preceding the election.',
  },
  {
    docId: 'rule_202',
    content:
      'Rule 202: Campaign Finance. All candidates and political parties must submit a full, true, and itemized Statement of Contributions and Expenditures (SOCE) within thirty (30) days after the day of the election. No elected candidate shall enter upon the duties of his office until he has filed the SOCE.',
  },
  {
    docId: 'rule_303',
    content:
      'Rule 303: Prohibited Campaign Materials. It is unlawful to post, display, or distribute any campaign material that is libelous, obscene, or that violates any provision of the Omnibus Election Code. The use of government resources for campaign purposes is strictly prohibited.',
  },
  {
    docId: 'rule_404',
    content:
      'Rule 404: Online Campaigning and Social Media. Official social media pages of candidates must be registered with the COMELEC. All online political advertisements are subject to the same regulations as traditional media. Any form of online campaigning is prohibited on the day before and on the day of the election.',
  },
];

// //////////////////////////////////////////////////////////////////////////////
// 2. Indexer and Retriever Definition
//    - The Indexer is responsible for processing and storing the documents.
//    - The Retriever is responsible for searching the stored documents.
// //////////////////////////////////////////////////////////////////////////////

// We will use an in-memory vector store for simplicity.
const vectorStore = new MemoryVectorStore();

// Define an indexer that uses Google's text embedding model.
const comelecRulesIndexer = defineIndexer(
  {
    name: 'comelec-rules-indexer',
    embedder: textEmbeddingGecko,
    vectorStore,
  },
  async () => {
    // In a real app, you would fetch this data from Firestore or another DB.
    await index({
      indexer: 'comelec-rules-indexer',
      documents: COMELEC_RULES,
    });
  }
);

// Define a retriever to search the indexed documents.
const comelecRulesRetriever = defineRetriever({
  name: 'comelec-rules-retriever',
  retriever: async (input) => {
    // Note: We run the indexer every time for this demo.
    // In a production app, you would run this on a schedule or via a trigger.
    await comelecRulesIndexer();

    const results = await retrieve({
      retriever: {
        embedder: textEmbeddingGecko,
        vectorStore,
      },
      query: input,
      options: { k: 3 }, // Retrieve the top 3 most relevant documents
    });

    return results;
  },
});

// //////////////////////////////////////////////////////////////////////////////
// 3. Input, Output, and Flow Definition
// //////////////////////////////////////////////////////////////////////////////

const AskLegalQuestionInputSchema = z.object({
  question: z.string().describe('The legal question about COMELEC rules.'),
});
export type AskLegalQuestionInput = z.infer<typeof AskLegalQuestionInputSchema>;

const AskLegalQuestionOutputSchema = z.object({
  answer: z.string().describe('The AI-generated answer to the legal question.'),
});
export type AskLegalQuestionOutput = z.infer<typeof AskLegalQuestionOutputSchema>;

export async function askLegalQuestion(
  input: AskLegalQuestionInput
): Promise<AskLegalQuestionOutput> {
  return askLegalQuestionFlow(input);
}

// Define the main prompt for the RAG system.
const ragPrompt = ai.definePrompt({
  name: 'askLegalQuestionPrompt',
  input: {
    schema: z.object({
      question: z.string(),
      context: z.array(z.string()),
    }),
  },
  output: { schema: AskLegalQuestionOutputSchema },
  prompt: `You are an AI Legal Assistant specializing in COMELEC (Commission on Elections) rules and regulations in the Philippines.

  Your task is to answer the user's question based *only* on the provided context. If the context does not contain the answer, you must state that you cannot answer based on the information provided. Do not use any outside knowledge.

  CONTEXT:
  {{#each context}}
  - {{{this}}}
  {{/each}}

  QUESTION:
  {{{question}}}

  Please provide a clear and concise answer based strictly on the context above.`,
});


// Define the full RAG flow.
const askLegalQuestionFlow = ai.defineFlow(
  {
    name: 'askLegalQuestionFlow',
    inputSchema: AskLegalQuestionInputSchema,
    outputSchema: AskLegal-QuestionOutputSchema,
  },
  async (input) => {
    // 1. Retrieve relevant context from the vector store.
    const context = await comelecRulesRetriever(input.question);

    // 2. Generate the answer using the retrieved context.
    const { output } = await ragPrompt({
      question: input.question,
      context: context.map((c) => c.content),
    });

    return output!;
  }
);
