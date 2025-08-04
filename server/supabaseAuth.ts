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

    // Upsert user data to ensure it's in our database
    const [firstName, ...lastNameParts] = (user.user_metadata?.full_name || '').split(' ');
    const lastName = lastNameParts.join(' ');

    try {
      await storage.upsertUser({
        id: user.id,
        email: user.email!,
        firstName: firstName || user.user_metadata?.firstName || '',
        lastName: lastName || user.user_metadata?.lastName || '',
        profileImageUrl: user.user_metadata?.avatar_url || user.user_metadata?.profileImageUrl || '',
      });
    } catch (err) {
      console.error("Failed to update user:", err);
      return res.status(500).json({ message: "Failed to update user information" });
    }

    // Attach user to request
    req.user = user;
    req.userId = user.id;
    
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
    next();
  });
};

// Auth routes
export function setupAuthRoutes(app: Express) {
  // Get current user
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      const dbUser = await storage.getUser(user.id);
      
      res.json({
        id: user.id,
        email: user.email,
        firstName: dbUser?.firstName || '',
        lastName: dbUser?.lastName || '',
        profileImageUrl: dbUser?.profileImageUrl || '',
        isAdmin: isAdmin(req)
      });
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