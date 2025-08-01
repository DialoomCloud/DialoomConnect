# Dialoom - Plataforma de Videollamadas con Expertos

## Overview
Dialoom is a comprehensive multilingual web application designed as a professional video call booking marketplace. It facilitates user profile management, multimedia content sharing, and integrates a fully functional video calling system. Key capabilities include Stripe payment integration, advanced content management with a visual email template editor, a complete news/article system, YouTube video integration, conversion-optimized marketing landing pages, AI-powered intelligent host search using natural language processing, comprehensive social media integration, and a fully integrated AI assistant called "Loomia" that enhances user profiles and provides intelligent suggestions. The project aims to provide a robust platform for connecting users with experts via video calls, supporting a global audience with multilingual capabilities.

## User Preferences
Preferred communication style: Simple, everyday language (non-technical users).

## Recent Changes (January 2025)
- Fixed navigation flow: Users now go to /home when clicking on Dialoom logo while authenticated (previously redirected to /profile)
- Updated Loomia AI to respond in the platform's selected language (ES/EN/CA)
- Updated Loomia's context with current Dialoom payment information:
  - All payments processed through Stripe
  - 10% Dialoom commission on all transactions
  - Hosts can only edit their own video call rates and durations
  - Service fees (recording, etc.) are fixed by Dialoom and non-editable by hosts
- Admin panel remains accessible via manual navigation for users with admin role
- Verified database integrity: All tables properly configured with CASCADE foreign keys
- Object Storage configured with bucket 'replit-objstore-46fcbff3-adc5-49f0-bb85-39ea50a708d7'
- Public assets served via `/storage/*` route with local filesystem fallback
- Fixed blank page issue when navigating back from profile editor: Home page now shows loading skeleton instead of blank screen during data fetching
- Improved navigation stability: Added cleanup effects to close all modals when leaving profile page
- Enhanced home page loading states to handle navigation from other pages more gracefully
- Fixed JavaScript error "Can't find variable: useLocation" by properly importing useLocation and useEffect in App.tsx

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
-   **Object Storage Integration**: 
     - Bucket ID: `replit-objstore-46fcbff3-adc5-49f0-bb85-39ea50a708d7`
     - Public assets served via `/storage/*` routes with automatic fallback to local filesystem
     - Per-user folder structure for multimedia content and private documents
     - Public directory: `/public` for shared assets
     - Private directory: `/.private` for user-specific protected content
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
-   **AI Assistant "Loomia"**: Fully integrated OpenAI-powered assistant providing description enhancement, professional category suggestions, skill recommendations, and general platform support with contextual understanding in the selected platform language.

## Database Schema
The application uses PostgreSQL with 25 tables properly configured with CASCADE foreign key relationships:

**Core Tables:**
- `users` - User profiles with authentication, Stripe integration, and GDPR compliance
- `sessions` - Session management for Replit Auth
- `bookings` - Video call reservations between hosts and guests
- `stripe_payments` - Payment tracking with commission calculation
- `invoices` - Downloadable invoice generation

**Reference Tables:**
- `countries`, `languages`, `skills`, `categories`, `social_platforms`

**User Relations:**
- `user_languages`, `user_skills`, `user_categories`, `user_social_profiles`
- `user_documents` - Verification document storage
- `user_messages` - Contact/inquiry system

**Content Management:**
- `media_content` - User multimedia (YouTube, videos, images)
- `news_articles` - Blog/news system with rich content
- `email_templates` - Customizable email notifications
- `email_notifications` - Email delivery tracking

**Host Features:**
- `host_availability` - Schedule management
- `host_pricing` - Pricing tiers with service add-ons
- `host_categories` - Professional category assignments

**Admin:**
- `admin_config` - Global platform settings
- `admin_audit_log` - Administrative action tracking

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