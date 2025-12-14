// Gallery utility functions

export interface GalleryItem {
  id: string;
  type: "image" | "video";
  url: string;
  thumbnail?: string;
  prompt: string;
  category: string;
  timestamp: number;
  metadata?: {
    aspectRatio?: string;
    style?: string;
    frames?: number;
    duration?: number;
    seed?: number;
  };
}

export function saveToGallery(item: Omit<GalleryItem, "id" | "timestamp">): void {
  try {
    // Get existing gallery
    const saved = localStorage.getItem("bria-gallery");
    const gallery: GalleryItem[] = saved ? JSON.parse(saved) : [];

    // Create new item with ID and timestamp
    const newItem: GalleryItem = {
      ...item,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };

    // Add to beginning of array (newest first)
    gallery.unshift(newItem);

    // Keep only last 100 items to prevent localStorage overflow
    const trimmed = gallery.slice(0, 100);

    // Save back to localStorage
    localStorage.setItem("bria-gallery", JSON.stringify(trimmed));

    // Dispatch event to notify gallery page
    window.dispatchEvent(new Event("gallery-updated"));

    console.log("✅ Saved to gallery:", newItem.id);
  } catch (error) {
    console.error("Failed to save to gallery:", error);
  }
}

export function getGalleryItems(): GalleryItem[] {
  try {
    const saved = localStorage.getItem("bria-gallery");
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error("Failed to load gallery:", error);
    return [];
  }
}

export function deleteGalleryItem(id: string): void {
  try {
    const gallery = getGalleryItems();
    const updated = gallery.filter(item => item.id !== id);
    localStorage.setItem("bria-gallery", JSON.stringify(updated));
    window.dispatchEvent(new Event("gallery-updated"));
  } catch (error) {
    console.error("Failed to delete from gallery:", error);
  }
}

export function clearGallery(): void {
  try {
    localStorage.removeItem("bria-gallery");
    window.dispatchEvent(new Event("gallery-updated"));
  } catch (error) {
    console.error("Failed to clear gallery:", error);
  }
}
