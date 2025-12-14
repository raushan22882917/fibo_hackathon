import { useState, useEffect } from "react";
import { ArrowLeft, Grid3x3, List, Image as ImageIcon, Video, Download, Trash2, Search, Filter, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface GalleryItem {
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
  };
}

const Gallery = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filter, setFilter] = useState<"all" | "image" | "video">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);

  // Load gallery items from localStorage
  useEffect(() => {
    const loadGalleryItems = () => {
      const saved = localStorage.getItem("bria-gallery");
      if (saved) {
        try {
          const items = JSON.parse(saved);
          setGalleryItems(items);
        } catch (error) {
          console.error("Failed to load gallery:", error);
        }
      }
    };

    loadGalleryItems();
    
    // Listen for new items
    const handleStorageChange = () => {
      loadGalleryItems();
    };
    
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("gallery-updated", handleStorageChange);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("gallery-updated", handleStorageChange);
    };
  }, []);

  // Filter and sort items
  const filteredItems = galleryItems
    .filter(item => {
      if (filter !== "all" && item.type !== filter) return false;
      if (searchQuery && !item.prompt.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "newest") return b.timestamp - a.timestamp;
      return a.timestamp - b.timestamp;
    });

  const handleDownload = async (item: GalleryItem) => {
    try {
      if (item.url.startsWith('data:')) {
        const a = document.createElement("a");
        a.href = item.url;
        const ext = item.type === "video" ? "mp4" : "png";
        a.download = `bria-${item.type}-${item.id}.${ext}`;
        a.click();
      } else {
        const response = await fetch(item.url);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        const ext = item.type === "video" ? "mp4" : "png";
        a.download = `bria-${item.type}-${item.id}.${ext}`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this item?")) {
      const updated = galleryItems.filter(item => item.id !== id);
      setGalleryItems(updated);
      localStorage.setItem("bria-gallery", JSON.stringify(updated));
      window.dispatchEvent(new Event("gallery-updated"));
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/")}
                className="gap-2 rounded-full"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Studio
              </Button>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent">
                  Gallery
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {filteredItems.length} {filteredItems.length === 1 ? 'creation' : 'creations'} • FIBO Generated
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-muted/30 rounded-full p-1">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="rounded-full"
              >
                <Grid3x3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="rounded-full"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="flex-1 min-w-[280px]">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search your FIBO creations..."
                  className="w-full pl-12 pr-4 py-3 rounded-full bg-background/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 backdrop-blur-sm"
                />
              </div>
            </div>

            {/* Type Filter */}
            <div className="flex items-center gap-3 bg-background/50 rounded-full px-4 py-2 border border-border/50">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="bg-transparent border-none text-sm focus:outline-none cursor-pointer"
              >
                <option value="all">All Types</option>
                <option value="image">Images</option>
                <option value="video">Videos</option>
              </select>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-3 bg-background/50 rounded-full px-4 py-2 border border-border/50">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent border-none text-sm focus:outline-none cursor-pointer"
              >
                <option value="newest">Latest</option>
                <option value="oldest">Oldest</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Gallery Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {filteredItems.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-surface-2 flex items-center justify-center mx-auto mb-4">
              <ImageIcon className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Items Found</h3>
            <p className="text-sm text-muted-foreground mb-6">
              {searchQuery || filter !== "all" 
                ? "Try adjusting your filters or search query"
                : "Start generating content to build your gallery"}
            </p>
            <Button onClick={() => navigate("/")}>
              Go to Editor
            </Button>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="group relative rounded-lg overflow-hidden border border-border bg-card hover:shadow-lg transition-all"
              >
                {/* Thumbnail */}
                <div className="aspect-video bg-surface-2 relative overflow-hidden">
                  {item.type === "video" ? (
                    <video
                      src={item.url}
                      className="w-full h-full object-cover"
                      muted
                      loop
                      onMouseEnter={(e) => e.currentTarget.play()}
                      onMouseLeave={(e) => {
                        e.currentTarget.pause();
                        e.currentTarget.currentTime = 0;
                      }}
                    />
                  ) : (
                    <img
                      src={item.url}
                      alt={item.prompt}
                      className="w-full h-full object-cover"
                    />
                  )}
                  
                  {/* Type Badge */}
                  <div className="absolute top-2 left-2">
                    <span className="px-2 py-1 rounded bg-black/70 backdrop-blur-sm text-xs font-semibold text-white flex items-center gap-1">
                      {item.type === "video" ? (
                        <>
                          <Video className="w-3 h-3" />
                          Video
                        </>
                      ) : (
                        <>
                          <ImageIcon className="w-3 h-3" />
                          Image
                        </>
                      )}
                    </span>
                  </div>

                  {/* Actions Overlay */}
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleDownload(item)}
                      className="gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <p className="text-sm text-foreground line-clamp-2 mb-2">
                    {item.prompt}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{item.category}</span>
                    <span>{formatDate(item.timestamp)}</span>
                  </div>
                  {item.metadata && (
                    <div className="mt-2 pt-2 border-t border-border flex items-center gap-2 text-xs text-muted-foreground">
                      {item.metadata.aspectRatio && (
                        <span>{item.metadata.aspectRatio}</span>
                      )}
                      {item.metadata.frames && (
                        <span>• {item.metadata.frames} frames</span>
                      )}
                      {item.metadata.duration && (
                        <span>• {item.metadata.duration}s</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 p-4 rounded-lg border border-border bg-card hover:shadow-lg transition-all"
              >
                {/* Thumbnail */}
                <div className="w-40 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-surface-2">
                  {item.type === "video" ? (
                    <video
                      src={item.url}
                      className="w-full h-full object-cover"
                      muted
                    />
                  ) : (
                    <img
                      src={item.url}
                      alt={item.prompt}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {item.type === "video" ? (
                          <Video className="w-4 h-4 text-primary" />
                        ) : (
                          <ImageIcon className="w-4 h-4 text-primary" />
                        )}
                        <span className="text-xs font-semibold text-primary uppercase">
                          {item.type}
                        </span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-sm text-foreground line-clamp-2">
                        {item.prompt}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownload(item)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{formatDate(item.timestamp)}</span>
                    {item.metadata?.aspectRatio && (
                      <>
                        <span>•</span>
                        <span>{item.metadata.aspectRatio}</span>
                      </>
                    )}
                    {item.metadata?.frames && (
                      <>
                        <span>•</span>
                        <span>{item.metadata.frames} frames</span>
                      </>
                    )}
                    {item.metadata?.duration && (
                      <>
                        <span>•</span>
                        <span>{item.metadata.duration}s</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Gallery;
