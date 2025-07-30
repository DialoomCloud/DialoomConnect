import { Client } from '@replit/object-storage';
import sharp from 'sharp';

export class ReplitObjectStorage {
  private _client: Client;

  constructor() {
    // Initialize with the specific bucket "MetallicBoilingService"
    this._client = new Client('MetallicBoilingService');
  }

  /**
   * Initialize Object Storage
   */
  async initializeBucket(): Promise<void> {
    try {
      console.log('Replit Object Storage initialized with bucket: MetallicBoilingService');
    } catch (error) {
      console.error('Error initializing Object Storage:', error);
      throw error;
    }
  }

  /**
   * Get user folder path for public or private content
   */
  private getUserPath(userId: string, folder: 'public' | 'private', filename: string): string {
    return `Objects/users/${userId}/${folder}/${filename}`;
  }

  /**
   * Upload profile image (processed and stored in public folder)
   */
  async uploadProfileImage(userId: string, fileBuffer: Buffer, originalName: string): Promise<string> {
    try {
      // Process image with Sharp
      const processedBuffer = await sharp(fileBuffer)
        .resize(300, 300, { fit: 'cover', position: 'center' })
        .webp({ quality: 85 })
        .toBuffer();

      const timestamp = Date.now();
      const filename = `profile-${timestamp}.webp`;
      const objectPath = this.getUserPath(userId, 'public', filename);

      // Upload to Replit Object Storage
      const result = await this._client.uploadFromBytes(objectPath, processedBuffer);
      
      if (result.error) {
        throw new Error(`Upload failed: ${result.error.message}`);
      }

      console.log(`Profile image uploaded: ${objectPath}`);
      return objectPath;
    } catch (error) {
      console.error('Error uploading profile image to Object Storage:', error);
      throw error;
    }
  }

  /**
   * Upload media file (video or image to public folder)
   */
  async uploadMediaFile(userId: string, fileBuffer: Buffer, originalName: string, mediaType: 'video' | 'image'): Promise<string> {
    try {
      let processedBuffer = fileBuffer;
      let filename = '';
      const timestamp = Date.now();
      const ext = originalName.split('.').pop()?.toLowerCase();

      if (mediaType === 'image') {
        // Process image
        processedBuffer = await sharp(fileBuffer)
          .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 80 })
          .toBuffer();
        filename = `image-${timestamp}.webp`;
      } else if (mediaType === 'video') {
        // Keep original video file
        filename = `video-${timestamp}.${ext}`;
      }

      const objectPath = this.getUserPath(userId, 'public', filename);

      // Upload to Replit Object Storage
      const result = await this._client.uploadFromBytes(objectPath, processedBuffer);
      
      if (result.error) {
        throw new Error(`Upload failed: ${result.error.message}`);
      }

      console.log(`Media file uploaded: ${objectPath}`);
      return objectPath;
    } catch (error) {
      console.error('Error uploading media file to Object Storage:', error);
      throw error;
    }
  }

  /**
   * Upload private document (ID, passport, etc.)
   */
  async uploadPrivateDocument(userId: string, fileBuffer: Buffer, originalName: string, documentType: string): Promise<string> {
    try {
      const timestamp = Date.now();
      const ext = originalName.split('.').pop() || 'pdf';
      const filename = `${documentType}-${timestamp}.${ext}`;
      const objectPath = this.getUserPath(userId, 'private', filename);

      const result = await this._client.uploadFromBytes(objectPath, fileBuffer);
      
      if (result.error) {
        throw new Error(`Upload failed: ${result.error.message}`);
      }

      console.log(`Private document uploaded: ${objectPath}`);
      return objectPath;
    } catch (error) {
      console.error('Error uploading private document to Object Storage:', error);
      throw error;
    }
  }

  /**
   * Get file as buffer from Object Storage
   */
  async getFile(objectPath: string): Promise<Buffer> {
    try {
      const result = await this._client.downloadAsBytes(objectPath);
      
      if (result.error) {
        throw new Error(`Download failed: ${result.error.message}`);
      }

      // Check if data exists and is valid
      if (!result.data) {
        throw new Error('No data received from Object Storage');
      }

      // Handle different data formats from Object Storage
      if (Buffer.isBuffer(result.data)) {
        return result.data;
      } else if (result.data instanceof Uint8Array) {
        return Buffer.from(result.data);
      } else if (Array.isArray(result.data)) {
        return Buffer.from(result.data);
      } else {
        throw new Error(`Unexpected data format: ${typeof result.data}`);
      }
    } catch (error) {
      console.error('Error downloading file from Object Storage:', error);
      throw error;
    }
  }

  /**
   * Expose client for direct access
   */
  get client() {
    return this._client;
  }

  /**
   * Delete an object from storage
   */
  async deleteObject(objectPath: string): Promise<void> {
    try {
      const result = await this._client.delete(objectPath);
      
      if (result.error) {
        throw new Error(`Delete failed: ${result.error.message}`);
      }

      console.log(`Object deleted: ${objectPath}`);
    } catch (error) {
      console.error('Error deleting object:', error);
      throw error;
    }
  }

  /**
   * List all objects for a user in a specific folder
   */
  async listUserObjects(userId: string, folder: 'public' | 'private'): Promise<string[]> {
    try {
      const prefix = `Objects/users/${userId}/${folder}/`;
      const result = await this._client.list({ prefix });
      
      if (result.error) {
        throw new Error(`List failed: ${result.error.message}`);
      }

      return result.data ? result.data.map((obj: any) => obj.path) : [];
    } catch (error) {
      console.error('Error listing user objects:', error);
      return [];
    }
  }

  /**
   * Check if an object exists
   */
  async objectExists(objectPath: string): Promise<boolean> {
    try {
      const result = await this._client.downloadAsBytes(objectPath);
      return !result.error;
    } catch {
      return false;
    }
  }

  /**
   * Delete all user data (GDPR compliance)
   */
  async deleteAllUserData(userId: string): Promise<void> {
    try {
      // Get all user objects from both folders
      const publicObjects = await this.listUserObjects(userId, 'public');
      const privateObjects = await this.listUserObjects(userId, 'private');
      
      // Delete all objects
      const deletePromises = [...publicObjects, ...privateObjects].map(path => 
        this.deleteObject(path)
      );
      
      await Promise.all(deletePromises);
      console.log(`All data deleted for user: ${userId}`);
    } catch (error) {
      console.error('Error deleting user data:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const replitStorage = new ReplitObjectStorage();