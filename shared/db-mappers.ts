/**
 * Database Mappers - Snake_case ↔ camelCase conversion
 * Single source of truth for field mapping to prevent inconsistencies
 */

/**
 * Maps snake_case DB fields to camelCase API fields
 */
export function mapDbToApi<T extends Record<string, any>>(dbRecord: T): any {
  if (!dbRecord || typeof dbRecord !== 'object') {
    return dbRecord;
  }

  const mapped: any = {};
  
  for (const [key, value] of Object.entries(dbRecord)) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    mapped[camelKey] = value;
  }
  
  return mapped;
}

/**
 * Maps camelCase API fields to snake_case DB fields
 */
export function mapApiToDb<T extends Record<string, any>>(apiRecord: T): any {
  if (!apiRecord || typeof apiRecord !== 'object') {
    return apiRecord;
  }

  const mapped: any = {};
  
  for (const [key, value] of Object.entries(apiRecord)) {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    mapped[snakeKey] = value;
  }
  
  return mapped;
}

/**
 * Common field mappings for consistency
 */
export const FIELD_MAPPINGS = {
  // User fields
  'first_name': 'firstName',
  'last_name': 'lastName',
  'profile_image_url': 'profileImageUrl',
  'country_code': 'countryCode',
  'primary_language_id': 'primaryLanguageId',
  'category_id': 'categoryId',
  'is_verified': 'isVerified',
  'is_recommended': 'isRecommended',
  'is_featured': 'isFeatured',
  'is_active': 'isActive',
  'is_host': 'isHost',
  'is_admin': 'isAdmin',
  'video_call_topics': 'videoCallTopics',
  
  // Language fields
  'is_primary': 'isPrimary',
  'native_name': 'nativeName',
  
  // Timestamps
  'created_at': 'createdAt',
  'updated_at': 'updatedAt',
  'published_at': 'publishedAt',
} as const;

/**
 * Applies known field mappings with fallback to automatic conversion
 */
export function mapFieldsDbToApi<T extends Record<string, any>>(dbRecord: T): any {
  if (!dbRecord || typeof dbRecord !== 'object') {
    return dbRecord;
  }

  const mapped: any = {};
  
  for (const [key, value] of Object.entries(dbRecord)) {
    const mappedKey = FIELD_MAPPINGS[key as keyof typeof FIELD_MAPPINGS] || 
                     key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    mapped[mappedKey] = value;
  }
  
  return mapped;
}

/**
 * Safe array mapping for API responses
 */
export function mapArrayDbToApi<T extends Record<string, any>>(dbArray: T[]): any[] {
  if (!Array.isArray(dbArray)) {
    console.warn('Expected array in mapArrayDbToApi, received:', typeof dbArray);
    return [];
  }
  
  return dbArray.map(mapFieldsDbToApi);
}