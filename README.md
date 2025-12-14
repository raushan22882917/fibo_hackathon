# 🎬 Vision Weaver Studio - Complete AI Video & Image Generation Platform

> **Bria AI Hackathon Submission** - The most comprehensive BRIA FIBO integration with 37+ features across image, video, music, and photo slideshow creation.

[![Status](https://img.shields.io/badge/status-production--ready-success)]()
[![Features](https://img.shields.io/badge/features-37+-blue)]()
[![API](https://img.shields.io/badge/BRIA-FIBO%20v2-orange)]()

---

## 🚀 Quick Start (5 Minutes)

### Prerequisites
- Python 3.8+
- Node.js 16+
- FFmpeg (for video features)

### Installation

```bash
# 1. Clone repository
git clone <your-repo>
cd vision-weaver-studio

# 2. Setup Backend
cd backend
pip install -r requirements.txt

# 3. Configure API Keys
# Edit backend/.env and add:
GEMINI_API_KEY=your_gemini_key_here
BRIA_API_KEY=your_bria_key_here
YOUTUBE_API_KEY=your_youtube_key_here  # Optional

# 4. Start Backend
python main.py
# Backend runs on http://127.0.0.1:8000

# 5. Setup Frontend (new terminal)
cd ..
npm install
npm run dev
# Frontend runs on http://localhost:5173
```

### Get API Keys

**Gemini AI** (FREE):
- Visit: https://makersuite.google.com/app/apikey
- Create API key
- Add to `backend/.env`

**BRIA API**:
- Contact: https://bria.ai/
- Get API key
- Add to `backend/.env`

**YouTube API** (Optional, FREE):
- Visit: https://console.cloud.google.com/
- Enable YouTube Data API v3
- Create API key
- Add to `backend/.env`

---

## 🎯 Core Features

### 1. 🎨 FIBO Editor Panel
**The most comprehensive FIBO control interface**

**6 Control Categories**:
- **Style & Medium**: 10 preset styles (Cinematic, Documentary, Commercial, etc.)
- **Objects & Characters**: 15+ properties (pose, expression, clothing, etc.)
- **Colors & Palette**: Color picker + predefined schemes
- **Composition & Layout**: Rule of thirds, symmetry, balance
- **Lighting & Atmosphere**: 3D control (direction, intensity, shadows)
- **Camera & Perspective**: Angles, focal length, depth of field

**Features**:
- ✅ 50+ adjustable parameters
- ✅ Real-time JSON preview
- ✅ Preset save/load system
- ✅ Direct JSON editing
- ✅ Export/import presets
- ✅ Color picker integration
- ✅ Slider controls

**Location**: Main app → FIBO Editor tab

---

### 2. 🎬 Multi-Frame Cinematic Video
**AI-powered video generation with frame consistency**

**Process**:
```
Text Prompt
    ↓
Gemini AI Creates Timeline (8 frames, 10 seconds)
    ↓
Extract Consistent Context (background, lighting, colors)
    ↓
Rewrite Each Frame for Visual Consistency
    ↓
Generate 8 Images with BRIA FIBO
    ↓
Assemble with FFmpeg (30 FPS, HD 1920x1080)
    ↓
Professional Cinematic Video
```

**Features**:
- ✅ AI-powered timeline generation
- ✅ Frame-by-frame consistency
- ✅ Automatic camera movements
- ✅ Lighting continuity
- ✅ Color palette matching
- ✅ Professional transitions
- ✅ HD output (1920x1080, 30 FPS)

**Innovation**: First structured JSON approach to multi-frame video generation.

**Location**: Main app → Generate Panel → Select "Video"

---

### 3. 🎵 Music-to-Video Generator
**Complete audio-visual workflow**

**Workflow**:
```
Upload Music/YouTube URL
    ↓
AI Music Analysis (tempo, mood, energy, genre)
    ↓
Gemini Generates Story Matching Music
    ↓
Create 6-8 Visual Scenes
    ↓
Generate Images with BRIA FIBO
    ↓
Assemble Video + Sync Audio
    ↓
Professional Music Video
```

**Features**:
- ✅ Music file upload (MP3, WAV, M4A, OGG, FLAC)
- ✅ YouTube URL audio extraction
- ✅ Automatic tempo detection (BPM)
- ✅ Mood analysis (energetic, calm, dramatic)
- ✅ Energy level detection
- ✅ Genre classification
- ✅ Key moment identification
- ✅ AI story generation
- ✅ Scene-by-scene visuals
- ✅ Perfect audio synchronization

**Content Types**:
1. **Music Video**: Full cinematic story
2. **Lyric Video**: Backgrounds for text overlay
3. **Audio Visualizer**: Abstract animated patterns
4. **Story Video**: Narrative-driven journey
5. **Album Art Video**: Animated album artwork
6. **Photo Slideshow**: Images with music

**Location**: `/music-video`

---

### 4. 🎤 Auto-Generated Lyric Video
**One-click lyric video from YouTube**

**Process**:
```
YouTube URL
    ↓
Extract Transcript/Lyrics (youtube-transcript-api)
    ↓
AI Format Lyrics (Gemini)
    ↓
Break into 10-15 Second Sections
    ↓
Generate Visual Themes per Section
    ↓
Create Background Images (BRIA FIBO)
    ↓
Assemble Video + Original Audio
    ↓
Complete Lyric Video
```

**Features**:
- ✅ Automatic lyric extraction
- ✅ AI formatting and cleanup
- ✅ Mood-matched backgrounds
- ✅ Section-by-section visuals
- ✅ Perfect timing sync
- ✅ Professional quality

**Location**: `/music-video` → Select "Lyric Video" → Click "Generate Lyric Video Now"

---

### 5. 📸 Photo Slideshow Creator
**Professional slideshow maker**

**Features**:
```
Upload Multiple Images
    ↓
Add Music (YouTube or File)
    ↓
Customize Settings
  - Duration per image (1-10s)
  - Transition effects (5 types)
  - Video quality (720p-4K)
  - Aspect ratio (4 options)
    ↓
Generate Professional Slideshow
    ↓
Download MP4 Video
```

**Customization**:
- ✅ Unlimited image upload
- ✅ Individual duration control per image
- ✅ 5 transition types (fade, slide, zoom, dissolve, wipe)
- ✅ Multiple aspect ratios (16:9, 9:16, 1:1, 4:3)
- ✅ Quality selection (720p, 1080p, 4K)
- ✅ Music integration
- ✅ Drag-and-drop reordering
- ✅ Hover-to-edit controls
- ✅ Real-time preview

**Use Cases**:
- Wedding slideshows
- Birthday videos
- Travel memories
- Business presentations
- Social media content

**Location**: `/photo-slideshow`

---

### 6. 🤖 Intelligent Content Routing
**Agentic AI workflow**

**Process**:
```
User Prompt
    ↓
Gemini AI Analyzes Intent
    ↓
Determines Category (image/video/ads)
    ↓
Selects Optimal Generation Path
    ↓
Routes to Appropriate BRIA Endpoint
    ↓
Returns Optimized Result
```

**Features**:
- ✅ Automatic category detection
- ✅ Confidence scoring
- ✅ Reasoning explanation
- ✅ Manual override option
- ✅ Context-aware decisions

**Location**: Automatic in Generate Panel

---

### 7. 🔧 ComfyUI Workflow Builder
**Visual node-based workflow creation**

**Features**:
```
Visual Node Editor
    ↓
Drag & Drop Interface
    ↓
Connect Nodes with Edges
    ↓
Configure Node Parameters
    ↓
Execute Complete Workflow
    ↓
Professional Results
```

**Node Types**:
- **Input Nodes**: Text Input, Image Input, Audio Input
- **Generation Nodes**: Image Generation, Video Generation, Music Generation
- **Processing Nodes**: Style Control, Color Adjust, Resize
- **Deterministic Controls**: Camera Control, Lighting Control, Composition Control, Color Palette
- **Logic Nodes**: Conditional, Loop, Merge
- **Output Nodes**: Output, Save File, Preview

**Deterministic Control Features**:
- **📷 Camera Control**: Angles, FOV (14-200mm), Distance (7 shot types), Height, Movement (11 types), Focus, Depth of Field
- **💡 Lighting Control**: 10 lighting setups, Direction, Intensity, Color Temperature (2000K-10000K), Contrast, Shadow types, Highlights, Ambient
- **🎯 Composition Control**: 8 composition rules, 5 balance types, Symmetry, Leading lines (7 types), Framing techniques, Negative space, Focal points, Depth layers
- **🎨 Color Palette Control**: 12 color schemes, Primary/Secondary/Accent colors, Saturation, Brightness, Contrast, Temperature, Harmony

**Workflow Templates**:
- ✅ Image Generation Pipeline
- ✅ Deterministic Image Control (NEW)
- ✅ Video Creation Workflow  
- ✅ Music Video Generator
- ✅ Batch Image Processing

**Advanced Features**:
- ✅ Visual workflow designer
- ✅ Real-time parameter adjustment
- ✅ Deterministic control over every aspect
- ✅ Structured parameters that work consistently
- ✅ Professional-grade precision
- ✅ Template system
- ✅ Save/load workflows
- ✅ Execution progress tracking
- ✅ Node connection validation
- ✅ Automatic topological sorting
- ✅ Backend workflow execution
- ✅ BRIA FIBO integration

**Location**: `/workflow-builder`

#### 🖼️ Advanced Image Merging & Style Transfer
**Professional image composition and artistic transformation**

**Image Input Node**:
- **Multi-Image Upload**: Upload up to 10 images per node
- **Real-time Preview**: Thumbnail grid with hover controls
- **Image Management**: Add, remove, preview individual images
- **Format Support**: JPG, PNG, GIF, WebP
- **Drag & Drop**: Easy file management interface

**Image Merge Node**:
- **8 Merge Modes**: Composite, Collage, Grid, Overlay, Mosaic, Panorama, Double-exposure, Split-screen
- **12 Blend Modes**: Normal, Multiply, Screen, Overlay, Soft-light, Hard-light, Color-dodge, etc.
- **8 Layout Options**: Grid, Horizontal, Vertical, Circular, Spiral, Random, Masonry, Diagonal
- **Precise Controls**: Opacity (0-100%), Spacing (0-50px), Background color
- **Output Formats**: Auto-fit, Square, HD, Portrait, 4K options
- **Quality Control**: 10-100% quality settings

**Style Transfer Node**:
- **15 Artistic Presets**: Van Gogh, Picasso, Monet, Kandinsky, Hokusai, Basquiat, Pollock, Warhol, Dalí, Rothko, Anime, Comic, Watercolor, Oil painting, Pencil sketch
- **Custom Style Upload**: Use your own reference images
- **Precise Control**: Style strength (0-100%), Content preservation (0-100%)
- **Color Management**: Color preservation vs. style adoption
- **Detail Enhancement**: Fine-tune texture and detail levels
- **8 Style Types**: Artistic, Photographic, Texture, Color-grading, Vintage, Modern, Abstract, Realistic

**Preview Output Node**:
- **Real-time Preview**: See results instantly in the workflow
- **Download Options**: PNG, JPG, WebP, SVG, PDF formats
- **Quality Settings**: Low, Medium, High, Ultra quality
- **Quick Actions**: Preview, Download, Modify, Share
- **Image Info**: Dimensions, format, file size display
- **Full-screen Preview**: Zoom and inspect details
- **Quick Modifications**: Rotate, Crop, Resize, Filter

**New Workflow Templates**:
- **Multi-Image Merge & Style**: Complete workflow for merging photos with artistic styles
- **Artistic Photo Collage**: Create professional collages with composition and lighting controls

#### 🎯 Deterministic Control System
**Professional-grade precision for every generation**

**Camera Control Node**:
- **Angles**: Bird's eye, High angle, Eye level, Low angle, Worm's eye, Dutch angle
- **Field of View**: 14mm-200mm (Wide angle to Telephoto)
- **Shot Types**: Extreme close-up to Extreme wide (7 precise distances)
- **Camera Height**: Ground level to Aerial view
- **Movement**: 11 types (Pan, Tilt, Zoom, Dolly, Tracking, Handheld)
- **Focus Control**: Center, Foreground, Background, Rule of thirds, Rack focus
- **Depth of Field**: 0-100% (Shallow bokeh to Deep focus)

**Lighting Control Node**:
- **Professional Setups**: Three-point, Rembrandt, Butterfly, Split, Rim, Silhouette
- **Color Temperature**: 2000K-10000K (Candlelight to Sky blue)
- **Shadow Types**: Soft, Hard, Dramatic, Minimal, Long, Contact
- **Intensity Control**: 0-100% precise control
- **Contrast & Highlights**: Professional-grade adjustment
- **Ambient Lighting**: Environmental light control

**Composition Control Node**:
- **Composition Rules**: Rule of thirds, Golden ratio, Diagonal, Triangular, S-curve
- **Balance Types**: Symmetrical, Asymmetrical, Radial, Dynamic
- **Leading Lines**: Diagonal, Horizontal, Vertical, Curved, Converging
- **Framing Techniques**: Natural, Architectural, Foreground, Shadow, Geometric
- **Negative Space**: 0-80% control
- **Depth Layers**: 1-5 layers (Flat to Maximum depth)

**Color Palette Control Node**:
- **Color Schemes**: 12 professional schemes (Monochromatic, Complementary, Triadic, etc.)
- **Precise Color Selection**: Primary, Secondary, Accent with hex codes
- **Saturation Control**: 0-100% (Desaturated to Highly saturated)
- **Brightness Control**: 0-100% (Dark/Moody to Bright/Light)
- **Contrast Control**: 0-100% (Low to High contrast)
- **Temperature Control**: Very warm to Very cool
- **Color Harmony**: Balanced, Dominant, Gradient, Accent pop, Tonal

**Why This Matters**:
- ✅ **Consistent Results**: Same parameters = Same visual outcome every time
- ✅ **Professional Quality**: Industry-standard controls used by photographers/cinematographers
- ✅ **Complete Control**: No more guessing - precise control over every visual aspect
- ✅ **Workflow Efficiency**: Save and reuse exact settings across projects
- ✅ **Predictable Output**: Know exactly what you'll get before generation

---

### 8. 🎛️ Advanced Controls

**Video Timeline Preview**:
- Real-time frame progress
- Visual timeline bar
- Frame-by-frame tooltips
- Duration display
- FPS indicator
- Completion percentage

**Prompt Preview System**:
- Preview frame prompts before generation
- Edit individual frame descriptions
- See AI-enhanced prompts
- Reset to original
- Approve before generating

**Gallery System**:
- Save all generations
- Metadata storage
- Search and filter
- Preview thumbnails
- Download options

---

## 🔧 Technical Architecture

### Frontend Stack
```
React + TypeScript
├── Zustand (State Management)
├── Tailwind CSS (Styling)
├── Shadcn/ui (Components)
├── React Router (Navigation)
├── Tanstack Query (Data Fetching)
└── Vite (Build Tool)
```

### Backend Stack
```
Python + FastAPI
├── Google Gemini AI (Analysis & Routing)
├── BRIA FIBO API (Image/Video Generation)
├── YouTube Data API v3 (Video Info)
├── youtube-transcript-api (Lyrics)
├── yt-dlp (Audio Download)
├── librosa (Music Analysis)
├── OpenCV (Image Processing)
├── FFmpeg (Video Assembly)
└── PIL/Pillow (Image Manipulation)
```

### BRIA API Endpoints Integrated
- ✅ `/v2/image/generate` - Standard images
- ✅ `/v2/video/generate` - Video generation
- ✅ `/v2/image/generate/tailored` - Custom models
- ✅ `/v2/video/generate/tailored/image-to-video` - Image animation
- ✅ `/v1/tailored-gen/restyle_portrait` - Portrait styling
- ✅ `/v2/video/edit/increase_resolution` - Upscaling
- ✅ `/v2/video/edit/remove_background` - BG removal
- ✅ `/v2/video/edit/foreground_mask` - Masking

---

## 📊 Complete Feature List

### Core Generation (8 Features)
1. Image generation with FIBO
2. Video generation (multi-frame)
3. Advertisement generation
4. Tailored model support
5. Image-to-video conversion
6. Portrait restyling
7. Video upscaling
8. Background removal

### Music & Audio (7 Features)
9. Music file upload
10. YouTube audio download
11. Music analysis (tempo, mood, energy)
12. AI story generation from music
13. Lyric video generation
14. Audio visualizer
15. Music synchronization

### Photo & Image (5 Features)
16. Photo slideshow creator
17. Image cartoonization (5 styles)
18. Batch image processing
19. Multiple aspect ratios
20. Quality selection (720p-4K)

### AI & Intelligence (5 Features)
21. Intelligent content routing
22. Structured prompt conversion
23. Video frame consistency
24. Timeline generation
25. Lyric extraction & formatting

### ComfyUI Workflow Builder (16 Features)
26. Visual node-based editor
27. Drag & drop interface
28. 17 node types (Input, Generation, Processing, Deterministic Controls, Logic, Output)
29. Multi-image input and management
30. Advanced image merging (8 modes, 12 blend types)
31. Professional style transfer (15 artistic presets)
32. Real-time preview and download
33. Deterministic camera control (angles, FOV, movement, focus)
34. Professional lighting control (setups, temperature, shadows)
35. Composition control (rules, balance, leading lines)
36. Color palette control (schemes, saturation, temperature)
37. Workflow templates (7 pre-built)
38. Save/load workflows
39. Real-time execution
40. Parameter configuration
41. Backend integration

### User Interface (6 Features)
34. FIBO Editor Panel
35. Multi-panel interface
36. Real-time progress tracking
37. Gallery system
38. Preset management
39. Video timeline preview

### Technical (6 Features)
40. Async polling system
41. FFmpeg video processing
42. Audio processing (librosa)
43. Image processing (OpenCV)
44. YouTube API integration
45. Error handling & fallbacks

**Total: 53+ Major Features**

---

## 🎨 User Interface

### Main Application Layout
```
┌─────────────────────────────────────────────────┐
│  Top Navigation Bar                             │
│  [Home] [Gallery] [Music Video] [Slideshow]    │
├──────────────┬──────────────────────────────────┤
│              │                                   │
│  Left Panel  │  Main Canvas                     │
│  - Generate  │  [Generated Content Display]     │
│  - FIBO Edit │                                   │
│  - Showcase  │  [Video Player / Image Preview]  │
│  - Character │                                   │
│  - Camera    │                                   │
│  - Scene     │  [Timeline Visualization]        │
│  - Motion    │                                   │
│  - Colors    │  [Progress Indicators]           │
│  - Timeline  │                                   │
│              │                                   │
└──────────────┴──────────────────────────────────┘
```

### Music Video Page
```
┌─────────────────────────────────────────────────┐
│  Music Video Creator                            │
├─────────────────────────────────────────────────┤
│  Step 1: Upload Music & Select Content Type    │
│  [Content Type Dropdown] [YouTube URL/Upload]  │
├─────────────────────────────────────────────────┤
│  Step 2: AI Story Generation                    │
│  [Generated Story] [Scene Descriptions]         │
├─────────────────────────────────────────────────┤
│  Step 3: Add Custom Images (Optional)           │
│  [Image Upload] [Cartoon Style Selection]       │
├─────────────────────────────────────────────────┤
│  Step 4: Generate Video                         │
│  [Video Preview] [Download Button]              │
└─────────────────────────────────────────────────┘
```

### Photo Slideshow Page
```
┌──────────────┬──────────────────────────────────┐
│  Upload      │  Image Grid                      │
│  Images      │  [img] [img] [img]               │
│              │  [img] [img] [img]               │
│  Add Music   │                                   │
│  (YouTube    │  Generated Video Preview         │
│   or File)   │  [video player]                  │
│              │                                   │
│  Settings    │  Generate Button                 │
│  - Duration  │  [Generate Slideshow Video]      │
│  - Transition│                                   │
│  - Quality   │                                   │
│  - Ratio     │                                   │
└──────────────┴──────────────────────────────────┘
```

---

## 🎯 Use Cases & Examples

### 1. Content Creator - YouTube Video
**Scenario**: Create thumbnail and video for tech review

**Steps**:
1. Open Generate Panel
2. Enter: "Futuristic tech product showcase"
3. Select "Video" content type
4. Generate → Get 10-second cinematic video
5. Download and use in YouTube video

**Time**: 2-3 minutes

### 2. Musician - Music Video
**Scenario**: Create music video for new song

**Steps**:
1. Go to `/music-video`
2. Upload song or paste YouTube URL
3. AI analyzes music (tempo, mood)
4. AI generates story and scenes
5. Generate → Get complete music video
6. Download and publish

**Time**: 3-5 minutes

### 3. Wedding Photographer - Slideshow
**Scenario**: Create wedding slideshow for clients

**Steps**:
1. Go to `/photo-slideshow`
2. Upload 20 wedding photos
3. Add romantic music
4. Set 5 seconds per image, fade transitions
5. Generate → Get professional slideshow
6. Deliver to clients

**Time**: 1-2 minutes

### 4. Social Media Manager - Ads
**Scenario**: Create Instagram ad campaign

**Steps**:
1. Open Generate Panel
2. Enter: "Instagram ad for summer sale"
3. Select "Ads" content type
4. Adjust aspect ratio to 1:1
5. Generate → Get optimized ad
6. Download and schedule

**Time**: 30-60 seconds

### 5. Artist - Lyric Video
**Scenario**: Create lyric video for YouTube

**Steps**:
1. Go to `/music-video`
2. Select "Lyric Video" content type
3. Paste YouTube URL of song
4. Click "Generate Lyric Video Now"
5. AI extracts lyrics and creates backgrounds
6. Download and upload to YouTube

**Time**: 3-5 minutes

### 6. Photographer - Artistic Portfolio
**Scenario**: Create artistic portfolio from multiple photos using workflow builder

**Steps**:
1. Go to `/workflow-builder`
2. Load "Multi-Image Merge & Style" template
3. Upload 5 portfolio photos to Image Input node
4. Set Style Transfer to "Van Gogh" with 70% strength
5. Configure Image Merge for "Collage" mode with "Masonry" layout
6. Set Color Palette to "Complementary" scheme
7. Execute workflow
8. Preview result in real-time
9. Download high-quality artistic collage

**Time**: 2-3 minutes

### 7. Designer - Brand Collage
**Scenario**: Create brand mood board from product photos

**Steps**:
1. Go to `/workflow-builder`
2. Load "Artistic Photo Collage" template
3. Upload 8 product photos to Image Input node
4. Set Composition Control to "Golden Ratio" with "Dynamic" balance
5. Configure Lighting Control for "Dramatic" setup
6. Set Style Transfer to "Modern" with 50% strength
7. Configure Image Merge for "Grid" layout with custom spacing
8. Set Preview Output to "Ultra" quality, "WebP" format
9. Execute workflow and download professional mood board

**Time**: 3-4 minutes

---

## 🔑 API Configuration

### Environment Variables

Create `backend/.env`:

```env
# Required
GEMINI_API_KEY=your_gemini_api_key_here
BRIA_API_KEY=your_bria_api_key_here

# Optional
YOUTUBE_API_KEY=your_youtube_api_key_here
DEMO_MODE=false

# HuggingFace (if using)
HUGGINGFACE_TOKEN=your_token_here
```

### Getting API Keys

#### Gemini AI (FREE)
1. Visit https://makersuite.google.com/app/apikey
2. Sign in with Google account
3. Click "Create API Key"
4. Copy and add to `.env`

#### BRIA API
1. Visit https://bria.ai/
2. Contact sales or support
3. Request API access
4. Add key to `.env`

#### YouTube API (Optional, FREE)
1. Visit https://console.cloud.google.com/
2. Create new project
3. Enable "YouTube Data API v3"
4. Create credentials → API Key
5. Add to `.env`

### Demo Mode

Test without BRIA API:
```env
DEMO_MODE=true
```

This uses placeholder images for testing UI and workflows.

---

## 📈 Performance Metrics

### Generation Speed
| Content Type | Time |
|-------------|------|
| Single Image | 30-60 seconds |
| 8-Frame Video | 2-3 minutes |
| Music Video | 3-5 minutes |
| Photo Slideshow | 30-60 seconds |
| Lyric Video | 3-5 minutes |

### Quality Options
| Quality | Resolution | File Size (30s) |
|---------|-----------|----------------|
| 720p HD | 1280x720 | ~10-15 MB |
| 1080p Full HD | 1920x1080 | ~30-40 MB |
| 4K Ultra HD | 3840x2160 | ~100-150 MB |

### Supported Formats

**Input**:
- Images: JPG, PNG, GIF, WebP
- Audio: MP3, WAV, M4A, OGG, FLAC
- Video: MP4, WebM

**Output**:
- Video: MP4 (H.264 + AAC)
- Images: PNG, JPG
- Audio: MP3, AAC

---

## 🐛 Troubleshooting

### Backend Won't Start

**Check Python Version**:
```bash
python --version
# Should be 3.8 or higher
```

**Reinstall Dependencies**:
```bash
cd backend
pip install -r requirements.txt
```

**Check Port**:
```bash
# Make sure port 8000 is not in use
netstat -ano | findstr :8000
```

### API Key Errors

**Verify Keys**:
```bash
# Check backend/.env file
# Make sure no extra spaces
# Restart backend after changes
```

**Test Gemini**:
```bash
# In Python
import google.generativeai as genai
genai.configure(api_key="your_key")
model = genai.GenerativeModel('gemini-1.5-flash')
response = model.generate_content("Hello")
print(response.text)
```

**Test BRIA**:
```bash
# Visit backend health endpoint
http://127.0.0.1:8000/health
```

### Video Generation Issues

**FFmpeg Not Found**:
```bash
# Windows: Download from https://ffmpeg.org/
# Add to PATH
# Test: ffmpeg -version
```

**librosa Not Working**:
```bash
pip install librosa soundfile
```

**OpenCV Issues**:
```bash
pip install opencv-python
```

### Frontend Issues

**Port Already in Use**:
```bash
# Change port in vite.config.ts
# Or kill process on port 5173
```

**API Connection Failed**:
```bash
# Check backend is running on http://127.0.0.1:8000
# Check CORS settings in backend/main.py
```

---

## 🚀 Deployment

### Local Development

**Backend**:
```bash
cd backend
python main.py
```

**Frontend**:
```bash
npm run dev
```

### Production Build

**Frontend**:
```bash
npm run build
# Output in dist/
```

**Backend**:
```bash
# Use uvicorn with workers
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Docker (Optional)

```dockerfile
# Backend Dockerfile
FROM python:3.11
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

```dockerfile
# Frontend Dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
CMD ["npm", "run", "preview"]
```

---

## 🎓 How It Works

### 1. Intelligent Routing
```
User enters prompt: "Create a sunset video"
    ↓
Gemini AI analyzes:
  - Keywords: "video", "sunset"
  - Intent: Video generation
  - Confidence: 95%
    ↓
Routes to: BRIA Video API
    ↓
Generates: Professional video
```

### 2. Multi-Frame Video
```
Prompt: "Ocean waves at sunset"
    ↓
Gemini creates timeline:
  Frame 0 (0s): Wide shot of ocean
  Frame 1 (1.25s): Zoom to waves
  Frame 2 (2.5s): Close-up of foam
  ... (8 frames total)
    ↓
Extract context:
  - Background: Ocean beach
  - Lighting: Golden hour
  - Colors: Warm oranges, blues
    ↓
Rewrite each frame for consistency:
  Frame 0: "Ocean beach at sunset, golden hour lighting..."
  Frame 1: "Same ocean beach, zooming to waves, golden hour..."
    ↓
Generate 8 images with BRIA
    ↓
Assemble with FFmpeg (30 FPS)
    ↓
Final 10-second video
```

### 3. Music-to-Video
```
Upload: song.mp3
    ↓
Analyze with librosa:
  - Tempo: 128 BPM
  - Mood: Energetic
  - Energy: High
  - Genre: Electronic
    ↓
Gemini generates story:
  "Futuristic city nightlife..."
  Scene 1: Neon lights
  Scene 2: Dancing crowd
  ... (8 scenes)
    ↓
Generate images with BRIA
    ↓
Assemble video + sync audio
    ↓
Music video complete
```

---

## 🏆 Why This Wins

### Best Overall
- **Most Comprehensive**: 37+ features across all categories
- **Production Ready**: Not just a demo, fully functional
- **Real Innovation**: Novel approaches to video generation
- **Business Potential**: Clear monetization path

### Best Controllability
- **50+ Parameters**: Complete FIBO API coverage
- **Visual Interface**: User-friendly JSON editing
- **Preset System**: Save and reuse configurations
- **Real-time Preview**: See changes instantly

### Best JSON-Native Workflow
- **Agentic AI**: Gemini makes intelligent decisions
- **Structured Generation**: Timeline-based video creation
- **Automatic Consistency**: AI ensures visual coherence
- **Complete Automation**: One-click workflows

### Best New User Experience
- **Intuitive Design**: No learning curve
- **Progressive Disclosure**: Complexity when needed
- **Real-time Feedback**: Always know what's happening
- **Beautiful UI**: Professional and modern

### Impact Award
- **Democratizes Creation**: Professional tools for everyone
- **Empowers Artists**: Independent musicians can create videos
- **Accessible**: No technical knowledge required
- **Real-world Use**: Solves actual problems

---

## 📊 Project Statistics

- **Lines of Code**: 15,000+
- **Components**: 50+
- **API Endpoints**: 25+
- **Features**: 37+
- **Documentation**: Comprehensive
- **Test Coverage**: Multiple test scripts
- **Development Time**: Extensive
- **Status**: Production Ready

---

## 🌟 Innovation Highlights

### 1. Frame Consistency System
**Problem**: Multi-frame videos look inconsistent  
**Solution**: AI extracts context and rewrites prompts  
**Result**: Professional, coherent videos  

### 2. Music-to-Visual Translation
**Problem**: Creating music videos is expensive  
**Solution**: AI analyzes music and generates matching visuals  
**Result**: Automated music video creation  

### 3. One-Click Lyric Videos
**Problem**: Lyric videos require manual work  
**Solution**: Extract lyrics, generate backgrounds automatically  
**Result**: Complete lyric video in minutes  

### 4. Intelligent Routing
**Problem**: Users don't know which API to use  
**Solution**: AI analyzes intent and routes automatically  
**Result**: Optimal results every time  

### 5. Visual JSON Editor
**Problem**: JSON is intimidating for non-developers  
**Solution**: Visual controls with real-time preview  
**Result**: Professional control for everyone  

---

## 📞 Support & Contact

### Documentation
All features are documented in this README.

### Issues
Check troubleshooting section above.

### API Support
- **Gemini**: https://ai.google.dev/
- **BRIA**: https://bria.ai/
- **YouTube**: https://developers.google.com/youtube

---

## 📝 License

This project integrates multiple services:
- Google Gemini AI (subject to Google's terms)
- BRIA FIBO API (subject to BRIA's terms)
- YouTube Data API (subject to Google's terms)

Please review each service's terms of use.

---

## 🙏 Acknowledgments

Built with amazing tools:
- [BRIA AI](https://bria.ai/) - Image & Video Generation
- [Google Gemini](https://ai.google.dev/) - AI Analysis
- [FastAPI](https://fastapi.tiangolo.com/) - Backend Framework
- [React](https://react.dev/) - Frontend Framework
- [FFmpeg](https://ffmpeg.org/) - Video Processing
- [librosa](https://librosa.org/) - Audio Analysis

---

## 🎯 Quick Links

- **Main App**: http://localhost:5173/
- **Music Video**: http://localhost:5173/music-video
- **Photo Slideshow**: http://localhost:5173/photo-slideshow
- **Workflow Builder**: http://localhost:5173/workflow-builder
- **Gallery**: http://localhost:5173/gallery
- **Backend Health**: http://127.0.0.1:8000/health
- **API Docs**: http://127.0.0.1:8000/docs

---

## 🚀 Get Started Now!

```bash
# 1. Install dependencies
cd backend && pip install -r requirements.txt
cd .. && npm install

# 2. Add API keys to backend/.env
GEMINI_API_KEY=your_key
BRIA_API_KEY=your_key

# 3. Start backend
cd backend && python main.py

# 4. Start frontend (new terminal)
npm run dev

# 5. Open browser
http://localhost:5173
```

**Start creating amazing content with AI!** 🎬✨

---

**Version**: 3.0 (Complete Platform)  
**Status**: Production Ready 🚀  
**Last Updated**: December 2024  
**Competition**: Bria AI Hackathon 2024  

**Made with ❤️ for the Bria AI Hackathon**
