import { Gavel } from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPolicyPage() {
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
            <h1 className="text-4xl font-bold font-headline mb-4">Privacy Policy</h1>
            <p className="text-muted-foreground mb-8">Last updated: [Date]</p>

            <div className="space-y-6 prose prose-lg max-w-none">
              <p>
                Welcome to the COMELEC Compliance Suite. We are committed to protecting your privacy and handling your data in an open and transparent manner. This privacy policy sets out how we collect, use, and protect any information that you give us when you use this application, in compliance with the Philippines Data Privacy Act of 2012 (RA 10173).
              </p>

              <h2 className="text-2xl font-bold font-headline">1. Information We Collect</h2>
              <p>
                We may collect the following information:
              </p>
              <ul>
                <li>Your name and contact information, including email address.</li>
                <li>Information related to your organization.</li>
                <li>Documents and data you upload for compliance purposes.</li>
                <li>Usage data and logs for security and service improvement.</li>
              </ul>

              <h2 className="text-2xl font-bold font-headline">2. How We Use Your Information</h2>
              <p>
                We require this information to provide you with our services, and in particular for the following reasons:
              </p>
              <ul>
                <li>To create and manage your account and your organization's tenant space.</li>
                <li>To provide the core services of the platform, including document management and AI assistance.</li>
                <li>For internal record keeping and to comply with legal obligations.</li>
                <li>To improve our products and services.</li>
              </ul>

              <h2 className="text-2xl font-bold font-headline">3. Data Security and Isolation</h2>
              <p>
                We are committed to ensuring that your information is secure. We operate on a strict multi-tenant model. All data and resources belonging to your organization are completely isolated within their own secure data partition. There is no cross-tenant data access.
              </p>
              
              <h2 className="text-2xl font-bold font-headline">4. Your Rights</h2>
              <p>
                 As a data subject under RA 10173, you have the right to be informed, to object, to access, to rectify, to erasure or blocking, to data portability, to file a complaint, and to be indemnified. To exercise these rights, please contact us.
              </p>
              
              <h2 className="text-2xl font-bold font-headline">5. Changes to This Policy</h2>
              <p>
                We may change this policy from time to time by updating this page. You should check this page from time to time to ensure that you are happy with any changes.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
