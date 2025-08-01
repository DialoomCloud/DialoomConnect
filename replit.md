# Dialoom - Plataforma de Videollamadas con Expertos

## Overview
Dialoom is a comprehensive multilingual web application designed as a professional video call booking marketplace. It facilitates user profile management, multimedia content sharing, and integrates a fully functional video calling system. Key capabilities include Stripe payment integration, advanced content management with a visual email template editor, a complete news/article system, YouTube video integration, conversion-optimized marketing landing pages, AI-powered intelligent host search using natural language processing, comprehensive social media integration, and a fully integrated AI assistant called "Loomia" that enhances user profiles and provides intelligent suggestions. The project aims to provide a robust platform for connecting users with experts via video calls, supporting a global audience with multilingual capabilities.

## User Preferences
Preferred communication style: Simple, everyday language (non-technical users).

## System Architecture
The application adopts a monorepo structure, separating client, server, and shared components, utilizing a modern web stack for scalability and maintainability.

**Core Technologies:**
-   **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui (built on Radix UI)
-   **Backend**: Express.js, TypeScript, RESTful API
-   **Database**: PostgreSQL with Drizzle ORM
-   **Authentication**: Replit Auth (OpenID Connect), Passport.js, session management
-   **Payment Processing**: Stripe with Connect for host payouts
-   **Video Calling**: Agora.io with React SDK
-   **Email Service**: Resend
-   **AI Integration**: OpenAI GPT-4o
-   **File Storage**: Replit Object Storage (Google Cloud Storage backend)
-   **Internationalization**: i18next with React integration (ES/EN/CA)

**Key Architectural Decisions & Features:**
-   **Monorepo Structure**: Enables clear separation and shared components across frontend and backend.
-   **Component-Based UI**: Leverages shadcn/ui and Radix UI for accessible, responsive, and consistent design, prioritizing a mobile-first approach.
-   **Server State Management**: Employs TanStack Query for efficient data fetching, caching, and optimistic updates.
-   **Object Storage Integration**: Comprehensive per-user folder structure within Replit Object Storage for multimedia content and private documents, served via a dedicated route.
-   **Dynamic Content Management**: Supports multimedia uploads (videos, images) with processing (Sharp) and YouTube embedding.
-   **Comprehensive Profile Management**: Enables detailed user profiles including professional categories, skills, languages, and contact information. Includes AI-powered analysis for suggesting professional categories and skills based on user descriptions.
-   **Advanced Scheduling & Pricing**: Implements flexible scheduling (recurring and specific dates) and customizable pricing tiers with service add-ons.
-   **Admin Panel**: Provides configuration management for commission rates, service pricing, user verification, and GDPR compliance features.
-   **Authentication & Authorization**: Unified Replit Auth for both users and admin, with role-based access control and protected routes, and conditional navigation based on authentication status.
-   **AI-Powered Search**: Intelligent host search using OpenAI for semantic understanding and natural language queries, providing relevance scoring.
-   **GDPR Compliance**: Includes features for data export, deletion requests, and field privacy controls.
-   **Email Notifications**: Utilizes Resend for transactional emails (welcome, booking confirmations, messages).
-   **SEO & Marketing**: Conversion-focused landing page design with structured content, social proof, and multilingual support.
-   **Translation System**: Complete i18n implementation across all application features and components.
-   **Social Media Integration**: Comprehensive support for 10 major social platforms (LinkedIn, Instagram, X/Twitter, Facebook, GitHub, YouTube, ArtStation, Behance, Discord, Dribbble) with user profile linking and management.
-   **AI Assistant "Loomia"**: Fully integrated OpenAI-powered assistant providing description enhancement, professional category suggestions, skill recommendations, and general platform support with contextual understanding.

## External Dependencies
-   **Database**: Neon PostgreSQL
-   **Authentication**: Replit Auth service
-   **Payment Gateway**: Stripe (including Stripe Connect)
-   **Video Calling**: Agora.io
-   **Email Service**: Resend
-   **AI Services**: OpenAI GPT-4o
-   **File Storage**: Replit Object Storage (Google Cloud Storage backend)
-   **UI Libraries**: Radix UI, shadcn/ui
-   **Validation**: Zod
-   **Date Handling**: date-fns
-   **Image/Video Processing**: Sharp, Multer