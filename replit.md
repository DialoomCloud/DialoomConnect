# Dialoom - Social Media Portfolio Platform

## Overview
Dialoom is a full-stack web application designed to empower users to create professional portfolios showcasing their multimedia content. The platform aims to unify and present a user's social media presence in a polished interface, enabling face-to-face interaction with admired individuals. It integrates video calling, advanced scheduling, and a robust payment system, positioned as a comprehensive solution for creators and professionals to monetize their expertise and connect with an audience.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture
The application adopts a monorepo structure, separating client, server, and shared components.

**Core Technologies:**
-   **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui (built on Radix UI)
-   **Backend**: Express.js, TypeScript, RESTful API
-   **Database**: PostgreSQL with Drizzle ORM
-   **Authentication**: Replit Auth, Passport.js, session management
-   **Payment Processing**: Stripe with Connect for host payouts
-   **Video Calling**: Agora.io
-   **Email Service**: Resend

**Key Architectural Decisions & Features:**
-   **Monorepo Structure**: Facilitates clear separation and shared components across frontend and backend.
-   **Component-Based UI**: Utilizes shadcn/ui and Radix UI for accessible, responsive, and consistent design.
-   **Server State Management**: Employs TanStack Query for efficient data fetching, caching, and optimistic updates.
-   **Object Storage Integration**: Comprehensive per-user folder structure within Replit Object Storage (`public/` and `private/` directories) for multimedia content and private documents. Files are served via a dedicated `/storage/*` route.
-   **Dynamic Content Management**: Supports multimedia uploads (videos, images) with processing (Sharp) and YouTube embedding.
-   **Comprehensive Profile Management**: Enables detailed user profiles including professional categories, skills, languages, and contact information.
-   **Advanced Scheduling & Pricing**: Implements flexible scheduling (recurring and specific dates) and customizable pricing tiers with service add-ons.
-   **Admin Panel**: Provides configuration management for commission rates, service pricing, user verification, and GDPR compliance features.
-   **Authentication & Authorization**: Unified Replit Auth for both users and admin, with role-based access control.
-   **GDPR Compliance**: Includes features for data export, deletion requests, and field privacy controls.
-   **Email Notifications**: Utilizes Resend for transactional emails (welcome, booking confirmations, messages).
-   **SEO & Marketing**: Conversion-focused landing page redesign with structured content, social proof, and multilingual support.
-   **Translation System**: Complete i18n implementation with comprehensive translation files (Spanish, English, Catalan) covering all application features and components.

## External Dependencies
-   **Database**: Neon PostgreSQL (serverless with connection pooling)
-   **Authentication**: Replit Auth service
-   **Payment Gateway**: Stripe (for payment processing, webhooks, and Stripe Connect for host payouts)
-   **Video Calling**: Agora.io (for real-time video communication)
-   **Email Service**: Resend (for transactional emails)
-   **UI Libraries**: Radix UI (primitives for accessible components), shadcn/ui (component library)
-   **Validation**: Zod (runtime type checking)
-   **Date Handling**: date-fns
-   **Image/Video Processing**: Sharp (for image compression and video thumbnail generation), Multer (for file uploads)