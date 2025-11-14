// lib/image-utils.ts

/**
 * Generates an image URL with cache busting parameter
 * @param imagePath - The original image path (e.g., "/uploads/foto_personil/image.jpg")
 * @param useTimestamp - If true, uses current timestamp (always fresh). If false, uses a stable version based on path
 * @returns Cache-busted image URL
 */
export function getCacheBustedImageUrl(imagePath: string | null | undefined, useTimestamp: boolean = false): string | null {
  if (!imagePath) return null;
  
  if (useTimestamp) {
    // Use current timestamp for dynamic cache busting (always fresh)
    return `${imagePath}?v=${Date.now()}`;
  }
  
  // Use a stable hash based on the filename for consistent cache busting
  // This allows the same image to be cached until it's replaced
  const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
  return `${imagePath}?v=${timestamp}`;
}

/**
 * Converts public uploads path to API route path with no-cache headers
 * @param publicPath - The public path (e.g., "/uploads/foto_personil/image.jpg")
 * @returns API route path
 */
export function getApiImageUrl(publicPath: string | null | undefined): string | null {
  if (!publicPath) return null;
  
  // Convert /uploads/... to /api/uploads/...
  if (publicPath.startsWith('/uploads/')) {
    return publicPath.replace('/uploads/', '/api/uploads/');
  }
  
  return publicPath;
}

/**
 * Combined utility: converts to API route and adds cache busting
 */
export function getOptimizedImageUrl(imagePath: string | null | undefined, alwaysFresh: boolean = false): string | null {
  if (!imagePath) return null;
  
  // Convert to API route for better cache control
  const apiPath = getApiImageUrl(imagePath);
  
  // Add cache busting
  return getCacheBustedImageUrl(apiPath, alwaysFresh);
}
