import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function uploadLogoViaAPI() {
  try {
    // Read the logo file
    const logoPath = path.join(__dirname, '../uploads/images/dialoom blue.png');
    const logoData = fs.readFileSync(logoPath);
    
    // Create FormData
    const FormData = (await import('form-data')).default;
    const form = new FormData();
    
    // Add the logo as a file
    form.append('logo', logoData, {
      filename: 'dialoom-logo.png',
      contentType: 'image/png'
    });
    
    // Upload via the API endpoint
    const response = await fetch('http://localhost:5000/api/upload/logo', {
      method: 'POST',
      body: form,
      headers: {
        ...form.getHeaders()
      }
    });
    
    const result = await response.json();
    console.log('Upload result:', result);
    
    if (result.success) {
      console.log('Logo uploaded successfully!');
      console.log('Public URL:', result.url);
    } else {
      console.error('Upload failed:', result.message);
    }
  } catch (error) {
    console.error('Error uploading logo:', error);
  }
}

uploadLogoViaAPI();