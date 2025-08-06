# Dialoom - Compressed Development Notes

## Overview
Dialoom is a platform designed to connect users through video calls. It focuses on providing a seamless and professional experience for booking and conducting online sessions. Key capabilities include host search and filtering, live video sessions, and host service configuration. The project aims to provide a robust, user-friendly, and scalable solution for online interactions, targeting both individuals seeking consultations and professionals offering their services.

## Recent Changes (January 2025)
- **Favicon Implementation**: Added Dialoom mobile logo as favicon in multiple formats (ico, 16x16, 32x32, apple-touch-icon) for cross-platform compatibility
- **Profile Edit Bug Fix**: Resolved blank page issue when editing profiles by adding proper error handling, user validation, and diagnostic logging in EnhancedProfileEdit component

## User Preferences
- **Communication Style**: Simple, everyday language (non-technical users)
- **Code Style**: TypeScript with proper interfaces, functional components with hooks
- **UI Approach**: Mobile-first, accessible design using shadcn/ui patterns
- **State Management**: TanStack Query for server state, Context API for global UI state

## System Architecture
The system employs a client-server architecture.
- **UI/UX Decisions**: Mobile-first design with accessibility in mind. Utilizes `shadcn/ui` for consistent component styling.
- **Technical Implementations**:
    - **Responsive Logo System**: JavaScript-based logo switching based on screen size, with image fallbacks.
    - **Multi-Select Filter UI**: Minimalist dropdowns for search filters (Categories, Skills, Languages, Purpose) with smart text display and tooltips.
    - **Host Card Enhancement**: Display of categories and video call topics as badges on host search cards.
    - **Purpose Filter**: Integration of a new 'Purpose' filter for host search, managed by Zustand for global state.
    - **Profile Management**: Robust profile saving and persistence, with data synchronized between Supabase and NEON.
    - **AI Enhancement**: Integrated AI assistance for professional descriptions, focusing on humble and professional tone.
    - **Live Session System**: Complete video call flow including pre-call lobby and post-session ratings.
    - **Host Service Configuration**: Allows hosts to enable/disable additional services like screen sharing, translation, recording, and transcription.
    - **Free Consultation**: Configurable free consultation duration.
    - **Image Optimization**: Increased limits and improved compression for uploaded images.
    - **Admin Panel**: Enhanced with analytics, session management, multimedia management, theme editor, and robust role assignment and impersonation features.
- **System Design Choices**:
    - **Authentication**: All user authentication is handled via Supabase Auth.
    - **File Storage**: `ObjectStorageService` is the standard for all file operations.
    - **Database Management**: Drizzle ORM is used; database schema changes are managed via `npm run db:push`, avoiding manual SQL migrations. User data is synchronized between Supabase and the NEON database.
    - **Internationalization**: All UI text uses i18n keys for multi-language support (Spanish, English, Catalan).

## External Dependencies
- **Supabase**: Primary service for user authentication and managing user profiles.
- **NEON**: PostgreSQL database for storing application data.
- **TanStack Query**: For server state management and data fetching.
- **Zustand**: For global UI state management, particularly for filters.
- **shadcn/ui**: UI component library for consistent and accessible design.
- **react-range**: For price range selection sliders.
- **Multer**: Middleware for handling `multipart/form-data`, primarily for file uploads.
- **Google OAuth**: For user authentication via Google.
- **LinkedIn OAuth**: For user authentication via LinkedIn.