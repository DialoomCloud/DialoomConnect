# Dialoom - Development Notes

> 📚 **Full documentation has been moved to [README.md](./README.md)**

## User Preferences
- **Communication Style**: Simple, everyday language (non-technical users)
- **Code Style**: TypeScript with proper interfaces, functional components with hooks
- **UI Approach**: Mobile-first, accessible design using shadcn/ui patterns
- **State Management**: TanStack Query for server state, Context API for global UI state

## Recent Changes (January 2025)
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
- **Profile Edit Modal Auto-Close** (January 3, 2025): Added automatic dialog closure 1 second after successful profile save to improve UX - user sees success message before modal closes
- **AI Enhancement Tone Update** (January 3, 2025): Modified AI prompt to generate more humble and professional descriptions, avoiding superlatives and grandiose claims in favor of modest, client-focused language
- **Test Mode Implementation** (January 3, 2025): Added comprehensive test mode for development and testing:
  - Created test user: billing@thopters.com (password: test2)
  - Test bookings auto-confirm and skip payment processing
  - Added TestBookingButton component for instant test reservations
  - Test mode only active in development environment

## Critical Architecture Notes
- **Authentication**: Always use Replit Auth for user authentication
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
- **Test User**: billing@thopters.com (password: test2) - for testing video calls
- **Default Language**: Spanish (es)
- **Supported Languages**: Spanish (es), English (en), Catalan (ca)
- **Main Entry Points**: 
  - Frontend: `/client/src/App.tsx`
  - Backend: `/server/routes.ts`
  - Database Schema: `/shared/schema.ts`
  - Test Routes: `/server/routes/testBooking.ts`