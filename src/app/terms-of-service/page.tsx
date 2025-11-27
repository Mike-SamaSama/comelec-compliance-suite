import { Gavel } from 'lucide-react';
import Link from 'next/link';

export default function TermsOfServicePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b">
         <Link href="/" className="flex items-center justify-center gap-2" prefetch={false}>
          <Gavel className="h-6 w-6 text-primary" />
          <span className="text-lg font-semibold font-headline">COMELEC Compliance Suite</span>
        </Link>
      </header>
      <main className="flex-1">
        <div className="container mx-auto px-4 md:px-6 py-12 md:py-24 lg:py-32">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold font-headline mb-4">Terms of Service</h1>
            <p className="text-muted-foreground mb-8">Last updated: [Date]</p>

            <div className="space-y-6 prose prose-lg max-w-none">
              <p>
                Please read these Terms of Service ("Terms", "Terms of Service") carefully before using the COMELEC Compliance Suite (the "Service") operated by us.
              </p>

              <h2 className="text-2xl font-bold font-headline">1. Accounts</h2>
              <p>
                When you create an account with us, you must provide us with information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.
              </p>

              <h2 className="text-2xl font-bold font-headline">2. Tenant Responsibilities</h2>
              <p>
                You are responsible for the management of your organization's tenant space, including inviting and managing users. The user who creates the organization is designated as the initial Tenant Administrator and is responsible for all activity that occurs under that organization.
              </p>
              
              <h2 className="text-2xl font-bold font-headline">3. Intellectual Property</h2>
              <p>
                The Service and its original content (excluding Content provided by users), features, and functionality are and will remain the exclusive property of the Service operator.
              </p>

              <h2 className="text-2xl font-bold font-headline">4. Termination</h2>
              <p>
                We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
              </p>
              
              <h2 className="text-2xl font-bold font-headline">5. Limitation Of Liability</h2>
              <p>
                In no event shall our team, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
