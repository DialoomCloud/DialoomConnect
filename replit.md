# Dialoom - Social Media Portfolio Platform

## Overview

Dialoom is a modern full-stack web application that allows users to create professional portfolios featuring multimedia content from YouTube, Instagram, and TikTok. Built with React/TypeScript frontend, Express.js backend, and PostgreSQL database, it provides a comprehensive platform for users to showcase their social media presence in a unified, professional interface.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a monorepo structure with clear separation between client, server, and shared components:

- **Frontend**: React 18 with TypeScript, Vite bundler, and Tailwind CSS for styling
- **Backend**: Express.js with TypeScript, RESTful API architecture
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Authentication**: Replit Auth integration with session management
- **UI Framework**: shadcn/ui components built on Radix UI primitives

## Key Components

### Frontend Architecture
- **React Router**: Using Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management and caching
- **UI Components**: shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens and CSS variables
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **API Structure**: RESTful endpoints organized in `/api` routes
- **Database Layer**: Drizzle ORM with connection pooling via Neon serverless
- **Session Management**: Express sessions with PostgreSQL store
- **Middleware**: Request logging, JSON parsing, and error handling
- **Authentication**: Replit OIDC integration with passport.js

### Database Schema
- **Users Table**: Stores user profiles with authentication data
- **Media Content Table**: Stores social media links with metadata
- **Sessions Table**: Manages user authentication sessions
- **Media Types**: Enum for YouTube, Instagram, and TikTok content

## Data Flow

1. **Authentication Flow**: Users authenticate via Replit OIDC, sessions stored in PostgreSQL
2. **Profile Management**: Users can update personal information through validated forms
3. **Media Content**: Users add social media URLs which are processed to extract embed IDs
4. **Content Display**: Media content is rendered using platform-specific embed components
5. **Real-time Updates**: TanStack Query provides optimistic updates and cache invalidation

## External Dependencies

### Core Dependencies
- **Database**: Neon PostgreSQL serverless with connection pooling
- **Authentication**: Replit Auth service integration
- **UI Libraries**: Radix UI primitives for accessible components
- **Validation**: Zod for runtime type checking and form validation
- **Date Handling**: date-fns for date manipulation

### Development Tools
- **Build Tool**: Vite with React plugin and TypeScript support
- **ORM**: Drizzle Kit for database migrations and schema management
- **Package Manager**: npm with lockfile version 3
- **Type Checking**: TypeScript with strict mode enabled

## Deployment Strategy

### Development Environment
- **Local Development**: Vite dev server with HMR for frontend, tsx for backend
- **Database**: Neon PostgreSQL with environment-based connection strings
- **Asset Handling**: Vite handles static assets and bundling

### Production Build
- **Frontend Build**: Vite builds optimized bundle to `dist/public`
- **Backend Build**: esbuild compiles server code to `dist/index.js`
- **Database Migrations**: Drizzle Kit manages schema changes
- **Environment Variables**: DATABASE_URL, SESSION_SECRET, REPLIT_DOMAINS required

### Key Features
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints
- **Type Safety**: End-to-end TypeScript with shared schema definitions
- **Performance**: Code splitting, lazy loading, and optimized bundle sizes
- **Accessibility**: ARIA-compliant components via Radix UI
- **SEO Ready**: Proper meta tags and semantic HTML structure

The application is designed to be deployed on Replit with automatic database provisioning and built-in authentication, making it easy to scale and maintain.

## Recent Updates (January 2025 - July 31, 2025)
- **Simplified Media System**: Removed Instagram and TikTok support, keeping only YouTube, local videos, and images
- **File Upload Implementation**: Added Multer and Sharp for handling MP4 videos (max 50MB) and images (max 3MB with WebP compression)
- **New Upload Modal**: Created tabbed interface for YouTube URLs, video uploads, and image uploads
- **Backend API Routes**: Implemented `/api/upload/video` and `/api/upload/image` endpoints with proper validation
- **Storage Infrastructure**: Created uploads/videos and uploads/images directories with Express static serving
- **Type Safety**: Updated schema and components to use new media types (youtube, video, image)
- **API Client Fix**: Corrected apiRequest function signature for better usability
- **Database Expansion (July 2025)**: Added reference tables for countries, languages, skills, and professional categories
- **Profile Enhancement**: Updated profile editing with separate address fields and multi-select options
- **Data Population**: Loaded 45 countries, 47 languages, 99 skills, and 18 categories from CSV files
- **Advanced Forms**: Implemented dropdowns for country/category selection and checkboxes for skills/languages

## Major Update - Bucket Storage & GDPR Compliance (July 30, 2025)
- **Bucket Storage System**: Implemented comprehensive per-user folder structure with `public/` and `private/` directories
- **Profile Photo Upload**: Fixed image upload functionality using new bucket system with Sharp processing
- **Security Architecture**: Created user-specific storage paths: `uploads/users/{userId}/public/` for visible content, `uploads/users/{userId}/private/` for verification documents
- **Admin System**: Created admin user (login: dialoomroot, password: TopGun) with encrypted credentials using bcrypt
- **User Verification**: Added verification system where users can upload ID documents for admin review
- **GDPR Compliance**: Implemented data export, deletion requests, and privacy controls for European data protection
- **Field Privacy**: Phone and address fields now visible only to profile owner and admin users
- **Database Schema**: Added user verification flags, GDPR consent tracking, and data retention management
- **API Endpoints**: Created admin routes for user verification and GDPR compliance endpoints

## Complete Migration to Replit Object Storage (July 30, 2025)
- **Object Storage Integration**: Migrated entire storage system to use Replit Object Storage bucket "MetallicBoilingService"
- **Storage Structure**: Implemented `/Objects/users/{userId}/public/` and `/Objects/users/{userId}/private/` folder structure in Object Storage
- **File Serving**: Created `/storage/*` route to serve files directly from Object Storage with proper content types
- **Media Upload System**: Updated profile images, videos, and images to upload to Object Storage with Sharp processing
- **User Data Migration**: Successfully migrated existing user files (Nacho Saladrigas) from local filesystem to Object Storage
- **Private Documents**: Migrated verification document uploads to use Object Storage private folders
- **API Consistency**: All upload endpoints now use Object Storage while maintaining same API interface
- **Bucket Configuration**: Using specific bucket "MetallicBoilingService" with /Objects/ prefix as requested
- **Navigation Enhancement (July 30, 2025)**: Added quick action cards to home page for Search Hosts, My Availability, My Profile, and Video Calls (coming soon)
- **Host Search Accessibility**: Fixed 404 error by making host search page accessible to both authenticated and non-authenticated users
- **Home Page UX**: Improved user experience with visual navigation cards featuring icons and hover effects
- **Multilingual Support**: Added translations for new navigation menu items in Spanish, English, and Catalan
- **Host Availability Integration (July 31, 2025)**: Integrated availability management directly into profile page, removing separate availability page
- **Enhanced Pricing System**: Added toggleable free tier option and fourth customizable pricing tier with custom minutes/price settings
- **Advanced Scheduling**: Implemented dual scheduling system supporting both weekly recurring schedules and specific date selections
- **Profile Page Enhancement**: Added comprehensive "Disponibilidad y Precios" section in profile with tabbed interface for scheduling
- **Bug Fixes**: Fixed critical JSON double-stringification issue in API requests that was breaking drag-and-drop functionality
- **UI Improvements**: Made media content boxes full-width (1 column layout) for better visibility on desktop

## Complete Stripe Payment Integration (July 31, 2025)
- **Stripe Gateway Setup**: Full payment processing with webhooks, payment intents, and customer management
- **Commission Structure**: 10% commission + 21% VAT automatically calculated and split between host and platform
- **Service Add-ons Pricing**: Screen sharing (€5), translation (€10), recording (€8), transcription (€12)
- **Invoice System**: Automatic invoice generation with downloadable PDFs linked to Stripe payments
- **Admin Panel**: Complete configuration management for commission rates and service pricing
- **Payment Flow**: Integrated checkout with booking system, real-time payment status updates
- **Database Schema**: New tables for stripe_payments, invoices, admin_config, admin_audit_log
- **API Endpoints**: Full REST API for payments (/api/stripe/*), invoices (/api/invoices/*), admin config (/api/admin/*)
- **Dashboard Integration**: Added billing section with invoice downloads and payment history
- **Webhook Processing**: Stripe webhook handling for payment confirmations and failures
- **Configuration Defaults**: Commission 10%, VAT 21%, service pricing configured and stored in admin_config table
- **Dashboard Transformation**: Transformed dashboard into comprehensive host control center integrating all profile functionalities including contact data, multimedia content, availability, and pricing management
- **Stripe Connect Analysis**: Analyzed requirements for implementing Stripe Connect to enable hosts to issue invoices in their name. Added database fields (stripeAccountId, stripeOnboardingCompleted) but full implementation pending as current system works with centralized payments to Dialoom account