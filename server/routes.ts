import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { isAuthenticated, isAdminAuthenticated, setupAuthRoutes, supabaseAdmin } from "./supabaseAuth";
import multer from "multer";
import sharp from "sharp";
import path from "path";
import { promises as fs } from "fs";
import { insertMediaContentSchema, updateUserProfileSchema } from "@shared/schema";
import { z } from "zod";
import { storageBucket } from "./storage-bucket";
import { replitStorage, ReplitObjectStorage } from "./object-storage";
import Stripe from "stripe";
import { generateAgoraToken } from "./agora-token";
import { emailService } from "./email-service";
import { initializeEmailTemplates } from "./email-templates-init";
import { aiSearchService } from "./ai-search";
import { translateArticle, detectLanguage } from "./translation-service";
import { 
  createEmailTemplateSchema, 
  updateEmailTemplateSchema,
  createUserMessageSchema,
  createNewsArticleSchema,
  updateNewsArticleSchema,
  hostVerificationDocuments,
  users
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

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
  // Setup Supabase auth routes
  setupAuthRoutes(app);


  
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
        console.log(`Served from Object Storage: ${objectPath}`);
      } catch (objectStorageError) {
        console.log('Object Storage failed, trying local fallback...');
        
        // Fallback to local file system
        // Try multiple local path variations
        const localPaths = [
          `uploads/${objectPath}`,
          objectPath.replace('Objects/', 'uploads/'),
          objectPath.replace('Media/', 'uploads/Media/')
        ];
        
        let fileFound = false;
        for (const localPath of localPaths) {
          try {
            const fs = await import('fs/promises');
            fileBuffer = await fs.readFile(localPath);
            console.log(`Served from local filesystem: ${localPath}`);
            fileFound = true;
            break;
          } catch (localError) {
            // Continue to next path
          }
        }
        
        if (!fileFound) {
          console.error('Both Object Storage and local file failed:', {
            objectStorageError: (objectStorageError as Error).message,
            paths: localPaths
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
      const userId = req.userId;
      const user = await storage.getUserWithPrivateInfo(userId, userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.put('/api/auth/role', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
      const { role } = req.body;
      if (!['guest', 'host', 'admin'].includes(role)) {
        return res.status(400).json({ message: 'Rol no válido' });
      }
      const user = await storage.getUser(userId);
      if (role === 'admin' && !user?.isAdmin) {
        return res.status(403).json({ message: 'No autorizado' });
      }
      if (role === 'host' && !user?.isHost) {
        return res.status(403).json({ message: 'No autorizado' });
      }
      const updated = await storage.updateUserRole(userId, role);
      res.json(updated);
    } catch (error) {
      console.error('Error updating role:', error);
      res.status(500).json({ message: 'Failed to update role' });
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
        bio: host.description || '',
        professionalCategory: '',
        skills: [], // Will be populated from user skills relation
        languages: [], // Will be populated from user languages relation
        email: host.email
      }));

      // Get additional data for each host
      for (const profile of hostProfiles) {
        try {
          const skills = await storage.getUserSkills(profile.id);
          profile.skills = skills.map(s => ({ id: s.id, name: '' }));
          
          const languages = await storage.getUserLanguages(profile.id);
          profile.languages = languages.map(l => ({ id: l.id, name: '' }));
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

      const userId = req.userId;
      
      const storagePath = await replitStorage.uploadProfileImage(
        userId,
        req.file.buffer,
        req.file.originalname
      );
      
      // Update user profile with new image path
      const updatedUser = await storage.updateProfileImage(userId, storagePath);

      // Sync profile image with Supabase auth metadata
      const supabaseUserId = req.user?.id;
      if (supabaseUserId) {
        const { error: metaError } = await supabaseAdmin.auth.admin.updateUserById(supabaseUserId, {
          user_metadata: { avatar_url: storagePath, profileImageUrl: storagePath },
        });
        if (metaError) {
          console.error('Error syncing Supabase profile image:', metaError);
        }
      }

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

  // Admin profile image upload route (for admins uploading images for other users)
  app.post('/api/admin/upload/profile-image', isAdminAuthenticated, upload.single('image'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No se proporcionó ninguna imagen" });
      }

      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({ message: "ID de usuario requerido" });
      }

      const storagePath = await replitStorage.uploadProfileImage(
        userId,
        req.file.buffer,
        req.file.originalname
      );
      
      // Update user profile with new image path
      const updatedUser = await storage.updateProfileImage(userId, storagePath);

      // Get user's Supabase ID for metadata sync
      const userRecord = await storage.getUserById(userId);
      if (userRecord?.supabaseId) {
        const { error: metaError } = await supabaseAdmin.auth.admin.updateUserById(userRecord.supabaseId, {
          user_metadata: { avatar_url: storagePath, profileImageUrl: storagePath },
        });
        if (metaError) {
          console.error('Error syncing Supabase profile image:', metaError);
        }
      }

      res.json({
        message: "Imagen de perfil actualizada exitosamente",
        user: updatedUser,
        storagePath: storagePath
      });
    } catch (error) {
      console.error("Error uploading profile image (Admin):", error);
      res.status(500).json({ message: "Error al subir la imagen de perfil" });
    }
  });

  // Profile routes
  app.put('/api/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
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
      console.log('[updateProfile] Successfully updated user', userId, 'result:', updatedUser);

      // DISABLED: Do not sync with Supabase metadata to prevent conflicts
      // Supabase should only be used for authentication, not as source of profile data
      console.log('[INFO] Skipping Supabase metadata sync to preserve database as single source of truth');

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

  // User-specific profile route - matches frontend calls
  app.put('/api/users/:userId/profile', isAuthenticated, async (req: any, res) => {
    try {
      const requestedUserId = req.params.userId;
      const authenticatedUserId = req.userId;
      
      // Users can only update their own profile
      if (requestedUserId !== authenticatedUserId) {
        return res.status(403).json({ message: "No autorizado para actualizar este perfil" });
      }
      
      const { skillIds, languageIds, ...profileData } = req.body;
      
      console.log('🔍 [SERVER] User profile update request:', {
        userId: authenticatedUserId,
        address: profileData.address,
        phone: profileData.phone,
        city: profileData.city,
        postalCode: profileData.postalCode,
        title: profileData.title,
        description: profileData.description,
        nationality: profileData.nationality,
        dateOfBirth: profileData.dateOfBirth,
        fullProfileData: profileData,
        skillIds,
        languageIds,
      });
      
      const validatedData = updateUserProfileSchema.parse(profileData);
      console.log('✅ [SERVER] Validated profile data:', {
        address: validatedData.address,
        phone: validatedData.phone,
        city: validatedData.city,
        postalCode: validatedData.postalCode,
        title: validatedData.title,
        description: validatedData.description,
        nationality: validatedData.nationality,
        countryCode: validatedData.countryCode,
        primaryLanguageId: validatedData.primaryLanguageId,
        dateOfBirth: validatedData.dateOfBirth,
        fullValidatedData: validatedData
      });
      console.log('🔍 [PROBLEMATIC FIELDS SERVER] Specific check:', {
        'nationality value': validatedData.nationality,
        'nationality type': typeof validatedData.nationality,
        'countryCode value': validatedData.countryCode,
        'countryCode type': typeof validatedData.countryCode,
        'primaryLanguageId value': validatedData.primaryLanguageId,
        'primaryLanguageId type': typeof validatedData.primaryLanguageId
      });
      
      const updatedUser = await storage.updateUserProfile(authenticatedUserId, validatedData);
      console.log('[updateUserProfile] Successfully updated user', authenticatedUserId, 'result:', updatedUser);

      // DISABLED: Do not sync with Supabase metadata to prevent conflicts
      // Supabase should only be used for authentication, not as source of profile data
      console.log('[INFO] Skipping Supabase metadata sync to preserve database as single source of truth');

      // Update user languages if provided
      if (Array.isArray(languageIds)) {
        console.log('Updating user languages:', languageIds);
        await storage.updateUserLanguages(authenticatedUserId, languageIds);
        console.log('User languages updated successfully');
      }

      // Update user skills if provided  
      if (Array.isArray(skillIds)) {
        console.log('Updating user skills:', skillIds);
        await storage.updateUserSkills(authenticatedUserId, skillIds);
        console.log('User skills updated successfully');
      }
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user profile:", error);
      if (error instanceof z.ZodError) {
        console.error("Validation errors:", error.errors);
        return res.status(400).json({ message: "Invalid profile data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Update user categories
  app.put('/api/users/:userId/categories', isAuthenticated, async (req: any, res) => {
    try {
      const requestedUserId = req.params.userId;
      const authenticatedUserId = req.userId;
      
      // Users can only update their own categories
      if (requestedUserId !== authenticatedUserId) {
        return res.status(403).json({ message: "No autorizado para actualizar estas categorías" });
      }
      
      const { categoryIds } = req.body;
      
      if (!Array.isArray(categoryIds)) {
        return res.status(400).json({ message: "categoryIds debe ser un array" });
      }
      
      console.log('Updating user categories:', { userId: authenticatedUserId, categoryIds });
      
      await storage.updateUserCategories(authenticatedUserId, categoryIds);
      
      res.json({ message: "Categorías actualizadas exitosamente" });
    } catch (error) {
      console.error("Error updating user categories:", error);
      res.status(500).json({ message: "Error al actualizar categorías" });
    }
  });

  // Update user social profiles
  app.put('/api/users/:userId/social-profiles', isAuthenticated, async (req: any, res) => {
    try {
      const requestedUserId = req.params.userId;
      const authenticatedUserId = req.userId;
      
      // Users can only update their own social profiles
      if (requestedUserId !== authenticatedUserId) {
        return res.status(403).json({ message: "No autorizado para actualizar estos perfiles sociales" });
      }
      
      const { profiles } = req.body;
      
      if (!Array.isArray(profiles)) {
        return res.status(400).json({ message: "profiles debe ser un array" });
      }
      
      console.log('Updating user social profiles:', { userId: authenticatedUserId, profiles });
      
      await storage.updateUserSocialProfiles(authenticatedUserId, profiles);
      
      res.json({ message: "Perfiles sociales actualizados exitosamente" });
    } catch (error) {
      console.error("Error updating user social profiles:", error);
      res.status(500).json({ message: "Error al actualizar perfiles sociales" });
    }
  });

  // Media content routes
  // Upload video file
  app.post("/api/upload/video", isAuthenticated, upload.single('video'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No se proporcionó ningún archivo" });
      }

      const userId = req.userId;
      
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

      const userId = req.userId;
      
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
      const userId = req.userId;
      const mediaContent = await storage.getUserMediaContent(userId);
      res.json(mediaContent);
    } catch (error) {
      console.error("Error fetching media content:", error);
      res.status(500).json({ message: "Failed to fetch media content" });
    }
  });

  app.post('/api/media', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
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
      const userId = req.userId;
      
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
      const userId = req.userId;
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

  // Get user categories
  app.get('/api/user/categories/:userId', isAuthenticated, async (req: any, res) => {
    try {
      const requestedUserId = req.params.userId;
      const authenticatedUserId = req.userId;
      
      // Users can only view their own categories
      if (requestedUserId !== authenticatedUserId) {
        return res.status(403).json({ message: "No autorizado para ver estas categorías" });
      }
      
      const userCategories = await storage.getUserCategories(authenticatedUserId);
      res.json(userCategories);
    } catch (error) {
      console.error("Error fetching user categories:", error);
      res.status(500).json({ message: "Error al obtener categorías del usuario" });
    }
  });

  // Get user social profiles
  app.get('/api/user/social-profiles/:userId', isAuthenticated, async (req: any, res) => {
    try {
      const requestedUserId = req.params.userId;
      const authenticatedUserId = req.userId;
      
      // Users can only view their own social profiles
      if (requestedUserId !== authenticatedUserId) {
        return res.status(403).json({ message: "No autorizado para ver estos perfiles sociales" });
      }
      
      const userSocialProfiles = await storage.getUserSocialProfiles(authenticatedUserId);
      res.json(userSocialProfiles);
    } catch (error) {
      console.error("Error fetching user social profiles:", error);
      res.status(500).json({ message: "Error al obtener perfiles sociales del usuario" });
    }
  });

  // Loomia AI Chat - Asistente IA unificado de Dialoom
  app.post('/api/loomia/chat', async (req: any, res) => {
    try {
      const { message, userRole, conversationHistory, language } = req.body;
      
      if (!message || message.trim().length === 0) {
        return res.status(400).json({ 
          message: "Se requiere un mensaje" 
        });
      }

      const { loomiaAI } = await import("./loomia-chat");
      
      // Analyze intent first to determine if this requires profile suggestions
      const intent = await loomiaAI.analyzeUserIntent(message);
      
      let response;
      let suggestions = null;
      
      // Check if user is asking for profile suggestions
      if (intent.intent === "profile_setup" && 
          (message.toLowerCase().includes("sugerir") || 
           message.toLowerCase().includes("categoría") || 
           message.toLowerCase().includes("skill") ||
           message.toLowerCase().includes("experiencia"))) {
        
        // Get current categories and skills for context
        const [categories, skills] = await Promise.all([
          storage.getCategories(),
          storage.getSkills()
        ]);
        
        const profileSuggestionResult = await loomiaAI.handleProfileSuggestionRequest(
          message, categories, skills
        );
        
        response = profileSuggestionResult.response;
        suggestions = profileSuggestionResult.suggestions;
      } else {
        // Regular chat response with language support and article search
        response = await loomiaAI.chatResponse(message, conversationHistory, language || 'es');
      }

      res.json({
        response,
        intent,
        suggestions, // Include suggestions if generated
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error in Loomia chat:", error);
      res.status(500).json({ message: "Error al procesar tu consulta" });
    }
  });

  // AI-powered suggestions for professional categories and skills (via Loomia)
  app.post('/api/ai/suggest-profile', async (req: any, res) => {
    try {
      const { description } = req.body;
      
      if (!description || description.trim().length < 10) {
        return res.status(400).json({ 
          message: "Se requiere una descripción de al menos 10 caracteres" 
        });
      }

      // Get current categories and skills from database
      const [categories, skills] = await Promise.all([
        storage.getCategories(),
        storage.getSkills()
      ]);

      // Generate AI suggestions using unified Loomia system
      const { loomiaAI } = await import("./loomia-chat");
      const suggestions = await loomiaAI.generateProfessionalSuggestions(
        description,
        categories,
        skills
      );

      res.json(suggestions);
    } catch (error) {
      console.error("Error generating AI suggestions:", error);
      res.status(500).json({ message: "Error al generar sugerencias" });
    }
  });

  // Add new category suggested by AI (accessible by authenticated users, not just admin)
  app.post('/api/categories', isAuthenticated, async (req: any, res) => {
    try {
      const { name, description, subcategories } = req.body;
      
      if (!name || !description) {
        return res.status(400).json({ message: "Nombre y descripción son requeridos" });
      }

      const newCategory = await storage.createCategory({
        name,
        description,
        isActive: true
      });

      // Add subcategories if provided
      if (subcategories && Array.isArray(subcategories)) {
        for (const subcat of subcategories) {
          await storage.createCategory({
            name: subcat,
            description: `Subcategoría de ${name}`,
            parentId: newCategory.id,
            isActive: true
          });
        }
      }

      res.json(newCategory);
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(500).json({ message: "Error al crear categoría" });
    }
  });

  // Add new skill suggested by AI (accessible by authenticated users, not just admin)  
  app.post('/api/skills', isAuthenticated, async (req: any, res) => {
    try {
      const { name, category, description } = req.body;
      
      if (!name) {
        return res.status(400).json({ message: "Nombre es requerido" });
      }

      const newSkill = await storage.createSkill({
        name,
        category: category || "",
        description: description || "",
        isActive: true
      });

      res.json(newSkill);
    } catch (error) {
      console.error("Error creating skill:", error);
      res.status(500).json({ message: "Error al crear skill" });
    }
  });

  // Approve and add AI suggestions to database
  app.post('/api/ai/approve-suggestions', isAuthenticated, async (req: any, res) => {
    try {
      const { categories, skills } = req.body;
      const userId = req.userId;

      const results = {
        addedCategories: [],
        addedSkills: [],
        errors: []
      };

      // Add approved categories
      if (categories && Array.isArray(categories)) {
        for (const category of categories) {
          try {
            // Check if category already exists
            const existing = await storage.getCategoryByName(category.name);
            if (!existing) {
              const newCategory = await storage.createCategory({
                name: category.name,
                description: category.description,
                isActive: true
              });
              results.addedCategories.push(newCategory);

              // Add user to this category
              await storage.addUserCategory(userId, newCategory.id);
            }
          } catch (error) {
            results.errors.push(`Error adding category ${category.name}: ${error.message}`);
          }
        }
      }

      // Add approved skills
      if (skills && Array.isArray(skills)) {
        for (const skill of skills) {
          try {
            // Check if skill already exists
            const existing = await storage.getSkillByName(skill.name);
            let skillId;
            
            if (!existing) {
              const newSkill = await storage.createSkill({
                name: skill.name,
                category: skill.category || "",
                description: skill.description || "",
                isActive: true
              });
              results.addedSkills.push(newSkill);
              skillId = newSkill.id;
            } else {
              skillId = existing.id;
            }

            // Add user to this skill
            await storage.addUserSkill(userId, skillId);
          } catch (error) {
            results.errors.push(`Error adding skill ${skill.name}: ${error.message}`);
          }
        }
      }

      res.json(results);
    } catch (error) {
      console.error("Error approving AI suggestions:", error);
      res.status(500).json({ message: "Error al aprobar sugerencias" });
    }
  });

  // Private document upload route (requires verification)
  app.post('/api/upload/private-document', isAuthenticated, upload.single('document'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No se proporcionó ningún documento" });
      }

      const userId = req.userId;
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

      const adminId = req.userId;
      await storage.verifyUser(targetUserId, isVerified, adminId, notes);
      
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

  // Admin Object Storage Management
  app.get('/api/admin/object-storage', isAdminAuthenticated, async (req: any, res) => {
    try {
      const { path = '', userId } = req.query;
      const objectStorage = new ReplitObjectStorage();
      
      // Build the base path
      let basePath = 'Objects';
      if (userId && userId !== 'all') {
        basePath = `Objects/users/${userId}`;
      }
      
      const fullPath = path ? `${basePath}/${path}` : basePath;
      
      try {
        // List files in the directory
        const files = await objectStorage.listFiles(fullPath);
        
        // Process files to add metadata
        const processedFiles = files.map(file => {
          const isFolder = file.endsWith('/');
          const name = isFolder ? file.slice(0, -1) : file;
          
          return {
            name: name.split('/').pop() || name,
            type: isFolder ? 'folder' : 'file',
            size: 0, // Would need to fetch metadata for actual size
            updated: new Date().toISOString(),
            contentType: isFolder ? 'folder' : 'application/octet-stream',
            url: isFolder ? null : `/storage/${fullPath}/${name}`
          };
        });
        
        // Create breadcrumbs
        const breadcrumbs = path ? path.split('/').filter(Boolean) : [];
        
        res.json({
          data: {
            files: processedFiles,
            currentPath: path,
            breadcrumbs
          }
        });
      } catch (error) {
        console.log('Object storage not configured, returning empty list');
        res.json({
          data: {
            files: [],
            currentPath: path,
            breadcrumbs: []
          }
        });
      }
    } catch (error) {
      console.error('Error listing object storage:', error);
      res.status(500).json({ message: 'Failed to list object storage' });
    }
  });

  // Admin Object Storage Upload
  app.post('/api/admin/object-storage/upload', isAdminAuthenticated, upload.single('file'), async (req: any, res) => {
    try {
      const { path = '' } = req.body;
      const file = req.file;
      
      if (!file) {
        return res.status(400).json({ message: 'No file provided' });
      }
      
      const objectStorage = new ReplitObjectStorage();
      const fileName = `${Date.now()}-${file.originalname}`;
      const fullPath = path ? `Objects/${path}/${fileName}` : `Objects/${fileName}`;
      
      try {
        await objectStorage.uploadFile(fullPath, file.buffer);
        res.json({ 
          success: true, 
          path: fullPath,
          url: `/storage/${fullPath}`
        });
      } catch (error) {
        console.error('Error uploading to object storage:', error);
        res.status(500).json({ message: 'Failed to upload file' });
      }
    } catch (error) {
      console.error('Error handling upload:', error);
      res.status(500).json({ message: 'Failed to handle upload' });
    }
  });

  // Admin Object Storage Delete
  app.delete('/api/admin/object-storage', isAdminAuthenticated, async (req: any, res) => {
    try {
      const { path } = req.body;
      
      if (!path) {
        return res.status(400).json({ message: 'No path provided' });
      }
      
      const objectStorage = new ReplitObjectStorage();
      const fullPath = path.startsWith('Objects/') ? path : `Objects/${path}`;
      
      try {
        await objectStorage.deleteFile(fullPath);
        res.json({ success: true });
      } catch (error) {
        console.error('Error deleting from object storage:', error);
        res.status(500).json({ message: 'Failed to delete file' });
      }
    } catch (error) {
      console.error('Error handling delete:', error);
      res.status(500).json({ message: 'Failed to handle delete' });
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
      const adminId = req.userId;
      const config = await storage.updateMultipleAdminConfigs(req.body, adminId);
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
      const adminId = req.userId;
      const updatedConfig = await storage.updateAdminConfig(key, value, adminId, description);
      
      // Create audit log
      await storage.createAuditLog({
        adminId: adminId,
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

  // Public - Get theme configuration (for logo and colors)
  app.get('/api/config/theme', async (req, res) => {
    try {
      const configs = await storage.getAllAdminConfig();
      const themeConfigs = configs.filter((c: any) => 
        c.key === 'theme_colors' || c.key === 'theme_logo'
      );
      res.json(themeConfigs);
    } catch (error) {
      console.error("Error fetching theme config:", error);
      res.status(500).json({ message: "Failed to fetch theme configuration" });
    }
  });

  // Admin - Upload logo
  app.post('/api/admin/upload-logo', isAdminAuthenticated, upload.single('logo'), async (req: any, res) => {
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const adminId = req.userId;
      let logoPath: string;

      try {
        const uniqueFilename = `Logo/logo-${Date.now()}.${file.originalname.split('.').pop()}`;
        const buffer = file.buffer;

        // Try Object Storage first
        try {
          await replitStorage.uploadPublicFile(uniqueFilename, buffer);
          logoPath = `/storage/${uniqueFilename}`;
          console.log('Logo uploaded to Object Storage:', uniqueFilename);
        } catch (objError) {
          console.error('Object Storage upload failed, falling back to local:', objError);
          
          // Fallback to local storage
          const localPath = path.join('uploads', uniqueFilename);
          const fullPath = path.join(process.cwd(), localPath);
          
          await fs.mkdir(path.dirname(fullPath), { recursive: true });
          await fs.writeFile(fullPath, buffer);
          
          logoPath = `/uploads/${uniqueFilename}`;
          console.log('Logo saved locally:', fullPath);
        }

        res.json({ logoUrl: logoPath });
      } catch (error) {
        console.error('Error processing upload:', error);
        res.status(500).json({ message: "Failed to upload logo" });
      }
    } catch (error) {
      console.error("Error uploading logo:", error);
      res.status(500).json({ message: "Failed to upload logo" });
    }
  });

  // Host availability routes
  app.get('/api/host/availability', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
      const availability = await storage.getHostAvailability(userId);
      res.json(availability);
    } catch (error) {
      console.error("Error fetching host availability:", error);
      res.status(500).json({ message: "Failed to fetch availability" });
    }
  });

  app.post('/api/host/availability', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
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
      const userId = req.userId;
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

  // AI enhancement endpoint for descriptions using OpenAI
  app.post('/api/ai/enhance-description', isAuthenticated, async (req: any, res) => {
    console.log('AI Enhancement endpoint called');
    try {
      const { description, linkedinUrl } = req.body;
      const userId = req.userId;
      
      console.log('AI Enhancement request received:', { 
        descriptionLength: description?.length, 
        linkedinUrl, 
        userId,
        body: req.body 
      });
      
      if (!description?.trim()) {
        return res.status(400).json({ message: 'Descripción requerida' });
      }

      // Get user's social profiles to extract LinkedIn data if available
      const userSocialProfiles = await storage.getUserSocialProfiles(userId);
      console.log('User social profiles:', userSocialProfiles);
      
      let linkedinData = '';
      
      if (linkedinUrl) {
        linkedinData = linkedinUrl;
      } else {
        // Find LinkedIn profile from user's social profiles
        const linkedinProfile = userSocialProfiles.find(profile => profile.platformId === 1); // LinkedIn platform ID
        if (linkedinProfile) {
          linkedinData = `https://linkedin.com/in/${linkedinProfile.username}`;
        }
      }
      
      console.log('Using LinkedIn data:', linkedinData);

      const enhancementPrompt = `
        Como experto en redacción profesional y marketing personal, mejora esta descripción profesional para que sea más atractiva, clara y persuasiva para potenciales clientes.
        
        Descripción actual: "${description}"
        ${linkedinData ? `
        El usuario ha indicado que tiene un perfil en LinkedIn en: ${linkedinData}
        Nota: Aunque no puedo acceder directamente al contenido del perfil de LinkedIn, debes basarte en la descripción proporcionada y mejorarla asumiendo que el profesional tiene experiencia relevante que respalda sus afirmaciones.
        ` : ''}
        
        Directrices:
        - Mantén un tono HUMILDE y PROFESIONAL, evitando superlativos o afirmaciones grandilocuentes
        - En lugar de decir "soy experto" o "soy el mejor", usa frases como "cuento con experiencia en", "me especializo en", "he trabajado en"
        - Destaca logros y experiencia específica basándote en la descripción proporcionada, pero con modestia
        - Enfócate en cómo puedes ayudar al cliente, no en autopromoción excesiva
        - Incluye el valor único que aportas, pero expresado de forma sutil y profesional
        - Usa verbos de acción y resultados concretos, pero sin exagerar
        - Evita términos como "líder", "pionero", "excepcional", "extraordinario" a menos que estén respaldados por hechos concretos
        - Si el texto original es muy corto o genérico, expándelo con ejemplos de valor agregado típicos para su rol/industria
        - Máximo 200 palabras
        - Responde solo con la descripción mejorada, sin explicaciones adicionales
      `;

      console.log('Making OpenAI request with prompt length:', enhancementPrompt.length);
      console.log('API Key exists:', !!process.env.OPENAI_API_KEY);

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o', // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
          messages: [
            {
              role: 'user',
              content: enhancementPrompt
            }
          ],
          max_tokens: 500,
          temperature: 0.7,
        }),
      });

      console.log('OpenAI response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('OpenAI API error details:', errorData);
        throw new Error(`OpenAI API error: ${response.statusText} - ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      const enhancedDescription = data.choices[0]?.message?.content?.trim();

      if (!enhancedDescription) {
        throw new Error('No se pudo generar una descripción mejorada');
      }

      console.log('Sending enhanced description response');
      res.json({ enhancedDescription });
    } catch (error: any) {
      console.error('Error enhancing description:', error);
      console.error('Error details:', error.message);
      res.status(500).json({ 
        message: error.message || 'Error al mejorar la descripción con IA',
        error: error.toString()
      });
    }
  });

  // Social platforms endpoints
  app.get('/api/social-platforms', async (req, res) => {
    try {
      const platforms = await storage.getSocialPlatforms();
      res.json(platforms);
    } catch (error) {
      console.error("Error fetching social platforms:", error);
      res.status(500).json({ message: "Failed to fetch social platforms" });
    }
  });

  app.get('/api/user/social-profiles/:userId', isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const requesterId = req.userId;
      
      // Only allow users to see their own social profiles or admins to see any
      const requester = await storage.getUser(requesterId);
      if (userId !== requesterId && !requester?.isAdmin) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const profiles = await storage.getUserSocialProfiles(userId);
      res.json(profiles);
    } catch (error) {
      console.error("Error fetching user social profiles:", error);
      res.status(500).json({ message: "Failed to fetch social profiles" });
    }
  });

  app.put('/api/users/:userId/social-profiles', isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const requesterId = req.userId;
      const { profiles } = req.body;
      
      // Only allow users to update their own social profiles
      if (userId !== requesterId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      await storage.updateUserSocialProfiles(userId, profiles);
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating user social profiles:", error);
      res.status(500).json({ message: "Failed to update social profiles" });
    }
  });

  // Stripe Connect routes for hosts
  app.post('/api/stripe/connect/create-account', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
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
      const userId = req.userId;
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
      const userId = req.userId;
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
      const userId = req.userId;
      const pricing = await storage.getHostPricing(userId);
      res.json(pricing);
    } catch (error) {
      console.error("Error fetching host pricing:", error);
      res.status(500).json({ message: "Failed to fetch pricing" });
    }
  });

  // Get host services and pricing for booking
  app.get("/api/host/:hostId/services", async (req, res) => {
    try {
      const { hostId } = req.params;
      
      // Get host pricing configurations
      const pricingConfigs = await storage.getHostPricing(hostId);
      
      // Get global service pricing
      const servicePricing = await storage.getServicePricing();
      
      // Filter services based on host configuration
      const availableServices: any = {};
      
      // Check if any pricing config has these services enabled
      const hasScreenSharing = pricingConfigs.some(config => config.includesScreenSharing);
      const hasTranslation = pricingConfigs.some(config => config.includesTranslation);
      const hasRecording = pricingConfigs.some(config => config.includesRecording);
      const hasTranscription = pricingConfigs.some(config => config.includesTranscription);
      
      if (hasScreenSharing) {
        availableServices.screenSharing = servicePricing.screenSharing;
      }
      if (hasTranslation) {
        availableServices.translation = servicePricing.translation;
      }
      if (hasRecording) {
        availableServices.recording = servicePricing.recording;
      }
      if (hasTranscription) {
        availableServices.transcription = servicePricing.transcription;
      }
      
      res.json(availableServices);
    } catch (error) {
      console.error("Error fetching host services:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });

  app.post('/api/host/pricing', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
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
      const guestId = req.userId;
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
        await emailService.sendBookingReceivedEmail(
          host.email,
          host.firstName || 'Host',
          guest.firstName || 'Usuario',
          guest.email || '',
          scheduledDate,
          startTime,
          parseFloat(price),
          booking.hostId
        );

        await emailService.sendBookingCreatedEmail(
          guest.email || '',
          guest.firstName || 'Usuario',  
          host.firstName || 'Host',
          scheduledDate,
          startTime,
          undefined,
          booking.guestId
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
      const userId = req.userId;
      
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
        
        // Send cancellation notification to both parties using generic sendEmail method
        await emailService.sendEmail({
          recipientEmail: host.email,
          templateType: 'booking_cancelled',
          userId: booking.hostId,
          variables: {
            recipient_name: host.firstName || 'Host',
            other_party_name: guest.firstName || 'Usuario',
            booking_date: booking.scheduledDate,
            booking_time: booking.startTime,
            cancelled_by: cancelledBy,
            booking_id: bookingId
          }
        });
        
        await emailService.sendEmail({
          recipientEmail: guest.email,
          templateType: 'booking_cancelled',
          userId: booking.guestId,
          variables: {
            recipient_name: guest.firstName || 'Usuario',
            other_party_name: host.firstName || 'Host',
            booking_date: booking.scheduledDate,
            booking_time: booking.startTime,
            cancelled_by: cancelledBy,
            booking_id: bookingId
          }
        });
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
      const userId = req.userId;
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
      const userId = req.userId;
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
                await emailService.sendEmail({
                  recipientEmail: guest.email,
                  templateType: 'payment_confirmation',
                  userId: booking.guestId,
                  variables: {
                    user_name: guest.firstName || 'Usuario',
                    host_name: host.firstName || 'Host',
                    booking_date: booking.scheduledDate,
                    booking_time: booking.startTime,
                    amount: parseFloat(payment.amount),
                    booking_id: booking.id,
                    invoice_number: invoiceNumber
                  }
                });

                // Send booking confirmed notification to host
                await emailService.sendEmail({
                  recipientEmail: host.email,
                  templateType: 'booking_confirmed',
                  userId: booking.hostId,
                  variables: {
                    host_name: host.firstName || 'Host',
                    client_name: guest.firstName || 'Usuario',
                    booking_date: booking.scheduledDate,
                    booking_time: booking.startTime,
                    amount: parseFloat(payment.amount),
                    booking_id: booking.id
                  }
                });
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
      const userId = req.userId;
      const invoices = await storage.getUserInvoices(userId);
      res.json(invoices);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      res.status(500).json({ message: 'Error al obtener facturas' });
    }
  });

  app.get('/api/invoices/:id/download', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
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

  // Admin routes - Get complete user profile
  app.get('/api/admin/users/:targetUserId/complete-profile', isAdminAuthenticated, async (req: any, res) => {
    try {
      const { targetUserId } = req.params;
      const adminId = req.adminUser.claims.sub;
      
      // Get complete user data
      const user = await storage.getUserWithPrivateInfo(targetUserId, adminId);
      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
      
      // Get related data
      const [skills, languages, categories, mediaContent, socialProfiles] = await Promise.all([
        storage.getUserSkills(targetUserId),
        storage.getUserLanguages(targetUserId),
        storage.getUserCategories(targetUserId),
        storage.getUserMediaContent(targetUserId),
        storage.getUserSocialProfiles(targetUserId)
      ]);
      
      res.json({
        user,
        skills,
        languages,
        categories,
        mediaContent,
        socialProfiles
      });
    } catch (error) {
      console.error('Error fetching complete user profile:', error);
      res.status(500).json({ message: 'Error al obtener perfil completo' });
    }
  });

  // Admin routes - Update user status (basic info)
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

  // Admin routes - Delete user
  app.delete('/api/admin/users/:targetUserId', isAdminAuthenticated, async (req: any, res) => {
    try {
      const { targetUserId } = req.params;
      const adminId = req.userId;
      
      // Prevent admin from deleting themselves
      if (targetUserId === adminId) {
        return res.status(400).json({ message: 'No puedes eliminarte a ti mismo' });
      }
      
      // Delete user and all their data
      await storage.deleteUser(targetUserId);
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ message: 'Error al eliminar usuario' });
    }
  });

  // Admin routes - Create new user
  app.post('/api/admin/users', isAdminAuthenticated, async (req: any, res) => {
    try {
      const { email, firstName, lastName, password, isAdmin, isHost } = req.body;
      
      // Validate required fields
      if (!email || !firstName || !lastName || !password) {
        return res.status(400).json({ message: 'Todos los campos son requeridos' });
      }
      
      // Create new user
      const newUser = await storage.createUserWithPassword({
        email,
        firstName,
        lastName,
        password,
        isAdmin: isAdmin || false,
        isHost: isHost || false,
        isActive: true,
        isVerified: false
      });
      
      res.json({ success: true, userId: newUser.id });
    } catch (error) {
      console.error('Error creating user:', error);
      if (error instanceof Error && error.message.includes('unique constraint')) {
        return res.status(400).json({ message: 'El email ya está registrado' });
      }
      res.status(500).json({ message: 'Error al crear usuario' });
    }
  });

  // Admin routes - Update user profile (complete profile data)
  app.put('/api/admin/users/:targetUserId/profile', isAdminAuthenticated, async (req: any, res) => {
    try {
      const { targetUserId } = req.params;
      const { skillIds, languageIds, categoryIds, socialProfiles, ...profileData } = req.body;
      
      console.log('Admin update request for user:', targetUserId);
      console.log('Received data:', {
        profileData,
        skillIds,
        languageIds,
        categoryIds,
        socialProfiles
      });
      
      // Update basic profile data
      if (Object.keys(profileData).length > 0) {
        console.log('Updating basic profile data:', profileData);
        const updatedUser = await storage.updateUserProfile(targetUserId, profileData);
        console.log('Profile updated successfully:', updatedUser.id);
      }
      
      // Update skills if provided
      if (Array.isArray(skillIds)) {
        console.log('Updating skills:', skillIds);
        await storage.updateUserSkills(targetUserId, skillIds);
        console.log('Skills updated successfully');
      }
      
      // Update languages if provided
      if (Array.isArray(languageIds)) {
        console.log('Updating languages:', languageIds);
        await storage.updateUserLanguages(targetUserId, languageIds);
        console.log('Languages updated successfully');
      }
      
      // Update categories if provided
      if (Array.isArray(categoryIds)) {
        console.log('Updating categories:', categoryIds);
        await storage.updateUserCategories(targetUserId, categoryIds);
        console.log('Categories updated successfully');
      }
      
      // Update social profiles if provided
      if (Array.isArray(socialProfiles)) {
        console.log('Updating social profiles:', socialProfiles);
        await storage.updateUserSocialProfiles(targetUserId, socialProfiles);
        console.log('Social profiles updated successfully');
      }
      
      console.log('All admin updates completed successfully for user:', targetUserId);
      res.json({ success: true });
    } catch (error) {
      console.error('Error updating user profile via admin:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Datos de perfil inválidos", errors: error.errors });
      }
      res.status(500).json({ message: 'Error al actualizar perfil' });
    }
  });

  // DUPLICATE ROUTE - COMMENTED OUT (using the one at line 735)
  // app.get('/api/admin/config', isAuthenticated, async (req: any, res) => {
  //   try {
  //     const userId = req.userId;
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

      const adminId = req.userId;
      const oldConfig = await storage.getAdminConfig(key);
      const updatedConfig = await storage.updateAdminConfig(key, value, adminId, description);

      // Create audit log
      await storage.createAuditLog({
        adminId: adminId,
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
      const userId = req.userId;
      const userData = await storage.exportUserData(userId);
      
      // Set headers for file download
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="dialoom-data-export-${userId}-${new Date().toISOString().split('T')[0]}.json"`);
      
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

  // GDPR Data Deletion Request endpoint
  app.post('/api/gdpr/request-deletion', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
      const { confirmDeletion } = req.body;
      
      if (!confirmDeletion) {
        return res.status(400).json({ error: 'Deletion confirmation required' });
      }
      
      // Set deletion date to 30 days from now (GDPR compliance period)
      const deletionDate = new Date();
      deletionDate.setDate(deletionDate.getDate() + 30);
      
      await storage.requestDataDeletion(userId, deletionDate);
      
      res.json({ 
        success: true, 
        message: 'Data deletion requested',
        deletionDate: deletionDate.toISOString()
      });
    } catch (error) {
      console.error('Error requesting data deletion:', error);
      res.status(500).json({ error: 'Failed to request data deletion' });
    }
  });

  // GDPR Privacy Preferences endpoint
  app.get('/api/gdpr/privacy-preferences', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
      
      // Get user's current privacy preferences
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.json({
        marketingEmails: user.marketingEmails,
        profileVisibility: user.profileVisibility,
        dataProcessingConsent: user.dataProcessingConsent
      });
    } catch (error) {
      console.error('Error fetching privacy preferences:', error);
      res.status(500).json({ error: 'Failed to fetch privacy preferences' });
    }
  });

  // GDPR Update Privacy Preferences endpoint
  app.post('/api/gdpr/privacy-preferences', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
      const { marketingEmails, profileVisibility, dataProcessingConsent } = req.body;
      
      await storage.updateUserProfile(userId, {
        marketingEmails: marketingEmails,
        profileVisibility: profileVisibility,
        dataProcessingConsent: dataProcessingConsent
      });
      
      res.json({ success: true, message: 'Privacy preferences updated' });
    } catch (error) {
      console.error('Error updating privacy preferences:', error);
      res.status(500).json({ error: 'Failed to update privacy preferences' });
    }
  });

  // GDPR Contact Support for Data Processing Restriction
  app.post('/api/gdpr/restriction-request', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
      const { requestType, details } = req.body;
      
      // Store restriction request as a user message
      const messageData = {
        id: crypto.randomUUID(),
        userId,
        type: 'gdpr_restriction' as const,
        subject: `GDPR Restriction Request - ${requestType}`,
        message: details || 'User requested data processing restriction under GDPR Article 18',
        isRead: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await storage.createUserMessage(messageData);
      
      res.json({ 
        success: true, 
        message: 'Restriction request submitted. Our team will review it within 48 hours.',
        requestId: messageData.id
      });
    } catch (error) {
      console.error('Error submitting restriction request:', error);
      res.status(500).json({ error: 'Failed to submit restriction request' });
    }
  });

  // GDPR compliance route - User data deletion request
  app.post('/api/gdpr/delete-request', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
      
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
      // Ensure we always return JSON, never HTML
      res.setHeader('Content-Type', 'application/json');
      
      const validatedData = createEmailTemplateSchema.parse(req.body);
      const template = await storage.createEmailTemplate(validatedData);
      res.status(201).json(template);
    } catch (error) {
      console.error("Error creating email template:", error);
      res.setHeader('Content-Type', 'application/json');
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid template data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create email template" });
    }
  });

  app.put('/api/admin/email-templates/:id', isAdminAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      
      // Ensure we always return JSON, never HTML
      res.setHeader('Content-Type', 'application/json');
      
      const validatedData = updateEmailTemplateSchema.parse(req.body);
      const template = await storage.updateEmailTemplate(id, validatedData);
      
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      
      res.json(template);
    } catch (error) {
      console.error("Error updating email template:", error);
      res.setHeader('Content-Type', 'application/json');
      
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
        firstName: recipient.firstName || 'Usuario',
        lastName: recipient.lastName || 'Prueba',
        userName: `${recipient.firstName} ${recipient.lastName}`,
        platformName: 'Dialoom',
        dashboardUrl: `${req.protocol}://${req.get('host')}/profile`,
        hostName: `${recipient.firstName} ${recipient.lastName}`,
        guestName: 'Usuario de Prueba',
        guestEmail: 'usuario@prueba.com',
        date: new Date().toLocaleDateString('es-ES'),
        time: '15:00',
        duration: '60',
        price: '50.00',
        bookingId: 'TEST-12345',
        primaryColor: '#008B9A',
        logoUrl: `${req.protocol}://${req.get('host')}/uploads/images/dialoomblue.png`
      };

      // Send the email using the email service
      const emailSent = await emailService.sendEmail({
        recipientEmail: recipient.email,
        templateType: template.type,
        variables: testData,
        userId: recipient.id,
        customTemplate: {
          subject: `[PRUEBA] ${template.subject}`,
          htmlContent: template.htmlContent,
          textContent: template.textContent
        }
      });

      if (emailSent) {
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
  app.get('/api/admin/news/articles', isAdminAuthenticated, async (req: any, res) => {
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
  app.post('/api/admin/news/articles', isAdminAuthenticated, async (req: any, res) => {
    try {
      const user = req.user as any;
      const { autoTranslate = true, ...articleData } = req.body;
      
      // Convert publishedAt string to Date if present
      if (articleData.publishedAt) {
        articleData.publishedAt = new Date(articleData.publishedAt);
      }
      
      const validatedData = createNewsArticleSchema.parse({
        ...articleData,
        authorId: user.claims.sub,
      });

      const article = await storage.createNewsArticle(validatedData);
      
      // Auto-translate if enabled and OpenAI API key is available
      if (autoTranslate && process.env.OPENAI_API_KEY) {
        try {
          // Detect source language from content
          const sourceLanguage = await detectLanguage(article.content);
          const targetLanguages = ['es', 'en', 'ca'].filter(lang => lang !== sourceLanguage);
          
          if (targetLanguages.length > 0) {
            const translations = await translateArticle({
              title: article.title,
              excerpt: article.excerpt || undefined,
              content: article.content,
              tags: article.tags || undefined,
              metaTitle: article.metaTitle || undefined,
              metaDescription: article.metaDescription || undefined,
              sourceLanguage,
              targetLanguages
            });
            
            // Create translated versions
            for (const translation of translations) {
              try {
                const translatedArticle = {
                  ...validatedData,
                  title: translation.title,
                  slug: `${article.slug}-${translation.language}`,
                  excerpt: translation.excerpt,
                  content: translation.content,
                  tags: translation.tags,
                  metaTitle: translation.metaTitle,
                  metaDescription: translation.metaDescription,
                  // Add a reference to the original article
                  parentArticleId: article.id,
                  language: translation.language
                };
                
                await storage.createNewsArticle(translatedArticle);
                console.log(`Created ${translation.language} translation for article ${article.id}`);
              } catch (translationError) {
                console.error(`Error creating ${translation.language} translation:`, translationError);
              }
            }
          }
        } catch (translationError) {
          console.error("Error during automatic translation:", translationError);
          // Continue without translations - don't fail the main article creation
        }
      }
      
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
  app.put('/api/admin/news/articles/:id', isAdminAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { autoTranslate = true, ...articleData } = req.body;
      
      // Convert publishedAt string to Date if present
      if (articleData.publishedAt) {
        articleData.publishedAt = new Date(articleData.publishedAt);
      }
      
      const validatedData = updateNewsArticleSchema.parse(articleData);

      const article = await storage.updateNewsArticle(id, validatedData);
      
      // Auto-translate updates if enabled and OpenAI API key is available
      if (autoTranslate && process.env.OPENAI_API_KEY && validatedData.content) {
        try {
          // Detect source language from updated content
          const sourceLanguage = await detectLanguage(validatedData.content);
          const targetLanguages = ['es', 'en', 'ca'].filter(lang => lang !== sourceLanguage);
          
          if (targetLanguages.length > 0) {
            const translations = await translateArticle({
              title: validatedData.title || article.title,
              excerpt: validatedData.excerpt !== undefined ? validatedData.excerpt : article.excerpt,
              content: validatedData.content,
              tags: validatedData.tags !== undefined ? validatedData.tags : article.tags,
              metaTitle: validatedData.metaTitle !== undefined ? validatedData.metaTitle : article.metaTitle,
              metaDescription: validatedData.metaDescription !== undefined ? validatedData.metaDescription : article.metaDescription,
              sourceLanguage,
              targetLanguages
            });
            
            // Update translated versions if they exist
            for (const translation of translations) {
              try {
                // Find existing translation by parent article ID and language
                const existingTranslations = await storage.getAllNewsArticles();
                const existingTranslation = existingTranslations.find(
                  (a: any) => a.parentArticleId === id && a.language === translation.language
                );
                
                if (existingTranslation) {
                  await storage.updateNewsArticle(existingTranslation.id, {
                    title: translation.title,
                    excerpt: translation.excerpt,
                    content: translation.content,
                    tags: translation.tags,
                    metaTitle: translation.metaTitle,
                    metaDescription: translation.metaDescription,
                  });
                  console.log(`Updated ${translation.language} translation for article ${id}`);
                }
              } catch (translationError) {
                console.error(`Error updating ${translation.language} translation:`, translationError);
              }
            }
          }
        } catch (translationError) {
          console.error("Error during automatic translation:", translationError);
          // Continue without translations - don't fail the main article update
        }
      }
      
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
  app.delete('/api/admin/news/articles/:id', isAdminAuthenticated, async (req: any, res) => {
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
  app.put('/api/admin/news/articles/:id/publish', isAdminAuthenticated, async (req: any, res) => {
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
  app.post('/api/admin/news/upload-image', isAdminAuthenticated, upload.single('image'), async (req: any, res) => {
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

      // Save to Object Storage in Media folder
      const imageFilename = `news-${timestamp}-${req.file.originalname.replace(/\.[^/.]+$/, ".webp")}`;
      const imagePath = `Media/${imageFilename}`;
      
      // Upload to Object Storage
      try {
        const result = await replitStorage._client.uploadFromBytes(imagePath, processedImage);
        if (result.error) {
          console.error(`Object Storage upload failed: ${result.error.message}`);
          return res.status(500).json({ message: "Failed to upload image to storage" });
        }
        console.log(`News image uploaded to Object Storage: ${imagePath}`);
      } catch (objectStorageError) {
        console.error('Object Storage upload failed:', objectStorageError);
        return res.status(500).json({ message: "Failed to upload image to storage" });
      }

      // Also save to local filesystem as backup
      const localPath = `uploads/${imagePath}`;
      await fs.mkdir(path.dirname(localPath), { recursive: true });
      await fs.writeFile(localPath, processedImage);
      console.log(`News image also saved locally: ${localPath}`);

      const imageUrl = `/storage/${imagePath}`;
      res.json({ imageUrl });
    } catch (error) {
      console.error("Error uploading news image:", error);
      res.status(500).json({ message: "Failed to upload image" });
    }
  });

  // Upload video for news articles
  app.post('/api/admin/news/upload-video', isAdminAuthenticated, upload.single('video'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No video file provided" });
      }

      // Check file size (100MB limit)
      if (req.file.size > 100 * 1024 * 1024) {
        return res.status(400).json({ message: "Video file too large. Maximum size is 100MB" });
      }

      const user = req.user as any;
      const userId = user.claims.sub;
      const timestamp = Date.now();
      const filename = `news-video-${timestamp}-${req.file.originalname}`;

      // Save video to Object Storage in Media folder
      const videoPath = `Media/videos/${filename}`;
      
      // Upload to Object Storage
      try {
        const result = await replitStorage._client.uploadFromBytes(videoPath, req.file.buffer);
        if (result.error) {
          console.error(`Object Storage upload failed: ${result.error.message}`);
          return res.status(500).json({ message: "Failed to upload video to storage" });
        }
        console.log(`News video uploaded to Object Storage: ${videoPath}`);
      } catch (objectStorageError) {
        console.error('Object Storage upload failed:', objectStorageError);
        return res.status(500).json({ message: "Failed to upload video to storage" });
      }

      // Also save to local filesystem as backup
      const localPath = `uploads/${videoPath}`;
      await fs.mkdir(path.dirname(localPath), { recursive: true });
      await fs.writeFile(localPath, req.file.buffer);
      console.log(`News video also saved locally: ${localPath}`);

      const videoUrl = `/storage/${videoPath}`;
      res.json({ videoUrl });
    } catch (error) {
      console.error("Error uploading news video:", error);
      res.status(500).json({ message: "Failed to upload video" });
    }
  });

  // Delete news featured image
  app.delete("/api/admin/news/delete-image", isAdminAuthenticated, async (req, res) => {
    try {
      const { articleId } = req.body;
      
      if (!articleId) {
        return res.status(400).json({ message: "Article ID is required" });
      }

      // Update the article to remove featured image
      await storage.updateNewsArticle(articleId, {
        featuredImage: null
      });

      res.json({ message: "Featured image deleted successfully" });
    } catch (error) {
      console.error("Error deleting featured image:", error);
      res.status(500).json({ message: "Failed to delete featured image" });
    }
  });

  // Delete news featured video
  app.delete("/api/admin/news/delete-video", isAdminAuthenticated, async (req, res) => {
    try {
      const { articleId } = req.body;
      
      if (!articleId) {
        return res.status(400).json({ message: "Article ID is required" });
      }

      // Update the article to remove featured video
      await storage.updateNewsArticle(articleId, {
        featuredVideo: null
      });

      res.json({ message: "Featured video deleted successfully" });
    } catch (error) {
      console.error("Error deleting featured video:", error);
      res.status(500).json({ message: "Failed to delete featured video" });
    }
  });

  // Social platforms endpoints
  app.get('/api/social-platforms', async (req, res) => {
    try {
      const platforms = await storage.getSocialPlatforms();
      res.json(platforms);
    } catch (error) {
      console.error("Error fetching social platforms:", error);
      res.status(500).json({ message: "Error al obtener plataformas sociales" });
    }
  });

  // User social profiles endpoints
  app.get('/api/user/social-profiles/:userId', isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const socialProfiles = await storage.getUserSocialProfiles(userId);
      res.json(socialProfiles);
    } catch (error) {
      console.error("Error fetching user social profiles:", error);
      res.status(500).json({ message: "Error al obtener perfiles sociales" });
    }
  });

  // User categories endpoints
  app.get('/api/user/categories/:userId', isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const categories = await storage.getUserCategories(userId);
      res.json(categories);
    } catch (error) {
      console.error("Error fetching user categories:", error);
      res.status(500).json({ message: "Error al obtener categorías del usuario" });
    }
  });

  // AI description improvement endpoint (protected)
  app.post('/api/ai/improve-description', isAuthenticated, async (req: any, res) => {
    try {
      const { description } = req.body;
      
      if (!description || description.trim().length < 10) {
        return res.status(400).json({ 
          message: "Se requiere una descripción de al menos 10 caracteres" 
        });
      }

      // Get user's social profiles if available
      const userId = req.userId;
      let socialUrls: { platform: string; url: string }[] = [];
      
      try {
        const socialProfiles = await storage.getUserSocialProfiles(userId);
        socialUrls = socialProfiles.map((profile: any) => ({
          platform: profile.platformName || profile.platform,
          url: `https://${profile.platformName || profile.platform}.com/${profile.username}`
        }));
      } catch (error) {
        console.log("Could not fetch social profiles for AI analysis");
      }

      // Use unified Loomia system for description improvement
      const { loomiaAI } = await import("./loomia-chat");
      const improvedDescription = await loomiaAI.improveDescriptionWithSocialContext(
        description,
        socialUrls
      );

      res.json({ improvedDescription });
    } catch (error) {
      console.error("Error improving description:", error);
      res.status(500).json({ message: "Error al mejorar la descripción" });
    }
  });

  // Public AI testing endpoints for demo purposes
  app.post('/api/test/ai/improve-description', async (req, res) => {
    try {
      const { description } = req.body;
      
      if (!description || description.trim().length < 10) {
        return res.status(400).json({ 
          message: "Se requiere una descripción de al menos 10 caracteres" 
        });
      }

      // Use unified Loomia system for description improvement
      const { loomiaAI } = await import("./loomia-chat");
      const improvedDescription = await loomiaAI.improveDescription(description);

      res.json({ improvedDescription });
    } catch (error) {
      console.error("Error improving description:", error);
      res.status(500).json({ message: "Error al mejorar la descripción" });
    }
  });

  app.post('/api/test/ai/suggestions', async (req, res) => {
    try {
      const { description } = req.body;
      
      if (!description || description.trim().length < 10) {
        return res.status(400).json({ 
          message: "Se requiere una descripción de al menos 10 caracteres" 
        });
      }

      // Use unified Loomia system for suggestions
      const { loomiaAI } = await import("./loomia-chat");
      const categories = await loomiaAI.generateCategorySuggestions(description);
      const skills = await loomiaAI.generateSkillSuggestions(description);

      res.json({ categories, skills });
    } catch (error) {
      console.error("Error generating suggestions:", error);
      res.status(500).json({ message: "Error al generar sugerencias" });
    }
  });

  // Stripe Connect payment endpoints
  app.post('/api/payments/create-connect-payment', isAuthenticated, async (req: any, res) => {
    try {
      const { hostId, amount, currency, description, payment_method_types } = req.body;

      if (!process.env.STRIPE_SECRET_KEY) {
        return res.status(500).json({ message: "Stripe no está configurado" });
      }

      const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

      // Get host information
      const host = await storage.getUser(hostId);
      if (!host) {
        return res.status(404).json({ message: "Host no encontrado" });
      }

      // Create payment intent with Stripe Connect
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount, // Amount in cents
        currency: currency || 'eur',
        payment_method_types: payment_method_types || ['card', 'google_pay', 'apple_pay'],
        description: description,
        metadata: {
          hostId: hostId,
          bookingUserId: req.userId,
          bookingDescription: description
        },
        // Enable automatic payment methods for better UX
        automatic_payment_methods: {
          enabled: true,
        },
        // Application fee for platform (if using connected accounts)
        // application_fee_amount: Math.round(amount * 0.05), // 5% platform fee
      });

      res.json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      });

    } catch (error) {
      console.error("Error creating Stripe Connect payment:", error);
      res.status(500).json({ message: "Error al crear el pago" });
    }
  });

  // Stripe webhook endpoint for payment confirmation
  app.post('/api/payments/stripe-webhook', async (req, res) => {
    try {
      const sig = req.headers['stripe-signature'];
      const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

      if (!endpointSecret) {
        return res.status(400).json({ message: "Webhook secret no configurado" });
      }

      const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
      let event;

      try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
      } catch (err: any) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).json({ message: 'Webhook error: ' + err.message });
      }

      // Handle the event
      switch (event.type) {
        case 'payment_intent.succeeded':
          const paymentIntent = event.data.object;
          console.log('PaymentIntent succeeded:', paymentIntent.id);
          
          // Here you would typically:
          // 1. Update booking status in database
          // 2. Send confirmation emails
          // 3. Create calendar events
          // 4. Transfer funds to host (if using Connect)
          
          break;
        case 'payment_intent.payment_failed':
          const failedPayment = event.data.object;
          console.log('PaymentIntent failed:', failedPayment.id);
          break;
        default:
          console.log(`Unhandled event type ${event.type}`);
      }

      res.json({ received: true });
    } catch (error) {
      console.error("Stripe webhook error:", error);
      res.status(500).json({ message: "Error procesando webhook" });
    }
  });

  // Get payment methods available for a host
  app.get('/api/payments/methods/:hostId', async (req, res) => {
    try {
      const { hostId } = req.params;
      
      // For now, return standard payment methods
      // In a real implementation, you might check if the host has Stripe Connect enabled
      const paymentMethods = [
        {
          id: 'card',
          name: 'Tarjeta de Crédito/Débito',
          enabled: true,
          fee: 0.029, // 2.9%
          fixed_fee: 0.30
        },
        {
          id: 'google_pay',
          name: 'Google Pay',
          enabled: true,
          fee: 0.029,
          fixed_fee: 0.30
        },
        {
          id: 'apple_pay',
          name: 'Apple Pay',
          enabled: true,
          fee: 0.029,
          fixed_fee: 0.30
        },
        {
          id: 'sepa_debit',
          name: 'SEPA Domiciliación',
          enabled: true,
          fee: 0.008, // 0.8%
          fixed_fee: 0
        }
      ];

      res.json({ methods: paymentMethods });
    } catch (error) {
      console.error("Error fetching payment methods:", error);
      res.status(500).json({ message: "Error al obtener métodos de pago" });
    }
  });

  // Host verification endpoints
  // Request to become a host
  app.post('/api/host/request-verification', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }
      
      if (user.isHost) {
        return res.status(400).json({ message: "Ya eres un host verificado" });
      }
      
      // Generate activation token
      const token = await storage.requestHostStatus(userId);
      
      // Send activation email
      try {
        const sendEmail = await import('./send-email');
        await sendEmail.sendHostActivationEmail(user.email, user.firstName, token, userId);
      } catch (emailError) {
        console.error("Error sending activation email:", emailError);
      }
      
      res.json({ 
        message: "Solicitud de verificación iniciada. Por favor, revisa tu correo para activar tu cuenta.",
        status: 'registered'
      });
    } catch (error) {
      console.error("Error requesting host verification:", error);
      res.status(500).json({ message: "Error al solicitar verificación de host" });
    }
  });
  
  // Activate host account via email token
  app.get('/api/host/activate/:token', async (req, res) => {
    try {
      const { token } = req.params;
      const { userId } = req.query;
      
      if (!userId || typeof userId !== 'string') {
        return res.status(400).json({ message: "ID de usuario inválido" });
      }
      
      const success = await storage.activateHostAccount(userId, token);
      
      if (!success) {
        return res.status(400).json({ message: "Token inválido o expirado" });
      }
      
      res.json({ message: "Cuenta de host activada exitosamente", status: 'active' });
    } catch (error) {
      console.error("Error activating host account:", error);
      res.status(500).json({ message: "Error al activar cuenta de host" });
    }
  });
  
  // Upload host verification document
  app.post('/api/host/upload-document', isAuthenticated, upload.single('document'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No se proporcionó documento" });
      }
      
      const userId = req.userId;
      const { documentType, documentTypeLabel } = req.body;
      
      if (!documentType) {
        return res.status(400).json({ message: "Tipo de documento requerido" });
      }
      
      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(req.file.mimetype)) {
        return res.status(400).json({ message: "Tipo de archivo no permitido. Solo PDF, JPG, PNG o WEBP" });
      }
      
      // Generate unique filename
      const timestamp = Date.now();
      const filename = `verification-${userId}-${timestamp}-${req.file.originalname}`;
      
      // Save to private object storage
      const privatePath = `host-verification/${userId}/${filename}`;
      const fullPath = `/replit-objstore-46fcbff3-adc5-49f0-bb85-39ea50a708d7/.private/${privatePath}`;
      
      try {
        const result = await replitStorage._client.uploadFromBytes(fullPath, req.file.buffer);
        if (result.error) {
          console.error("Object Storage upload failed:", result.error.message);
          return res.status(500).json({ message: "Error al subir documento" });
        }
      } catch (uploadError) {
        console.error("Error uploading to Object Storage:", uploadError);
        return res.status(500).json({ message: "Error al subir documento" });
      }
      
      // Save document record in database
      const document = await storage.createHostVerificationDocument({
        userId,
        documentType,
        documentTypeLabel: documentType === 'other' ? documentTypeLabel : null,
        documentUrl: fullPath,
        originalFileName: req.file.originalname,
        fileSize: req.file.size,
        fileType: req.file.mimetype.split('/')[1]
      });
      
      res.json({ 
        message: "Documento subido exitosamente", 
        document: {
          id: document.id,
          documentType: document.documentType,
          originalFileName: document.originalFileName,
          uploadedAt: document.createdAt
        }
      });
    } catch (error) {
      console.error("Error uploading verification document:", error);
      res.status(500).json({ message: "Error al subir documento de verificación" });
    }
  });
  
  // Get user's verification documents
  app.get('/api/host/verification-documents', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
      const documents = await storage.getHostVerificationDocuments(userId);
      
      // Don't expose the actual document URLs to users
      const safeDocuments = documents.map(doc => ({
        id: doc.id,
        documentType: doc.documentType,
        documentTypeLabel: doc.documentTypeLabel,
        originalFileName: doc.originalFileName,
        fileSize: doc.fileSize,
        verificationStatus: doc.verificationStatus,
        uploadedAt: doc.createdAt,
        verifiedAt: doc.verifiedAt,
        rejectionReason: doc.rejectionReason
      }));
      
      res.json(safeDocuments);
    } catch (error) {
      console.error("Error fetching verification documents:", error);
      res.status(500).json({ message: "Error al obtener documentos de verificación" });
    }
  });
  
  // Delete verification document
  app.delete('/api/host/verification-documents/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.userId;
      
      // Verify the document belongs to the user
      const documents = await storage.getHostVerificationDocuments(userId);
      const document = documents.find(doc => doc.id === id);
      
      if (!document) {
        return res.status(404).json({ message: "Documento no encontrado" });
      }
      
      if (document.verificationStatus === 'approved') {
        return res.status(400).json({ message: "No se pueden eliminar documentos aprobados" });
      }
      
      const success = await storage.deleteHostVerificationDocument(id);
      
      if (!success) {
        return res.status(500).json({ message: "Error al eliminar documento" });
      }
      
      res.json({ message: "Documento eliminado exitosamente" });
    } catch (error) {
      console.error("Error deleting verification document:", error);
      res.status(500).json({ message: "Error al eliminar documento" });
    }
  });
  
  // Admin endpoints for host verification
  // Get pending host verifications (admin only)
  app.get('/api/admin/host-verifications/pending', isAdminAuthenticated, async (req, res) => {
    try {
      const pendingUsers = await storage.getPendingHostVerifications();
      
      // Get verification documents for each user
      const usersWithDocuments = await Promise.all(
        pendingUsers.map(async (user: any) => {
          const documents = await storage.getHostVerificationDocuments(user.id);
          return { ...user, verificationDocuments: documents };
        })
      );
      
      res.json(usersWithDocuments);
    } catch (error) {
      console.error("Error fetching pending verifications:", error);
      res.status(500).json({ message: "Error al obtener verificaciones pendientes" });
    }
  });
  
  // View verification document (admin only)
  app.get('/api/admin/host-verifications/document/:documentId', isAdminAuthenticated, async (req, res) => {
    try {
      const { documentId } = req.params;
      
      // Get document info from database
      const documents = await db.select()
        .from(hostVerificationDocuments)
        .where(eq(hostVerificationDocuments.id, documentId));
        
      if (documents.length === 0) {
        return res.status(404).json({ message: "Documento no encontrado" });
      }
      
      const document = documents[0];
      
      // Download from object storage
      try {
        const file = await replitStorage.getFile(document.documentUrl);
        const buffer = await file.download();
        
        res.setHeader('Content-Type', `image/${document.fileType}`);
        res.setHeader('Content-Disposition', `inline; filename="${document.originalFileName}"`);
        res.send(buffer);
      } catch (downloadError) {
        console.error("Error downloading document:", downloadError);
        res.status(500).json({ message: "Error al descargar documento" });
      }
    } catch (error) {
      console.error("Error viewing document:", error);
      res.status(500).json({ message: "Error al ver documento" });
    }
  });
  
  // Approve host verification (admin only)
  app.post('/api/admin/host-verifications/approve', isAdminAuthenticated, async (req: any, res) => {
    try {
      const { userId } = req.body;
      const adminId = req.userId;
      
      if (!userId) {
        return res.status(400).json({ message: "ID de usuario requerido" });
      }
      
      await storage.approveHostVerification(userId, adminId);
      
      // Get user info for email
      const user = await storage.getUser(userId);
      if (user && user.email) {
        try {
          const sendEmail = await import('./send-email');
          await sendEmail.sendHostApprovalEmail(user.email, user.firstName);
        } catch (emailError) {
          console.error("Error sending approval email:", emailError);
        }
      }
      
      res.json({ message: "Host verificado exitosamente" });
    } catch (error) {
      console.error("Error approving host:", error);
      res.status(500).json({ message: "Error al aprobar host" });
    }
  });
  
  // Reject host verification (admin only)
  app.post('/api/admin/host-verifications/reject', isAdminAuthenticated, async (req: any, res) => {
    try {
      const { userId, reason } = req.body;
      const adminId = req.userId;
      
      if (!userId || !reason) {
        return res.status(400).json({ message: "ID de usuario y razón requeridos" });
      }
      
      await storage.rejectHostVerification(userId, adminId, reason);
      
      res.json({ message: "Verificación de host rechazada" });
    } catch (error) {
      console.error("Error rejecting host:", error);
      res.status(500).json({ message: "Error al rechazar host" });
    }
  });

  // Admin role impersonation endpoint
  app.post('/api/admin/impersonate', isAdminAuthenticated, async (req: any, res) => {
    try {
      const { userId, role } = req.body;
      
      if (!userId || !role) {
        return res.status(400).json({ message: 'User ID y rol son requeridos' });
      }

      if (!['admin', 'host'].includes(role)) {
        return res.status(400).json({ message: 'Rol inválido' });
      }

      // Store impersonation in session/token for security tracking
      req.session.impersonating = { userId, role, originalAdmin: req.userId };
      
      res.json({ 
        success: true, 
        message: `Impersonando como ${role}`,
        impersonating: { userId, role }
      });
    } catch (error) {
      console.error('Error in role impersonation:', error);
      res.status(500).json({ message: 'Error al cambiar rol' });
    }
  });

  // Admin password reset endpoint
  app.post('/api/admin/password-reset', isAdminAuthenticated, async (req: any, res) => {
    try {
      const { userId, email } = req.body;
      
      if (!userId || !email) {
        return res.status(400).json({ message: 'User ID y email son requeridos' });
      }

      // Generate password reset token
      const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      
      // Store reset token (you'd typically store this in database)
      // For now, we'll just log it
      console.log(`Password reset for ${email}: Token: ${resetToken}, Expires: ${resetExpires}`);
      
      res.json({ 
        success: true, 
        message: `Enlace de reseteo enviado a ${email}`,
        resetToken // In production, don't return this
      });
    } catch (error) {
      console.error('Error sending password reset:', error);
      res.status(500).json({ message: 'Error al enviar enlace de reseteo' });
    }
  });

  // Admin notification endpoint
  app.post('/api/admin/send-notification', isAdminAuthenticated, async (req: any, res) => {
    try {
      const { userId, email, type = 'generic' } = req.body;
      
      if (!userId || !email) {
        return res.status(400).json({ message: 'User ID y email son requeridos' });
      }

      // Here you would integrate with your email service
      console.log(`Sending ${type} notification to ${email} (User ID: ${userId})`);
      
      res.json({ 
        success: true, 
        message: `Notificación enviada a ${email}`,
        type,
        sentAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error sending notification:', error);
      res.status(500).json({ message: 'Error al enviar notificación' });
    }
  });

  // ============ PAYMENT METHODS ROUTES ============
  
  // Get user's payment methods
  app.get('/api/payment-methods', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
      const user = await storage.getUser(userId);
      
      if (!user?.stripeCustomerId) {
        return res.json([]);
      }

      // Get payment methods from Stripe
      const paymentMethods = await stripe.paymentMethods.list({
        customer: user.stripeCustomerId,
        type: 'card',
      });

      const formattedMethods = paymentMethods.data.map(pm => ({
        id: pm.id,
        type: 'card',
        last4: pm.card?.last4 || '',
        brand: pm.card?.brand || '',
        expiryMonth: pm.card?.exp_month || 0,
        expiryYear: pm.card?.exp_year || 0,
        isDefault: pm.id === user.stripeDefaultPaymentMethodId
      }));

      res.json(formattedMethods);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      res.status(500).json({ message: 'Error al obtener métodos de pago' });
    }
  });

  // Add new payment method
  app.post('/api/payment-methods', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
      const { cardNumber, expiryMonth, expiryYear, cvc, holderName } = req.body;
      
      let user = await storage.getUser(userId);
      
      // Create Stripe customer if not exists
      if (!user?.stripeCustomerId) {
        const customer = await stripe.customers.create({
          email: user?.email,
          name: `${user?.firstName} ${user?.lastName}`.trim() || holderName,
        });
        
        await storage.updateUserStripeCustomerId(userId, customer.id);
        user = await storage.getUser(userId);
      }

      // Create payment method in Stripe
      const paymentMethod = await stripe.paymentMethods.create({
        type: 'card',
        card: {
          number: cardNumber.replace(/\s/g, ''),
          exp_month: parseInt(expiryMonth),
          exp_year: parseInt(`20${expiryYear}`),
          cvc: cvc,
        },
        billing_details: {
          name: holderName,
        },
      });

      // Attach to customer
      await stripe.paymentMethods.attach(paymentMethod.id, {
        customer: user!.stripeCustomerId!,
      });

      // Set as default if it's the first payment method
      const existingMethods = await stripe.paymentMethods.list({
        customer: user!.stripeCustomerId!,
        type: 'card',
      });

      if (existingMethods.data.length === 1) {
        await stripe.customers.update(user!.stripeCustomerId!, {
          invoice_settings: {
            default_payment_method: paymentMethod.id,
          },
        });
      }

      res.json({
        id: paymentMethod.id,
        type: 'card',
        last4: paymentMethod.card?.last4 || '',
        brand: paymentMethod.card?.brand || '',
        expiryMonth: paymentMethod.card?.exp_month || 0,
        expiryYear: paymentMethod.card?.exp_year || 0,
        isDefault: existingMethods.data.length === 1
      });
    } catch (error) {
      console.error('Error adding payment method:', error);
      if (error instanceof Stripe.errors.StripeCardError) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Error al agregar método de pago' });
      }
    }
  });

  // Remove payment method
  app.delete('/api/payment-methods/:paymentMethodId', isAuthenticated, async (req: any, res) => {
    try {
      const { paymentMethodId } = req.params;
      
      await stripe.paymentMethods.detach(paymentMethodId);
      
      res.json({ message: 'Método de pago eliminado exitosamente' });
    } catch (error) {
      console.error('Error removing payment method:', error);
      res.status(500).json({ message: 'Error al eliminar método de pago' });
    }
  });

  return httpServer;
}
