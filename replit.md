# Dialoom - Development Notes

> 📚 **Full documentation has been moved to [README.md](./README.md)**

## User Preferences
- **Communication Style**: Simple, everyday language (non-technical users)
- **Code Style**: TypeScript with proper interfaces, functional components with hooks
- **UI Approach**: Mobile-first, accessible design using shadcn/ui patterns
- **State Management**: TanStack Query for server state, Context API for global UI state

## Recent Changes (January 2025)
- **Admin Role Assignment Fix** (January 8, 2025): Fixed error 500 when admins try to assign admin roles to users
  - Root cause: updateUserProfile() function was missing role-related fields (isAdmin, isHost, role, isActive, isVerified)
  - Extended updateUserProfile() to handle all admin/role fields in storage layer
  - Updated updateUserProfileSchema to validate role assignment fields
  - Admins can now successfully assign/modify user roles through admin panel
- **OAuth Login Redirection Fix** (January 8, 2025): Fixed OAuth login (Google, LinkedIn) to properly redirect users to dashboard instead of home page
- **Complete Profile Save Fix** (January 8, 2025): Fixed multiple issues preventing profile data from saving correctly
  - Issue 1: Profile edits were reverting to original values after logout/login
    - Root cause: During authentication, Supabase user metadata was overwriting database values
    - Fixed upsertUser logic to preserve existing user data instead of updating from Supabase metadata
    - Completely disabled Supabase metadata synchronization to prevent conflicts
  - Issue 2: Many fields (dateOfBirth, nationality, address, etc.) were not saving due to validation errors
    - Root cause: Backend schema didn't accept null values for optional fields
    - Extended updateUserProfileSchema to properly handle null values for all optional fields
    - Simplified frontend data cleaning to convert empty strings to null
  - Issue 3: Profile updates were syncing back to Supabase causing data conflicts
    - Removed all Supabase user metadata updates from profile routes
    - Database is now the single source of truth for all profile data
  - Issue 4: Drizzle .returning() bug with PostgreSQL was only returning partial field updates
    - Replaced .returning() with separate SELECT after UPDATE to get complete user data
    - This ensures all profile fields are properly returned after updates
  - Issue 5: UI cache desynchronization causing saved data to disappear from form fields
    - Root cause: Duplicate updateUserProfile methods - one buggy with .returning(), one correct with SELECT
    - Removed duplicate method that was overriding the correct implementation
    - Fixed TanStack Query cache management to use setQueryData instead of conflicting refetchQueries
    - Removed automatic modal closure to allow users to verify data persistence
    - Added form synchronization with useEffect to update form values when user data changes
    - Implemented direct form value updates after successful save operations
  - **COMPLETELY RESOLVED**: ALL profile fields now save correctly and persist across all UI interactions, modal closures, and browser sessions
- **Profile Save Fix** (January 8, 2025): Fixed critical profile update failure caused by primaryLanguageId validation error
  - Issue: Profile updates were failing with Zod validation error "Expected number, received string" for primaryLanguageId
  - Root cause: Frontend was sending empty string instead of null for empty primaryLanguageId field
  - Fixed data cleaning logic to properly handle primaryLanguageId as null when empty
  - Updated Select component to parse string values to integers or null correctly
  - Now all profile fields save properly including name, date of birth, nationality, address, and languages
- **Major Authentication Migration** (January 3-4, 2025): Migrated from Replit Auth to Supabase Authentication
  - Created new authentication infrastructure: `server/supabaseAuth.ts`, `client/src/lib/supabase.ts`
  - Updated authentication hooks: `client/src/hooks/useAuth.ts` now uses Supabase with proper session management
  - Created new login page: `client/src/pages/login.tsx` with sign in/sign up functionality
  - Updated navigation component to use Supabase signOut method
  - Updated queryClient to include Supabase JWT tokens in API requests
  - Removed old Replit Auth dependency: deleted `server/replitAuth.ts`
  - All authentication now flows through Supabase while maintaining existing user data structure
  - **Google OAuth Fix** (January 4, 2025): Fixed authentication issue where existing users couldn't log in with Google OAuth
    - Modified `upsertUser` to properly handle existing users by email lookup
    - Updated authentication middleware to support migration from old user IDs to Supabase IDs
    - Added `getUserByEmail` method to storage layer for proper user lookup during OAuth flow
  - **OAuth Account Linking** (January 4, 2025): Implemented comprehensive OAuth account linking to prevent duplicate users
    - Created `userAuthProviders` table to track multiple OAuth providers per user
    - Updated `upsertUser` to automatically link new OAuth providers to existing accounts with same email
    - Added storage methods: `linkAuthProvider`, `unlinkAuthProvider`, `getUserAuthProviders`, `getUserByProviderInfo`, `updateAuthProviderLastUsed`
    - Users can now sign in with Google and LinkedIn (same email) and have both providers linked to single account
    - Migration script successfully merged existing duplicate accounts
- **Documentation Update**: Created comprehensive README.md with extensive project documentation
- **Translation Implementation**: Updated dashboard.tsx to use proper i18n keys instead of hardcoded Spanish text
- **Live Session System**: Complete video call flow with pre-call lobby and post-session ratings
- **Admin Dashboard**: Enhanced with interactive analytics and comprehensive session management
- **Host Service Configuration**: Hosts can now enable/disable additional services (screen sharing, translation, recording, transcription)
- **Admin Controls**: Admin can control which services hosts can offer through admin configuration settings
- **Free Consultation Update**: Changed free consultation duration from 0 to 5 minutes with admin toggle
- **Image Optimization Update**: Increased file size limits from 3MB to 5MB and improved compression quality from 80% to 90-95% across all image processing functions (profile images, media uploads, public images)
- **Social Media @ Symbol Fix**: Completely removed automatic @ prepending logic for all social media platforms - users now see exactly what they input without any automatic modifications
- **Profile Edit Fix**: Fixed TanStack Query compatibility issues in enhanced-profile-edit component by removing deprecated onSuccess callback
- **Admin Multimedia Management**: Implemented full multimedia management in admin dashboard - admins can now view, edit, and delete user media content directly from the admin interface
- **AI Enhancement Button UI Update** (January 3, 2025): Removed separate "Asistente IA Loomia" block and integrated the AI enhancement functionality directly into the Professional Description section with gradient styling and LinkedIn integration explanation
- **Authentication Fix** (January 3, 2025): Fixed localhost authentication strategy mapping for development environment (127.0.0.1 -> localhost)
- **Profile Edit Modal Auto-Close Removed** (January 8, 2025): Removed automatic dialog closure after successful profile save to allow users to verify their data was saved correctly
- **AI Enhancement Tone Update** (January 3, 2025): Modified AI prompt to generate more humble and professional descriptions, avoiding superlatives and grandiose claims in favor of modest, client-focused language
- **User Sync Fix Between Supabase and NEON** (January 4, 2025): Fixed critical issue where users created in Supabase weren't being created in NEON database
  - Updated signup endpoint to create users in NEON immediately after Supabase creation
  - OAuth users (Google, LinkedIn) are now properly created in NEON during first authentication
  - Ensured all authentication flows maintain proper user data synchronization between Supabase and NEON

## Critical Architecture Notes
- **Authentication**: Always use Supabase Auth for user authentication
- **File Storage**: Use ObjectStorageService for all file operations
- **Database**: Never manually write SQL migrations - use `npm run db:push`
- **Translations**: All UI text must use i18n keys from translation files

## Development Reminders
- Always check LSP diagnostics after making code changes
- Use parallel tool calls when possible for efficiency
- Document any architectural changes immediately
- Test with real data - never use mock data unless explicitly requested

## Quick Reference
- **Admin Users**: nachosaladrigas, marcgarcia10
- **Default Language**: Spanish (es)
- **Supported Languages**: Spanish (es), English (en), Catalan (ca)
- **Main Entry Points**: 
  - Frontend: `/client/src/App.tsx`
  - Backend: `/server/routes.ts`
  - Database Schema: `/shared/schema.ts`