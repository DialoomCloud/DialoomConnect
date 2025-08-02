# Dialoom - Plataforma de Videollamadas con Expertos

## Overview
Dialoom is a comprehensive multilingual web application designed as a professional video call booking marketplace. It facilitates user profile management, multimedia content sharing, and integrates a fully functional video calling system. Key capabilities include Stripe payment integration, advanced content management with a visual email template editor, a complete news/article system, YouTube video integration, conversion-optimized marketing landing pages, AI-powered intelligent host search using natural language processing, comprehensive social media integration, and a fully integrated AI assistant called "Loomia" that enhances user profiles and provides intelligent suggestions. The project aims to provide a robust platform for connecting users with experts via video calls, supporting a global audience with multilingual capabilities.

## User Preferences
Preferred communication style: Simple, everyday language (non-technical users).

## Recent Changes (January 2025)
- Fixed navigation flow and authentication issues (January 2025):
  - Logo navigation now correctly redirects to /home when user is authenticated, solving blank page issue
  - Both desktop and mobile navigation updated to use conditional routing based on authentication status
  - Enhanced logout functionality with complete session clearing (localStorage, sessionStorage, cookies)
  - Improved Replit Auth logout to force account selection on next login attempt
  - Added prompt=select_account parameter to login URL to force user selection
  - Fixed all navigation components to consistently use /home for authenticated users
- Updated email templates with theme integration (January 2025):
  - Email templates now automatically use current theme colors instead of hardcoded green values
  - Added Dialoom logo to all email templates with proper variable replacement
  - Fixed test email sending functionality with proper variable substitution
  - Email service now fetches theme colors from admin configuration dynamically
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
- Extended translation coverage: Replaced hardcoded Spanish text with i18n translation keys in:
  - host-availability-section.tsx: All availability settings, pricing options, time selections, and date pickers
  - ai-profile-suggestions.tsx: All AI suggestion interface texts, buttons, and messages
  - Added comprehensive translation keys to es.json, en.json, and ca.json for complete multilingual support
- Fixed multimedia content management system (January 2025):
  - Resolved button conflicts between MediaEmbed and SortableMediaGrid by positioning edit button (top-right) and delete button (top-left)
  - Created separate drag handle area in center to prevent interference with action buttons
  - Added confirmation dialog before deleting multimedia content
  - Implemented proper file deletion from object storage when removing content (not just database records)
  - Fixed drag & drop functionality for reordering content with persistent order storage using displayOrder field
  - Added useEffect for proper synchronization between frontend and backend data
- Fixed Admin Dashboard issues (January 2025):
  - Resolved critical authentication error: Changed all `req.adminUser.id` references to `req.user.claims.sub` to fix null admin_id errors
  - Fixed commission display: Now shows as percentage (21%) instead of decimal (0.21) in configuration
  - Added individual host commission rate feature with database schema updates
  - Implemented percentage conversion between database (decimal) and UI (percentage) representations
  - Fixed article management authorization: Changed from dual middleware system (isAuthenticated + isAdmin) to unified isAdminAuthenticated
  - Theme editor now properly saves color changes without authentication errors
  - News article management (create, update, delete, publish) now works correctly with proper admin authentication
- Fixed home page news display (January 2025):
  - Corrected NewsSection component API call syntax: Fixed apiRequest usage from 3-parameter to correct 1-parameter format
  - Resolved featured articles not displaying on home page despite being marked as published and featured
  - Fixed null safety issues in article date display and view count rendering
  - Featured articles now properly display on home page when marked as isFeatured=true
- Created comprehensive WordPress-style blog section (August 2025):
  - Fixed TypeScript errors in NewsSection component with proper type annotations
  - Created new BlogSection component with WordPress-style layout and design
  - Added comprehensive blog display with featured articles grid, recent articles, and call-to-action
  - Implemented responsive design with proper image handling and hover effects
  - Added complete multilingual support (ES/EN/CA) for all blog interface texts
  - Integrated BlogSection into home page to prominently display admin-created articles
  - Articles from admin dashboard now display in professional WordPress-style layout on home page
- Fixed Replit Auth configuration issues (August 2025):
  - Resolved "Unknown authentication strategy" error by registering strategies for both localhost and Replit domains
  - Fixed OIDC discovery configuration to use correct Replit Auth endpoints
  - Added proper error handling and logging for authentication strategy registration
  - Eliminated email verification flow issues by ensuring correct domain-strategy mapping
  - Authentication now works seamlessly for both development (localhost) and production (Replit domain) environments
- Fixed footer duplication issues (August 2025):
  - Removed duplicate footer from "How it works" page that was conflicting with global footer
  - Eliminated unnecessary Footer import from how-it-works.tsx component
  - Global footer from App.tsx now handles all pages consistently without duplication

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