import { createClient } from '@supabase/supabase-js';
import type { Request, Response, NextFunction } from 'express';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validate URL format
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Create supabase admin client or dummy fallback
export const supabaseAdmin = supabaseUrl && supabaseServiceKey && isValidUrl(supabaseUrl)
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : {
      auth: {
        getUser: () => Promise.resolve({ 
          data: { user: null }, 
          error: { message: 'Supabase not configured or invalid URL' } 
        })
      }
    } as any;

export const verifySupabaseToken = async (req: Request, res: Response, next: NextFunction) => {
  if (!supabaseUrl || !supabaseServiceKey || !isValidUrl(supabaseUrl)) {
    return res.status(503).json({ message: 'Authentication service not configured or invalid URL' });
  }

  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No authorization token provided' });
    }

    const token = authHeader.substring(7);
    
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Error verifying token:', error);
    return res.status(401).json({ message: 'Token verification failed' });
  }
};

// Middleware to check if user is authenticated (for routes that need auth)
export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  if (!supabaseUrl || !supabaseServiceKey || !isValidUrl(supabaseUrl)) {
    return res.status(503).json({ message: 'Authentication service not configured or invalid URL' });
  }

  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const token = authHeader.substring(7);
  
  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(401).json({ message: 'Unauthorized' });
  }
};