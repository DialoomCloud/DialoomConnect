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

## Recent Updates (January 2025)
- **Simplified Media System**: Removed Instagram and TikTok support, keeping only YouTube, local videos, and images
- **File Upload Implementation**: Added Multer and Sharp for handling MP4 videos (max 50MB) and images (max 3MB with WebP compression)
- **New Upload Modal**: Created tabbed interface for YouTube URLs, video uploads, and image uploads
- **Backend API Routes**: Implemented `/api/upload/video` and `/api/upload/image` endpoints with proper validation
- **Storage Infrastructure**: Created uploads/videos and uploads/images directories with Express static serving
- **Type Safety**: Updated schema and components to use new media types (youtube, video, image)
- **API Client Fix**: Corrected apiRequest function signature for better usability