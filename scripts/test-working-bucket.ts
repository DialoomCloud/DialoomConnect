import { Client } from '@replit/object-storage';
import { promises as fs } from 'fs';

async function testWorkingBucket() {
  console.log('Testing with working bucket...');
  
  try {
    // Use the default bucket that we know works
    const bucketId = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID || 'repl-default-bucket-4d62c3b5-ca08-47ab-ac9f-30bd82f7f4da';
    console.log(`Using bucket: ${bucketId}`);
    
    const client = new Client(bucketId);
    
    // Upload a real image file
    console.log('\nUploading test image...');
    try {
      const imageData = await fs.readFile('uploads/users/36733853/public/profile-1753891529223.webp');
      console.log(`Image loaded: ${imageData.length} bytes`);
      
      const uploadResult = await client.uploadFromBytes('users/36733853/public/profile-test.webp', imageData);
      
      if (uploadResult.error) {
        console.error('Upload failed:', uploadResult.error);
        return;
      }
      
      console.log('Upload successful!');
      
      // Now try to download it
      console.log('\nDownloading uploaded image...');
      const downloadResult = await client.downloadAsBytes('users/36733853/public/profile-test.webp');
      
      console.log('Download result:', {
        hasError: !!downloadResult.error,
        errorMessage: downloadResult.error?.message,
        dataType: typeof downloadResult.data,
        dataExists: !!downloadResult.data,
        dataSize: downloadResult.data ? downloadResult.data.length : 0
      });
      
      if (downloadResult.data) {
        console.log('SUCCESS: Data downloaded correctly!');
        console.log('Data is Buffer:', Buffer.isBuffer(downloadResult.data));
        console.log('Data is Uint8Array:', downloadResult.data instanceof Uint8Array);
      }
      
    } catch (fileError) {
      console.error('File error:', fileError);
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testWorkingBucket().catch(console.error);