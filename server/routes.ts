import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertMediaContentSchema, updateUserProfileSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Profile routes
  app.put('/api/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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

  const httpServer = createServer(app);
  return httpServer;
}
