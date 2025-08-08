# Dialoom - Professional Video Call Booking Marketplace

## 📋 Table of Contents
- [Overview](#overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Project Structure](#project-structure)
- [Recent Updates](#recent-updates)
- [Installation & Setup](#installation--setup)
- [Configuration](#configuration)
- [API Documentation](#api-documentation)
- [Development Guidelines](#development-guidelines)
- [Deployment](#deployment)
- [Contributing](#contributing)

## 🎯 Overview

Dialoom is a comprehensive multilingual web application designed as a professional video call booking marketplace that connects experts with clients worldwide. The platform facilitates seamless user profile management, multimedia content sharing, and integrates a fully functional video calling system with pre-call lobby, live session management, and post-call rating capabilities.

### Mission
To provide a robust, user-friendly platform that enables professionals to monetize their expertise through video consultations while offering clients easy access to expert knowledge across various fields.

### Core Values
- **Accessibility**: Multilingual support (Spanish, English, Catalan) ensuring global reach
- **Trust**: Secure payment processing and verified expert profiles
- **Quality**: AI-powered matching and comprehensive rating system
- **Innovation**: Cutting-edge video technology and intelligent assistant integration

## 🚀 Key Features

### 1. **Live Video Consultation System**
- **Pre-Call Lobby**: Device testing and preparation area before joining calls
- **HD Video Calls**: Powered by Agora.io for reliable, high-quality video streaming
- **Screen Sharing**: Share presentations and documents during consultations
- **Session Recording**: Optional recording capabilities for future reference
- **Post-Call Ratings**: Comprehensive feedback system with 5-star ratings and written reviews

### 2. **AI-Powered Features**
- **Intelligent Host Search**: Natural language processing for semantic search
- **Loomia AI Assistant**: Integrated chatbot providing:
  - Profile optimization suggestions
  - Professional category recommendations
  - Skill matching and enhancement
  - Platform navigation assistance
  - Multilingual support matching user's selected language

### 3. **Comprehensive User Profiles**
- **Professional Portfolios**: Showcase expertise with multimedia content
- **Skill Verification**: Admin-verified professional credentials
- **Social Media Integration**: Connect 10+ major platforms
- **Availability Management**: Flexible scheduling with timezone support
- **Dynamic Pricing**: Customizable service tiers and add-ons

### 4. **Advanced Admin Dashboard**
- **Interactive Analytics**: Real-time metrics with Recharts visualization
- **Session Management**: Calendar and list views for booking oversight
- **Financial Tracking**: 
  - Transaction history with detailed reports
  - Host payout management
  - Commission rate configuration
  - Invoice generation and management
- **User Management**: Verification, moderation, and support tools
- **Content Moderation**: Article and media content review system

### 5. **Payment Integration**
- **Stripe Connect**: Secure payment processing with automatic host payouts
- **Multiple Currencies**: Support for international transactions
- **Flexible Pricing Models**: Per-session, packages, and subscriptions
- **Automated Invoicing**: PDF generation for both hosts and clients
- **Commission Management**: Configurable platform fees

### 6. **Content Management System**
- **News/Blog System**: Full-featured article publishing with:
  - Rich text editor
  - Featured images and videos
  - Automatic translation capabilities
  - SEO optimization
  - Social sharing integration
- **Email Templates**: Visual editor for transactional emails
- **Media Management**: Object storage integration for images/videos

### 7. **Marketing & SEO**
- **Conversion-Optimized Landing Pages**: A/B tested designs
- **Social Proof Integration**: Reviews, testimonials, and success stories
- **Meta Tag Management**: Dynamic SEO optimization
- **Structured Data**: Schema.org implementation for rich snippets
- **Performance Optimization**: Lazy loading and code splitting

## 💻 Technology Stack

### Frontend
- **React 18**: Modern UI library with concurrent features
- **TypeScript**: Type-safe development
- **Vite**: Lightning-fast build tool
- **Tailwind CSS**: Utility-first styling
- **shadcn/ui**: Accessible component library built on Radix UI
- **TanStack Query**: Powerful server state management
- **Recharts**: Interactive data visualization
- **i18next**: Comprehensive internationalization

### Backend
- **Express.js**: Flexible Node.js framework
- **TypeScript**: Consistent type safety across the stack
- **Drizzle ORM**: Type-safe database queries
- **PostgreSQL**: Robust relational database
- **Passport.js**: Authentication middleware
- **Zod**: Runtime type validation

### Infrastructure & Services
- **Replit**: Hosting and development platform
- **Neon PostgreSQL**: Serverless Postgres database
- **Replit Auth**: OpenID Connect authentication
- **Stripe**: Payment processing and payouts
- **Agora.io**: Real-time video communication
- **Resend**: Transactional email service
- **OpenAI GPT-4o**: AI-powered features
- **Replit Object Storage**: File and media storage

## 🏗️ System Architecture

### Monorepo Structure
The project uses a monorepo architecture with clear separation of concerns:

```
├── client/               # Frontend React application
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Route-based page components
│   │   ├── hooks/       # Custom React hooks
│   │   ├── lib/         # Utility functions and helpers
│   │   ├── i18n/        # Internationalization files
│   │   └── styles/      # Global styles and themes
├── server/              # Backend Express application
│   ├── routes.ts        # API route definitions
│   ├── storage.ts       # Database abstraction layer
│   ├── replitAuth.ts    # Authentication configuration
│   ├── objectStorage.ts # File storage service
│   └── stripe.ts        # Payment processing
├── shared/              # Shared types and schemas
│   └── schema.ts        # Database schema definitions
└── scripts/             # Utility scripts
```

### Data Flow Architecture
1. **Client Request** → React Component → TanStack Query
2. **API Call** → Express Routes → Validation (Zod)
3. **Business Logic** → Storage Layer → Database (Drizzle)
4. **Response** → Type-safe return → Client update

### Security Architecture
- **Authentication**: Replit Auth with session management
- **Authorization**: Role-based access control (User/Host/Admin)
- **Data Protection**: GDPR compliance with privacy controls
- **Payment Security**: PCI compliance via Stripe
- **API Security**: Rate limiting and CORS configuration

## 📂 Project Structure

### Key Directories

#### `/client/src/components/`
- **Navigation.tsx**: Main navigation with language switcher
- **Footer.tsx**: Comprehensive footer with newsletter signup
- **MediaEmbed.tsx**: YouTube video integration component
- **ObjectUploader.tsx**: File upload with progress tracking
- **SessionRatingModal.tsx**: Post-call feedback interface
- **HostDiscovery.tsx**: AI-powered expert search interface
- **AdminDashboard/**: Complete admin panel components

#### `/client/src/pages/`
- **home.tsx**: Landing page with hero, features, and testimonials
- **dashboard.tsx**: User/Host dashboard with statistics and management
- **video-call.tsx**: Pre-call lobby interface
- **video-call-room.tsx**: Live video call interface
- **admin-dashboard.tsx**: Admin control panel
- **news.tsx**: Article listing and reading interface
- **hosts.tsx**: Host discovery and filtering page

#### `/server/`
- **routes.ts**: All API endpoints organized by feature
- **storage.ts**: Database operations and queries
- **emailService.ts**: Email template rendering and sending
- **stripeService.ts**: Payment and payout processing
- **agoraService.ts**: Video call token generation

## 🔄 Recent Updates (January 2025)

### Live Session System Enhancements
- **Pre-Call Lobby Implementation**:
  - Device selection and testing interface
  - Audio/video preview with quality indicators
  - Network connectivity checks
  - Smooth transition to live calls
  
- **Video Call Improvements**:
  - Enhanced UI with participant info display
  - Real-time connection status indicators
  - Improved error handling and reconnection logic
  - Automatic quality adjustment based on bandwidth

- **Post-Session Features**:
  - Immediate rating prompt after call ends
  - Detailed review system with multiple criteria
  - Host response capabilities
  - Review moderation tools for admins

### Admin Dashboard Overhaul
- **Analytics Enhancement**:
  - Interactive charts with Recharts library
  - Real-time metrics updates
  - Exportable reports in CSV/PDF formats
  - Customizable date ranges and filters

- **Session Management**:
  - Calendar view with drag-and-drop rescheduling
  - List view with advanced filtering
  - Bulk actions for session management
  - Automated reminder system

- **Financial Management**:
  - Detailed transaction history
  - Host payout tracking and processing
  - Commission analytics and adjustments
  - Revenue forecasting tools

### Internationalization Improvements
- **Complete Translation Coverage**:
  - All UI elements now properly internationalized
  - Dynamic content translation via OpenAI
  - Language-specific date/time formatting
  - RTL support preparation for future languages

- **Translation Management**:
  - Centralized translation keys in JSON files
  - Consistent naming conventions
  - Context-aware translations
  - Fallback language support

### Performance Optimizations
- **Frontend Improvements**:
  - Code splitting for faster initial loads
  - Image optimization with lazy loading
  - Component memoization for complex views
  - Virtual scrolling for large lists

- **Backend Optimizations**:
  - Database query optimization
  - Redis caching implementation (planned)
  - API response compression
  - Connection pooling for better scalability

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database (or use Neon)
- Stripe account for payments
- Agora.io account for video calls
- OpenAI API key for AI features
- Resend account for emails (domain verification required)

### Environment Variables
Create a `.env` file with the following variables:

```bash
# Database
DATABASE_URL=postgresql://...

# Authentication
REPLIT_OWNER=your-username

# Stripe
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_CONNECT_WEBHOOK_SECRET=whsec_...

# Agora
AGORA_APP_ID=...
AGORA_APP_CERTIFICATE=...

# OpenAI
OPENAI_API_KEY=sk-...

# Resend
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@dialoom.com

# Object Storage
PUBLIC_OBJECT_SEARCH_PATHS=/bucket/public
PRIVATE_OBJECT_DIR=/bucket/private
```

Before using the email service, verify your domain in the Resend dashboard.

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/dialoom.git
   cd dialoom
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up the database**
   ```bash
   npm run db:push
   ```

4. **Configure object storage**
   - Create buckets in Replit Object Storage
   - Set up public and private directories

5. **Start development server**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5000`

## ⚙️ Configuration

### Admin Users
Configure admin usernames in the authentication setup:
```typescript
const adminUsernames = ['admin1', 'admin2'];
```

### Commission Rates
Default commission rates are stored in the database and configurable via admin panel.

### Email Templates
Email templates are stored in the database with the following types:
- `welcome`: New user registration
- `booking_confirmation`: Booking confirmations
- `session_reminder`: Pre-session reminders
- `password_reset`: Password recovery

### Supported Languages
- Spanish (es) - Default
- English (en)
- Catalan (ca)

Add new languages by creating translation files in `/client/src/i18n/locales/`

## 📡 API Documentation

### Authentication Endpoints
- `GET /api/auth/user` - Get current user
- `GET /login` - Login page (Supabase Auth)
- `GET /api/logout` - Logout user

### User Management
- `GET /api/profile/:userId` - Get user profile
- `PUT /api/profile` - Update user profile
- `POST /api/users/:userId/skills` - Update user skills
- `POST /api/users/:userId/languages` - Update user languages

### Booking System
- `GET /api/bookings` - List user bookings
- `POST /api/bookings` - Create new booking
- `PUT /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Cancel booking

### Video Calls
- `GET /api/video/token` - Get Agora token
- `POST /api/sessions/:id/start` - Start session
- `POST /api/sessions/:id/end` - End session
- `POST /api/sessions/:id/rate` - Rate session

### Admin Endpoints
- `GET /api/admin/stats` - Platform statistics
- `GET /api/admin/users` - User management
- `GET /api/admin/sessions` - Session oversight
- `PUT /api/admin/config` - Update configuration

## 🔧 Development Guidelines

### Code Style
- Use TypeScript for all new code
- Follow ESLint and Prettier configurations
- Implement proper error handling
- Write meaningful commit messages

### Component Guidelines
- Use functional components with hooks
- Implement proper TypeScript interfaces
- Follow shadcn/ui patterns for consistency
- Ensure accessibility (ARIA labels, keyboard navigation)

### State Management
- Use TanStack Query for server state
- Local state with useState/useReducer
- Context API for global UI state
- Avoid prop drilling

### Testing Strategy
- Unit tests for utilities and helpers
- Integration tests for API endpoints
- E2E tests for critical user flows
- Accessibility testing with axe-core

### Performance Best Practices
- Implement code splitting
- Use React.memo for expensive components
- Optimize images before upload
- Monitor bundle size

## 🚀 Deployment

### Replit Deployment
1. Push code to Replit
2. Set environment variables in Secrets
3. Configure domains in Replit settings
4. Use Replit Deployments for production

### Production Checklist
- [ ] Environment variables configured
- [ ] Database migrations completed
- [ ] Object storage buckets created
- [ ] Stripe webhooks configured
- [ ] Email templates uploaded
- [ ] SSL certificates active
- [ ] Monitoring and logging setup
- [ ] Backup strategy implemented

### Monitoring
- Use Replit's built-in monitoring
- Set up error tracking (e.g., Sentry)
- Configure uptime monitoring
- Implement performance monitoring

## 🤝 Contributing

### Development Workflow
1. Create feature branch from `main`
2. Implement changes following guidelines
3. Test thoroughly including edge cases
4. Update documentation as needed
5. Submit pull request with description

### Code Review Process
- Automated checks must pass
- Peer review required
- Admin approval for production changes
- Documentation updates mandatory

### Bug Reports
Please include:
- Steps to reproduce
- Expected behavior
- Actual behavior
- Browser/device information
- Screenshots if applicable

## 📄 License

This project is proprietary software. All rights reserved.

## 🙏 Acknowledgments

- Built with ❤️ on Replit
- UI components from shadcn/ui
- Icons from Lucide React
- Video infrastructure by Agora.io
- Payments powered by Stripe

---

For questions or support, contact: support@dialoom.com