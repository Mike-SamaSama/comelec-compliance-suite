import { genkit, InitializedGenkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

// --- Configuration Constants ---
export const VECTOR_STORE_CONFIG = {
  type: 'basic', 
  embeddingModel: 'googleai/text-embedding-004', 
  collection: 'knowledge_base_index', 
};

export const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error("GEMINI_API_KEY is missing from .env file");
}
// --------------------------------


// --- FINAL FIX: Global Module Cache Pattern ---
// This relies on Node.js module caching to ensure this block runs only one time per server process.

const globalWithGenkit = global as typeof globalThis & {
  __genkitInstance?: InitializedGenkit;
};

// Use an existing instance if available (this prevents the core crash)
let ai = globalWithGenkit.__genkitInstance;

if (!ai) {
    // Initialize core AI engine only if it doesn't exist
    ai = genkit({
        plugins: [
            googleAI({ 
                apiKey: API_KEY,
            }),
        ],
        model: 'googleai/gemini-2.5-flash', 
    });

    // Force RAG configuration immediately after initialization
    ai.configure({
        vectorStore: VECTOR_STORE_STORE_CONFIG, // Use the configured vector store
    });
    
    // Cache the instance for future module imports
    globalWithGenkit.__genkitInstance = ai;
}

// Export the initialized instance for use in actions/flows
export const getAiInstance = () => ai; 
export { ai }; // Export the object directly for convenience