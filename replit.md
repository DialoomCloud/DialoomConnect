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
- **Default Language**: Spanish (es)
- **Supported Languages**: Spanish (es), English (en), Catalan (ca)
- **Main Entry Points**: 
  - Frontend: `/client/src/App.tsx`
  - Backend: `/server/routes.ts`
  - Database Schema: `/shared/schema.ts`