'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  Trash2, 
  RefreshCw, 
  ArrowLeft,
  AlertCircle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
// This imports the backend engine for reading PDFs
import { processDocument } from '@/app/actions/process-document'; 

const initialDocs = [
  { id: 1, name: 'COMELEC Resolution 10999.pdf', type: 'PDF', size: '2.4 MB', status: 'indexed', date: '2023-10-24' },
];

export default function KnowledgeBasePage() {
  const [docs, setDocs] = useState(initialDocs);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const result = await processDocument(formData);

      if (result.success) {
        const newDoc = {
          id: Date.now(),
          name: file.name,
          type: file.name.split('.').pop()?.toUpperCase() || 'FILE',
          size: (file.size / 1024 / 1024).toFixed(1) + ' MB',
          status: 'indexed',
          date: new Date().toISOString().split('T')[0]
        };
        setDocs([newDoc, ...docs]);
        alert(`Success! Read ${result.charCount} characters from PDF.`);
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (error) {
      console.error(error);
      alert('Upload failed.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'indexed':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100"><CheckCircle2 className="mr-1 h-3 w-3" /> Indexed</Badge>;
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 animate-pulse"><RefreshCw className="mr-1 h-3 w-3 animate-spin" /> Processing</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100"><AlertCircle className="mr-1 h-3 w-3" /> Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto max-w-6xl p-6 space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/admin">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Knowledge Base Manager</h1>
          <p className="text-muted-foreground">Upload source documents for the AI.</p>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-1">
          <Card className="h-full border-dashed border-2 hover:border-blue-400 transition-colors">
            <CardHeader><CardTitle>Upload Source Material</CardTitle></CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-10 text-center space-y-4">
              <div className="p-4 bg-gray-50 rounded-full"><UploadCloud className="h-10 w-10 text-gray-400" /></div>
              <div className="space-y-1">
                <p className="font-medium text-gray-900">Click to upload PDF</p>
                <p className="text-sm text-gray-500">Max 10MB</p>
              </div>
              <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileSelect} accept=".pdf,.txt" />
              <Button className="w-full" disabled={isUploading} onClick={() => fileInputRef.current?.click()}>
                {isUploading ? 'Processing...' : 'Select Files'}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card>
            <CardHeader><CardTitle>Indexed Documents</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                {docs.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg bg-white hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-gray-100 rounded"><FileText className="h-5 w-5 text-gray-600" /></div>
                      <div>
                        <p className="font-medium text-sm">{doc.name}</p>
                        <p className="text-xs text-gray-500">{doc.size} • {doc.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {getStatusBadge(doc.status)}
                      <Button variant="ghost" size="icon" className="text-gray-400 hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}