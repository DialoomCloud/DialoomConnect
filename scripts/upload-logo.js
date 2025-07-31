import { Storage } from '@replit/object-storage';
import fs from 'fs';
import path from 'path';

async function uploadLogo() {
  try {
    const storage = new Storage();
    const bucket = await storage.getBucket('replit-objstore-46fcbff3-adc5-49f0-bb85-39ea50a708d7');
    
    // Read the logo file
    const logoPath = 'attached_assets/dialoom blue_1753950890961.png';
    const logoData = fs.readFileSync(logoPath);
    
    // Upload to public/media/dialoom-logo.png
    const objectPath = 'public/media/dialoom-logo.png';
    await bucket.upload(objectPath, logoData, {
      metadata: {
        contentType: 'image/png'
      }
    });
    
    console.log('Logo uploaded successfully to:', objectPath);
    console.log('Public URL will be: /storage/media/dialoom-logo.png');
  } catch (error) {
    console.error('Error uploading logo:', error);
  }
}

uploadLogo();