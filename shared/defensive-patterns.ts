import { z } from 'zod';

/**
 * Defensive Programming Patterns - Shared validation schemas and safety utilities
 * Prevents runtime errors through proactive validation and type-safe operations
 */

// =============================================================================
// SAFE ARRAY OPERATIONS
// =============================================================================

/**
 * Safely converts any value to an array with logging
 */
export function safeArray<T>(value: unknown, context?: string): T[] {
  if (Array.isArray(value)) {
    return value as T[];
  }

  if (context) {
    console.warn(`⚠️  Expected array in ${context}, received:`, typeof value);
  }

  if (value === null || value === undefined) {
    return [];
  }

  // Single item to array
  return [value] as T[];
}

/**
 * Safe string extraction with fallbacks
 */
export function safeString(value: unknown, fallback = ''): string {
  if (typeof value === 'string') {
    return value;
  }
  
  if (value === null || value === undefined) {
    return fallback;
  }
  
  return String(value);
}

/**
 * Safe number extraction with validation
 */
export function safeNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && !isNaN(value)) {
    return value;
  }
  
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? fallback : parsed;
  }
  
  return fallback;
}

// =============================================================================
// VALIDATION SCHEMAS FOR COMMON PATTERNS
// =============================================================================

/**
 * Schema for validating API responses that should be arrays
 */
export const arrayResponseSchema = z.unknown().transform((val) => safeArray(val));

/**
 * Host data validation schema with defensive defaults
 */
export const hostSchema = z.object({
  id: z.string(),
  firstName: z.string().nullable().default(null),
  lastName: z.string().nullable().default(null),
  title: z.string().nullable().default(null),
  description: z.string().nullable().default(null),
  profileImageUrl: z.string().nullable().default(null),
  countryCode: z.string().length(2).nullable().default(null),
  primaryLanguageId: z.number().nullable().default(null),
  categoryId: z.number().nullable().default(null),
  isVerified: z.boolean().default(false),
  isRecommended: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  videoCallTopics: z.array(z.string()).default([]),
});

/**
 * Category validation with safety defaults
 */
export const categorySchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable().default(null),
  imageUrl: z.string().nullable().default(null),
  iconUrl: z.string().nullable().default(null),
  isActive: z.boolean().default(true),
});

/**
 * Language validation with safety defaults
 */
export const languageSchema = z.object({
  id: z.number(),
  name: z.string(),
  code: z.string().nullable().default(null),
  nativeName: z.string().nullable().default(null),
  isActive: z.boolean().default(true),
});

// =============================================================================
// ERROR BOUNDARY PATTERNS
// =============================================================================

/**
 * Wrapper for async operations that might fail
 */
export async function safeAsync<T>(
  operation: () => Promise<T>,
  fallback: T,
  context?: string
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (context) {
      console.error(`❌ Failed in ${context}:`, error);
    }
    return fallback;
  }
}

/**
 * Safe object property access with validation
 */
export function safeGet<T>(obj: unknown, path: string, fallback: T): T {
  try {
    const keys = path.split('.');
    let current = obj as any;
    
    for (const key of keys) {
      if (current === null || current === undefined || !(key in current)) {
        return fallback;
      }
      current = current[key];
    }
    
    return current ?? fallback;
  } catch {
    return fallback;
  }
}

// =============================================================================
// FORM VALIDATION PATTERNS
// =============================================================================

/**
 * Safe form data extraction
 */
export function safeFormData(formData: FormData, key: string, fallback = ''): string {
  try {
    const value = formData.get(key);
    return typeof value === 'string' ? value : fallback;
  } catch {
    return fallback;
  }
}

/**
 * Validate required fields in an object
 */
export function validateRequired<T extends Record<string, unknown>>(
  obj: T,
  requiredFields: (keyof T)[]
): { isValid: boolean; missing: string[] } {
  const missing = requiredFields.filter(field => 
    obj[field] === null || obj[field] === undefined || obj[field] === ''
  ).map(String);
  
  return {
    isValid: missing.length === 0,
    missing,
  };
}

// =============================================================================
// URL AND PATH SAFETY
// =============================================================================

/**
 * Safe URL construction with fallbacks
 */
export function safeUrl(base: string, path?: string): string {
  try {
    if (!path) return base;
    
    const url = new URL(path, base);
    return url.toString();
  } catch {
    return base;
  }
}

/**
 * Sanitize file paths to prevent directory traversal
 */
export function sanitizePath(path: string): string {
  return path
    .replace(/\.\./g, '') // Remove parent directory references
    .replace(/^\/+/, '') // Remove leading slashes
    .replace(/\/+/g, '/') // Normalize multiple slashes
    .trim();
}

// =============================================================================
// TYPE GUARDS
// =============================================================================

/**
 * Check if value is a non-empty string
 */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

/**
 * Check if value is a valid number
 */
export function isValidNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
}

/**
 * Check if value is a valid array with items
 */
export function isNonEmptyArray<T>(value: unknown): value is T[] {
  return Array.isArray(value) && value.length > 0;
}