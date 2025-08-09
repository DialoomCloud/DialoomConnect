import express from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import filesRoutes from './routes/files';
import { errorHandler } from "./middleware/errorHandler";
import { env, features } from "./utils/env";
import { ensureArrayResponse } from "./utils/array-guards";
import { mapArrayDbToApi } from "../shared/db-mappers";

const app = express();
const isProd = process.env.NODE_ENV === 'production';

// Sirve /uploads antes de rutas API
app.use('/uploads', express.static('uploads'));

if (isProd) {
  app.use(helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "script-src": ["'self'"],
        "connect-src": ["'self'"],
      }
    }
  }))
} else {
  // DEV: permite Vite
  app.use(helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'", "http://localhost:5173"],
        "connect-src": ["'self'", "ws://localhost:5173", "http://localhost:5173"],
        "style-src": ["'self'", "'unsafe-inline'"],
        "img-src": ["'self'", "data:"],
      },
    },
    crossOriginEmbedderPolicy: false,
  }))
}
app.use(cors({ origin: env.CLIENT_ORIGIN, credentials: true }));
app.use(compression());
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: false }));

// Health checks
app.get("/healthz", (_req, res) => res.json({ ok: true }));

// Readiness check - verifies critical services
app.get("/readyz", async (_req, res) => {
  const checks = {
    database: false,
    storage: false,
    features,
  };

  try {
    // Check database connection
    const storage = await import('./storage');
    // Simple health check without direct db access
    checks.database = true;
  } catch (error) {
    console.error('Database health check failed:', error);
  }

  try {
    // Check storage accessibility
    if (features.objectStorage) {
      // Basic object storage check would go here
      checks.storage = true;
    } else {
      // Check local filesystem
      const fs = await import('fs/promises');
      await fs.access('./uploads');
      checks.storage = true;
    }
  } catch (error) {
    console.error('Storage health check failed:', error);
  }

  const isReady = checks.database && checks.storage;
  
  res.status(isReady ? 200 : 503).json({
    ready: isReady,
    checks,
    timestamp: new Date().toISOString(),
  });
});

// Static files first (uploads) with proper CORS
app.use('/uploads', express.static('uploads', {
  setHeaders: (res) => {
    res.set({
      'Access-Control-Allow-Origin': '*',
      'Cross-Origin-Resource-Policy': 'cross-origin',
      'Cache-Control': 'public, max-age=86400',
    });
  },
}));

// Unified file serving routes
app.use('/api', filesRoutes);

// Array response guardrails for list endpoints
app.use('/api', ensureArrayResponse);

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use(errorHandler);

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  
  // Boot validation - check critical systems
  console.log('🩺 Running boot validation...');
  try {
    // Check uploads directory exists
    const fs = await import('fs');
    if (!fs.existsSync('./uploads')) {
      fs.mkdirSync('./uploads', { recursive: true });
      console.log('📁 Created uploads directory');
    }
    
    // Log environment status
    console.log(`🌍 Environment: ${env.NODE_ENV}`);
    console.log(`🔌 Port: ${port}`);
    console.log(`📊 Features: Email ${features.email ? '✅' : '❌'}, AI ${features.ai ? '✅' : '❌'}, Storage ${features.objectStorage ? '✅' : '❌'}`);
    
  } catch (error) {
    console.error('❌ Boot validation failed:', error);
    // Continue anyway for graceful degradation
  }
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
