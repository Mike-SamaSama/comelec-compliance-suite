"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { CornerDownLeft, Bot, User, Loader } from "lucide-react";

import { askLegalQuestion, AskLegalQuestionOutput } from "@/ai/flows/ai-legal-assistant";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const initialMessage: Message = {
    role: "assistant",
    content: "I am an AI Legal Assistant specializing in COMELEC rules. How can I help you today?",
};

async function askQuestionAction(
  state: { messages: Message[] },
  formData: FormData
): Promise<{ messages: Message[] }> {
  const question = formData.get("question") as string;
  if (!question) return state;

  const newMessages: Message[] = [...state.messages, { role: "user", content: question }];

  try {
    const result: AskLegalQuestionOutput = await askLegalQuestion({ question });
    return {
      messages: [...newMessages, { role: "assistant", content: result.answer }],
    };
  } catch (error) {
    console.error(error);
    return {
      messages: [...newMessages, { role: "assistant", content: "Sorry, I encountered an error. Please try again." }],
    };
  }
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button size="icon" type="submit" disabled={pending} className="absolute w-8 h-8 top-3 right-3">
      {pending ? <Loader className="h-4 w-4 animate-spin" /> : <CornerDownLeft className="h-4 w-4" />}
    </Button>
  );
}


export function AiAssistantChat() {
  const [state, formAction] = useFormState(askQuestionAction, {
    messages: [initialMessage],
  });
  const [question, setQuestion] = useState("");

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!question.trim()) return;
    
    const formData = new FormData(event.currentTarget);
    formAction(formData);
    setQuestion("");
  };

  return (
    <Card className="h-full flex flex-col">
        <CardContent className="flex-1 flex flex-col p-0">
          <ScrollArea className="flex-1 p-4 md:p-6">
            <div className="space-y-6">
              {state.messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex items-start gap-4",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {message.role === "assistant" && (
                    <Avatar className="w-8 h-8 border">
                       <AvatarFallback><Bot className="h-4 w-4" /></AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      "max-w-xl rounded-lg px-4 py-3 text-sm",
                       message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                   {message.role === "user" && (
                    <Avatar className="w-8 h-8 border">
                       <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="border-t bg-background p-4">
             <form onSubmit={handleFormSubmit} className="relative">
              <Textarea
                name="question"
                placeholder="Type your legal question here..."
                className="min-h-[48px] rounded-2xl resize-none p-4 pr-16"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        e.currentTarget.form?.requestSubmit();
                    }
                }}
              />
              <SubmitButton />
            </form>
          </div>
        </CardContent>
    </Card>
  );
}
