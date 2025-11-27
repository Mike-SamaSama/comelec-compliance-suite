import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, FileText } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function DocumentsPage() {
  return (
    <div className="space-y-8">
       <div className="flex items-center justify-between">
         <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold font-headline">Document Repository</h1>
            <p className="text-lg text-muted-foreground">
              Manage your organization's compliance documents.
            </p>
        </div>
        <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Upload Document
        </Button>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>All Documents</CardTitle>
            <CardDescription>A list of all documents uploaded by your organization.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Document Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Uploaded By</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead><span className="sr-only">Actions</span></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow>
                        <TableCell className="font-medium flex items-center gap-2"><FileText className="h-4 w-4 text-muted-foreground"/> Statement of Contributions.pdf</TableCell>
                        <TableCell>PDF</TableCell>
                        <TableCell>Juan Dela Cruz</TableCell>
                        <TableCell>2024-05-15</TableCell>
                        <TableCell className="text-right">
                           <Button variant="ghost" size="icon">...</Button>
                        </TableCell>
                    </TableRow>
                     <TableRow>
                        <TableCell className="font-medium flex items-center gap-2"><FileText className="h-4 w-4 text-muted-foreground"/> Campaign Finance Report.docx</TableCell>
                        <TableCell>DOCX</TableCell>
                        <TableCell>Maria Clara</TableCell>
                        <TableCell>2024-05-12</TableCell>
                        <TableCell className="text-right">
                           <Button variant="ghost" size="icon">...</Button>
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}
