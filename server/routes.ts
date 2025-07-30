import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { requireAuth } from "./supabaseAuth";
import multer from "multer";
import sharp from "sharp";
import path from "path";
import { promises as fs } from "fs";
import { insertMediaContentSchema, updateUserProfileSchema } from "@shared/schema";
import { z } from "zod";

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
  // Serve uploaded files
  app.use('/uploads', (req, res, next) => {
    res.header('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
  });
  app.use('/uploads', express.static('uploads'));

  // Supabase Auth routes
  app.post('/api/auth/sync-user', requireAuth, async (req: any, res) => {
    try {
      const userData = req.body;
      const user = await storage.upsertUser(userData);
      res.json(user);
    } catch (error) {
      console.error("Error syncing user:", error);
      res.status(500).json({ message: "Failed to sync user" });
    }
  });

  app.get('/api/auth/user', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Profile routes
  app.put('/api/profile', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const validatedData = updateUserProfileSchema.parse(req.body);
      
      const updatedUser = await storage.updateUserProfile(userId, validatedData);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating profile:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid profile data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Media content routes
  // Upload video file
  app.post("/api/upload/video", requireAuth, upload.single('video'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No se proporcionó ningún archivo" });
      }

      const userId = req.user.id;
      const { title, description } = req.body;
      
      // Check file size (50MB max)
      if (req.file.size > 50 * 1024 * 1024) {
        return res.status(400).json({ message: "El archivo excede el límite de 50MB" });
      }

      // Generate unique filename
      const timestamp = Date.now();
      const filename = `video_${timestamp}_${req.file.originalname}`;
      const filepath = path.join('uploads', 'videos', filename);

      // Ensure directory exists
      await fs.mkdir(path.dirname(filepath), { recursive: true });
      
      // Save file
      await fs.writeFile(filepath, req.file.buffer);

      // Save to database
      const mediaContent = await storage.createMediaContent({
        userId,
        type: 'video' as const,
        url: `/uploads/videos/${filename}`,
        title: title || req.file.originalname,
        description: description || '',
        fileName: req.file.originalname,
        fileSize: req.file.size.toString(),
        mimeType: req.file.mimetype,
      });

      res.json(mediaContent);
    } catch (error) {
      console.error("Error uploading video:", error);
      res.status(500).json({ message: "Error al subir el video" });
    }
  });

  // Upload image file
  app.post("/api/upload/image", requireAuth, upload.single('image'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No se proporcionó ningún archivo" });
      }

      const userId = req.user.id;
      const { title, description } = req.body;
      
      // Check file size (3MB max for images)
      if (req.file.size > 3 * 1024 * 1024) {
        return res.status(400).json({ message: "El archivo excede el límite de 3MB" });
      }

      // Process and compress image
      const timestamp = Date.now();
      const filename = `image_${timestamp}.webp`;
      const filepath = path.join('uploads', 'images', filename);

      // Ensure directory exists
      await fs.mkdir(path.dirname(filepath), { recursive: true });
      
      // Compress image using Sharp
      await sharp(req.file.buffer)
        .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 85 })
        .toFile(filepath);

      // Save to database
      const mediaContent = await storage.createMediaContent({
        userId,
        type: 'image' as const,
        url: `/uploads/images/${filename}`,
        title: title || req.file.originalname,
        description: description || '',
        fileName: req.file.originalname,
        fileSize: req.file.size.toString(),
        mimeType: 'image/webp',
      });

      res.json(mediaContent);
    } catch (error) {
      console.error("Error uploading image:", error);
      res.status(500).json({ message: "Error al subir la imagen" });
    }
  });

  app.get('/api/media', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const mediaContent = await storage.getUserMediaContent(userId);
      res.json(mediaContent);
    } catch (error) {
      console.error("Error fetching media content:", error);
      res.status(500).json({ message: "Failed to fetch media content" });
    }
  });

  app.post('/api/media', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
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

  app.put('/api/media/:id', requireAuth, async (req: any, res) => {
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

  app.delete('/api/media/:id', requireAuth, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
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

  const httpServer = createServer(app);
  return httpServer;
}
