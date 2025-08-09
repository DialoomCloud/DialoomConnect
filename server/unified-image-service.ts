import path from 'path';
import fs from 'fs/promises';
import { ReplitObjectStorage } from './object-storage';

/**
 * Unified Image Service - Una única fuente de verdad para URLs de imágenes
 * Previene errores de /Objects vs /uploads y CORS issues
 */

export class UnifiedImageService {
  private static objectStorage = new ReplitObjectStorage();

  /**
   * Obtiene la URL pública correcta para cualquier imagen
   * Maneja tanto Object Storage como filesystem local
   */
  static getPublicUrl(imagePath: string | null | undefined): string {
    if (!imagePath) {
      return '/api/files/default-avatar.png'; // URL de fallback
    }

    // Si ya es una URL completa, devolverla tal como está
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }

    // Si comienza con /, es una ruta del servidor
    if (imagePath.startsWith('/')) {
      return imagePath;
    }

    // Para rutas relativas, usar el endpoint unificado
    return `/api/files/${imagePath}`;
  }

  /**
   * Sirve archivo con fallback automático Object Storage → local filesystem
   */
  static async serveFile(filePath: string): Promise<{ buffer: Buffer; contentType: string } | null> {
    try {
      // Intentar Object Storage primero
      try {
        const buffer = await this.objectStorage.getFile(filePath);
        const contentType = this.getContentType(filePath);
        return { buffer, contentType };
      } catch (objectStorageError) {
        console.log(`Object Storage failed for ${filePath}, trying local fallback...`);
      }

      // Fallback a filesystem local
      const localPath = path.join(process.cwd(), 'uploads', filePath);
      const buffer = await fs.readFile(localPath);
      const contentType = this.getContentType(filePath);
      
      console.log(`Served from local filesystem: ${filePath}`);
      return { buffer, contentType };

    } catch (error) {
      console.error(`Failed to serve file ${filePath}:`, error);
      return null;
    }
  }

  /**
   * Determina el content-type basado en la extensión
   */
  private static getContentType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    const contentTypeMap: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg', 
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.mp4': 'video/mp4',
      '.webm': 'video/webm',
      '.pdf': 'application/pdf',
    };
    
    return contentTypeMap[ext] || 'application/octet-stream';
  }

  /**
   * Verifica si un archivo existe en cualquiera de los storages
   */
  static async fileExists(filePath: string): Promise<boolean> {
    try {
      // Verificar en Object Storage
      try {
        await this.objectStorage.getFile(filePath);
        return true;
      } catch {
        // Intentar en filesystem local
        const localPath = path.join(process.cwd(), 'uploads', filePath);
        await fs.access(localPath);
        return true;
      }
    } catch {
      return false;
    }
  }

  /**
   * Limpia URLs de imagen para evitar paths maliciosos
   */
  static sanitizePath(filePath: string): string {
    // Remover caracteres peligrosos y normalizar
    return path.normalize(filePath)
      .replace(/\.\./g, '') // Prevenir directory traversal
      .replace(/^\/+/, '') // Remover leading slashes
      .trim();
  }

  /**
   * Genera URL de avatar con fallback garantizado
   */
  static getAvatarUrl(profileImage: string | null | undefined, userId?: string): string {
    if (profileImage) {
      return this.getPublicUrl(profileImage);
    }

    // Fallback a avatar generado o por defecto
    return userId ? `/api/files/avatars/generated-${userId}.png` : '/api/files/default-avatar.png';
  }
}