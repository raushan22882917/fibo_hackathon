import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Music, Image as ImageIcon, Video, Sparkles, Upload, Download, Loader2 } from "lucide-react";
import { buildApiUrl, API_ENDPOINTS } from "@/config/api";

interface MusicAnalysis {
  duration: number;
  tempo: number;
  mood: string;
  energy: string;
  genre: string;
  key_moments: number[];
  description: string;
}

interface MusicStory {
  title: string;
  story: string;
  scenes: Array<{
    timestamp: number;
    description: string;
    mood: string;
    style: string;
    action: string;
  }>;
  timeline: Array<{
    time: number;
    scene_index: number;
    description: string;
  }>;
}

interface CartoonImage {
  url: string;
  style: string;
  method: string;
}

export default function MusicVideo() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  
  // Content Type Selection
  const [contentType, setContentType] = useState("music-video");
  
  // Step 1: Music upload
  const [musicFile, setMusicFile] = useState<File | null>(null);
  const [musicAnalysis, setMusicAnalysis] = useState<MusicAnalysis | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [isDownloadingYoutube, setIsDownloadingYoutube] = useState(false);
  
  // Step 2: Story generation
  const [story, setStory] = useState<MusicStory | null>(null);
  
  // Step 3: Image upload & cartoonization
  const [cartoonStyle, setCartoonStyle] = useState("anime");
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [cartoonImages, setCartoonImages] = useState<CartoonImage[]>([]);
  
  // Step 4: Final video
  const [finalVideo, setFinalVideo] = useState<string | null>(null);
  const [videoInfo, setVideoInfo] = useState<any>(null);

  const handleYoutubeDownload = async () => {
    if (!youtubeUrl.trim()) {
      toast.error("Please enter a YouTube URL");
      return;
    }

    setIsDownloadingYoutube(true);
    setProgress(10);

    try {
      const response = await fetch(buildApiUrl(API_ENDPOINTS.MUSIC_DOWNLOAD_YOUTUBE), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: youtubeUrl }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to download audio");
      }

      const result = await response.json();
      setProgress(50);
      
      // Convert base64 to File object
      const audioData = result.audio_data.split(',')[1];
      const byteCharacters = atob(audioData);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'audio/mp3' });
      const file = new File([blob], `${result.title}.mp3`, { type: 'audio/mp3' });
      
      setMusicFile(file);
      setProgress(100);
      toast.success(`Downloaded: ${result.title}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to download audio");
    } finally {
      setIsDownloadingYoutube(false);
      setProgress(0);
    }
  };

  const handleGenerateLyricVideo = async () => {
    if (!youtubeUrl.trim()) {
      toast.error("Please enter a YouTube URL");
      return;
    }

    setLoading(true);
    setProgress(5);

    try {
      toast.info("Starting lyric video generation...");
      
      const response = await fetch(buildApiUrl(API_ENDPOINTS.MUSIC_GENERATE_LYRIC_VIDEO), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: youtubeUrl, style: "modern" }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to generate lyric video");
      }

      setProgress(90);
      const result = await response.json();
      
      setFinalVideo(result.video_url);
      setVideoInfo(result);
      setProgress(100);
      toast.success("Lyric video created!");
      setStep(4);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to generate lyric video");
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  const handleMusicUpload = async () => {
    if (!musicFile) {
      toast.error("Please select a music file");
      return;
    }

    setLoading(true);
    setProgress(10);

    try {
      const formData = new FormData();
      formData.append("file", musicFile);

      const response = await fetch(buildApiUrl(API_ENDPOINTS.MUSIC_ANALYZE), {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to analyze music");

      const analysis = await response.json();
      setMusicAnalysis(analysis);
      setProgress(100);
      toast.success("Music analyzed successfully!");
      setStep(2);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to analyze music");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateStory = async () => {
    if (!musicAnalysis) return;

    setLoading(true);
    setProgress(10);

    try {
      const response = await fetch(buildApiUrl(API_ENDPOINTS.MUSIC_GENERATE_STORY), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...musicAnalysis,
          content_type: contentType
        }),
      });

      if (!response.ok) throw new Error("Failed to generate story");

      const storyData = await response.json();
      setStory(storyData);
      setProgress(100);
      toast.success("Story generated successfully!");
      setStep(3);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to generate story");
    } finally {
      setLoading(false);
    }
  };

  const handleCartoonizeImage = async (file: File) => {
    setLoading(true);
    setProgress(30);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("style", cartoonStyle);

      const response = await fetch(buildApiUrl(API_ENDPOINTS.MUSIC_CARTOONIZE_IMAGE), {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to cartoonize image");

      const cartoon = await response.json();
      setCartoonImages([...cartoonImages, cartoon]);
      setProgress(100);
      toast.success("Image cartoonized!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to cartoonize image");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateVideo = async () => {
    if (!musicFile || !story) {
      toast.error("Missing required data");
      return;
    }

    setLoading(true);
    setProgress(10);

    try {
      const formData = new FormData();
      formData.append("music_file", musicFile);
      formData.append("story_json", JSON.stringify(story));
      
      if (cartoonImages.length > 0) {
        formData.append("cartoon_images", JSON.stringify(cartoonImages.map(img => img.url)));
      }

      setProgress(30);

      const response = await fetch(buildApiUrl(API_ENDPOINTS.MUSIC_GENERATE_VIDEO), {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to generate video");

      const result = await response.json();
      setFinalVideo(result.video_url);
      setVideoInfo(result);
      setProgress(100);
      toast.success("Music video created!");
      setStep(4);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to generate video");
    } finally {
      setLoading(false);
    }
  };

  const downloadVideo = () => {
    if (!finalVideo) return;
    
    const link = document.createElement("a");
    link.href = finalVideo;
    link.download = `music_video_${Date.now()}.mp4`;
    link.click();
    toast.success("Video download started!");
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-2">
          <Music className="w-8 h-8" />
          Music to Video Creator
        </h1>
        <p className="text-muted-foreground">
          Transform your music into an immersive visual experience with AI
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  step >= s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                {s}
              </div>
              {s < 4 && (
                <div
                  className={`w-24 h-1 mx-2 ${step > s ? "bg-primary" : "bg-muted"}`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Upload Music</span>
          <span>Generate Story</span>
          <span>Add Images</span>
          <span>Create Video</span>
        </div>
      </div>

      {loading && (
        <div className="mb-6">
          <Progress value={progress} className="w-full" />
          <p className="text-sm text-muted-foreground mt-2 text-center">Processing...</p>
        </div>
      )}

      <Tabs value={`step${step}`} className="w-full">
        {/* Step 1: Upload Music */}
        <TabsContent value="step1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Music className="w-5 h-5" />
                Step 1: Upload Your Music
              </CardTitle>
              <CardDescription>
                Upload an MP3, WAV, or other audio file to analyze
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="content-type">Content Type</Label>
                <Select value={contentType} onValueChange={setContentType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="music-video">
                      <div className="flex flex-col items-start">
                        <span className="font-medium">Music Video</span>
                        <span className="text-xs text-muted-foreground">Full cinematic story with visuals</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="lyric-video">
                      <div className="flex flex-col items-start">
                        <span className="font-medium">Lyric Video</span>
                        <span className="text-xs text-muted-foreground">Animated text with background visuals</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="visualizer">
                      <div className="flex flex-col items-start">
                        <span className="font-medium">Audio Visualizer</span>
                        <span className="text-xs text-muted-foreground">Abstract animated patterns synced to music</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="story-video">
                      <div className="flex flex-col items-start">
                        <span className="font-medium">Story Video</span>
                        <span className="text-xs text-muted-foreground">Narrative-driven visual journey</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="album-art">
                      <div className="flex flex-col items-start">
                        <span className="font-medium">Album Art Video</span>
                        <span className="text-xs text-muted-foreground">Animated album cover with effects</span>
                      </div>
                    </SelectItem>

                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  {contentType === "music-video" && "AI generates a complete cinematic story with scene-by-scene visuals"}
                  {contentType === "lyric-video" && "Perfect for showcasing song lyrics with beautiful backgrounds"}
                  {contentType === "visualizer" && "Dynamic audio-reactive animations and patterns"}
                  {contentType === "story-video" && "AI creates a narrative that matches your music's emotional journey"}
                  {contentType === "album-art" && "Bring your album artwork to life with motion and effects"}

                </p>
              </div>

              <div>
                <Label htmlFor="youtube-url">YouTube URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="youtube-url"
                    type="text"
                    placeholder="https://youtube.com/watch?v=..."
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    disabled={loading || isDownloadingYoutube || !!musicFile}
                  />
                  <Button
                    onClick={handleYoutubeDownload}
                    disabled={!youtubeUrl.trim() || loading || isDownloadingYoutube || !!musicFile}
                    variant="outline"
                  >
                    {isDownloadingYoutube ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Downloading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Download
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Paste a YouTube video URL to extract audio
                </p>
              </div>

              {/* Quick Lyric Video Generation */}
              {youtubeUrl.trim() && contentType === "lyric-video" && (
                <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/30">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-primary mb-2">
                        🎤 Auto-Generate Lyric Video
                      </p>
                      <p className="text-xs text-foreground/80 mb-3">
                        Automatically extract lyrics from YouTube, generate beautiful backgrounds, and create a complete lyric video!
                      </p>
                      <Button
                        onClick={handleGenerateLyricVideo}
                        disabled={loading || isDownloadingYoutube}
                        className="w-full"
                        variant="default"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Generating Lyric Video...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Generate Lyric Video Now
                          </>
                        )}
                      </Button>
                      <p className="text-xs text-muted-foreground mt-2">
                        ⚡ This will skip manual steps and create the video automatically
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground">OR</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              <div>
                <Label htmlFor="music-file">Upload Music File</Label>
                <Input
                  id="music-file"
                  type="file"
                  accept="audio/*"
                  onChange={(e) => {
                    setMusicFile(e.target.files?.[0] || null);
                    setYoutubeUrl("");
                  }}
                  disabled={loading || !!youtubeUrl.trim()}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Supported: MP3, WAV, M4A, OGG, FLAC
                </p>
              </div>

              {musicFile && (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="font-medium">{musicFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(musicFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              )}

              {musicAnalysis && (
                <div className="p-4 bg-primary/10 rounded-lg space-y-2">
                  <h3 className="font-semibold">Analysis Results:</h3>
                  <p><strong>Duration:</strong> {musicAnalysis.duration.toFixed(1)}s</p>
                  <p><strong>Tempo:</strong> {musicAnalysis.tempo} BPM</p>
                  <p><strong>Mood:</strong> {musicAnalysis.mood}</p>
                  <p><strong>Energy:</strong> {musicAnalysis.energy}</p>
                  <p><strong>Genre:</strong> {musicAnalysis.genre}</p>
                  <p className="text-sm text-muted-foreground">{musicAnalysis.description}</p>
                </div>
              )}

              <Button
                onClick={handleMusicUpload}
                disabled={!musicFile || loading}
                className="w-full"
              >
                <Upload className="w-4 h-4 mr-2" />
                Analyze Music
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Step 2: Generate Story */}
        <TabsContent value="step2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Step 2: AI Story Generation
              </CardTitle>
              <CardDescription>
                Let AI create a visual story based on your music
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {musicAnalysis && (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm">
                    <strong>Music:</strong> {musicAnalysis.description}
                  </p>
                </div>
              )}

              {story && (
                <div className="space-y-4">
                  <div className="p-4 bg-primary/10 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-bold">{story.title}</h3>
                      <span className="text-xs px-2 py-1 bg-primary/20 rounded-full">
                        {contentType.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{story.story}</p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold">Scenes ({story.scenes.length}):</h4>
                    {story.scenes.map((scene, i) => (
                      <div key={i} className="p-3 bg-muted rounded-lg">
                        <p className="text-sm font-medium">Scene {i + 1} - {scene.timestamp.toFixed(1)}s</p>
                        <p className="text-sm">{scene.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {scene.mood} • {scene.style}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button
                  onClick={handleGenerateStory}
                  disabled={!musicAnalysis || loading}
                  className="flex-1"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Story
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Step 3: Add Images */}
        <TabsContent value="step3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Step 3: Add Custom Images (Optional)
              </CardTitle>
              <CardDescription>
                Upload images to cartoonize and include in your video
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="cartoon-style">Cartoon Style</Label>
                <Select value={cartoonStyle} onValueChange={setCartoonStyle}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="anime">Anime</SelectItem>
                    <SelectItem value="comic">Comic Book</SelectItem>
                    <SelectItem value="watercolor">Watercolor</SelectItem>
                    <SelectItem value="sketch">Pencil Sketch</SelectItem>
                    <SelectItem value="pixar">Pixar 3D</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="image-upload">Upload Images</Label>
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    files.forEach(file => handleCartoonizeImage(file));
                  }}
                  disabled={loading}
                />
              </div>

              {cartoonImages.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {cartoonImages.map((img, i) => (
                    <div key={i} className="relative">
                      <img
                        src={img.url}
                        alt={`Cartoon ${i + 1}`}
                        className="w-full h-40 object-cover rounded-lg"
                      />
                      <p className="text-xs text-center mt-1">{img.style}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button
                  onClick={() => setStep(4)}
                  disabled={!story}
                  className="flex-1"
                >
                  Continue to Video Generation
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Step 4: Generate Video */}
        <TabsContent value="step4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="w-5 h-5" />
                Step 4: Generate Final Video
              </CardTitle>
              <CardDescription>
                Create your complete music video with AI-generated visuals
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {story && (
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium">{story.title}</p>
                    <span className="text-xs px-2 py-1 bg-primary/20 rounded-full">
                      {contentType.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {story.scenes.length} scenes • {cartoonImages.length} custom images
                  </p>
                </div>
              )}

              {finalVideo ? (
                <div className="space-y-4">
                  <video
                    src={finalVideo}
                    controls
                    className="w-full rounded-lg"
                  />
                  
                  {videoInfo && (
                    <div className="p-4 bg-primary/10 rounded-lg">
                      <h3 className="font-semibold mb-2">Video Info:</h3>
                      <p><strong>Title:</strong> {videoInfo.title}</p>
                      <p><strong>Duration:</strong> {videoInfo.duration}s</p>
                      <p><strong>Scenes:</strong> {videoInfo.scenes}</p>
                    </div>
                  )}

                  <Button onClick={downloadVideo} className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Download Video
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep(3)}>
                    Back
                  </Button>
                  <Button
                    onClick={handleGenerateVideo}
                    disabled={!story || loading}
                    className="flex-1"
                  >
                    <Video className="w-4 h-4 mr-2" />
                    Generate Music Video
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
