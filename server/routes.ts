import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import multer from "multer";
import sharp from "sharp";
import path from "path";
import { promises as fs } from "fs";
import { insertMediaContentSchema, updateUserProfileSchema } from "@shared/schema";
import { z } from "zod";
import { storageBucket } from "./storage-bucket";
import { replitStorage } from "./object-storage";
import Stripe from "stripe";
import session from "express-session";
import { generateAgoraToken } from "./agora-token";
import { emailService } from "./email-service";
import { initializeEmailTemplates } from "./email-templates-init";
import { aiSearchService } from "./ai-search";
import { 
  createEmailTemplateSchema, 
  updateEmailTemplateSchema,
  createUserMessageSchema,
  createNewsArticleSchema,
  updateNewsArticleSchema 
} from "@shared/schema";

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'video') {
      if (file.mimetype.startsWith('video/mp4')) {
        cb(null, true);
      } else {
        cb(new Error('Solo se permiten archivos MP4'));
      }
    } else if (file.fieldname === 'image') {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Solo se permiten archivos de imagen'));
      }
    } else {
      cb(new Error('Tipo de archivo no permitido'));
    }
  }
});

// Helper for password hashing
import bcrypt from "bcryptjs";

// Initialize Stripe
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-07-30.basil",
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure session for admin
  app.use(session({
    secret: process.env.SESSION_SECRET || 'dialoom-admin-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true in production with HTTPS
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // Auth middleware
  await setupAuth(app);
  
  // Admin check session endpoint
  app.get('/api/admin/check-session', async (req, res) => {
    if ((req as any).session?.isAdmin && (req as any).session?.userId) {
      const user = await storage.getUser((req as any).session.userId);
      if (user && (user.isAdmin || user.role === 'admin')) {
        res.json({ 
          success: true,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            isAdmin: user.isAdmin,
            role: user.role
          }
        });
      } else {
        res.status(401).send("No autorizado");
      }
    } else {
      res.status(401).send("No autorizado");
    }
  });

  // Admin authentication middleware
  const isAdminAuthenticated: RequestHandler = async (req: any, res, next) => {
    if (req.session?.isAdmin && req.session?.userId) {
      const user = await storage.getUser(req.session.userId);
      if (user && (user.isAdmin || user.role === 'admin')) {
        req.adminUser = user;
        next();
      } else {
        res.status(401).json({ message: "Unauthorized - Admin access required" });
      }
    } else {
      res.status(401).json({ message: "Unauthorized - Admin access required" });
    }
  };

  // Admin login endpoint (separate from Replit auth)
  app.post('/api/admin/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).send("Usuario y contraseña requeridos");
      }
      
      // Find user by username
      const user = await storage.getUserByUsername(username);
      
      if (!user || !user.passwordHash) {
        return res.status(401).send("Credenciales inválidas");
      }
      
      // Check if user is admin
      if (!user.isAdmin && user.role !== 'admin') {
        return res.status(403).send("Acceso denegado");
      }
      
      // Verify password
      const validPassword = await bcrypt.compare(password, user.passwordHash);
      if (!validPassword) {
        return res.status(401).send("Credenciales inválidas");
      }
      
      // Log the user in using the session
      (req as any).session.userId = user.id;
      (req as any).session.isAdmin = true;
      (req as any).user = user;
      
      res.json({ 
        success: true, 
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          isAdmin: user.isAdmin,
          role: user.role
        }
      });
    } catch (error) {
      console.error("Admin login error:", error);
      res.status(500).send("Error del servidor");
    }
  });
  
  // Serve uploaded files with GDPR compliance
  app.use('/uploads', (req, res, next) => {
    res.header('Cross-Origin-Resource-Policy', 'cross-origin');
    
    // Add privacy headers for GDPR compliance
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Pragma', 'no-cache');
    res.header('Expires', '0');
    
    next();
  });
  app.use('/uploads', express.static('uploads'));

  // Serve files from Replit Object Storage with fallback to local files
  app.get('/storage/*', async (req, res) => {
    try {
      const objectPath = req.params[0];
      console.log(`Attempting to serve file: ${objectPath}`);
      
      let fileBuffer: Buffer;
      
      try {
        // Try Object Storage first
        fileBuffer = await replitStorage.getFile(objectPath);
      } catch (objectStorageError) {
        console.log('Object Storage failed, trying local fallback...');
        
        // Fallback to local file system
        // Convert Object Storage path to local path
        const localPath = objectPath.replace('Objects/', 'uploads/');
        
        try {
          const fs = await import('fs/promises');
          fileBuffer = await fs.readFile(localPath);
          console.log(`Served from local filesystem: ${localPath}`);
        } catch (localError) {
          console.error('Both Object Storage and local file failed:', {
            objectStorageError: objectStorageError.message,
            localError: localError.message
          });
          return res.status(404).json({ message: 'File not found' });
        }
      }

      // Determine content type based on file extension
      const ext = objectPath.split('.').pop()?.toLowerCase();
      let contentType = 'application/octet-stream';
      
      if (ext === 'webp' || ext === 'jpg' || ext === 'jpeg' || ext === 'png') {
        contentType = `image/${ext === 'jpg' ? 'jpeg' : ext}`;
      } else if (ext === 'mp4') {
        contentType = 'video/mp4';
      } else if (ext === 'pdf') {
        contentType = 'application/pdf';
      }

      res.set('Content-Type', contentType);
      res.set('Cache-Control', 'private, max-age=3600');
      res.send(fileBuffer);
    } catch (error) {
      console.error('Error serving file from Object Storage:', error);
      res.status(404).json({ message: 'File not found' });
    }
  });



  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUserWithPrivateInfo(userId, userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Public route to get all hosts
  app.get('/api/hosts', async (req, res) => {
    try {
      const hosts = await storage.getAllUsers();
      res.json(hosts);
    } catch (error) {
      console.error("Error fetching hosts:", error);
      res.status(500).json({ message: "Failed to fetch hosts" });
    }
  });

  // AI-powered host search endpoint
  app.post('/api/hosts/search', async (req, res) => {
    try {
      const { query } = req.body;
      
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ message: "Query is required" });
      }

      // Get all hosts
      const hosts = await storage.getAllUsers();
      
      // Convert to AI search format
      const hostProfiles = hosts.map(host => ({
        id: host.id,
        firstName: host.firstName,
        lastName: host.lastName,
        title: host.title,
        bio: host.bio,
        professionalCategory: host.professionalCategory,
        skills: [], // Will be populated from user skills relation
        languages: [], // Will be populated from user languages relation
        email: host.email
      }));

      // Get additional data for each host
      for (const profile of hostProfiles) {
        try {
          const skills = await storage.getUserSkills(profile.id);
          profile.skills = skills.map(s => s.name);
          
          const languages = await storage.getUserLanguages(profile.id);
          profile.languages = languages.map(l => l.name);
        } catch (error) {
          console.error(`Error fetching additional data for host ${profile.id}:`, error);
        }
      }

      // Use AI to search and rank hosts
      const results = await aiSearchService.searchHosts(hostProfiles, query);
      
      // Return the ranked results with original host data
      const rankedHosts = results.map(result => ({
        ...hosts.find(h => h.id === result.host.id),
        relevance: result.relevance
      }));

      res.json({
        query,
        results: rankedHosts,
        count: rankedHosts.length
      });
    } catch (error) {
      console.error("Error in AI host search:", error);
      res.status(500).json({ message: "Failed to search hosts" });
    }
  });

  // Public endpoint to get service prices (no auth required)
  app.get('/api/config/service-prices', async (req, res) => {
    try {
      const configs = await storage.getAllAdminConfig();
      
      const prices = {
        screenSharing: 10,
        translation: 25,
        recording: 10,
        transcription: 5
      };
      
      configs.forEach((config: any) => {
        const value = parseFloat(config.value);
        switch (config.key) {
          case 'screen_sharing_price':
            prices.screenSharing = value;
            break;
          case 'translation_price':
            prices.translation = value;
            break;
          case 'recording_price':
            prices.recording = value;
            break;
          case 'transcription_price':
            prices.transcription = value;
            break;
        }
      });
      
      res.json(prices);
    } catch (error) {
      console.error('Error fetching service prices:', error);
      // Return default prices if there's an error
      res.json({
        screenSharing: 10,
        translation: 25,
        recording: 10,
        transcription: 5
      });
    }
  });

  // User relations routes
  app.get('/api/user/languages/:userId', isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const userLanguages = await storage.getUserLanguages(userId);
      res.json(userLanguages);
    } catch (error) {
      console.error("Error fetching user languages:", error);
      res.status(500).json({ message: "Failed to fetch user languages" });
    }
  });

  app.get('/api/user/skills/:userId', isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const userSkills = await storage.getUserSkills(userId);
      res.json(userSkills);
    } catch (error) {
      console.error("Error fetching user skills:", error);
      res.status(500).json({ message: "Failed to fetch user skills" });
    }
  });

  // Reference data routes
  app.get("/api/countries", async (req, res) => {
    try {
      const countries = await storage.getCountries();
      // Sort countries alphabetically by name
      const sortedCountries = countries.sort((a, b) => a.name.localeCompare(b.name));
      res.json(sortedCountries);
    } catch (error) {
      console.error("Error fetching countries:", error);
      res.status(500).json({ message: "Failed to fetch countries" });
    }
  });

  app.get("/api/languages", async (req, res) => {
    try {
      const languages = await storage.getLanguages();
      // Sort languages alphabetically by name
      const sortedLanguages = languages.sort((a, b) => a.name.localeCompare(b.name));
      res.json(sortedLanguages);
    } catch (error) {
      console.error("Error fetching languages:", error);
      res.status(500).json({ message: "Failed to fetch languages" });
    }
  });

  app.get("/api/skills", async (req, res) => {
    try {
      const skills = await storage.getSkills();
      res.json(skills);
    } catch (error) {
      console.error("Error fetching skills:", error);
      res.status(500).json({ message: "Failed to fetch skills" });
    }
  });

  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Profile image upload route
  app.post('/api/upload/profile-image', isAuthenticated, upload.single('image'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No se proporcionó ninguna imagen" });
      }

      const userId = req.user.claims.sub;
      
      // Initialize and upload to Replit Object Storage
      await replitStorage.initializeBucket();
      const storagePath = await replitStorage.uploadProfileImage(
        userId, 
        req.file.buffer, 
        req.file.originalname
      );
      
      // Update user profile with new image path
      const updatedUser = await storage.updateProfileImage(userId, storagePath);
      
      res.json({ 
        message: "Imagen de perfil actualizada exitosamente",
        user: updatedUser,
        storagePath: storagePath
      });
    } catch (error) {
      console.error("Error uploading profile image:", error);
      res.status(500).json({ message: "Error al subir la imagen de perfil" });
    }
  });

  // Profile routes
  app.put('/api/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { skillIds, languageIds, ...profileData } = req.body;
      
      console.log('Profile update request:', {
        userId,
        profileData,
        skillIds,
        languageIds,
      });
      
      const validatedData = updateUserProfileSchema.parse(profileData);
      console.log('Validated profile data:', validatedData);
      
      const updatedUser = await storage.updateUserProfile(userId, validatedData);
      console.log('User profile updated successfully');

      // Update user languages if provided
      if (Array.isArray(languageIds)) {
        console.log('Updating user languages:', languageIds);
        await storage.updateUserLanguages(userId, languageIds);
        console.log('User languages updated successfully');
      }

      // Update user skills if provided  
      if (Array.isArray(skillIds)) {
        console.log('Updating user skills:', skillIds);
        await storage.updateUserSkills(userId, skillIds);
        console.log('User skills updated successfully');
      }
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating profile:", error);
      if (error instanceof z.ZodError) {
        console.error("Validation errors:", error.errors);
        return res.status(400).json({ message: "Invalid profile data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Media content routes
  // Upload video file
  app.post("/api/upload/video", isAuthenticated, upload.single('video'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No se proporcionó ningún archivo" });
      }

      const userId = req.user.claims.sub;
      
      // Upload to Replit Object Storage
      const storagePath = await replitStorage.uploadMediaFile(
        userId,
        req.file.buffer,
        req.file.originalname,
        'video'
      );

      const mediaData = {
        userId,
        type: "video" as const,
        url: storagePath,
        title: req.body.title || req.file.originalname,
        description: req.body.description || "",
        fileName: req.file.originalname,
        fileSize: req.file.size.toString(),
        mimeType: req.file.mimetype,
      };

      const mediaContent = await storage.createMediaContent(mediaData);

      res.json({ 
        message: "Video subido exitosamente",
        media: mediaContent 
      });
    } catch (error) {
      console.error("Error uploading video:", error);
      res.status(500).json({ message: "Error al subir el video" });
    }
  });

  // Upload image file
  app.post("/api/upload/image", isAuthenticated, upload.single('image'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No se proporcionó ningún archivo" });
      }

      const userId = req.user.claims.sub;
      
      // Upload to Replit Object Storage
      const storagePath = await replitStorage.uploadMediaFile(
        userId,
        req.file.buffer,
        req.file.originalname,
        'image'
      );

      const mediaData = {
        userId,
        type: "image" as const,
        url: storagePath,
        title: req.body.title || req.file.originalname,
        description: req.body.description || "",
        fileName: req.file.originalname,
        fileSize: req.file.size.toString(),
        mimeType: "image/webp",
      };

      const mediaContent = await storage.createMediaContent(mediaData);

      res.json({
        message: "Imagen subida exitosamente",
        media: mediaContent
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      res.status(500).json({ message: "Error al subir la imagen" });
    }
  });

  // Upload logo to public media folder
  app.post("/api/upload/logo", upload.single('logo'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No logo file uploaded" });
      }

      // Upload to Object Storage public media folder
      const objectPath = 'media/dialoom-logo.png';
      
      // Save to local filesystem as primary storage
      const fs = await import('fs/promises');
      const path = await import('path');
      const localPath = `uploads/${objectPath}`;
      
      // Ensure directory exists
      await fs.mkdir(path.dirname(localPath), { recursive: true });
      await fs.writeFile(localPath, req.file.buffer);
      console.log(`Logo saved locally: ${localPath}`);

      // Try to upload to Object Storage as backup
      const uploadResult = await replitStorage.uploadPublicFile('dialoom-logo.png', req.file.buffer);
      if (!uploadResult.success) {
        console.warn('Object Storage upload had issues:', uploadResult.error);
      }

      // Return the public URL
      const publicUrl = `/storage/media/dialoom-logo.png`;
      
      res.json({ 
        success: true, 
        url: publicUrl,
        message: 'Logo uploaded successfully' 
      });
    } catch (error) {
      console.error('Error uploading logo:', error);
      res.status(500).json({ message: 'Failed to upload logo' });
    }
  });

  app.get('/api/media', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const mediaContent = await storage.getUserMediaContent(userId);
      res.json(mediaContent);
    } catch (error) {
      console.error("Error fetching media content:", error);
      res.status(500).json({ message: "Failed to fetch media content" });
    }
  });

  app.post('/api/media', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertMediaContentSchema.parse({
        ...req.body,
        userId,
      });
      
      const newContent = await storage.createMediaContent(validatedData);
      res.json(newContent);
    } catch (error) {
      console.error("Error creating media content:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid media content data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create media content" });
    }
  });

  app.put('/api/media/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertMediaContentSchema.partial().parse(req.body);
      
      const updatedContent = await storage.updateMediaContent(id, validatedData);
      res.json(updatedContent);
    } catch (error) {
      console.error("Error updating media content:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid media content data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update media content" });
    }
  });

  app.delete('/api/media/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.claims.sub;
      
      const deleted = await storage.deleteMediaContent(id, userId);
      if (deleted) {
        res.json({ message: "Media content deleted successfully" });
      } else {
        res.status(404).json({ message: "Media content not found" });
      }
    } catch (error) {
      console.error("Error deleting media content:", error);
      res.status(500).json({ message: "Failed to delete media content" });
    }
  });

  // Update media order (for drag and drop)
  app.put('/api/media/order', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { mediaIds } = req.body;
      
      if (!Array.isArray(mediaIds)) {
        return res.status(400).json({ message: "mediaIds must be an array" });
      }
      
      await storage.updateMediaOrder(userId, mediaIds);
      res.json({ message: "Media order updated successfully" });
    } catch (error) {
      console.error("Error updating media order:", error);
      res.status(500).json({ message: "Failed to update media order" });
    }
  });

  // Reference data routes (no auth required for lookups)
  app.get('/api/countries', async (req, res) => {
    try {
      const countries = await storage.getCountries();
      res.json(countries);
    } catch (error) {
      console.error("Error fetching countries:", error);
      res.status(500).json({ message: "Failed to fetch countries" });
    }
  });

  app.get('/api/languages', async (req, res) => {
    try {
      const languages = await storage.getLanguages();
      res.json(languages);
    } catch (error) {
      console.error("Error fetching languages:", error);
      res.status(500).json({ message: "Failed to fetch languages" });
    }
  });

  app.get('/api/skills', async (req, res) => {
    try {
      const skills = await storage.getSkills();
      res.json(skills);
    } catch (error) {
      console.error("Error fetching skills:", error);
      res.status(500).json({ message: "Failed to fetch skills" });
    }
  });

  app.get('/api/categories', async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Private document upload route (requires verification)
  app.post('/api/upload/private-document', isAuthenticated, upload.single('document'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No se proporcionó ningún documento" });
      }

      const userId = req.user.claims.sub;
      const { documentType } = req.body;

      if (!documentType) {
        return res.status(400).json({ message: "Tipo de documento requerido" });
      }

      // Store document in user's private bucket directory using Object Storage
      const documentPath = await replitStorage.uploadPrivateDocument(
        userId,
        req.file.buffer,
        req.file.originalname,
        documentType
      );

      res.json({
        message: "Documento privado subido exitosamente. Esperando verificación del administrador.",
        documentPath: documentPath,
        documentType: documentType
      });
    } catch (error) {
      console.error("Error uploading private document:", error);
      res.status(500).json({ message: "Error al subir el documento privado" });
    }
  });

  // Admin routes - Get users pending verification
  app.get('/api/admin/users/pending', isAdminAuthenticated, async (req: any, res) => {
    try {
      // Get users who have uploaded documents but are not verified
      const pendingUsers = await storage.getPendingVerificationUsers();
      res.json(pendingUsers);
    } catch (error) {
      console.error("Error fetching pending users:", error);
      res.status(500).json({ message: "Error al obtener usuarios pendientes" });
    }
  });

  // Admin routes - Verify user
  app.post('/api/admin/users/:targetUserId/verify', isAdminAuthenticated, async (req: any, res) => {
    try {
      const { targetUserId } = req.params;
      const { isVerified, notes } = req.body;

      await storage.verifyUser(targetUserId, isVerified, req.adminUser.id, notes);
      
      res.json({
        message: isVerified ? "Usuario verificado exitosamente" : "Verificación de usuario denegada",
        verified: isVerified
      });
    } catch (error) {
      console.error("Error verifying user:", error);
      res.status(500).json({ message: "Error al verificar usuario" });
    }
  });

  // Admin Dashboard Stats
  app.get('/api/admin/stats', isAdminAuthenticated, async (req: any, res) => {
    try {
      // Get statistics
      const stats = {
        totalHosts: await storage.getTotalHosts(),
        newHostsThisMonth: await storage.getNewHostsThisMonth(),
        totalCalls: await storage.getTotalVideoCalls(),
        callsToday: await storage.getCallsToday(),
        monthlyRevenue: await storage.getMonthlyRevenue(),
        revenueGrowth: await storage.getRevenueGrowth(),
        avgCallDuration: await storage.getAverageCallDuration()
      };

      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch admin statistics" });
    }
  });

  // Admin - Get all hosts
  app.get('/api/admin/hosts', isAdminAuthenticated, async (req: any, res) => {
    try {
      const hosts = await storage.getAllHosts();
      res.json(hosts);
    } catch (error) {
      console.error("Error fetching hosts:", error);
      res.status(500).json({ message: "Failed to fetch hosts" });
    }
  });

  // Admin - Get/Update configuration
  app.get('/api/admin/config', isAdminAuthenticated, async (req: any, res) => {
    try {
      const config = await storage.getAllAdminConfig();
      res.json(config);
    } catch (error) {
      console.error("Error fetching config:", error);
      res.status(500).json({ message: "Failed to fetch configuration" });
    }
  });

  app.put('/api/admin/config', isAdminAuthenticated, async (req: any, res) => {
    try {
      const config = await storage.updateMultipleAdminConfigs(req.body, req.adminUser.id);
      res.json(config);
    } catch (error) {
      console.error("Error updating config:", error);
      res.status(500).json({ message: "Failed to update configuration" });
    }
  });

  // Admin - Create/Update individual configuration
  app.post('/api/admin/config', isAdminAuthenticated, async (req: any, res) => {
    try {
      const { key, value, description } = req.body;
      const updatedConfig = await storage.updateAdminConfig(key, value, req.adminUser.id, description);
      
      // Create audit log
      await storage.createAuditLog({
        adminId: req.adminUser.id,
        action: 'update_config',
        targetTable: 'admin_config',
        targetId: key,
        oldValue: null,
        newValue: { value },
        description: `Updated config: ${key}`,
      });
      
      res.json(updatedConfig);
    } catch (error) {
      console.error("Error updating config:", error);
      res.status(500).json({ message: "Failed to update configuration" });
    }
  });

  // Host availability routes
  app.get('/api/host/availability', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const availability = await storage.getHostAvailability(userId);
      res.json(availability);
    } catch (error) {
      console.error("Error fetching host availability:", error);
      res.status(500).json({ message: "Failed to fetch availability" });
    }
  });

  app.post('/api/host/availability', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const availability = await storage.addHostAvailability({
        ...req.body,
        userId,
      });
      res.json(availability);
    } catch (error) {
      console.error("Error adding host availability:", error);
      res.status(500).json({ message: "Failed to add availability" });
    }
  });

  app.delete('/api/host/availability/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      const deleted = await storage.deleteHostAvailability(id, userId);
      if (deleted) {
        res.json({ message: "Availability deleted successfully" });
      } else {
        res.status(404).json({ message: "Availability not found" });
      }
    } catch (error) {
      console.error("Error deleting host availability:", error);
      res.status(500).json({ message: "Failed to delete availability" });
    }
  });

  // Public user profile routes
  app.get('/api/users/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const user = await storage.getUser(id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Return public profile information only
      const publicProfile = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl,
        city: user.city,
        countryCode: user.countryCode,
        title: user.title,
        description: user.description,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
      };
      
      res.json(publicProfile);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      res.status(500).json({ message: "Failed to fetch user profile" });
    }
  });

  app.get('/api/users/:id/media', async (req, res) => {
    try {
      const { id } = req.params;
      const media = await storage.getUserMedia(id);
      res.json(media);
    } catch (error) {
      console.error("Error fetching user media:", error);
      res.status(500).json({ message: "Failed to fetch user media" });
    }
  });

  app.get('/api/users/:id/availability', async (req, res) => {
    try {
      const { id } = req.params;
      const availability = await storage.getHostAvailability(id);
      res.json(availability);
    } catch (error) {
      console.error("Error fetching user availability:", error);
      res.status(500).json({ message: "Failed to fetch user availability" });
    }
  });

  app.get('/api/users/:id/pricing', async (req, res) => {
    try {
      const { id } = req.params;
      const pricing = await storage.getHostPricing(id);
      res.json(pricing);
    } catch (error) {
      console.error("Error fetching user pricing:", error);
      res.status(500).json({ message: "Failed to fetch user pricing" });
    }
  });

  // Stripe Connect routes for hosts
  app.post('/api/stripe/connect/create-account', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      // Check if user already has a Stripe account
      if (user.stripeAccountId) {
        return res.json({ 
          accountId: user.stripeAccountId,
          onboardingCompleted: user.stripeOnboardingCompleted 
        });
      }

      // Create Stripe Connect account
      const account = await stripe.accounts.create({
        type: 'express', // Express accounts are easier to manage
        country: 'ES',
        email: user.email || undefined,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      });

      // Save account ID to user
      await storage.updateUserStripeConnect(userId, account.id, false);

      res.json({ 
        accountId: account.id,
        onboardingCompleted: false 
      });
    } catch (error) {
      console.error('Error creating Stripe Connect account:', error);
      res.status(500).json({ message: 'Error al crear cuenta de Stripe Connect' });
    }
  });

  app.post('/api/stripe/connect/onboarding-link', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || !user.stripeAccountId) {
        return res.status(400).json({ message: "No se encontró cuenta de Stripe" });
      }

      // Create account link for onboarding
      const accountLink = await stripe.accountLinks.create({
        account: user.stripeAccountId,
        refresh_url: `${process.env.REPLIT_DOMAINS?.split(',')[0] || 'http://localhost:5000'}/dashboard?stripe_connect=reauth`,
        return_url: `${process.env.REPLIT_DOMAINS?.split(',')[0] || 'http://localhost:5000'}/dashboard?stripe_connect=success`,
        type: 'account_onboarding',
      });

      res.json({ url: accountLink.url });
    } catch (error) {
      console.error('Error creating onboarding link:', error);
      res.status(500).json({ message: 'Error al crear enlace de onboarding' });
    }
  });

  app.get('/api/stripe/connect/account-status', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || !user.stripeAccountId) {
        return res.json({ 
          hasAccount: false,
          onboardingCompleted: false 
        });
      }

      // Get account details from Stripe
      const account = await stripe.accounts.retrieve(user.stripeAccountId);
      
      // Check if onboarding is complete
      const isComplete = account.charges_enabled && account.payouts_enabled;
      
      // Update database if status changed
      if (isComplete !== user.stripeOnboardingCompleted) {
        await storage.updateUserStripeConnect(userId, user.stripeAccountId, isComplete);
      }

      res.json({
        hasAccount: true,
        onboardingCompleted: isComplete,
        accountId: user.stripeAccountId,
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
        requirements: account.requirements,
      });
    } catch (error) {
      console.error('Error checking account status:', error);
      res.status(500).json({ message: 'Error al verificar estado de cuenta' });
    }
  });

  // Host pricing routes
  app.get('/api/host/pricing', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const pricing = await storage.getHostPricing(userId);
      res.json(pricing);
    } catch (error) {
      console.error("Error fetching host pricing:", error);
      res.status(500).json({ message: "Failed to fetch pricing" });
    }
  });

  app.post('/api/host/pricing', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const body = req.body;

      // Check if it's a single pricing update or bulk update
      if (Array.isArray(body)) {
        // Bulk update - clear existing and create new
        const existing = await storage.getHostPricing(userId);
        for (const price of existing) {
          await storage.deleteHostPricing(price.id, userId);
        }

        const results = [];
        for (const price of body) {
          const result = await storage.createHostPricing({
            ...price,
            userId,
            currency: "EUR",
          });
          results.push(result);
        }
        res.json(results);
      } else {
        // Single pricing update
        const { 
          duration, 
          price, 
          isActive, 
          isCustom,
          includesScreenSharing,
          includesTranslation,
          includesRecording,
          includesTranscription
        } = body;

        const pricingData = {
          userId,
          duration,
          price,
          currency: "EUR",
          isActive,
          isCustom: isCustom || false,
          includesScreenSharing: includesScreenSharing || false,
          includesTranslation: includesTranslation || false,
          includesRecording: includesRecording || false,
          includesTranscription: includesTranscription || false,
        };

        const result = await storage.upsertHostPricing(pricingData);
        res.json(result);
      }
    } catch (error) {
      console.error("Error saving host pricing:", error);
      res.status(500).json({ message: "Failed to save pricing" });
    }
  });

  // Booking creation endpoint
  app.post('/api/bookings', isAuthenticated, async (req: any, res) => {
    try {
      const guestId = req.user.claims.sub;
      const { hostId, scheduledDate, startTime, duration, price, services, notes } = req.body;

      // Create booking
      const booking = await storage.createBooking({
        hostId,
        guestId,
        scheduledDate,
        startTime,
        duration,
        price,
        status: 'pending',
        notes,
        services: services ? JSON.stringify(services) : null,
      });

      // Get host and guest details
      const host = await storage.getUser(hostId);
      const guest = await storage.getUser(guestId);

      if (host?.email && guest) {
        // Send booking confirmation emails
        await emailService.sendBookingConfirmationEmail(
          host.email,
          host.firstName || 'Host',
          guest.firstName || 'Usuario',
          guest.email || '',
          scheduledDate,
          startTime,
          duration,
          parseFloat(price),
          services || {},
          booking.id
        );

        await emailService.sendBookingNotificationEmail(
          guest.email || '',
          guest.firstName || 'Usuario',
          host.firstName || 'Host',
          scheduledDate,
          startTime,
          duration,
          parseFloat(price),
          services || {},
          booking.id
        );
      }

      res.status(201).json(booking);
    } catch (error) {
      console.error('Error creating booking:', error);
      res.status(500).json({ message: 'Error al crear la reserva' });
    }
  });

  // Cancel booking endpoint
  app.put('/api/bookings/:id/cancel', isAuthenticated, async (req: any, res) => {
    try {
      const bookingId = req.params.id;
      const userId = req.user.claims.sub;
      
      // Get booking and verify user has permission to cancel
      const booking = await storage.getBookingById(bookingId);
      if (!booking) {
        return res.status(404).json({ message: 'Reserva no encontrada' });
      }
      
      if (booking.hostId !== userId && booking.guestId !== userId) {
        return res.status(403).json({ message: 'No tienes permisos para cancelar esta reserva' });
      }
      
      // Update booking status to cancelled
      await storage.updateBookingStatus(bookingId, 'cancelled');
      
      // Get host and guest details for notifications
      const host = await storage.getUser(booking.hostId);
      const guest = await storage.getUser(booking.guestId);
      
      if (host?.email && guest?.email) {
        const cancelledBy = booking.hostId === userId ? 'host' : 'guest';
        
        // Send cancellation notification to both parties
        await emailService.sendBookingCancellationEmail(
          host.email,
          host.firstName || 'Host',
          guest.firstName || 'Usuario',
          booking.scheduledDate,
          booking.startTime,
          booking.duration,
          cancelledBy,
          bookingId
        );
        
        await emailService.sendBookingCancellationEmail(
          guest.email,
          guest.firstName || 'Usuario',
          host.firstName || 'Host',
          booking.scheduledDate,
          booking.startTime,
          booking.duration,
          cancelledBy,
          bookingId
        );
      }
      
      res.json({ message: 'Reserva cancelada exitosamente' });
    } catch (error) {
      console.error('Error cancelling booking:', error);
      res.status(500).json({ message: 'Error al cancelar la reserva' });
    }
  });

  // Get user bookings
  app.get('/api/bookings/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const role = req.query.role; // 'host' or 'guest'
      
      let bookings;
      if (role === 'host') {
        bookings = await storage.getHostBookings(userId);
      } else if (role === 'guest') {
        bookings = await storage.getGuestBookings(userId);
      } else {
        // Get all bookings for user (both as host and guest)
        const hostBookings = await storage.getHostBookings(userId);
        const guestBookings = await storage.getGuestBookings(userId);
        bookings = [...hostBookings, ...guestBookings];
      }
      
      res.json(bookings);
    } catch (error) {
      console.error('Error fetching user bookings:', error);
      res.status(500).json({ message: 'Error al obtener las reservas' });
    }
  });

  // Stripe payment routes
  app.post('/api/stripe/create-payment-intent', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { bookingId, amount, serviceAddons = {} } = req.body;

      // Calculate commission and VAT
      const calculations = await storage.calculateCommission(parseFloat(amount));
      const servicePricing = await storage.getServicePricing();

      // Calculate addon fees
      let addonTotal = 0;
      if (serviceAddons.screenSharing) addonTotal += servicePricing.screenSharing;
      if (serviceAddons.translation) addonTotal += servicePricing.translation;
      if (serviceAddons.recording) addonTotal += servicePricing.recording;
      if (serviceAddons.transcription) addonTotal += servicePricing.transcription;

      const totalAmount = parseFloat(amount) + addonTotal;
      const finalCalculations = await storage.calculateCommission(totalAmount);

      // Get booking and user details
      const booking = await storage.getBookingById(bookingId);
      if (!booking) {
        return res.status(404).json({ message: 'Reserva no encontrada' });
      }

      const user = await storage.getUser(userId);
      const host = await storage.getUser(booking.hostId);
      
      let stripeCustomerId = user?.stripeCustomerId;

      if (!stripeCustomerId && user?.email) {
        const customer = await stripe.customers.create({
          email: user.email,
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        });
        stripeCustomerId = customer.id;
        
        // Update user with Stripe customer ID
        await storage.updateUserProfile(userId, { stripeCustomerId });
      }

      // Create payment intent with Stripe Connect if host has account
      let paymentIntentParams: any = {
        amount: Math.round(totalAmount * 100), // Convert to cents
        currency: 'eur',
        customer: stripeCustomerId,
        metadata: {
          bookingId,
          userId,
          hostId: booking.hostId,
          hostAmount: finalCalculations.hostAmount.toString(),
          commissionAmount: finalCalculations.commission.toString(),
          vatAmount: finalCalculations.vat.toString(),
        },
      };

      // If host has completed Stripe Connect onboarding, use their account
      if (host?.stripeAccountId && host?.stripeOnboardingCompleted) {
        // For connected accounts, charge customer and transfer to host
        paymentIntentParams.application_fee_amount = Math.round((finalCalculations.commission + finalCalculations.vat) * 100); // Platform fee including VAT
        paymentIntentParams.transfer_data = {
          destination: host.stripeAccountId,
        };
      }

      const paymentIntent = await stripe.paymentIntents.create(paymentIntentParams);

      // Store payment in database
      await storage.createStripePayment({
        bookingId,
        stripePaymentIntentId: paymentIntent.id,
        stripeCustomerId,
        amount: totalAmount.toString(),
        hostAmount: finalCalculations.hostAmount.toString(),
        commissionAmount: finalCalculations.commission.toString(),
        vatAmount: finalCalculations.vat.toString(),
        currency: 'EUR',
        status: 'pending',
        screenSharingFee: serviceAddons.screenSharing ? servicePricing.screenSharing.toString() : '0',
        translationFee: serviceAddons.translation ? servicePricing.translation.toString() : '0', 
        recordingFee: serviceAddons.recording ? servicePricing.recording.toString() : '0',
        transcriptionFee: serviceAddons.transcription ? servicePricing.transcription.toString() : '0',
      });

      res.json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      });
    } catch (error) {
      console.error('Error creating payment intent:', error);
      res.status(500).json({ message: 'Error al crear el intento de pago' });
    }
  });

  // Stripe webhook for payment status updates
  app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig!, process.env.STRIPE_WEBHOOK_SECRET!);
    } catch (err: any) {
      console.log(`Webhook signature verification failed.`, err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          const paymentIntent = event.data.object;
          await storage.updateStripePaymentStatus(paymentIntent.id, 'succeeded');
          
          // Generate invoice and send payment confirmation emails
          const payment = await storage.getStripePaymentByIntent(paymentIntent.id);
          if (payment) {
            const booking = await storage.getBookingById(payment.bookingId);
            if (booking) {
              // Update booking status to confirmed
              await storage.updateBookingStatus(booking.id, 'confirmed');
              
              // Generate invoice
              const invoiceNumber = await storage.generateNextInvoiceNumber();
              await storage.createInvoice({
                invoiceNumber,
                paymentId: payment.id,
                userId: booking.guestId,
                hostId: booking.hostId,
                issueDate: new Date().toISOString().split('T')[0],
              });

              // Get user details and send confirmation emails
              const host = await storage.getUser(booking.hostId);
              const guest = await storage.getUser(booking.guestId);
              
              if (host?.email && guest?.email) {
                // Send payment confirmation to guest
                await emailService.sendPaymentConfirmationEmail(
                  guest.email,
                  guest.firstName || 'Usuario',
                  host.firstName || 'Host',
                  booking.scheduledDate,
                  booking.startTime,
                  booking.duration,
                  parseFloat(payment.amount),
                  booking.id,
                  invoiceNumber
                );

                // Send booking confirmed notification to host
                await emailService.sendBookingConfirmedEmail(
                  host.email,
                  host.firstName || 'Host',
                  guest.firstName || 'Usuario',
                  booking.scheduledDate,
                  booking.startTime,
                  booking.duration,
                  parseFloat(payment.amount),
                  booking.id
                );
              }
            }
          }
          break;

        case 'payment_intent.payment_failed':
          await storage.updateStripePaymentStatus(event.data.object.id, 'failed');
          break;

        default:
          console.log(`Unhandled event type ${event.type}`);
      }
    } catch (error) {
      console.error('Error processing webhook:', error);
      return res.status(500).json({ error: 'Webhook processing failed' });
    }

    res.json({ received: true });
  });

  // Resend webhook endpoint
  app.post('/api/webhooks/resend', async (req, res) => {
    try {
      const event = req.body;
      
      // Log the webhook event
      console.log('Resend webhook event:', event.type, event.data);
      
      // Handle different event types
      switch (event.type) {
        case 'email.sent':
        case 'email.delivered':
        case 'email.delivery_delayed':
        case 'email.complained':
        case 'email.bounced':
        case 'email.opened':
        case 'email.clicked':
          // Update email notification status if we have the email ID
          if (event.data && event.data.email_id) {
            // Find notification by resend ID
            const notifications = await storage.getEmailNotificationsByResendId(event.data.email_id);
            if (notifications && notifications.length > 0) {
              for (const notification of notifications) {
                await storage.updateEmailNotification(notification.id, {
                  status: event.type.replace('email.', ''),
                  sentAt: event.type === 'email.sent' ? new Date() : notification.sentAt,
                });
              }
            }
          }
          break;
          
        default:
          console.log(`Unhandled Resend event type: ${event.type}`);
      }
      
      res.status(200).json({ received: true });
    } catch (error) {
      console.error('Resend webhook processing error:', error);
      res.status(500).json({ error: 'Webhook processing failed' });
    }
  });

  // Invoice routes
  app.get('/api/invoices', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const invoices = await storage.getUserInvoices(userId);
      res.json(invoices);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      res.status(500).json({ message: 'Error al obtener facturas' });
    }
  });

  app.get('/api/invoices/:id/download', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const invoiceId = req.params.id;
      
      const invoice = await storage.getInvoice(invoiceId);
      if (!invoice || invoice.userId !== userId) {
        return res.status(404).json({ message: 'Factura no encontrada' });
      }

      // Update download count
      await storage.updateInvoiceDownload(invoiceId);

      // For now, return JSON data - later we'll generate PDF
      res.json({
        invoice,
        message: 'Factura descargada (PDF en desarrollo)',
      });
    } catch (error) {
      console.error('Error downloading invoice:', error);
      res.status(500).json({ message: 'Error al descargar factura' });
    }
  });

  // Admin routes - Get all users
  app.get('/api/admin/users', isAdminAuthenticated, async (req: any, res) => {
    try {
      const users = await storage.getAllUsersForAdmin();
      res.json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ message: 'Error al obtener usuarios' });
    }
  });

  // Admin routes - Update user status
  app.put('/api/admin/users/:targetUserId', isAdminAuthenticated, async (req: any, res) => {
    try {
      const { targetUserId } = req.params;
      const { 
        firstName, 
        lastName, 
        email, 
        username, 
        role, 
        isHost, 
        isAdmin, 
        isActive, 
        isVerified 
      } = req.body;

      await storage.updateUserStatus(targetUserId, {
        firstName,
        lastName,
        email,
        username,
        role,
        isHost,
        isAdmin,
        isActive,
        isVerified
      });

      res.json({ success: true });
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ message: 'Error al actualizar usuario' });
    }
  });

  // DUPLICATE ROUTE - COMMENTED OUT (using the one at line 735)
  // app.get('/api/admin/config', isAuthenticated, async (req: any, res) => {
  //   try {
  //     const userId = req.user.claims.sub;
  //     const user = await storage.getUser(userId);
  //     
  //     if (!user?.isAdmin) {
  //       return res.status(403).json({ message: 'Acceso denegado' });
  //     }
  //
  //     const config = await storage.getAllAdminConfig();
  //     res.json(config);
  //   } catch (error) {
  //     console.error('Error fetching admin config:', error);
  //     res.status(500).json({ message: 'Error al obtener configuración' });
  //   }
  // });

  app.put('/api/admin/config/:key', isAdminAuthenticated, async (req: any, res) => {
    try {
      const { key } = req.params;
      const { value, description } = req.body;

      const oldConfig = await storage.getAdminConfig(key);
      const updatedConfig = await storage.updateAdminConfig(key, value, req.adminUser.id, description);

      // Create audit log
      await storage.createAuditLog({
        adminId: req.adminUser.id,
        action: 'update_config',
        targetTable: 'admin_config',
        targetId: key,
        oldValue: oldConfig ? { value: oldConfig.value } : null,
        newValue: { value },
        description: `Updated config: ${key}`,
      });

      res.json(updatedConfig);
    } catch (error) {
      console.error('Error updating admin config:', error);
      res.status(500).json({ message: 'Error al actualizar configuración' });
    }
  });

  // GDPR compliance route - User data export
  app.get('/api/gdpr/export', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const userData = await storage.exportUserData(userId);
      
      res.json({
        message: "Datos de usuario exportados según GDPR",
        data: userData,
        exportDate: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error exporting user data:", error);
      res.status(500).json({ message: "Error al exportar datos del usuario" });
    }
  });

  // GDPR compliance route - User data deletion request
  app.post('/api/gdpr/delete-request', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Set data retention date to 30 days from now (GDPR compliance)
      const retentionDate = new Date();
      retentionDate.setDate(retentionDate.getDate() + 30);
      
      await storage.requestDataDeletion(userId, retentionDate);
      
      res.json({
        message: "Solicitud de eliminación de datos registrada. Los datos se eliminarán en 30 días.",
        deletionDate: retentionDate.toISOString()
      });
    } catch (error) {
      console.error("Error requesting data deletion:", error);
      res.status(500).json({ message: "Error al solicitar eliminación de datos" });
    }
  });

  const httpServer = createServer(app);
  // Video Call Routes
  app.post("/api/video-call/token", isAuthenticated, async (req, res) => {
    try {
      const { bookingId, userId } = req.body;
      
      // Verify booking exists and user has access
      const booking = await storage.getBooking(bookingId);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      // Check if user is either host or guest
      if (booking.hostId !== userId && booking.guestId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Generate Agora token
      const channelName = `booking_${bookingId}`;
      const token = await generateAgoraToken(channelName, userId);
      
      // Get host info
      const host = await storage.getUser(booking.hostId);
      
      res.json({
        token,
        channelName,
        appId: process.env.AGORA_APP_ID,
        hostName: host?.firstName || "Host",
        scheduledDate: booking.date,
        startTime: booking.time,
        duration: booking.duration,
        services: booking.services
      });
    } catch (error) {
      console.error("Error generating video call token:", error);
      res.status(500).json({ message: "Failed to generate video call token" });
    }
  });
  
  app.post("/api/video-call/end", isAuthenticated, async (req, res) => {
    try {
      const { bookingId } = req.body;
      
      // Update booking status to completed
      await storage.updateBookingStatus(bookingId, 'completed');
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error ending video call:", error);
      res.status(500).json({ message: "Failed to end video call" });
    }
  });

  // Email template management endpoints (Admin only)
  app.get('/api/admin/email-templates', isAdminAuthenticated, async (req: any, res) => {
    try {
      const templates = await storage.getAllEmailTemplates();
      res.json(templates);
    } catch (error) {
      console.error("Error fetching email templates:", error);
      res.status(500).json({ message: "Failed to fetch email templates" });
    }
  });

  app.post('/api/admin/email-templates', isAdminAuthenticated, async (req: any, res) => {
    try {
      const validatedData = createEmailTemplateSchema.parse(req.body);
      const template = await storage.createEmailTemplate(validatedData);
      res.status(201).json(template);
    } catch (error) {
      console.error("Error creating email template:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid template data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create email template" });
    }
  });

  app.put('/api/admin/email-templates/:id', isAdminAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const validatedData = updateEmailTemplateSchema.parse(req.body);
      const template = await storage.updateEmailTemplate(id, validatedData);
      res.json(template);
    } catch (error) {
      console.error("Error updating email template:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid template data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update email template" });
    }
  });

  app.delete('/api/admin/email-templates/:id', isAdminAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteEmailTemplate(id);
      if (success) {
        res.json({ message: "Template deleted successfully" });
      } else {
        res.status(404).json({ message: "Template not found" });
      }
    } catch (error) {
      console.error("Error deleting email template:", error);
      res.status(500).json({ message: "Failed to delete email template" });
    }
  });

  // Initialize default email templates
  app.post("/api/admin/initialize-email-templates", isAdminAuthenticated, async (req: any, res) => {
    try {
      await initializeEmailTemplates();
      res.json({ message: "Email templates initialized successfully" });
    } catch (error) {
      console.error("Error initializing email templates:", error);
      res.status(500).json({ message: "Failed to initialize email templates" });
    }
  });

  // Send test email
  app.post('/api/admin/send-test-email', isAdminAuthenticated, async (req: any, res) => {
    try {
      const { templateId, recipientId } = req.body;
      
      if (!templateId || !recipientId) {
        return res.status(400).json({ message: "Template ID and recipient ID are required" });
      }

      // Get the email template
      const template = await storage.getEmailTemplateById(templateId);
      if (!template) {
        return res.status(404).json({ message: "Email template not found" });
      }

      // Get the recipient user
      const recipient = await storage.getUser(recipientId);
      if (!recipient) {
        return res.status(404).json({ message: "Recipient user not found" });
      }

      // Replace template variables with test data
      const testData = {
        user_name: `${recipient.firstName} ${recipient.lastName}`,
        platform_name: 'Dialoom',
        login_url: `${req.protocol}://${req.get('host')}/auth/login`,
        host_name: `${recipient.firstName} ${recipient.lastName}`,
        guest_name: 'Usuario de Prueba',
        call_date: new Date().toLocaleDateString('es-ES'),
        call_time: '15:00',
        total_price: '€50.00'
      };

      let htmlContent = template.htmlContent;
      let textContent = template.textContent;
      let subject = template.subject;

      // Replace variables in all content
      Object.entries(testData).forEach(([key, value]) => {
        const placeholder = `{{${key}}}`;
        htmlContent = htmlContent.replace(new RegExp(placeholder, 'g'), value);
        textContent = textContent.replace(new RegExp(placeholder, 'g'), value);
        subject = subject.replace(new RegExp(placeholder, 'g'), value);
      });

      // Send the email
      const emailSent = await emailService.sendEmail({
        to: recipient.email,
        subject: `[PRUEBA] ${subject}`,
        html: htmlContent,
        text: textContent,
      });

      if (emailSent) {
        // Log the email notification
        await storage.createEmailNotification({
          templateId: template.id,
          recipientEmail: recipient.email,
          subject: `[PRUEBA] ${subject}`,
          status: 'sent',
          sentAt: new Date(),
          metadata: { isTest: true, recipientName: `${recipient.firstName} ${recipient.lastName}` }
        });

        res.json({ message: "Test email sent successfully" });
      } else {
        res.status(500).json({ message: "Failed to send test email" });
      }
    } catch (error) {
      console.error("Error sending test email:", error);
      res.status(500).json({ message: "Failed to send test email" });
    }
  });

  // Email notifications log (Admin only)
  app.get('/api/admin/email-notifications', isAdminAuthenticated, async (req: any, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const notifications = await storage.getEmailNotifications(undefined, limit);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching email notifications:", error);
      res.status(500).json({ message: "Failed to fetch email notifications" });
    }
  });

  // User messages endpoint
  app.post('/api/users/:userId/messages', async (req, res) => {
    try {
      const { userId } = req.params;
      const validatedData = createUserMessageSchema.parse(req.body);

      // Get recipient user
      const recipient = await storage.getUser(userId);
      if (!recipient) {
        return res.status(404).json({ message: "User not found" });
      }

      // Create message record
      const message = await storage.createUserMessage({
        ...validatedData,
        recipientId: userId,
      });

      // Send email notification to the host
      await emailService.sendUserMessageEmail(
        recipient.email || '',
        recipient.firstName || 'Usuario',
        validatedData.senderName,
        validatedData.senderEmail,
        validatedData.subject,
        validatedData.message,
        userId
      );

      res.status(201).json(message);
    } catch (error) {
      console.error("Error creating user message:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid message data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  // Get user messages (authenticated user only)
  app.get('/api/user/messages', isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      if (!user?.claims?.sub) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const isRead = req.query.isRead === 'true' ? true : req.query.isRead === 'false' ? false : undefined;
      const messages = await storage.getUserMessages(user.claims.sub, isRead);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching user messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Mark message as read
  app.put('/api/user/messages/:id/read', isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      if (!user?.claims?.sub) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { id } = req.params;
      const message = await storage.markMessageAsRead(id);
      res.json(message);
    } catch (error) {
      console.error("Error marking message as read:", error);
      res.status(500).json({ message: "Failed to mark message as read" });
    }
  });

  // ========== NEWS ARTICLES API ROUTES ==========

  // Get all news articles (public - for home page)
  app.get('/api/news/articles', async (req, res) => {
    try {
      const status = req.query.status as string;
      const featured = req.query.featured === 'true';
      const limit = parseInt(req.query.limit as string) || 10;

      let articles;
      if (featured) {
        articles = await storage.getFeaturedNewsArticles(limit);
      } else if (status) {
        articles = await storage.getAllNewsArticles(status);
      } else {
        articles = await storage.getPublishedNewsArticles(limit);
      }

      res.json(articles);
    } catch (error) {
      console.error("Error fetching news articles:", error);
      res.status(500).json({ message: "Failed to fetch articles" });
    }
  });

  // Get single article by ID or slug (public)
  app.get('/api/news/articles/:idOrSlug', async (req, res) => {
    try {
      const { idOrSlug } = req.params;
      let article;

      // Try to get by ID first, then by slug
      article = await storage.getNewsArticle(idOrSlug);
      if (!article) {
        article = await storage.getNewsArticleBySlug(idOrSlug);
      }

      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }

      // Increment view count for published articles
      if (article.status === 'published') {
        await storage.incrementArticleViews(article.id);
        article.viewCount = (article.viewCount || 0) + 1;
      }

      res.json(article);
    } catch (error) {
      console.error("Error fetching article:", error);
      res.status(500).json({ message: "Failed to fetch article" });
    }
  });

  // Admin routes for news management
  function isAdmin(req: any, res: any, next: any) {
    const user = req.user as any;
    if (!user?.claims?.sub) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Check if user is admin
    storage.getUser(user.claims.sub).then(userData => {
      if (!userData?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }
      next();
    }).catch(() => {
      res.status(500).json({ message: "Error checking admin status" });
    });
  }

  // Get all articles for admin (includes drafts)
  app.get('/api/admin/news/articles', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const status = req.query.status as string;
      const articles = await storage.getAllNewsArticles(status);
      res.json(articles);
    } catch (error) {
      console.error("Error fetching admin articles:", error);
      res.status(500).json({ message: "Failed to fetch articles" });
    }
  });

  // Create new article (admin only)
  app.post('/api/admin/news/articles', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const user = req.user as any;
      const validatedData = createNewsArticleSchema.parse({
        ...req.body,
        authorId: user.claims.sub,
      });

      const article = await storage.createNewsArticle(validatedData);
      res.status(201).json(article);
    } catch (error) {
      console.error("Error creating article:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid article data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create article" });
    }
  });

  // Update article (admin only)
  app.put('/api/admin/news/articles/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = updateNewsArticleSchema.parse(req.body);

      const article = await storage.updateNewsArticle(id, validatedData);
      res.json(article);
    } catch (error) {
      console.error("Error updating article:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid article data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update article" });
    }
  });

  // Delete article (admin only)
  app.delete('/api/admin/news/articles/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteNewsArticle(id);
      
      if (!success) {
        return res.status(404).json({ message: "Article not found" });
      }

      res.json({ message: "Article deleted successfully" });
    } catch (error) {
      console.error("Error deleting article:", error);
      res.status(500).json({ message: "Failed to delete article" });
    }
  });

  // Publish article (admin only)
  app.put('/api/admin/news/articles/:id/publish', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const article = await storage.publishNewsArticle(id);
      res.json(article);
    } catch (error) {
      console.error("Error publishing article:", error);
      res.status(500).json({ message: "Failed to publish article" });
    }
  });

  // Upload images for news articles (admin only)
  app.post('/api/admin/news/upload-image', isAuthenticated, isAdmin, upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image file provided" });
      }

      const user = req.user as any;
      const userId = user.claims.sub;
      const timestamp = Date.now();
      const filename = `news-${timestamp}-${req.file.originalname}`;

      // Process image with Sharp
      const processedImage = await sharp(req.file.buffer)
        .resize(1200, 800, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 85 })
        .toBuffer();

      // Save to Object Storage
      const imagePath = `Objects/news/${filename.replace(/\.[^/.]+$/, ".webp")}`;
      await replitStorage.upload(imagePath, processedImage, 'image/webp');

      const imageUrl = `/storage/${imagePath}`;
      res.json({ imageUrl });
    } catch (error) {
      console.error("Error uploading news image:", error);
      res.status(500).json({ message: "Failed to upload image" });
    }
  });

  return httpServer;
}
