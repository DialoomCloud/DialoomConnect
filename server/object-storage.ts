import { Client } from '@replit/object-storage';
import sharp from 'sharp';

export class ReplitObjectStorage {
  public _client: Client;

  constructor() {
    // Get bucket name from environment variables
    const publicPaths = process.env.PUBLIC_OBJECT_SEARCH_PATHS || '';
    const bucketId = publicPaths.split('/')[1] || 'replit-objstore-46fcbff3-adc5-49f0-bb85-39ea50a708d7';
    console.log('Initializing Object Storage with bucket:', bucketId);
    this._client = new Client(bucketId);
  }

  /**
   * Initialize Object Storage
   */
  async initializeBucket(): Promise<void> {
    try {
      const publicPaths = process.env.PUBLIC_OBJECT_SEARCH_PATHS || '';
      const bucketId = publicPaths.split('/')[1] || 'replit-objstore-46fcbff3-adc5-49f0-bb85-39ea50a708d7';
      console.log(`Replit Object Storage initialized with bucket: ${bucketId}`);
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
   * Upload generic file to public media folder
   */
  async uploadPublicFile(filename: string, fileBuffer: Buffer): Promise<{ success: boolean; error?: string }> {
    try {
      const objectPath = `media/${filename}`;
      
      // Save to local filesystem first
      const localPath = `uploads/${objectPath}`;
      const fs = await import('fs/promises');
      const path = await import('path');
      
      await fs.mkdir(path.dirname(localPath), { recursive: true });
      await fs.writeFile(localPath, fileBuffer);
      console.log(`File saved locally: ${localPath}`);

      // Try to upload to Object Storage
      const result = await this._client.uploadFromBytes(objectPath, fileBuffer);
      if (result.error) {
        console.warn(`Object Storage upload failed: ${result.error.message}`);
        return { success: true, error: result.error.message };
      } else {
        console.log(`File uploaded to Object Storage: ${objectPath}`);
        return { success: true };
      }
    } catch (error) {
      console.error('Error uploading public file:', error);
      return { success: false, error: String(error) };
    }
  }

  /**
   * Upload profile image (processed and stored in public folder)
   */
  async uploadProfileImage(userId: string, fileBuffer: Buffer, originalName: string): Promise<string> {
    try {
      // Process image with Sharp - higher quality for profile images
      const processedBuffer = await sharp(fileBuffer)
        .resize(300, 300, { fit: 'cover', position: 'center' })
        .webp({ quality: 92 })
        .toBuffer();

      const timestamp = Date.now();
      const filename = `profile-${timestamp}.webp`;
      const objectPath = this.getUserPath(userId, 'public', filename);

      // Save to local filesystem as primary storage (with fallback path)
      const localPath = objectPath.replace('Objects/', 'uploads/');
      const fs = await import('fs/promises');
      const path = await import('path');
      
      // Ensure directory exists
      await fs.mkdir(path.dirname(localPath), { recursive: true });
      await fs.writeFile(localPath, processedBuffer);
      console.log(`Profile image saved locally: ${localPath}`);

      // Try to upload to Object Storage as backup (but don't fail if it doesn't work)
      try {
        const result = await this._client.uploadFromBytes(objectPath, processedBuffer);
        if (result.error) {
          console.warn(`Object Storage upload failed: ${result.error.message}`);
        } else {
          console.log(`Profile image also uploaded to Object Storage: ${objectPath}`);
        }
      } catch (objectStorageError) {
        console.warn('Object Storage upload failed:', objectStorageError);
      }

      return objectPath;
    } catch (error) {
      console.error('Error uploading profile image:', error);
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
        // Process image with higher quality
        processedBuffer = await sharp(fileBuffer)
          .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 90 })
          .toBuffer();
        filename = `image-${timestamp}.webp`;
      } else if (mediaType === 'video') {
        // Keep original video file
        filename = `video-${timestamp}.${ext}`;
      }

      const objectPath = this.getUserPath(userId, 'public', filename);

      // Save to local filesystem as primary storage
      const localPath = objectPath.replace('Objects/', 'uploads/');
      const fs = await import('fs/promises');
      const path = await import('path');
      
      // Ensure directory exists
      await fs.mkdir(path.dirname(localPath), { recursive: true });
      await fs.writeFile(localPath, processedBuffer);
      console.log(`Media file saved locally: ${localPath}`);

      // Try to upload to Object Storage as backup
      try {
        const result = await this._client.uploadFromBytes(objectPath, processedBuffer);
        if (result.error) {
          console.warn(`Object Storage upload failed: ${result.error.message}`);
        } else {
          console.log(`Media file also uploaded to Object Storage: ${objectPath}`);
        }
      } catch (objectStorageError) {
        console.warn('Object Storage upload failed:', objectStorageError);
      }

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
      // Try to download the file directly
      const result = await this._client.downloadAsBytes(objectPath);
      
      if (result.error) {
        throw new Error(`Download failed: ${result.error.message}`);
      }

      if (!result.data) {
        throw new Error('No data received from Object Storage');
      }

      return result.data;
      
    } catch (error) {
      console.error('Error downloading file from Object Storage:', error);
      throw error;
    }
  }

  /**
   * Delete object from Object Storage
   */
  async deleteObject(objectPath: string): Promise<void> {
    try {
      // Remove leading slash if present
      const cleanPath = objectPath.startsWith('/') ? objectPath.substring(1) : objectPath;
      
      // If path starts with /storage/, remove it
      const storagePath = cleanPath.startsWith('storage/') ? cleanPath.substring(8) : cleanPath;
      
      const result = await this._client.delete(storagePath);
      
      if (result.error) {
        throw new Error(`Delete failed: ${result.error.message}`);
      }
      
      console.log(`Object deleted from Object Storage: ${storagePath}`);
    } catch (error) {
      console.error('Error deleting object from Object Storage:', error);
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
   * List files in a directory
   */
  async listFiles(prefix: string): Promise<string[]> {
    try {
      const result = await this._client.list({ prefix, delimiter: '/' });
      
      if (result.error) {
        throw new Error(`List failed: ${result.error.message}`);
      }
      
      const files: string[] = [];
      
      // Add files
      if (result.data) {
        result.data.forEach(obj => {
          const relativePath = obj.path.substring(prefix.length);
          if (relativePath && relativePath !== '/') {
            files.push(relativePath);
          }
        });
      }
      
      // Add folders (prefixes)
      if (result.prefixes) {
        result.prefixes.forEach(p => {
          const folderName = p.substring(prefix.length);
          if (folderName && folderName !== '/') {
            files.push(folderName); // Folders end with /
          }
        });
      }
      
      return files;
    } catch (error) {
      console.error('Error listing files:', error);
      throw error;
    }
  }

  /**
   * Upload file from buffer
   */
  async uploadFile(objectPath: string, buffer: Buffer): Promise<void> {
    try {
      const result = await this._client.uploadFromBytes(objectPath, buffer);
      
      if (result.error) {
        throw new Error(`Upload failed: ${result.error.message}`);
      }
      
      console.log(`File uploaded to Object Storage: ${objectPath}`);
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  /**
   * Delete a file
   */
  async deleteFile(objectPath: string): Promise<void> {
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

// Export both class and singleton instance
export { ReplitObjectStorage };
export const replitStorage = new ReplitObjectStorage();