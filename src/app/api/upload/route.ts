import { NextResponse } from 'next/server';
import { verifyToken, getAuthToken } from '@/lib/auth/jwt';
import { v4 as uuidv4 } from 'uuid';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function POST(req: Request) {
  try {
    console.log('Upload API called');
    
    // Verify user is authenticated
    const token = await getAuthToken();
    if (!token) {
      console.log('No authentication token found');
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);
    if (!payload?.userId) {
      console.log('Invalid authentication token');
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }
    
    console.log('User authenticated:', payload.userId);

    // Process the uploaded file
    const formData = await req.formData();
    console.log('Form data received');
    
    // Log form data keys without using iterator spread
    const formDataKeys: string[] = [];
    formData.forEach((value, key) => {
      formDataKeys.push(key);
    });
    console.log('Form data keys:', formDataKeys);
    
    const file = formData.get('file') as File;
    
    if (!file) {
      console.log('No file found in form data');
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }
    
    console.log('File received:', file.name, file.type, file.size);

    // Read the file as ArrayBuffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Generate a unique filename
    const fileId = uuidv4();
    const fileName = `${fileId}.jpg`;
    
    // Define the path where the file will be saved
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'profile-images');
    const filePath = join(uploadDir, fileName);
    
    try {
      console.log('Saving file to:', filePath);
      
      // Create directory if it doesn't exist
      const fs = require('fs');
      if (!fs.existsSync(uploadDir)) {
        console.log('Creating directory:', uploadDir);
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      // Save the file to the local filesystem
      await writeFile(filePath, buffer);
      console.log('File saved successfully');
    } catch (error: any) {
      console.error('Error saving file:', error);
      throw new Error(`Failed to save file: ${error?.message || 'Unknown error'}`);
    }
    
    // Return the URL that can be used to access the file
    const url = `/uploads/profile-images/${fileName}`;
    
    // S3 implementation (commented out for future reference)
    /*
    // For AWS S3 implementation:
    const fileId = uuidv4();
    const url = `https://experlo-bucket.s3.amazonaws.com/profile-images/${fileId}.jpg`;
    
    // AWS S3 upload code would go here
    // const s3 = new AWS.S3();
    // await s3.upload({
    //   Bucket: 'experlo-bucket',
    //   Key: `profile-images/${fileId}.jpg`,
    //   Body: buffer,
    //   ContentType: file.type,
    // }).promise();
    */

    return NextResponse.json({ url });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
