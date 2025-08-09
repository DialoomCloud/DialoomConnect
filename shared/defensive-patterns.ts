import { z } from 'zod';
import React from 'react';

/**
 * Defensive programming patterns to prevent runtime errors
 * Single source of truth for array guards, null checks, and validation
 */

// Array defensive guards
export const safeArray = <T>(data: T[] | null | undefined): T[] => {
  if (!data || !Array.isArray(data)) {
    return [];
  }
  return data;
};

export const safeArrayFilter = <T>(
  data: T[] | null | undefined, 
  predicate: (item: T) => boolean
): T[] => {
  return safeArray(data).filter(predicate);
};

export const safeArrayMap = <T, R>(
  data: T[] | null | undefined,
  mapper: (item: T, index: number) => R
): R[] => {
  return safeArray(data).map(mapper);
};

// String defensive guards
export const safeString = (data: string | null | undefined, fallback: string = ''): string => {
  return data && typeof data === 'string' ? data : fallback;
};

export const safeStringArray = (data: string[] | string | null | undefined): string[] => {
  if (Array.isArray(data)) return data;
  if (typeof data === 'string') return [data];
  return [];
};

// Number defensive guards
export const safeNumber = (data: number | string | null | undefined, fallback: number = 0): number => {
  if (typeof data === 'number' && !isNaN(data)) return data;
  if (typeof data === 'string') {
    const parsed = parseFloat(data);
    return !isNaN(parsed) ? parsed : fallback;
  }
  return fallback;
};

// Object defensive guards
export const safeObject = <T extends Record<string, any>>(
  data: T | null | undefined, 
  fallback: T
): T => {
  return data && typeof data === 'object' && !Array.isArray(data) ? data : fallback;
};

// API response validation schemas
export const apiResponseSchema = <T>(dataSchema: z.ZodType<T>) => 
  z.object({
    data: dataSchema,
    success: z.boolean().optional(),
    message: z.string().optional(),
    error: z.string().optional()
  }).transform((response) => {
    // Always return data, even if API shape is inconsistent
    if (response.data !== undefined) return response.data;
    if ('success' in response && response.success === false) {
      throw new Error(response.error || response.message || 'API request failed');
    }
    // If response is actually the data itself (inconsistent API)
    return response as any;
  });

// Host data validation with defensive defaults
export const hostSchema = z.object({
  id: z.string(),
  email: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  categoryId: z.number().nullable().optional(),
  languages: z.array(z.any()).optional().default([]),
  categories: z.array(z.any()).optional().default([]),
  videoCallTopics: z.array(z.string()).optional().default([]),
  title: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  profileImageUrl: z.string().nullable().optional(),
  countryCode: z.string().nullable().optional(),
}).transform((data) => ({
  ...data,
  // Apply defensive defaults
  languages: safeArray(data.languages),
  categories: safeArray(data.categories),
  videoCallTopics: safeArray(data.videoCallTopics),
  title: safeString(data.title),
  description: safeString(data.description),
  profileImageUrl: safeString(data.profileImageUrl),
  countryCode: safeString(data.countryCode),
}));

// Array response wrapper
export const arrayResponseSchema = <T>(itemSchema: z.ZodType<T>) => 
  z.union([
    z.array(itemSchema),
    z.object({}).optional() // Handle empty objects
  ]).transform((data) => {
    if (Array.isArray(data)) return data;
    return []; // Convert any non-array to empty array
  });

// Pricing validation with constraints
export const pricingConstraintSchema = z.object({
  duration: z.number().int().min(0).max(480), // Max 8 hours
  price: z.union([z.string(), z.number()]).transform(val => String(val)),
  isActive: z.boolean().default(true),
}).refine((data) => {
  const price = parseFloat(data.price);
  return !isNaN(price) && price >= 0 && price <= 9999;
}, {
  message: "Price must be a valid number between 0 and 9999"
});

// Safe JSON parsing
export const safeJsonParse = <T>(json: string, fallback: T): T => {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
};

// Error boundary helpers
export const createErrorBoundary = (componentName: string) => ({
  onError: (error: Error, errorInfo: any) => {
    console.error(`Error in ${componentName}:`, error, errorInfo);
    // Could add error reporting here
  },
  fallback: React.createElement('div', {
    className: 'p-4 bg-red-50 text-red-700 rounded-lg'
  }, `Something went wrong in ${componentName}. Please refresh the page.`)
});

// API request wrapper with defensive error handling
export const safeApiRequest = async <T>(
  url: string,
  options?: RequestInit,
  schema?: z.ZodType<T>
): Promise<T | null> => {
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      console.warn(`API request failed: ${response.status} ${response.statusText}`);
      return null;
    }
    
    const data = await response.json();
    
    if (schema) {
      try {
        return schema.parse(data);
      } catch (validationError) {
        console.warn('API response validation failed:', validationError);
        return null;
      }
    }
    
    return data;
  } catch (error) {
    console.error('Network error:', error);
    return null;
  }
};