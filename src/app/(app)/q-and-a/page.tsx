'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { Send, Bot, User, Database, Loader2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

// NOTE: We rely on the implicit Next.js Server Action call below.
// The Server Action function signature is defined in src/app/actions/chat-rag.ts
// We use a declaration here to satisfy TypeScript without triggering module conflicts.
declare function ragChat(input: { query: string, history: any[] }): Promise<{ response: string, sources: string[], success?: boolean }>;


interface Message {
  role: 'user' | 'model';
  content: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const contextMessage: Message = useMemo(() => ({
    role: 'model',
    content: "Hello! I'm the AI Legal Assistant. I can only answer questions based on the official COMELEC documents you have uploaded to the Knowledge Base. How can I help you with party-list compliance today?"
  }), []);

  // Scrolls to the bottom of the chat window when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
        // Strict validation and filtering of history messages
        const historyForFlow = newMessages
            .filter(m => m !== contextMessage)
            .map(m => ({ role: m.role, content: m.content || '' }))
            .filter(m => m.content.trim().length > 0);
        
        // Call the RAG Flow using the implicit Server Action call
        const result = await ragChat({ // <-- Next.js finds the action automatically
            query: userMessage.content,
            history: historyForFlow,
        });

        // Process the response and sources
        const modelResponse: Message = { 
            role: 'model', 
            content: result.response + (result.sources && result.sources.length > 0 ? `\n\n[Sources: ${result.sources.join(', ')}]` : '')
        };
        
        setMessages([...newMessages, modelResponse]);

    } catch (error) {
        console.error("Chat API Error:", error);
        setMessages([...newMessages, { role: 'model', content: "Sorry, I encountered a system error while processing your request. The server failed to connect to the AI engine." }]);
    } finally {
        setIsLoading(false);
    }
  };

  const allMessages = [contextMessage, ...messages];

  return (
    <div className="container mx-auto max-w-4xl p-6 h-[80vh] flex flex-col space-y-4">
      <h1 className="text-3xl font-bold tracking-tight">AI Legal Q&A</h1>
      <p className="text-muted-foreground">Ask questions about compliance, filings, and resolutions.</p>

      {/* Chat History Area */}
      <Card className="flex-1 overflow-hidden">
        <CardContent className="h-full p-6 flex flex-col justify-end">
            
          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {allMessages.map((msg, index) => (
              <div key={index} className={`flex items-start ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                
                {msg.role === 'model' && (
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3 text-blue-600">
                        <Bot className="h-4 w-4" />
                    </div>
                )}
                
                <div 
                    className={`max-w-[75%] p-3 rounded-xl shadow-sm ${
                        msg.role === 'user' 
                        ? 'bg-blue-600 text-white rounded-br-none' 
                        : 'bg-gray-100 text-gray-800 rounded-tl-none border'
                    }`}
                >
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                </div>

                {msg.role === 'user' && (
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center ml-3 text-gray-600">
                        <User className="h-4 w-4" />
                    </div>
                )}
              </div>
            ))}
            {isLoading && (
                 <div className="flex items-start justify-start">
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3 text-blue-600">
                        <Bot className="h-4 w-4" />
                    </div>
                    <div className="max-w-[75%] p-3 rounded-xl bg-gray-100 text-gray-800 rounded-tl-none border flex items-center">
                        <Loader2 className="h-4 w-4 mr-2 animate-spin text-blue-500" /> Thinking...
                    </div>
                 </div>
            )}
            <div ref={messagesEndRef} />
          </div>

        </CardContent>
      </Card>

      {/* Input Form */}
      <form onSubmit={handleSendMessage} className="flex gap-3">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your question here (e.g., What is the deadline for filing?)."
          className="flex-1 resize-none"
          rows={1}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              handleSendMessage(e);
            }
          }}
          disabled={isLoading}
        />
        <Button 
            type="submit" 
            className="h-auto px-6 py-3" 
            disabled={!input.trim() || isLoading}
        >
          <Send className="h-5 w-5 mr-2" /> Send
        </Button>
      </form>
      <div className="text-xs text-muted-foreground flex items-center gap-1">
        <Database className="h-3 w-3" /> Powered by Knowledge Base (RAG)
      </div>
    </div>
  );
}