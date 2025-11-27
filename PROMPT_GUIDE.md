# Master Plan: The COMELEC Compliance Suite (SaaS Edition)

This document is the complete and authoritative characterization of the project you are building.

**1. Project Vision & Purpose**

The **COMELEC Compliance Suite** is a multi-tenant Software-as-a-Service (SaaS) platform designed to streamline and simplify the complex process of compliance for political parties and organizations dealing with the Philippines' Commission on Elections (COMELEC). The entire platform must operate in full compliance with the Philippines Data Privacy Act of 2012 (RA 10173).

**2. Technical Foundation**

The application is built on a modern, robust technical stack:
*   **Frontend & Backend:** Next.js (App Router)
*   **Database & Authentication:** Firebase (Firestore & Firebase Authentication)
*   **AI Capabilities:** Google's Genkit
*   **UI Components & Styling:** ShadCN UI and Tailwind CSS

**3. Core Architecture: Multi-Tenancy & Data Isolation**

The platform is built on a strict multi-tenant model where each organization is a **Tenant**. All data and resources belonging to a tenant are completely isolated within their own secure data partition in Firestore (e.g., under `/organizations/{organizationId}/...`). There is no cross-tenant data access for any user role except the Platform Administrator.

**4. User Roles & Permissions Hierarchy**

The platform features a three-tier role hierarchy to ensure security and proper separation of duties:

*   **A. Platform Administrator (Global Admin):**
    *   **Scope:** Global. Has oversight of the entire SaaS platform.
    *   **Responsibilities:** Manages the platform itself, not the internal affairs of tenants. Has exclusive write-access to global resources shared across all tenants (Master Checklist, Document Templates, etc.).
    *   **Authorization Source:** Role is granted by the existence of a user's document in the root-level `/platform_admins/{userId}` collection. **Granting this role is a secure, backend process, typically handled by a developer tool or manually in the Firebase console.**

*   **B. Tenant Administrator (Organization Admin):**
    *   **Scope:** Local. Limited to a single tenant organization.
    *   **Responsibilities:** Manages their own organization's profile, settings, and users. Can invite new members to their organization and manage their roles *within that tenant*.
    *   **Authorization Source:** Role is determined by an `isAdmin: true` flag within the user's document located inside the tenant's data scope (e.g., `/organizations/{organizationId}/users/{userId}`).

*   **C. Tenant Member:**
    *   **Scope:** Local and Personal. The most restricted role.
    *   **Responsibilities:** Focuses on managing their own assigned compliance tasks, uploading documents, and using the platform's AI tools.
    *   **Authorization Source:** Standard user without an `isAdmin` flag within their tenant's user list.

**5. Onboarding & User Flow**

*   **Tenant Creation:** A new user can register their organization through the public sign-up flow. This process creates the new tenant space and designates the signing user as the first **Tenant Admin** for that organization *only*. **The public sign-up flow can never grant Platform Admin privileges.**
*   **User Invitation:** Tenant Admins can invite new members to join their specific organization.
*   **Consent:** All users, upon signing up, must provide explicit, logged consent to the platform's Privacy Policy and Terms of Service.

**6. Core Features by Role**

*   **For All Tenant Users (Admins & Members):**
    *   **Personalized Dashboard:** An overview of compliance status, pending tasks, and upcoming deadlines.
    *   **Secure Document Management:** Upload, view, and manage compliance documents.
    *   **AI-Powered Document Drafting:** Generate legal documents from templates using a simple form.
    *   **AI Legal Assistant (Q&A):** An interactive chat interface for legal questions about COMELEC rules.
    *   **Organization Profile Management:** View and contribute to the shared organizational profile.

*   **For Tenant Admins:**
    *   **User Management:** View, invite, and manage roles for users *within their own organization*.
    *   **Organization Profile Editing:** Edit the shared details of their organization.

*   **For Platform Administrators:**
    *   **Global Dashboard:** View all tenant organizations on the platform.
    *   **Master Checklist Management:** Create and maintain the master list of required submission items for all tenants.
    *   **Document Template Management:** Manage the templates used by the AI Document Drafting feature.
    *   **Compliance Deadline Management:** Manage the global compliance calendar.

**7. Guiding Principles for Development**

*   **Security First:** Adherence to the principle of least privilege, enforced by Firestore Security Rules and a defensive UI.
*   **Schema Adherence:** All data operations must strictly conform to the schemas defined in `docs/backend.json`.
*   **Flow-Based AI:** All AI interactions must be encapsulated within dedicated Genkit flows. Direct calls to AI models from UI components are forbidden.
*   **UI/UX Consistency:** The UI will be built with reusable ShadCN components, styled with a central theme (`globals.css`), and use `lucide-react` for all iconography.
*   **Robust Error Handling:** The application will use Next.js error boundaries, a custom `FirestorePermissionError` class, and a central `useToast` system for notifications.
*   **Performance:** Optimize image loading with `next/image` and memoize database queries where appropriate to reduce costs and improve speed.

---
**8. Implementation Strategy for Firebase Studio**

To ensure a successful and manageable build process, the project should be implemented in logical phases. The following is the recommended order of operations. Use the prompts provided for each phase to guide Firebase Studio.

**Phase 1: Foundational Data Structure & Security (The Most Critical Step)**
This phase re-architects the core data model and security rules to support multi-tenancy. This must be done first.

*   **Objective:** Update `docs/backend.json` and `firestore.rules` to reflect the new multi-tenant architecture with tenant data isolation and the two-tier admin structure.
*   **Example Prompt:** *"Using the Master Plan, please begin by implementing **Phase 1: Foundational Data Structure & Security**. Refactor `docs/backend.json` and `firestore.rules` to create the new multi-tenant data model. Ensure strict tenant isolation and define rules for both Platform Admins and Tenant Admins."*

**Phase 2: Tenant Onboarding and Robust Authentication**
With the new data structure in place, this phase builds the public-facing entry point for new organizations, ensuring the authentication flow is robust and free of race conditions.

*   **Objective:** Create the new tenant sign-up flow, including the ability to create an organization and the mandatory consent mechanism for the Privacy Policy. Implement the core authentication logic according to best practices to prevent redirect loops.
*   **Example Prompt:** *"Now, let's implement **Phase 2: Tenant Onboarding and Robust Authentication**. Based on the new data model, create the sign-up page where a user can register their organization and become the first Tenant Admin. Implement the login page and mandatory privacy consent checkbox. Create the static `/privacy-policy` and `/terms-of-service` pages.
>
> The authentication flow must follow these critical architectural patterns to prevent redirect loops and race conditions:
>
> 1.  **Centralized Auth Provider (`<AuthProvider>`):** Create a single, client-side `AuthProvider` that wraps the root layout. It must manage a `loading` state, and while `loading` is true, it must render a full-page loading UI to prevent the app from rendering prematurely.
>
> 2.  **Server Actions for Authentication:** Use Next.js Server Actions for sign-in and sign-up. Upon success, use the `redirect()` function from `next/navigation` to navigate to the dashboard.
>
> 3.  **Protected Layout (`/app/(app)/layout.tsx`):** This layout must **NOT** contain any `useEffect` hooks for redirection. It should simply render children if `loading` is `false` and a `user` is present, or redirect if not."*

**Phase 3: Core Application Logic Refactoring**
This phase updates the existing application pages to become tenant-aware.

*   **Objective:** Refactor all pages (`Dashboard`, `Documents`, `AI Drafting`, etc.) to fetch and display data based on the logged-in user's `organizationId`.
*   **Example Prompt:** *"It's time for **Phase 3: Core Application Logic Refactoring**. Please update all application pages to be tenant-aware. All Firestore queries must now be scoped to the current user's organization. Ensure the app feels like a private workspace for the logged-in user's organization."*

**Phase 4: Tenant Admin Functionality**
This phase builds the tools for Tenant Admins to manage their own organization.

*   **Objective:** Implement the user management features for Tenant Admins, including inviting new users to their organization.
*   **Example Prompt:** *"Let's build the tools for Tenant Admins in **Phase 4**. Update the 'User Management' page so that a Tenant Admin can see and manage only the users within their own organization. Implement the user invitation flow."*

**Phase 5: Platform Admin Functionality**
This phase is to build the global oversight tools for the platform owner.

*   **Objective:** Create the global dashboard and management pages for Platform Admins.
*   **Example Prompt:** *"Next, please implement **Phase 5: Platform Admin Functionality**. Create the global dashboard that lists all tenant organizations. Ensure the pages for managing the Master Checklist, Document Templates, and Deadlines are now exclusively accessible to Platform Admins and that their changes apply globally."*

**Phase 6: AI Legal Assistant (RAG Implementation)**
This phase upgrades the AI Legal Assistant from a simple Q&A bot to a powerful RAG system.

*   **Objective:** Re-implement the AI Legal Assistant using a Retrieval-Augmented Generation architecture. This will involve setting up a vector database (like Vertex AI Search), creating a pipeline to embed documents into the vector store, and updating the Genkit flow to perform a similarity search to retrieve relevant context before generating an answer.
*   **Example Prompt:** *"Let's upgrade the AI Legal Assistant in **Phase 6**. Convert the `askLegalQuestionFlow` into a full RAG system. Set up the necessary infrastructure, including a Genkit tool to query a vector database like Vertex AI Search. The flow should now be able to answer questions based on the specific documents you provide it."*
