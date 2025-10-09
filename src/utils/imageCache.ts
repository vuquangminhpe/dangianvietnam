// Basic image caching utility
class ImageCache {
  private cache = new Map<string, string>();
  private readonly maxSize = 50; // Maximum number of cached images

  async getImage(url: string): Promise<string> {
    // Check if image is already cached
    if (this.cache.has(url)) {
      return this.cache.get(url)!;
    }

    try {
      // Fetch and cache the image
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch image');
      
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      
      // Add to cache with size limit
      if (this.cache.size >= this.maxSize) {
        const firstKey = this.cache.keys().next().value;
        if (firstKey) {
          const oldUrl = this.cache.get(firstKey);
          if (oldUrl) URL.revokeObjectURL(oldUrl);
          this.cache.delete(firstKey);
        }
      }
      
      this.cache.set(url, objectUrl);
      return objectUrl;
    } catch (error) {
      console.warn('Failed to cache image:', url, error);
      return url; // Return original URL as fallback
    }
  }

  clear() {
    // Clean up all object URLs
    this.cache.forEach(url => URL.revokeObjectURL(url));
    this.cache.clear();
  }
}

// Export singleton instance
export const imageCache = new ImageCache();

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    imageCache.clear();
  });
}