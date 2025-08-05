import { createClient } from "@supabase/supabase-js";
import type { Request, Response, NextFunction, RequestHandler, Express } from "express";
import { storage } from "./storage";

// Initialize Supabase client with service role key for server-side operations
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase credentials. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Middleware to check if user is authenticated with Supabase
export const isAuthenticated: RequestHandler = async (req: any, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify the JWT token with Supabase
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    // Get user data from our database, handling migration from old IDs
    const [firstName, ...lastNameParts] = (user.user_metadata?.full_name || '').split(' ');
    const lastName = lastNameParts.join(' ');

    let dbUser;
    try {
      // First try to get user by Supabase ID
      dbUser = await storage.getUser(user.id);
      
      if (!dbUser && user.email) {
        // If not found by ID, try to find by email (migration case)
        dbUser = await storage.getUserByEmail(user.email);
        
        if (dbUser) {
          // User exists with old ID, use their existing ID
          console.log(`Migration: User ${user.email} found with existing ID ${dbUser.id}, Supabase ID ${user.id}`);
        }
      }
      
      if (!dbUser) {
        // Create new user if not found
        const provider = user.app_metadata?.provider || 'email';
        dbUser = await storage.upsertUser({
          id: user.id,
          email: user.email!,
          firstName: firstName || user.user_metadata?.firstName || '',
          lastName: lastName || user.user_metadata?.lastName || '',
          profileImageUrl: user.user_metadata?.avatar_url || user.user_metadata?.profileImageUrl || '',
          provider: provider,
          providerUserId: user.id,
        });
      } else {
        // For existing users, only link OAuth provider if needed
        // DO NOT update firstName/lastName from Supabase to preserve user's profile edits
        const provider = user.app_metadata?.provider || 'email';
        
        // Only update profile image if user doesn't have one
        const newProfileImage = user.user_metadata?.avatar_url || user.user_metadata?.profileImageUrl || null;
        
        await storage.upsertUser({
          id: dbUser.id,
          email: user.email!,
          firstName: dbUser.firstName || '',  // Keep existing firstName
          lastName: dbUser.lastName || '',    // Keep existing lastName
          profileImageUrl: dbUser.profileImageUrl || newProfileImage || '',  // Only update if empty
          provider: provider,
          providerUserId: user.id,
        });
      }
    } catch (err) {
      console.error("Failed to handle user:", err);
      return res.status(500).json({ message: "Failed to handle user information" });
    }

    // Attach user to request with the database user ID (not Supabase ID)
    req.user = { ...user, dbId: dbUser.id };
    req.userId = dbUser.id;
    
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(401).json({ message: "Authentication failed" });
  }
};

// Admin check middleware
const ADMIN_EMAILS = ['marcgarcia10@gmail.com', 'nachosaladrigas@gmail.com'];

export const isAdmin = (req: any): boolean => {
  const user = req.user;
  return user && ADMIN_EMAILS.includes(user.email);
};

export const isAdminAuthenticated: RequestHandler = async (req: any, res: Response, next: NextFunction) => {
  // First check if user is authenticated
  return isAuthenticated(req, res, () => {
    if (!isAdmin(req)) {
      return res.status(401).json({ message: "Unauthorized - Admin access required" });
    }
    
    // Set adminUser for compatibility with existing admin routes
    req.adminUser = {
      claims: {
        sub: req.userId  // Use the database user ID
      }
    };
    
    next();
  });
};

// Auth routes
export function setupAuthRoutes(app: Express) {
  // Get current user
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      // Use the database ID, not the Supabase ID
      const dbUser = await storage.getUser(req.userId || user.dbId);
      
      if (dbUser) {
        // Return complete user profile from database
        console.log('🔍 [AUTH USER] Returning complete user profile:', {
          id: dbUser.id,
          address: dbUser.address,
          phone: dbUser.phone,
          city: dbUser.city,
          title: dbUser.title,
          description: dbUser.description
        });
        res.json({
          ...dbUser,  // Return ALL database fields
          isAdmin: isAdmin(req)
        });
      } else {
        // Fallback to limited Supabase data if no database record
        res.json({
          id: user.id,
          email: user.email,
          firstName: '',
          lastName: '',
          profileImageUrl: '',
          isAdmin: isAdmin(req),
          isHost: false,
          role: 'guest'
        });
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user data" });
    }
  });

  // Sign up endpoint
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;
      
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          firstName,
          lastName,
          full_name: `${firstName} ${lastName}`
        }
      });

      if (error) {
        return res.status(400).json({ message: error.message });
      }

      // Create user in our database as well
      try {
        await storage.upsertUser({
          id: data.user.id,
          email: data.user.email!,
          firstName: firstName || '',
          lastName: lastName || '',
          profileImageUrl: '',
          provider: 'email',
          providerUserId: data.user.id,
        });
      } catch (dbError) {
        console.error("Failed to create user in database:", dbError);
        // Continue anyway, user will be created on first authentication
      }

      res.json({ success: true, user: data.user });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ message: "Failed to create account" });
    }
  });

  // Sign in endpoint
  app.post("/api/auth/signin", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Use the admin client to sign in the user
      const { data, error } = await supabaseAdmin.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return res.status(401).json({ message: error.message });
      }

      res.json({
        success: true,
        session: data.session,
        user: data.user
      });
    } catch (error) {
      console.error("Signin error:", error);
      res.status(500).json({ message: "Failed to sign in" });
    }
  });

  // Sign out endpoint
  app.post("/api/auth/signout", isAuthenticated, async (req: any, res) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      
      if (token) {
        // Revoke the JWT token
        await supabaseAdmin.auth.admin.signOut(token);
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Signout error:", error);
      res.json({ success: true }); // Still return success even if revoke fails
    }
  });

  // Admin check endpoint
  app.get('/api/admin/check-session', isAuthenticated, (req: any, res) => {
    if (isAdmin(req)) {
      res.json({ 
        success: true,
        user: {
          id: req.user.id,
          email: req.user.email,
          firstName: req.user.user_metadata?.firstName || '',
          isAdmin: true
        }
      });
    } else {
      res.status(401).json({ message: "No autorizado" });
    }
  });
}