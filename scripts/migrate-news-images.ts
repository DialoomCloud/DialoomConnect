import { replitStorage } from '../server/object-storage';
import { storage } from '../server/storage';
import fs from 'fs/promises';
import path from 'path';

async function migrateNewsImages() {
  try {
    console.log('Starting news images migration to Object Storage...');
    
    // Get all news articles with images
    const articles = await storage.getAllNewsArticles();
    const articlesWithImages = articles.filter(article => article.featuredImage);
    
    console.log(`Found ${articlesWithImages.length} articles with images to migrate`);
    
    for (const article of articlesWithImages) {
      if (!article.featuredImage) continue;
      
      // Extract filename from current path
      const currentPath = article.featuredImage;
      const filename = currentPath.split('/').pop();
      
      if (!filename) continue;
      
      // Check if file exists locally
      const localPath = `uploads/news/${filename}`;
      try {
        const fileExists = await fs.access(localPath).then(() => true).catch(() => false);
        
        if (fileExists) {
          console.log(`Migrating image for article: ${article.title}`);
          
          // Read file from local storage
          const fileBuffer = await fs.readFile(localPath);
          
          // Upload to Object Storage in Media folder
          const newPath = `Media/${filename}`;
          const result = await replitStorage._client.uploadFromBytes(newPath, fileBuffer);
          
          if (result.error) {
            console.error(`Failed to upload ${filename}: ${result.error.message}`);
            continue;
          }
          
          // Update database with new URL
          const newUrl = `/storage/Media/${filename}`;
          await storage.updateNewsArticle(article.id, {
            featuredImage: newUrl
          });
          
          console.log(`✓ Migrated ${filename} to ${newUrl}`);
        } else {
          console.log(`File not found locally: ${localPath}`);
        }
      } catch (error) {
        console.error(`Error processing ${filename}:`, error);
      }
    }
    
    console.log('Migration completed!');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

// Run migration
migrateNewsImages().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});