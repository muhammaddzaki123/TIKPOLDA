// app/api/uploads/[...path]/route.ts
/**
 * DEPRECATED: This API route is no longer needed.
 * All files are now stored in Supabase Storage with public URLs.
 * 
 * This route is kept for backward compatibility with old file URLs.
 * New uploads will use Supabase Storage directly.
 */
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: filePath } = await params;
    
    // Return a helpful message for deprecated endpoint
    return new NextResponse(
      JSON.stringify({
        error: 'This endpoint is deprecated',
        message: 'Files are now stored in Supabase Storage. Please use the new file URLs from Supabase.',
        requestedPath: filePath.join('/'),
      }),
      { 
        status: 410, // Gone
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error in deprecated uploads route:', error);
    return new NextResponse('Gone - Files moved to cloud storage', { status: 410 });
  }
}
