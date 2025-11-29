'use server';

import { genkit, InitializedGenkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
// ✅ FIX 1: Import the getter function from the config file.
import { API_KEY, VECTOR_STORE_CONFIG, getAiInstance } from '@/ai/genkit'; 
import { z } from 'zod';

// Define the signature for the client call
interface ChatRAGInput {
    query: string;
    history: any[];
}

interface ChatRAGOutput {
    response: string;
    sources: string[];
}

// NOTE: The 'ai' instance must be retrieved by calling the exported function.


// ✅ Exporting the function with the name 'ragChat'
export async function ragChat(input: ChatRAGInput): Promise<ChatRAGOutput> { 
    
    // ✅ FIX 2: Call the function to get the initialized AI engine.
    const initializedAi = getAiInstance(); 
    
    // 1. Perform Retrieval (Search the Index)
    try {
        const retrieval = await initializedAi.retrieval({
            query: input.query,
            collection: VECTOR_STORE_CONFIG.collection, 
            config: {
                numDocs: 5,
            }
        });

        const context = retrieval.chunks.map(chunk => chunk.content).join('\n---\n');

        // 2. Construct the RAG Prompt
        const prompt = `
            You are the COMELEC Legal Assistant. Your task is to answer the user's question 
            ONLY using the provided context. If the answer is not found in the context, 
            politely state that the information is unavailable in the current legal documents.
            
            --- CONTEXT ---
            ${context}
            --- END CONTEXT ---
            
            USER QUESTION: ${input.query}
        `;

        // 3. Generate the Response
        const result = await initializedAi.generate({
            model: 'googleai/gemini-2.5-flash',
            prompt: prompt,
            config: {
                history: input.history, 
                temperature: 0.2,
            }
        });

        // 4. Collect the full response text
        return {
            response: result.text,
            sources: retrieval.chunks.map(chunk => chunk.metadata.source)
        };
    } catch (error: any) {
        // Log the failure to the terminal for debugging
        console.error("RAG Chat Failed (Final Attempt Error):", error.message || error);
        
        return {
            response: "Sorry, I encountered a system error while processing your request. The server failed to connect to the AI engine.",
            sources: []
        };
    }
}