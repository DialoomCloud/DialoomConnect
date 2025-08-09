import { z } from 'zod';

/**
 * Contratos compartidos - Fuente única de verdad para validación client ↔ server
 * Previene errores de desalineación tras cambios en API
 */

// =============================================================================
// USER & HOST CONTRACTS
// =============================================================================

export const hostPricingSchema = z.object({
  id: z.string().uuid().optional(),
  userId: z.string(),
  duration: z.number().int().positive(),
  price: z.number().positive(),
  currency: z.string().default('EUR'),
  isPrimary: z.boolean().default(false),
  isActive: z.boolean().default(true),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const hostServicesSchema = z.object({
  screenSharing: z.boolean().default(false),
  translation: z.boolean().default(false), 
  recording: z.boolean().default(false),
  transcription: z.boolean().default(false),
});

export const hostAvailabilitySchema = z.object({
  id: z.string().uuid().optional(),
  userId: z.string(),
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  timezone: z.string().default('Europe/Madrid'),
  isActive: z.boolean().default(true),
});

export const userProfileSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  title: z.string().nullable(),
  description: z.string().nullable(),
  profileImage: z.string().nullable(),
  countryCode: z.string().length(2).nullable(),
  primaryLanguageId: z.number().int().nullable(),
  categoryId: z.number().int().nullable(),
  role: z.enum(['registered', 'host', 'admin']).default('registered'),
  isVerified: z.boolean().default(false),
  isRecommended: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  videoCallTopics: z.array(z.string()).default([]),
  additionalServices: hostServicesSchema.optional(),
  pricing: z.array(hostPricingSchema).default([]),
  availability: z.array(hostAvailabilitySchema).default([]),
});

// =============================================================================
// API REQUEST/RESPONSE CONTRACTS
// =============================================================================

// Host pricing mutations
export const createPricingRequestSchema = hostPricingSchema.omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const updatePricingRequestSchema = hostPricingSchema.partial().extend({
  id: z.string().uuid(),
});

export const hostPricingResponseSchema = z.object({
  success: z.boolean(),
  data: hostPricingSchema,
  message: z.string().optional(),
});

// Host services mutations
export const updateServicesRequestSchema = z.object({
  userId: z.string(),
  services: hostServicesSchema,
});

export const servicesResponseSchema = z.object({
  success: z.boolean(),
  data: hostServicesSchema,
  message: z.string().optional(),
});

// User profile mutations
export const updateProfileRequestSchema = userProfileSchema.partial().extend({
  id: z.string(),
});

export const profileResponseSchema = z.object({
  success: z.boolean(),
  data: userProfileSchema,
  message: z.string().optional(),
});

// Host search filters
export const hostSearchFiltersSchema = z.object({
  categories: z.array(z.string()).optional(),
  skills: z.array(z.string()).optional(), 
  languages: z.array(z.string()).optional(),
  purposes: z.array(z.string()).optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  searchTerm: z.string().optional(),
});

export const hostSearchResponseSchema = z.object({
  hosts: z.array(userProfileSchema),
  totalCount: z.number(),
  filters: hostSearchFiltersSchema,
});

// =============================================================================
// ADMIN CONTRACTS
// =============================================================================

export const adminUserUpdateSchema = z.object({
  id: z.string(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email().optional(),
  role: z.enum(['registered', 'host', 'admin']).optional(),
  isVerified: z.boolean().optional(),
  isRecommended: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export const adminUserResponseSchema = z.object({
  success: z.boolean(),
  data: userProfileSchema,
  message: z.string().optional(),
});

// =============================================================================
// TYPE EXPORTS (for client-side usage)
// =============================================================================

export type HostPricing = z.infer<typeof hostPricingSchema>;
export type HostServices = z.infer<typeof hostServicesSchema>;
export type HostAvailability = z.infer<typeof hostAvailabilitySchema>;
export type UserProfile = z.infer<typeof userProfileSchema>;

export type CreatePricingRequest = z.infer<typeof createPricingRequestSchema>;
export type UpdatePricingRequest = z.infer<typeof updatePricingRequestSchema>;
export type HostPricingResponse = z.infer<typeof hostPricingResponseSchema>;

export type UpdateServicesRequest = z.infer<typeof updateServicesRequestSchema>;
export type ServicesResponse = z.infer<typeof servicesResponseSchema>;

export type UpdateProfileRequest = z.infer<typeof updateProfileRequestSchema>;
export type ProfileResponse = z.infer<typeof profileResponseSchema>;

export type HostSearchFilters = z.infer<typeof hostSearchFiltersSchema>;
export type HostSearchResponse = z.infer<typeof hostSearchResponseSchema>;

export type AdminUserUpdate = z.infer<typeof adminUserUpdateSchema>;
export type AdminUserResponse = z.infer<typeof adminUserResponseSchema>;

// =============================================================================
// VALIDATION HELPERS
// =============================================================================

export const validateApiRequest = <T>(schema: z.ZodSchema<T>, data: unknown): T => {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new Error(`Validation failed: ${result.error.issues.map(i => i.message).join(', ')}`);
  }
  return result.data;
};

export const safeApiResponse = <T>(schema: z.ZodSchema<T>, data: unknown): { success: boolean; data?: T; error?: string } => {
  const result = schema.safeParse(data);
  if (!result.success) {
    return { success: false, error: result.error.issues.map(i => i.message).join(', ') };
  }
  return { success: true, data: result.data };
};