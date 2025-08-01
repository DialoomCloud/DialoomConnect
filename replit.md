# Dialoom - Plataforma de Videollamadas con Expertos

## Overview
Dialoom is a comprehensive multilingual web application (Spanish, English, Catalan) for user profile management and multimedia content sharing, expanded to include a professional video call booking marketplace with Stripe payment integration, fully functional Agora video calling system, advanced content management with visual email template editor, complete news/article system with media embedding capabilities, YouTube video integration, conversion-optimized marketing landing pages, and AI-powered intelligent host search using natural language processing.

## User Preferences
Preferred communication style: Simple, everyday language (non-technical users).

## System Architecture
The application adopts a monorepo structure, separating client, server, and shared components.

**Core Technologies:**
-   **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui (built on Radix UI)
-   **Backend**: Express.js, TypeScript, RESTful API
-   **Database**: PostgreSQL with Drizzle ORM
-   **Authentication**: Replit Auth (OpenID Connect), Passport.js, session management
-   **Payment Processing**: Stripe with Connect for host payouts
-   **Video Calling**: Agora.io with React SDK
-   **Email Service**: Resend (SendGrid as alternative)
-   **AI Integration**: OpenAI GPT-4o for intelligent search and content analysis
-   **File Storage**: Replit Object Storage with Google Cloud Storage backend
-   **Internationalization**: i18next with React integration (ES/EN/CA)

**Key Architectural Decisions & Features:**
-   **Monorepo Structure**: Facilitates clear separation and shared components across frontend and backend.
-   **Component-Based UI**: Utilizes shadcn/ui and Radix UI for accessible, responsive, and consistent design.
-   **Server State Management**: Employs TanStack Query for efficient data fetching, caching, and optimistic updates.
-   **Object Storage Integration**: Comprehensive per-user folder structure within Replit Object Storage (`public/` and `private/` directories) for multimedia content and private documents. Files are served via a dedicated `/storage/*` route.
-   **Dynamic Content Management**: Supports multimedia uploads (videos, images) with processing (Sharp) and YouTube embedding.
-   **Comprehensive Profile Management**: Enables detailed user profiles including professional categories, skills, languages, and contact information.
-   **Advanced Scheduling & Pricing**: Implements flexible scheduling (recurring and specific dates) and customizable pricing tiers with service add-ons.
-   **Admin Panel**: Provides configuration management for commission rates, service pricing, user verification, and GDPR compliance features.
-   **Authentication & Authorization**: Unified Replit Auth for both users and admin, with role-based access control and protected routes.
-   **AI-Powered Search**: Intelligent host search using OpenAI for semantic understanding and natural language queries.
-   **GDPR Compliance**: Includes features for data export, deletion requests, and field privacy controls.
-   **Email Notifications**: Utilizes Resend for transactional emails (welcome, booking confirmations, messages).
-   **SEO & Marketing**: Conversion-focused landing page redesign with structured content, social proof, and multilingual support.
-   **Translation System**: Complete i18n implementation with comprehensive translation files (Spanish, English, Catalan) covering all application features and components.
-   **Responsive Navigation**: Conditional menu display based on authentication status with mobile-first design.

## Installation & Dependencies

### Core Dependencies

#### Frontend
```bash
# React & TypeScript
@types/react @types/react-dom react react-dom typescript

# Build Tools
vite @vitejs/plugin-react esbuild

# UI & Styling
tailwindcss postcss autoprefixer
@tailwindcss/typography @tailwindcss/vite tailwindcss-animate
class-variance-authority clsx tailwind-merge

# Component Libraries
@radix-ui/react-* (accordion, alert-dialog, avatar, checkbox, dialog, dropdown-menu, etc.)
lucide-react react-icons

# Forms & Validation
react-hook-form @hookform/resolvers zod drizzle-zod

# State Management & Data Fetching
@tanstack/react-query

# Routing & Navigation
wouter

# Internationalization
i18next react-i18next i18next-browser-languagedetector

# Video Calling
agora-rtc-react agora-rtc-sdk-ng agora-access-token

# Payment Integration
@stripe/react-stripe-js @stripe/stripe-js

# File Upload
@uppy/core @uppy/react @uppy/dashboard @uppy/aws-s3

# Animation & Interaction
framer-motion embla-carousel-react
```

#### Backend
```bash
# Server Framework
express @types/express

# Database & ORM
drizzle-orm drizzle-kit @neondatabase/serverless

# Authentication
passport passport-local @types/passport @types/passport-local
express-session @types/express-session
connect-pg-simple memorystore
bcryptjs @types/bcryptjs

# OpenID Connect (Replit Auth)
openid-client google-auth-library

# Payment Processing
stripe

# Email Services
@sendgrid/mail resend

# File Processing & Storage
@replit/object-storage @google-cloud/storage
multer @types/multer sharp

# AI Integration
openai

# Utilities
nanoid memoizee @types/memoizee
form-data date-fns
```

#### Development Tools
```bash
# TypeScript & Build
tsx @types/node

# Database Tools
drizzle-kit

# Code Quality
@jridgewell/trace-mapping

# Replit Integration
@replit/vite-plugin-cartographer
@replit/vite-plugin-runtime-error-modal
```

### Environment Variables Required
```env
# Database
DATABASE_URL=postgresql://...
PGHOST=...
PGPORT=5432
PGUSER=...
PGPASSWORD=...
PGDATABASE=...

# Authentication
SESSION_SECRET=...
REPL_ID=...
REPLIT_DOMAINS=...
ISSUER_URL=https://replit.com/oidc

# Object Storage  
DEFAULT_OBJECT_STORAGE_BUCKET_ID=...
PUBLIC_OBJECT_SEARCH_PATHS=...
PRIVATE_OBJECT_DIR=...

# AI Services
OPENAI_API_KEY=sk-...

# Email Services
RESEND_API_KEY=re_...
SENDGRID_API_KEY=SG...

# Payment Processing
STRIPE_SECRET_KEY=sk_...
VITE_STRIPE_PUBLIC_KEY=pk_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Video Calling
AGORA_APP_ID=...
AGORA_APP_CERTIFICATE=...
```

## External Dependencies
-   **Database**: Neon PostgreSQL (serverless with connection pooling)
-   **Authentication**: Replit Auth service (OpenID Connect)
-   **Payment Gateway**: Stripe (for payment processing, webhooks, and Stripe Connect for host payouts)
-   **Video Calling**: Agora.io (for real-time video communication)
-   **Email Service**: Resend (primary), SendGrid (alternative)
-   **AI Services**: OpenAI GPT-4o (for intelligent search and content analysis)  
-   **File Storage**: Replit Object Storage (Google Cloud Storage backend)
-   **UI Libraries**: Radix UI (primitives for accessible components), shadcn/ui (component library)
-   **Validation**: Zod (runtime type checking)
-   **Date Handling**: date-fns
-   **Image/Video Processing**: Sharp (for image compression and video thumbnail generation), Multer (for file uploads)

## Recent Updates (January 2025)

### AI-Powered Intelligent Search System
- **OpenAI Integration**: Implemented semantic search using GPT-4o for host discovery
- **Natural Language Processing**: Users can search using concepts like "astronomía" to find related experts
- **Relevance Scoring**: AI-powered relevance scores displayed for search results
- **Smart Search Indicators**: Visual feedback when AI search is active
- **Multilingual Support**: Works across Spanish, English, and Catalan

### Authentication & Navigation Improvements
- **Conditional Navigation**: Menu items now appear based on authentication status
- **Protected Routes**: Automatic redirection to login for unauthorized access attempts
- **Role-Based Access**: Admin menus only visible to authenticated admin users
- **Mobile Responsive**: Improved mobile navigation with proper authentication handling
- **Login Integration**: Seamless Replit Auth integration with proper session management

### User Experience Enhancements
- **Responsive Design**: Mobile-first approach with hamburger menu
- **Loading States**: Proper loading indicators during authentication checks
- **Error Handling**: Graceful handling of authentication failures
- **Translation Coverage**: Complete translation files for all new features

## Installation & Setup Guide

### Prerequisites
- Node.js 18+ (recommended: use replit environment)
- PostgreSQL database (Neon recommended for serverless)
- Required API keys (see Environment Variables section)

### Local Development Setup

1. **Clone Repository**
   ```bash
   git clone <repository-url>
   cd dialoom
   ```

2. **Install Dependencies**
   ```bash
   # Using npm (automatically handled in Replit)
   npm install
   
   # Or using the Replit packager tool
   # Frontend and backend dependencies are managed together in monorepo
   ```

3. **Environment Configuration**
   Create `.env` file with required variables (see Environment Variables section above)

4. **Database Setup**
   ```bash
   # Push database schema (using Drizzle)
   npm run db:push
   
   # Alternative: run database migrations
   npm run db:migrate
   ```

5. **Start Development Server**
   ```bash
   # Starts both frontend (Vite) and backend (Express) servers
   npm run dev
   
   # Server runs on port 5000
   # Frontend proxy configured to serve from same port
   ```

### Replit Environment (Recommended)

1. **Fork/Import Project** into Replit workspace
2. **Install Dependencies** - Handled automatically by Replit
3. **Configure Secrets** - Use Replit Secrets manager for environment variables
4. **Database Provisioning** - Use Replit's PostgreSQL database tool
5. **Object Storage Setup** - Configure through Replit Object Storage tool
6. **Run Application** - Use provided "Start application" workflow

### Key Commands

```bash
# Development
npm run dev          # Start development servers
npm run build        # Build for production
npm run preview      # Preview production build

# Database
npm run db:push      # Push schema changes
npm run db:studio    # Open Drizzle Studio (database GUI)
npm run db:migrate   # Run migrations

# Code Quality
npm run lint         # Run linting (if configured)
npm run type-check   # TypeScript type checking
```

### Project Structure

```
dialoom/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Route components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utility functions
│   │   ├── i18n/          # Internationalization
│   │   └── main.tsx       # Application entry point
│   └── public/            # Static assets
├── server/                # Backend Express application
│   ├── routes.ts          # API routes
│   ├── storage.ts         # Database operations
│   ├── ai-search.ts       # AI-powered search service
│   ├── replitAuth.ts      # Authentication setup
│   └── index.ts           # Server entry point
├── shared/                # Shared types and schemas
│   └── schema.ts          # Database schema (Drizzle)
├── uploads/               # Local file uploads (fallback)
└── package.json           # Dependencies and scripts
```

### Deployment

**Replit Deployment (Recommended)**
1. Use the Replit "Deploy" button
2. Configure production environment variables
3. Automatic scaling and SSL handled by Replit

**Manual Deployment**
1. Build the application: `npm run build`
2. Set production environment variables
3. Deploy to your preferred hosting platform
4. Ensure PostgreSQL database is accessible
5. Configure CORS and domain settings

### API Documentation

#### Authentication Endpoints
- `GET /api/auth/user` - Get current user
- `GET /api/login` - Initiate Replit Auth login
- `GET /api/callback` - Auth callback handler
- `GET /api/logout` - Logout user

#### Core API Routes
- `GET /api/hosts` - List all hosts
- `POST /api/hosts/search` - AI-powered host search
- `GET /api/users/:id` - Get user profile
- `POST /api/media` - Upload media content
- `GET /storage/*` - Serve stored files

#### Admin Routes (Protected)
- `GET /api/admin/*` - Various admin endpoints
- Require admin role authentication

### Troubleshooting

**Common Issues:**
1. **404 Errors on Protected Routes** - Check authentication status
2. **File Upload Issues** - Verify Object Storage configuration
3. **Database Connection** - Ensure DATABASE_URL is correct
4. **AI Search Not Working** - Verify OPENAI_API_KEY is set
5. **Video Calling Issues** - Check Agora credentials

**Debug Commands:**
```bash
# Check environment variables
echo $DATABASE_URL

# Test database connection
npm run db:studio

# View server logs
# Logs available in Replit console or terminal
```

### Performance Considerations

- **Database**: Uses connection pooling for PostgreSQL
- **File Storage**: Object Storage with local fallback
- **Caching**: TanStack Query for client-side caching
- **Images**: Sharp for server-side image processing
- **Bundle Size**: Code splitting and lazy loading implemented