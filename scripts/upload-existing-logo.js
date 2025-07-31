const { ObjectStorage } = await import('@replit/object-storage');
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function uploadExistingLogo() {
  try {
    const storage = new ObjectStorage();
    const bucket = storage.bucket('replit-objstore-46fcbff3-adc5-49f0-bb85-39ea50a708d7');
    
    // Read the existing logo file
    const logoPath = path.join(__dirname, '../uploads/images/dialoom blue.png');
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
    
    // Also upload the other logos
    const logos = [
      { file: '1024X500 logo dialoom.png', name: 'dialoom-logo-banner.png' },
      { file: 'dialoom white.png', name: 'dialoom-logo-white.png' }
    ];
    
    for (const logo of logos) {
      const filePath = path.join(__dirname, '../uploads/images/', logo.file);
      if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath);
        await bucket.upload(`public/media/${logo.name}`, data, {
          metadata: {
            contentType: 'image/png'
          }
        });
        console.log(`Uploaded ${logo.file} as ${logo.name}`);
      }
    }
    
  } catch (error) {
    console.error('Error uploading logo:', error);
  }
}

uploadExistingLogo();