# Dialoom - Plataforma de Videollamadas con Expertos

## Overview
Dialoom is a comprehensive multilingual web application designed as a professional video call booking marketplace. It facilitates user profile management, multimedia content sharing, and integrates a fully functional video calling system. Key capabilities include Stripe payment integration, content management with a visual email template editor, a complete news/article system, YouTube video integration, conversion-optimized marketing landing pages, AI-powered intelligent host search using natural language processing, comprehensive social media integration, and a fully integrated AI assistant called "Loomia" that enhances user profiles and provides intelligent suggestions. The project aims to provide a robust platform for connecting users with experts via video calls, supporting a global audience with multilingual capabilities.

## User Preferences
Preferred communication style: Simple, everyday language (non-technical users).

## System Architecture
The application adopts a monorepo structure, separating client, server, and shared components, utilizing a modern web stack for scalability and maintainability.

**Core Technologies:**
-   **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui (built on Radix UI)
-   **Backend**: Express.js, TypeScript, RESTful API
-   **Database**: PostgreSQL with Drizzle ORM
-   **Authentication**: Replit Auth (OpenID Connect), Passport.js
-   **Payment Processing**: Stripe with Connect for host payouts
-   **Video Calling**: Agora.io with React SDK
-   **Email Service**: Resend
-   **AI Integration**: OpenAI GPT-4o
-   **File Storage**: Replit Object Storage
-   **Internationalization**: i18next with React integration (ES/EN/CA)
-   **Data Visualization**: Recharts for interactive analytics dashboards

**Key Architectural Decisions & Features:**
-   **Monorepo Structure**: Enables clear separation and shared components across frontend and backend.
-   **Component-Based UI**: Leverages shadcn/ui and Radix UI for accessible, responsive, and consistent design, prioritizing a mobile-first approach.
-   **Server State Management**: Employs TanStack Query for efficient data fetching, caching, and optimistic updates.
-   **Object Storage Integration**: Public assets served via `/storage/*` routes with automatic fallback to local filesystem. Includes per-user folder structure for multimedia and private documents.
-   **Dynamic Content Management**: Supports multimedia uploads (videos, images) with processing and YouTube embedding.
-   **Comprehensive Profile Management**: Enables detailed user profiles including professional categories, skills, languages, and contact information. Includes AI-powered analysis for suggesting professional categories and skills.
-   **Advanced Scheduling & Pricing**: Implements flexible scheduling and customizable pricing tiers with service add-ons.
-   **Enhanced Admin Panel**: Comprehensive dashboard with interactive analytics using Recharts, session management with calendar/list views, financial tracking with transaction history and host payouts, real-time metrics, and operational insights for commission rates, service pricing, user verification, and GDPR compliance.
-   **Authentication & Authorization**: Unified Replit Auth for both users and admin, with role-based access control and protected routes, and conditional navigation.
-   **AI-Powered Search**: Intelligent host search using OpenAI for semantic understanding and natural language queries, providing relevance scoring.
-   **GDPR Compliance**: Includes features for data export, deletion requests, and field privacy controls.
-   **Email Notifications**: Utilizes Resend for transactional emails.
-   **SEO & Marketing**: Conversion-focused landing page design with structured content, social proof, and multilingual support.
-   **Translation System**: Complete i18n implementation across all application features and components.
-   **Social Media Integration**: Comprehensive support for 10 major social platforms with user profile linking and management.
-   **AI Assistant "Loomia"**: Fully integrated OpenAI-powered assistant providing description enhancement, professional category suggestions, skill recommendations, and general platform support with contextual understanding in the selected platform language.

## External Dependencies
-   **Database**: Neon PostgreSQL
-   **Authentication**: Replit Auth service
-   **Payment Gateway**: Stripe (including Stripe Connect)
-   **Video Calling**: Agora.io
-   **Email Service**: Resend
-   **AI Services**: OpenAI GPT-4o
-   **File Storage**: Replit Object Storage
-   **UI Libraries**: Radix UI, shadcn/ui
-   **Validation**: Zod
-   **Date Handling**: date-fns
-   **Image/Video Processing**: Sharp, Multer