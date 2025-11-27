import { AiAssistantChat } from "@/components/ai/ai-assistant-chat";

export default function AiAssistantPage() {
  return (
    <div className="h-[calc(100vh-10rem)] flex flex-col space-y-8">
       <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold font-headline">AI Legal Assistant</h1>
            <p className="text-lg text-muted-foreground">
              Ask legal questions about COMELEC rules and receive AI-driven guidance.
            </p>
        </div>
      
      <div className="flex-1 min-h-0">
        <AiAssistantChat />
      </div>
    </div>
  );
}
