import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

if (!process.env.REPLIT_DOMAINS) {
  throw new Error("Environment variable REPLIT_DOMAINS not provided");
}

const getOidcConfig = memoize(
  async () => {
    try {
      console.log(`Attempting OIDC discovery with client_id: ${process.env.REPL_ID}`);
      
      return await client.discovery(
        new URL("https://replit.com/oidc"),
        process.env.REPL_ID!
      );
    } catch (error) {
      console.error("OIDC discovery failed:", error);
      throw error;
    }
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // false in dev, true in prod
      maxAge: sessionTtl,
    },
  });
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUser(
  claims: any,
) {
  await storage.upsertUser({
    id: claims["sub"],
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"],
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  const config = await getOidcConfig();

  const verify: VerifyFunction = async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback
  ) => {
    const user = {};
    updateUserSession(user, tokens);
    await upsertUser(tokens.claims());
    verified(null, user);
  };

  // Add strategies for both Replit domains and localhost
  const domains = [...process.env.REPLIT_DOMAINS!.split(","), "localhost"];
  
  for (const domain of domains) {
    const isLocalhost = domain === "localhost";
    const protocol = isLocalhost ? "http" : "https";
    const port = isLocalhost ? ":5000" : "";
    
    const strategy = new Strategy(
      {
        name: `replitauth:${domain}`,
        config,
        scope: "openid email profile offline_access",
        callbackURL: `${protocol}://${domain}${port}/api/callback`,
      },
      verify,
    );
    passport.use(strategy);
    console.log(`Registered strategy: replitauth:${domain} with callback: ${protocol}://${domain}${port}/api/callback`);
  }

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  // Add endpoint to clear session and force new account selection
  app.get("/api/clear-session", (req, res) => {
    console.log('Clear session requested');
    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          console.error('Error destroying session:', err);
        }
        // Clear all authentication cookies
        const cookiesToClear = ['connect.sid', 'session', 'auth', 'repl_session', 'repl_identity'];
        cookiesToClear.forEach(cookieName => {
          res.clearCookie(cookieName, {
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
          });
        });
        
        console.log('Session cleared successfully');
        res.json({ success: true, message: 'Session cleared' });
      });
    } else {
      res.json({ success: true, message: 'No session to clear' });
    }
  });

  app.get("/api/login", (req, res, next) => {
    const hostname = req.hostname;
    console.log(`Login attempt for hostname: ${hostname}`);
    console.log(`Available strategies: ${Object.keys((passport as any)._strategies || {})}`);
    
    const strategyName = `replitauth:${hostname}`;
    console.log(`Using strategy: ${strategyName}`);
    
    // Check if strategy exists
    if (!(passport as any)._strategies[strategyName]) {
      console.error(`Strategy ${strategyName} not found!`);
      return res.status(500).json({ 
        error: "Authentication strategy not configured",
        hostname,
        availableStrategies: Object.keys((passport as any)._strategies || {})
      });
    }
    
    // Remove unsupported prompt parameter - Replit Auth doesn't support select_account
    const authOptions: any = {
      scope: ["openid", "email", "profile", "offline_access"]
    };
    
    // Add state parameter to track the authentication flow
    authOptions.state = Buffer.from(JSON.stringify({
      returnTo: req.query.returnTo || '/home',
      timestamp: Date.now()
    })).toString('base64');
    
    passport.authenticate(strategyName, authOptions)(req, res, next);
  });

  app.get("/api/callback", (req, res, next) => {
    // Log query parameters to debug OAuth errors
    console.log("OAuth callback received with params:", {
      query: req.query,
      hostname: req.hostname,
      headers: req.headers,
      url: req.url
    });
    
    // Check if there's an error in the query params
    if (req.query.error) {
      console.error("OAuth server returned error:", {
        error: req.query.error,
        error_description: req.query.error_description,
        state: req.query.state
      });
    }
    
    passport.authenticate(`replitauth:${req.hostname}`, 
      (err: any, user: any, info: any) => {
        if (err) {
          console.error("OAuth callback error:", err);
          console.error("Error details:", {
            message: err.message,
            stack: err.stack,
            code: err.code,
            error: err.error,
            error_description: err.error_description
          });
          return res.redirect("/api/login?error=auth_failed");
        }
        
        if (!user) {
          console.error("OAuth callback - no user:", info);
          return res.redirect("/api/login?error=no_user");
        }
        
        req.logIn(user, (loginErr) => {
          if (loginErr) {
            console.error("Login error:", loginErr);
            return res.redirect("/api/login?error=login_failed");
          }
          
          return res.redirect("/profile");
        });
      }
    )(req, res, next);
  });

  app.get("/api/logout", (req, res) => {
    console.log('Logout requested - clearing all session data');
    
    req.logout(() => {
      // Clear the session completely
      req.session.destroy((err) => {
        if (err) {
          console.error('Error destroying session:', err);
        }
        
        // Clear all session-related cookies
        const cookiesToClear = ['connect.sid', 'session', 'auth'];
        cookiesToClear.forEach(cookieName => {
          res.clearCookie(cookieName, {
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
          });
        });
        
        // Clear any other potential cookies
        res.clearCookie('repl_session');
        res.clearCookie('repl_identity');
        
        console.log('Session destroyed, redirecting to Replit logout...');
        
        // Force Replit to prompt for user selection on next login
        const protocol = req.hostname === 'localhost' ? 'http' : 'https';
        const host = req.hostname === 'localhost' ? 'localhost:5000' : req.get('host');
        const redirectUri = `${protocol}://${host}/`;
        
        console.log('Logout redirect URI:', redirectUri);
        
        // Use endSessionUrl if available, otherwise redirect to home
        let logoutUrl = redirectUri;
        try {
          if (config.endSessionEndpoint) {
            logoutUrl = `${config.endSessionEndpoint}?client_id=${process.env.REPL_ID}&post_logout_redirect_uri=${encodeURIComponent(redirectUri)}&state=force_logout_${Date.now()}`;
          }
        } catch (error) {
          console.log('Could not build end session URL, using simple redirect');
        }
        
        console.log('Logout URL:', logoutUrl);
        res.redirect(logoutUrl);
      });
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const user = req.user as any;

  if (!req.isAuthenticated() || !user.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    return next();
  }

  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};
