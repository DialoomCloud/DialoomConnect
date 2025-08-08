# Dialoom - Compressed Development Notes

## Overview
Dialoom is a platform designed to connect users through video calls. It focuses on providing a seamless and professional experience for booking and conducting online sessions. Key capabilities include host search and filtering, live video sessions, and host service configuration. The project aims to provide a robust, user-friendly, and scalable solution for online interactions, targeting both individuals seeking consultations and professionals offering their services.

## Recent Changes (January 2025)
- **Favicon Update**: Updated favicon to use the new app logo (ic_app_logo_foreground.webp) converted to all standard formats (ico, 16x16, 32x32, apple-touch-icon) for cross-platform compatibility
- **Profile Edit Bug Fix**: Resolved blank page issue when editing profiles by adding proper error handling, user validation, and diagnostic logging in EnhancedProfileEdit component
- **File Upload Limits Updated**: Increased photo upload limits from 5MB/10MB to 15MB across all components (host-verification, media-upload, profile-edit, enhanced-profile-edit) and server configuration
- **Smart Image Compression**: Implemented iterative WebP compression system that automatically reduces image quality until files are under 1.5MB while maintaining visual quality, eliminating the need to store original large files
- **Homepage Testimonials Enhancement**: Updated testimonials section with real client names (Marianne Foix, Joshua Artxiz, Laia Dolcet) and professional profile images with robust fallback system
- **Admin Panel Timestamp Fix**: Resolved "value.toISOString is not a function" error when editing admin users by adding proper date validation and timestamp handling for host availability and pricing data
- **Admin Panel Pricing Tab Enhancement**: Renamed "Host" tab to "Tarifas" and enhanced pricing display to show ALL host pricing configurations including custom durations (e.g., 120 minutes), with ability to add, edit, and delete custom tariffs
- **Video Call Topics Redesign**: Replaced textarea system with individual input fields featuring add/remove buttons, limited to 10 topics maximum, with full database synchronization and admin panel integration
- **Video Compression System**: Implemented comprehensive automatic video compression using FFmpeg for uploads up to 100MB. Features smart quality adjustment, format conversion to MP4, resolution optimization (max 1920x1080), and automatic cleanup of original files. Applied across all video upload sections including media uploads and news articles.
- **Admin Badge Control System**: Implemented comprehensive badge management system with global and individual controls. Added isRecommended and isFeatured fields to users table. Created AdminSettingsPanel with two-tab interface: Settings tab for global badge visibility controls (Verified/Recommended), and Hosts tab for individual host management with Estado (Active/Inactive), Verificado, Recomendado, and Destacado columns. Global and individual systems work independently for maximum flexibility.
- **Navigation Menu Cleanup**: Removed Demo video call links from all header navigation menus (desktop and mobile versions) and simplified "Recomendaciones de Networking" title to simply "Networking" for cleaner interface.
- **Global Badge Control System**: Implemented comprehensive badge control system with useVerificationSettings hook and global configuration endpoints. Modified all public-facing components (booking-flow, user-profile, NetworkingRecommendations, host-search, payment-demo) to respect global badge visibility settings. Admin panel now controls whether "Verified" and "Recommended" badges are shown globally in host exploration.
- **Featured Host Cards Fix**: Fixed review count display in homepage featured host cards to consistently show "12 reseñas" instead of "0 reseñas", matching the display format used in host exploration pages.
- **Navigation Header Reorganization**: Implemented role-based navigation with specific order for host mode (Dashboard, Profile, Hosts, Networking + language), admin mode (Admin panel + language), and regular users (Home, Hosts, News, Profile, Networking + language). Applied to both desktop and mobile versions.
- **Host Search Cards Simplification**: Simplified host cards in search results by removing verified tick, categories, and video call topics. Added languages display and kept country information. Made sessions and satisfaction stats smaller for cleaner appearance.
- **Comprehensive Translation System Completion**: Finalized complete internationalization of the platform with systematic replacement of all hardcoded strings throughout the application. Extended translation files (es.json, en.json, ca.json) with comprehensive coverage including footer, language selector, admin dashboard tabs, financial metrics, and UI components. Eliminated all conditional language checks (i18n.language === 'es') in favor of proper t() function calls for consistent multi-language support across Spanish, English, and Catalan.
- **Host Description Text Duplication Fix**: Resolved critical UI bug where expanding host descriptions showed both truncated and full text simultaneously. Fixed logic in user-profile.tsx to display either truncated text with "..." or full description, not both. Improved user experience by ensuring clean text expansion without content duplication.
- **How-It-Works Page Simplification**: Simplified the how-it-works page to show only 3 essential steps: Search Host → Schedule Session → Videocall, removing registration and payment steps for cleaner user flow.
- **Registered User Role Implementation**: Added "Registered" as the new default user role replacing "guest". Updated user schema and navigation system to support this new role structure.
- **Universal Navigation System**: Implemented universal navigation accessible to all internet users, allowing anyone to contract hosts regardless of their role (host/admin/both). Navigation now shows Home, Hosts, News for all users, with Profile and Networking for authenticated users, plus role-specific Dashboard/Admin panels when applicable.
- **Dashboard Menu Removal for Hosts**: Removed Dashboard menu access for users with host role activated to prevent functional overlap with the profile editor. The Dashboard page remains available but is not accessible through navigation menus (both desktop and mobile) to avoid redundancy and confusion.
- **Video Call Topics Character Limit Expansion**: Increased maximum character limit for video call topics from 50 to 200 characters, allowing hosts to create more descriptive and detailed topic descriptions. Updated placeholder text to provide better guidance with examples.

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
    - **Video Compression**: Automatic video compression using FFmpeg for files up to 100MB, with smart quality adjustment, format standardization to MP4, and resolution optimization while maintaining visual quality.
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