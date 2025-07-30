import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

export class StorageBucket {
  private basePath = 'uploads/users';

  /**
   * Creates the directory structure for a new user
   * Structure: uploads/users/{userId}/public/ and uploads/users/{userId}/private/
   */
  async createUserDirectories(userId: string): Promise<void> {
    const userPath = path.join(this.basePath, userId);
    const publicPath = path.join(userPath, 'public');
    const privatePath = path.join(userPath, 'private');

    try {
      await fs.mkdir(publicPath, { recursive: true });
      await fs.mkdir(privatePath, { recursive: true });
      console.log(`Created directories for user ${userId}`);
    } catch (error) {
      console.error(`Error creating directories for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Stores a profile image in the user's public directory
   */
  async storeProfileImage(userId: string, imageBuffer: Buffer, originalName: string): Promise<string> {
    await this.createUserDirectories(userId);
    
    const timestamp = Date.now();
    const fileName = `profile-${timestamp}.webp`;
    const publicPath = path.join(this.basePath, userId, 'public');
    const filePath = path.join(publicPath, fileName);

    try {
      // Process image with Sharp - resize and convert to WebP
      await sharp(imageBuffer)
        .resize(400, 400, { fit: 'cover', position: 'center' })
        .webp({ quality: 85 })
        .toFile(filePath);

      // Return relative path for database storage
      return `uploads/users/${userId}/public/${fileName}`;
    } catch (error) {
      console.error('Error processing profile image:', error);
      throw error;
    }
  }

  /**
   * Stores a video file in the user's public directory
   */
  async storePublicVideo(userId: string, videoBuffer: Buffer, originalName: string): Promise<string> {
    await this.createUserDirectories(userId);
    
    const timestamp = Date.now();
    const ext = path.extname(originalName);
    const fileName = `video-${timestamp}${ext}`;
    const publicPath = path.join(this.basePath, userId, 'public');
    const filePath = path.join(publicPath, fileName);

    try {
      await fs.writeFile(filePath, videoBuffer);
      return `uploads/users/${userId}/public/${fileName}`;
    } catch (error) {
      console.error('Error storing video:', error);
      throw error;
    }
  }

  /**
   * Stores an image in the user's public directory
   */
  async storePublicImage(userId: string, imageBuffer: Buffer, originalName: string): Promise<string> {
    await this.createUserDirectories(userId);
    
    const timestamp = Date.now();
    const fileName = `image-${timestamp}.webp`;
    const publicPath = path.join(this.basePath, userId, 'public');
    const filePath = path.join(publicPath, fileName);

    try {
      // Process and compress image
      await sharp(imageBuffer)
        .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(filePath);

      return `uploads/users/${userId}/public/${fileName}`;
    } catch (error) {
      console.error('Error processing public image:', error);
      throw error;
    }
  }

  /**
   * Stores a private document (PDF, ID photos, etc.) in the user's private directory
   * These files require admin verification
   */
  async storePrivateDocument(userId: string, fileBuffer: Buffer, originalName: string, documentType: string): Promise<string> {
    await this.createUserDirectories(userId);
    
    const timestamp = Date.now();
    const ext = path.extname(originalName);
    const fileName = `${documentType}-${timestamp}${ext}`;
    const privatePath = path.join(this.basePath, userId, 'private');
    const filePath = path.join(privatePath, fileName);

    try {
      await fs.writeFile(filePath, fileBuffer);
      return `uploads/users/${userId}/private/${fileName}`;
    } catch (error) {
      console.error('Error storing private document:', error);
      throw error;
    }
  }

  /**
   * Deletes a file from the storage bucket
   */
  async deleteFile(relativePath: string): Promise<void> {
    try {
      await fs.unlink(relativePath);
      console.log(`Deleted file: ${relativePath}`);
    } catch (error) {
      console.error(`Error deleting file ${relativePath}:`, error);
      // Don't throw - file might already be deleted
    }
  }

  /**
   * Checks if a file exists in the storage bucket
   */
  async fileExists(relativePath: string): Promise<boolean> {
    try {
      await fs.access(relativePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Gets file information
   */
  async getFileInfo(relativePath: string): Promise<{ size: number; mtime: Date } | null> {
    try {
      const stats = await fs.stat(relativePath);
      return {
        size: stats.size,
        mtime: stats.mtime
      };
    } catch {
      return null;
    }
  }

  /**
   * Lists files in a user's directory
   */
  async listUserFiles(userId: string, directory: 'public' | 'private'): Promise<string[]> {
    const dirPath = path.join(this.basePath, userId, directory);
    
    try {
      const files = await fs.readdir(dirPath);
      return files.map(file => `uploads/users/${userId}/${directory}/${file}`);
    } catch (error) {
      console.error(`Error listing files for user ${userId} in ${directory}:`, error);
      return [];
    }
  }
}

export const storageBucket = new StorageBucket();