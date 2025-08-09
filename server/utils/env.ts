import { config } from "dotenv";
import { z } from "zod";

// Load environment variables
const isDevelopment = process.env.NODE_ENV !== "production";
config();
if (isDevelopment) {
  config({ path: ".env.local", override: true });
}

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(8080),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  STRIPE_SECRET_KEY: z.string().optional(),
  AGORA_APP_ID: z.string().optional(),
  AGORA_APP_CERTIFICATE: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM_EMAIL: z.string().optional(),
  SUPABASE_URL: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  CLIENT_ORIGIN: z.string().default("http://localhost:5173"),
  REPLIT_DOMAINS: z.string().optional(),
  APP_URL: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_CONNECT_WEBHOOK_SECRET: z.string().optional(),
  PUBLIC_OBJECT_SEARCH_PATHS: z.string().optional(),
  PRIVATE_OBJECT_DIR: z.string().optional(),
  SESSION_SECRET: z.string().optional(),
  SUPPORT_TEAM_EMAIL: z.string().optional(),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  const formatted = result.error.flatten().fieldErrors;
  const message = `Missing environment variables: ${JSON.stringify(formatted)}`;
  if (isDevelopment) {
    console.warn(message);
  } else {
    console.error(message);
    process.exit(1);
  }
}

export const env = result.success ? result.data : ({} as z.infer<typeof envSchema>);
export type Env = z.infer<typeof envSchema>;
