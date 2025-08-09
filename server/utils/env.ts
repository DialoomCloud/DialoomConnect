import { z } from 'zod';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env' });
config({ path: '.env.local' });

/**
 * Environment Configuration with Zod Validation
 * Prevents crashes from missing ENV vars and provides graceful degradation
 */

const envSchema = z.object({
  // Core server config
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),
  CLIENT_ORIGIN: z.string().default('http://localhost:5173'),
  
  // Database
  DATABASE_URL: z.string().min(1),
  
  // Supabase (optional for some deployments)
  SUPABASE_URL: z.string().optional(),
  SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_KEY: z.string().optional(),
  
  // Optional services with graceful fallbacks
  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM_EMAIL: z.string().optional(),
  
  STRIPE_PUBLIC_KEY: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  
  OPENAI_API_KEY: z.string().optional(),
  
  // Object Storage (optional)
  PUBLIC_OBJECT_SEARCH_PATHS: z.string().optional(),
  PRIVATE_OBJECT_DIR: z.string().optional(),
  
  // Agora (optional)
  AGORA_APP_ID: z.string().optional(),
  AGORA_APP_CERTIFICATE: z.string().optional(),
});

// Parse and validate environment
const parseResult = envSchema.safeParse(process.env);

if (!parseResult.success) {
  console.error('❌ Environment validation failed:');
  parseResult.error.issues.forEach(issue => {
    console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
  });
  process.exit(1);
}

export const env = parseResult.data;

// Feature flags based on available services
export const features = {
  email: !!(env.RESEND_API_KEY && env.RESEND_FROM_EMAIL),
  payments: !!(env.STRIPE_PUBLIC_KEY && env.STRIPE_SECRET_KEY),
  ai: !!env.OPENAI_API_KEY,
  videoCall: !!(env.AGORA_APP_ID && env.AGORA_APP_CERTIFICATE),
  objectStorage: !!(env.PUBLIC_OBJECT_SEARCH_PATHS),
} as const;

// Log feature availability (non-critical warnings)
if (!features.email) {
  console.warn('⚠️  Email service disabled - RESEND_API_KEY or RESEND_FROM_EMAIL missing');
}

if (!features.payments) {
  console.warn('⚠️  Payments disabled - Stripe keys missing');
}

if (!features.ai) {
  console.warn('⚠️  AI features disabled - OPENAI_API_KEY missing');
}

if (!features.videoCall) {
  console.warn('⚠️  Video calls disabled - Agora credentials missing');
}

if (!features.objectStorage) {
  console.warn('⚠️  Object storage disabled - using local filesystem fallback');
}

console.log(`🚀 Server starting in ${env.NODE_ENV} mode`);
console.log(`📧 Email: ${features.email ? '✅' : '❌'} | 💳 Payments: ${features.payments ? '✅' : '❌'} | 🤖 AI: ${features.ai ? '✅' : '❌'} | 📹 Video: ${features.videoCall ? '✅' : '❌'} | 🗄️  Storage: ${features.objectStorage ? '✅' : '❌'}`);