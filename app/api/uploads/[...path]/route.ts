// app/api/uploads/[...path]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: filePath } = await params;
    
    // Construct the full file path
    const fullPath = path.join(process.cwd(), 'public', 'uploads', ...filePath);
    
    // Check if file exists
    if (!existsSync(fullPath)) {
      return new NextResponse('File not found', { status: 404 });
    }
    
    // Read the file
    const fileBuffer = await readFile(fullPath);
    
    // Determine content type based on file extension
    const ext = path.extname(fullPath).toLowerCase();
    const contentTypeMap: { [key: string]: string } = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.pdf': 'application/pdf',
    };
    
    const contentType = contentTypeMap[ext] || 'application/octet-stream';
    
    // Return the file with proper cache headers
    return new NextResponse(fileBuffer as unknown as BodyInit, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('Error serving file:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
