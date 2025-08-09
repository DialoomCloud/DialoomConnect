import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs/promises';
import { existsSync } from 'fs';

/**
 * Unified image URL helper - single source of truth for image serving
 * Prevents inconsistent /Objects/, /uploads/ paths that cause 404s
 */
export class ImageHelper {
  private static instance: ImageHelper;
  private objectStorage: any;
  
  constructor(objectStorage: any) {
    this.objectStorage = objectStorage;
  }
  
  static getInstance(objectStorage?: any): ImageHelper {
    if (!ImageHelper.instance && objectStorage) {
      ImageHelper.instance = new ImageHelper(objectStorage);
    }
    return ImageHelper.instance;
  }
  
  /**
   * Get normalized public URL for any image path
   * Handles both Object Storage and local fallbacks
   */
  getPublicUrl(imagePath: string): string {
    if (!imagePath) return '/api/placeholder-avatar';
    
    // Already a full URL
    if (imagePath.startsWith('http')) return imagePath;
    
    // API route for dynamic serving
    if (imagePath.startsWith('Objects/') || imagePath.includes('profile-')) {
      const cleanPath = imagePath.replace(/^Objects\//, '').replace(/^uploads\//, '');
      return `/storage/${cleanPath}`;
    }
    
    // Static assets
    if (imagePath.startsWith('assets/')) {
      return `/storage/${imagePath}`;
    }
    
    return `/storage/${imagePath}`;
  }
  
  /**
   * Serve image with proper fallback chain and CORS headers
   */
  async serveImage(req: Request, res: Response, imagePath: string): Promise<void> {
    const filePath = req.params.path || imagePath;
    
    try {
      // Set proper headers first
      res.set({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Cross-Origin-Resource-Policy': 'cross-origin',
        'Cache-Control': 'public, max-age=31536000', // 1 year cache
      });
      
      // Try Object Storage first
      try {
        console.log(`Attempting to serve file: ${filePath}`);
        const fileBuffer = await this.objectStorage.getFile(filePath);
        
        // Determine content type
        const ext = path.extname(filePath).toLowerCase();
        const contentType = this.getContentType(ext);
        res.contentType(contentType);
        
        return res.send(fileBuffer);
      } catch (objectStorageError) {
        console.log('Object Storage failed, trying local fallback...');
      }
      
      // Local fallback paths to try
      const localPaths = [
        `uploads/${filePath}`,
        `uploads/Objects/${filePath}`,
        filePath.startsWith('Objects/') ? `uploads/${filePath}` : `uploads/Objects/${filePath}`,
        `uploads/assets/${path.basename(filePath)}` // For assets
      ];
      
      for (const localPath of localPaths) {
        if (existsSync(localPath)) {
          console.log(`Served from local filesystem: ${localPath}`);
          const ext = path.extname(localPath).toLowerCase();
          const contentType = this.getContentType(ext);
          res.contentType(contentType);
          return res.sendFile(path.resolve(localPath));
        }
      }
      
      // Final fallback: placeholder avatar
      console.log(`File not found in any location: ${filePath}`);
      return this.servePlaceholderAvatar(res);
      
    } catch (error) {
      console.error('Error serving image:', error);
      return this.servePlaceholderAvatar(res);
    }
  }
  
  /**
   * Generate SVG placeholder avatar
   */
  private servePlaceholderAvatar(res: Response): void {
    const placeholderSvg = `
      <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="200" fill="#e2e8f0"/>
        <circle cx="100" cy="80" r="30" fill="#94a3b8"/>
        <path d="M50 160 Q100 120 150 160" fill="#94a3b8"/>
        <text x="100" y="190" font-family="Arial" font-size="12" text-anchor="middle" fill="#64748b">No Image</text>
      </svg>
    `;
    
    res.set({
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=3600', // 1 hour cache for placeholders
    });
    res.send(placeholderSvg);
  }
  
  /**
   * Get proper content type for file extensions
   */
  private getContentType(ext: string): string {
    const contentTypes: { [key: string]: string } = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.ico': 'image/x-icon'
    };
    
    return contentTypes[ext] || 'image/jpeg';
  }
}

/**
 * Express route handler for unified image serving
 */
export function createImageRoutes(app: any, objectStorage: any) {
  const imageHelper = ImageHelper.getInstance(objectStorage);
  
  // Unified storage route
  app.get('/storage/*', async (req: Request, res: Response) => {
    const filePath = req.params[0]; // Everything after /storage/
    await imageHelper.serveImage(req, res, filePath);
  });
  
  // Placeholder avatar route
  app.get('/api/placeholder-avatar', (req: Request, res: Response) => {
    const imageHelper = ImageHelper.getInstance();
    imageHelper['servePlaceholderAvatar'](res);
  });
}