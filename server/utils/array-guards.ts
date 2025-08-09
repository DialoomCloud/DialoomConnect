/**
 * Array Guards - Prevent runtime errors from non-array API responses
 * Implements defensive programming patterns for data integrity
 */

/**
 * Ensures a value is always an array, with detailed logging for debugging
 */
export function ensureArray<T>(value: unknown, context?: string): T[] {
  if (Array.isArray(value)) {
    return value as T[];
  }

  const contextMsg = context ? ` in ${context}` : '';
  
  if (value === null || value === undefined) {
    console.warn(`⚠️  Received null/undefined${contextMsg}, returning empty array`);
    return [];
  }

  console.error(`❌ Expected array${contextMsg}, received:`, {
    type: typeof value,
    value: value,
    constructor: value?.constructor?.name,
  });

  // Return empty array to prevent crashes
  return [];
}

/**
 * Safe API response handler that always returns arrays for list endpoints
 */
export function safeApiResponse<T>(response: unknown, endpoint: string): T[] {
  return ensureArray<T>(response, `API endpoint ${endpoint}`);
}

/**
 * Validates that an API response matches expected shape
 */
export function validateListResponse<T>(
  response: unknown, 
  endpoint: string,
  validator?: (item: unknown) => item is T
): T[] {
  const array = ensureArray<unknown>(response, endpoint);
  
  if (validator) {
    const validItems = array.filter(validator);
    const invalidCount = array.length - validItems.length;
    
    if (invalidCount > 0) {
      console.warn(`⚠️  Filtered ${invalidCount} invalid items from ${endpoint}`);
    }
    
    return validItems;
  }
  
  return array as T[];
}

/**
 * Express middleware to ensure endpoints always return arrays
 */
export function ensureArrayResponse(req: any, res: any, next: any) {
  const originalJson = res.json;
  
  res.json = function(data: any) {
    // For list endpoints, ensure we return arrays
    if (req.path.includes('/api/hosts') || 
        req.path.includes('/api/users') || 
        req.path.includes('/api/categories') ||
        req.path.includes('/api/skills') ||
        req.path.includes('/api/languages')) {
      
      if (!Array.isArray(data)) {
        console.error(`❌ List endpoint ${req.path} returned non-array:`, typeof data);
        return originalJson.call(this, []);
      }
    }
    
    return originalJson.call(this, data);
  };
  
  next();
}