const https = require('https');
const http = require('http');

/**
 * Fetches an image from a URL and converts it to base64
 * Validates file size (max 128KB)
 * @param {string} url - Image URL
 * @returns {Promise<string>} Base64 encoded image string
 */
async function fetchImageAsBase64(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const maxSize = 128 * 1024; // 128KB
    
    protocol.get(url, (response) => {
      // Check if response is successful
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to fetch image: ${response.statusCode}`));
        return;
      }

      // Check content type
      const contentType = response.headers['content-type'];
      if (!contentType || !contentType.startsWith('image/')) {
        reject(new Error('URL does not point to an image'));
        return;
      }

      // Check content length if available
      const contentLength = response.headers['content-length'];
      if (contentLength && parseInt(contentLength) > maxSize) {
        response.destroy(); // Stop downloading
        reject(new Error(`Image size exceeds 128KB limit. Size: ${(parseInt(contentLength) / 1024).toFixed(2)}KB`));
        return;
      }

      const chunks = [];
      let totalSize = 0;
      
      response.on('data', (chunk) => {
        totalSize += chunk.length;
        if (totalSize > maxSize) {
          response.destroy(); // Stop downloading if exceeds limit
          reject(new Error(`Image size exceeds 128KB limit. Size: ${(totalSize / 1024).toFixed(2)}KB`));
          return;
        }
        chunks.push(chunk);
      });
      
      response.on('end', () => {
        if (totalSize > maxSize) {
          reject(new Error(`Image size exceeds 128KB limit. Size: ${(totalSize / 1024).toFixed(2)}KB`));
          return;
        }
        const buffer = Buffer.concat(chunks);
        const base64 = buffer.toString('base64');
        resolve(base64);
      });
      response.on('error', reject);
    }).on('error', reject);
  });
}

/**
 * Processes avatar data - converts URL to base64 or extracts base64 from data URL
 * Validates file size (max 128KB)
 * @param {string} avatarData - Can be a URL, data URL, or base64 string
 * @returns {Promise<string|null>} Base64 string (without data URL prefix) or null
 */
async function processAvatarData(avatarData) {
  if (!avatarData || typeof avatarData !== 'string') {
    return null;
  }

  const trimmed = avatarData.trim();
  if (!trimmed) {
    return null;
  }

  const maxSize = 128 * 1024; // 128KB in bytes

  // If it's a data URL (data:image/...;base64,...), extract the base64 part
  if (trimmed.startsWith('data:')) {
    // Match both regular images and SVG
    const base64Match = trimmed.match(/data:image\/[^;]+;base64,(.+)/);
    if (base64Match && base64Match[1]) {
      const base64String = base64Match[1];
      // Validate size: base64 is ~4/3 the size of the original binary
      // For SVG, the base64 string is close to the actual size
      const estimatedSize = trimmed.includes('svg') 
        ? base64String.length  // SVG base64 is roughly the same size
        : (base64String.length * 3) / 4; // For binary images, estimate original size
      if (estimatedSize > maxSize) {
        throw new Error(`Image size exceeds 128KB limit. Estimated size: ${(estimatedSize / 1024).toFixed(2)}KB`);
      }
      return base64String;
    }
    return null;
  }

  // If it's a URL (http:// or https://), fetch and convert
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    try {
      const base64 = await fetchImageAsBase64(trimmed);
      return base64;
    } catch (error) {
      console.error('Error fetching image from URL:', error);
      throw new Error(`Failed to fetch image from URL: ${error.message}`);
    }
  }

  // Assume it's already a base64 string - validate size
  const estimatedSize = (trimmed.length * 3) / 4;
  if (estimatedSize > maxSize) {
    throw new Error(`Image size exceeds 128KB limit. Estimated size: ${(estimatedSize / 1024).toFixed(2)}KB`);
  }

  return trimmed;
}

module.exports = {
  fetchImageAsBase64,
  processAvatarData,
};
