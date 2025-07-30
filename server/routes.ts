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

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);
  
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

  // Serve files from Replit Object Storage
  app.get('/storage/*', async (req, res) => {
    try {
      const objectPath = req.params[0];
      const result = await replitStorage.client.downloadAsBytes(objectPath);
      
      if (result.error) {
        return res.status(404).json({ message: 'File not found' });
      }

      const fileBuffer = Buffer.from(result.data[0]);

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
  app.get('/api/admin/users/pending', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const adminUser = await storage.getUser(userId);

      if (!adminUser?.isAdmin) {
        return res.status(403).json({ message: "Acceso denegado. Solo administradores." });
      }

      // Get users who have uploaded documents but are not verified
      const pendingUsers = await storage.getPendingVerificationUsers();
      res.json(pendingUsers);
    } catch (error) {
      console.error("Error fetching pending users:", error);
      res.status(500).json({ message: "Error al obtener usuarios pendientes" });
    }
  });

  // Admin routes - Verify user
  app.post('/api/admin/users/:targetUserId/verify', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { targetUserId } = req.params;
      const { isVerified, notes } = req.body;

      const adminUser = await storage.getUser(userId);
      if (!adminUser?.isAdmin) {
        return res.status(403).json({ message: "Acceso denegado. Solo administradores." });
      }

      await storage.verifyUser(targetUserId, isVerified, userId, notes);
      
      res.json({
        message: isVerified ? "Usuario verificado exitosamente" : "Verificación de usuario denegada",
        verified: isVerified
      });
    } catch (error) {
      console.error("Error verifying user:", error);
      res.status(500).json({ message: "Error al verificar usuario" });
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
  return httpServer;
}
