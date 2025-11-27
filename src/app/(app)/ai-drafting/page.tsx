import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileJson } from "lucide-react";

export default function AiDraftingPage() {
  return (
    <div className="space-y-8">
       <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold font-headline">AI Document Drafting</h1>
            <p className="text-lg text-muted-foreground">
              Generate legal documents from templates using a simple form.
            </p>
        </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Draft a New Document</CardTitle>
          <CardDescription>Select a template to begin drafting your document.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <FileJson className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">Document Drafting Feature</h3>
            <p className="mt-1 text-sm text-gray-500">
              This area will contain the form to generate documents.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
