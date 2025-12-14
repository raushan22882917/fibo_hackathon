from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import os
from dotenv import load_dotenv
import google.generativeai as genai
import httpx
import json
import asyncio
from PIL import Image, ImageDraw, ImageFont
import io
import base64
import tempfile
import subprocess
import shutil
from datetime import datetime

# Load environment variables
load_dotenv()

app = FastAPI(title="BRIA FIBO API with Gemini Routing")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "http://localhost:5173", "http://127.0.0.1:8080", "http://127.0.0.1:5173","https://vision-weaver-studio.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
BRIA_API_KEY = os.getenv("BRIA_API_KEY")
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")
DEMO_MODE = os.getenv("DEMO_MODE", "false").lower() == "true"

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    # Use gemini-1.5-flash (faster) or gemini-1.5-pro (more accurate)
    gemini_model = genai.GenerativeModel('gemini-1.5-flash')
    print("✅ Gemini AI configured (gemini-1.5-flash)")
else:
    print("⚠️  WARNING: GEMINI_API_KEY not found - using fallback mode")
    gemini_model = None

if not BRIA_API_KEY and not DEMO_MODE:
    print("⚠️  WARNING: BRIA_API_KEY not found")
    print("💡 TIP: Set DEMO_MODE=true in .env to test without BRIA API")
elif DEMO_MODE:
    print("🎭 DEMO MODE: Using placeholder images (no BRIA API calls)")

# Video consistency settings
VIDEO_CONSISTENCY_ENABLED = True
AUDIO_GENERATION_ENABLED = False  # Set to True when audio API is configured

# BRIA API endpoints (v1 and v2)
BRIA_ENDPOINTS = {
    "image": "https://engine.prod.bria-api.com/v2/image/generate",
    "video": "https://engine.prod.bria-api.com/v2/video/generate",
    "ads": "https://engine.prod.bria-api.com/v2/image/generate",
    "tailored": "https://engine.prod.bria-api.com/v2/image/generate/tailored",
    "image-to-video": "https://engine.prod.bria-api.com/v2/video/generate/tailored/image-to-video",
    "portrait-restyle": "https://engine.prod.bria-api.com/v1/tailored-gen/restyle_portrait",
    "text-to-vector": "https://engine.prod.bria-api.com/v1/text-to-vector/tailored",
    "upscale-video": "https://engine.prod.bria-api.com/v2/video/edit/increase_resolution",
    "remove-bg-video": "https://engine.prod.bria-api.com/v2/video/edit/remove_background",
    "video-mask": "https://engine.prod.bria-api.com/v2/video/edit/foreground_mask",
}

class StructuredPrompt(BaseModel):
    short_description: Optional[str] = None
    objects: Optional[List[Dict[str, Any]]] = None
    background_setting: Optional[str] = None
    lighting: Optional[Dict[str, str]] = None
    aesthetics: Optional[Dict[str, str]] = None
    photographic_characteristics: Optional[Dict[str, str]] = None
    style_medium: Optional[str] = None
    context: Optional[str] = None
    artistic_style: Optional[str] = None

class GenerateRequest(BaseModel):
    prompt: Optional[str] = None
    structured_prompt: Optional[StructuredPrompt] = None
    seed: Optional[int] = 5555
    num_inference_steps: Optional[int] = 30
    aspect_ratio: Optional[str] = "1:1"
    guidance_scale: Optional[float] = 7.5
    negative_prompt: Optional[str] = None
    force_category: Optional[str] = None  # Manual category override
    tailored_model_id: Optional[str] = None  # For tailored models
    image_url: Optional[str] = None  # For image-to-video

class StructuredPromptRequest(BaseModel):
    prompt: str
    seed: Optional[int] = 5555

class CategoryResponse(BaseModel):
    category: str
    confidence: float
    reasoning: str

class VideoFrame(BaseModel):
    frame_number: int
    timestamp: float
    description: str
    camera_movement: Optional[str] = None
    lighting: Optional[str] = None
    action: Optional[str] = None

class VideoTimeline(BaseModel):
    total_duration: float
    total_frames: int
    fps: int
    frames: List[VideoFrame]
    overall_style: str
    transition_type: str
    camera_movement: Optional[str] = None
    lighting: Optional[str] = None
    action: Optional[str] = None

class VideoTimeline(BaseModel):
    total_duration: float
    fps: int
    total_frames: int
    frames: List[VideoFrame]
    overall_style: str
    transition_type: str
    background_description: Optional[str] = None
    character_description: Optional[str] = None
    color_palette: Optional[str] = None
    audio_description: Optional[str] = None

class ConsistentVideoContext(BaseModel):
    """Context for maintaining consistency across video frames"""
    background: str
    characters: List[str]
    lighting_style: str
    color_palette: str
    camera_style: str
    overall_mood: str

async def analyze_video_timeline(prompt: str, duration: float = 5.0) -> VideoTimeline:
    """Use Gemini to analyze video prompt and create frame-by-frame timeline"""
    if not gemini_model:
        # Fallback: create simple 3-frame timeline
        return VideoTimeline(
            total_duration=duration,
            fps=8,
            total_frames=3,
            frames=[
                VideoFrame(frame_number=0, timestamp=0.0, description=f"{prompt} - beginning"),
                VideoFrame(frame_number=1, timestamp=duration/2, description=f"{prompt} - middle"),
                VideoFrame(frame_number=2, timestamp=duration, description=f"{prompt} - end"),
            ],
            overall_style="cinematic",
            transition_type="smooth"
        )
    
    try:
        timeline_prompt = f"""Analyze this video prompt and create a detailed frame-by-frame timeline for a {duration} second video.

Prompt: "{prompt}"

Create a timeline with 5-8 key frames that tell the story. For each frame, specify:
- frame_number: Sequential number (0, 1, 2, etc.)
- timestamp: Time in seconds (0.0 to {duration})
- description: Detailed visual description of this exact moment
- camera_movement: Camera action (pan, zoom, static, tracking, etc.)
- lighting: Lighting condition at this moment
- action: What's happening/moving in this frame

Respond in JSON format:
{{
    "total_duration": {duration},
    "fps": 8,
    "total_frames": 6,
    "frames": [
        {{
            "frame_number": 0,
            "timestamp": 0.0,
            "description": "Opening shot description",
            "camera_movement": "slow zoom in",
            "lighting": "golden hour",
            "action": "waves beginning to crash"
        }},
        ...
    ],
    "overall_style": "cinematic|documentary|commercial",
    "transition_type": "smooth|cut|fade"
}}

Make it cinematic and visually compelling!"""

        response = gemini_model.generate_content(timeline_prompt)
        text = response.text.strip()
        
        # Clean markdown
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        text = text.strip()
        
        timeline_data = json.loads(text)
        return VideoTimeline(**timeline_data)
    
    except Exception as e:
        print(f"Timeline analysis error: {str(e)}")
        # Fallback timeline
        return VideoTimeline(
            total_duration=duration,
            fps=8,
            total_frames=3,
            frames=[
                VideoFrame(frame_number=0, timestamp=0.0, description=f"{prompt} - opening shot"),
                VideoFrame(frame_number=1, timestamp=duration/2, description=f"{prompt} - main action"),
                VideoFrame(frame_number=2, timestamp=duration, description=f"{prompt} - closing shot"),
            ],
            overall_style="cinematic",
            transition_type="smooth"
        )

async def extract_video_context(prompt: str) -> ConsistentVideoContext:
    """Extract consistent elements from video prompt for maintaining continuity"""
    if not gemini_model:
        return ConsistentVideoContext(
            background="generic background",
            characters=["main subject"],
            lighting_style="natural lighting",
            color_palette="neutral tones",
            camera_style="cinematic",
            overall_mood="professional"
        )
    
    try:
        context_prompt = f"""Analyze this video prompt and extract the consistent elements that should remain the same across all frames:

Prompt: "{prompt}"

Extract and return in JSON format:
{{
    "background": "detailed description of the setting/location that stays consistent",
    "characters": ["list of characters/subjects that appear"],
    "lighting_style": "lighting that should be consistent (golden hour, studio, dramatic, etc.)",
    "color_palette": "color scheme to maintain (warm tones, cool blues, vibrant, muted, etc.)",
    "camera_style": "camera approach (cinematic, documentary, commercial, handheld, etc.)",
    "overall_mood": "emotional tone to maintain (epic, intimate, energetic, calm, etc.)"
}}

Focus on elements that create visual continuity like a professional film."""

        response = gemini_model.generate_content(context_prompt)
        text = response.text.strip()
        
        # Clean markdown
        if text.startswith("```"):
            lines = text.split("\n")
            text = "\n".join(lines[1:-1])
            if text.startswith("json"):
                text = text[4:]
        text = text.strip()
        
        context_data = json.loads(text)
        return ConsistentVideoContext(**context_data)
    
    except Exception as e:
        print(f"   ⚠️  Context extraction error: {str(e)}")
        return ConsistentVideoContext(
            background="cinematic background",
            characters=["main subject"],
            lighting_style="cinematic lighting",
            color_palette="professional color grading",
            camera_style="cinematic",
            overall_mood="professional"
        )

async def rewrite_frame_prompt_for_consistency(
    frame_description: str,
    context: ConsistentVideoContext,
    frame_number: int,
    total_frames: int
) -> str:
    """Rewrite frame prompt to maintain consistency with video context"""
    if not gemini_model:
        return f"{frame_description}, {context.background}, {context.lighting_style}, {context.color_palette}"
    
    try:
        rewrite_prompt = f"""You are a professional cinematographer. Rewrite this frame description to maintain perfect visual consistency with the established video context.

FRAME {frame_number + 1} of {total_frames}:
"{frame_description}"

CONSISTENT ELEMENTS (must be maintained):
- Background/Setting: {context.background}
- Characters: {', '.join(context.characters)}
- Lighting: {context.lighting_style}
- Color Palette: {context.color_palette}
- Camera Style: {context.camera_style}
- Mood: {context.overall_mood}

Rewrite the frame description to:
1. Keep the specific action/moment from the original
2. Explicitly include the consistent background/setting
3. Maintain the same lighting style
4. Use the same color palette language
5. Keep the same characters/subjects
6. Match the camera style and mood

Return ONLY the rewritten prompt, no explanation. Make it detailed and specific for image generation."""

        response = gemini_model.generate_content(rewrite_prompt)
        rewritten = response.text.strip()
        
        # Remove any markdown or quotes
        rewritten = rewritten.replace("```", "").replace('"', '').strip()
        
        print(f"      🎨 Frame {frame_number + 1} prompt rewritten for consistency")
        return rewritten
    
    except Exception as e:
        print(f"      ⚠️  Prompt rewrite error: {str(e)}")
        # Fallback: manually add consistency elements
        return f"{frame_description}, {context.background}, {context.lighting_style}, {context.color_palette}, {context.camera_style} style"

async def analyze_video_timeline(prompt: str, duration: float = 10.0, num_frames: int = 8) -> VideoTimeline:
    """Use Gemini to break down video prompt into timeline with keyframes"""
    if not gemini_model:
        # Fallback: create simple timeline
        frame_duration = duration / num_frames
        frames = []
        for i in range(num_frames):
            frames.append(VideoFrame(
                frame_number=i,
                timestamp=i * frame_duration,
                description=f"Scene {i+1}: {prompt[:80]}",
                camera_movement="cinematic",
                lighting="natural",
                action="main action"
            ))
        return VideoTimeline(
            total_duration=duration,
            total_frames=num_frames,
            fps=1,
            frames=frames,
            overall_style="cinematic",
            transition_type="smooth"
        )
    
    try:
        timeline_prompt = f"""You are a professional video director. Analyze this video advertisement prompt and break it down into {num_frames} distinct keyframes for a {duration}-second video.

Video Prompt: "{prompt}"

Create a cinematic timeline with exactly {num_frames} keyframes. Each frame should be a distinct shot that tells part of the story.

For EACH frame, provide:
1. A detailed visual description (what's in the shot)
2. Camera movement/angle (wide shot, close-up, tracking, drone, etc.)
3. Lighting conditions (golden hour, dramatic, soft, backlit, etc.)
4. The action or moment being captured

Think like a cinematographer - vary your shots:
- Start with establishing shots
- Include close-ups of important details
- Show action and movement
- Build to a powerful ending
- Use different camera angles and movements

Respond ONLY with valid JSON (no markdown):
{{
    "total_duration": {duration},
    "total_frames": {num_frames},
    "fps": 1,
    "overall_style": "cinematic commercial",
    "transition_type": "smooth",
    "frames": [
        {{
            "frame_number": 0,
            "timestamp": 0.0,
            "description": "Detailed description of what's visible in this specific shot",
            "camera_movement": "wide establishing shot|close-up|tracking shot|drone view|etc",
            "lighting": "golden hour sunrise|dramatic side lighting|soft natural|etc",
            "action": "specific action or moment happening"
        }},
        ... ({num_frames} frames total)
    ]
}}"""

        response = gemini_model.generate_content(timeline_prompt)
        text = response.text.strip()
        
        # Clean markdown
        if text.startswith("```"):
            lines = text.split("\n")
            text = "\n".join(lines[1:-1])  # Remove first and last lines
            if text.startswith("json"):
                text = text[4:]
        text = text.strip()
        
        print(f"   📋 Gemini timeline response length: {len(text)} chars")
        
        timeline_data = json.loads(text)
        
        # Validate we got the right number of frames
        if len(timeline_data.get("frames", [])) != num_frames:
            print(f"   ⚠️  Expected {num_frames} frames, got {len(timeline_data.get('frames', []))}")
        
        return VideoTimeline(**timeline_data)
    
    except Exception as e:
        print(f"   ❌ Timeline analysis error: {str(e)}")
        print(f"   Response text: {text[:200] if 'text' in locals() else 'N/A'}...")
        
        # Fallback to simple timeline
        frame_duration = duration / num_frames
        frames = []
        for i in range(num_frames):
            frames.append(VideoFrame(
                frame_number=i,
                timestamp=i * frame_duration,
                description=f"Scene {i+1}: {prompt[:80]}",
                camera_movement="cinematic",
                lighting="natural",
                action="main action"
            ))
        return VideoTimeline(
            total_duration=duration,
            total_frames=num_frames,
            fps=1,
            frames=frames,
            overall_style="cinematic",
            transition_type="smooth"
        )

async def assemble_video_from_frames(frame_images: List[Dict[str, Any]], timeline: VideoTimeline, prompt: str = "") -> str:
    """Download frame images and assemble into video using FFmpeg"""
    import shutil
    from datetime import datetime
    
    try:
        # Create organized output directory
        output_base = os.path.join(os.getcwd(), "generated_videos")
        os.makedirs(output_base, exist_ok=True)
        
        # Create timestamped folder for this video
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        video_dir = os.path.join(output_base, f"video_{timestamp}")
        os.makedirs(video_dir, exist_ok=True)
        
        print(f"      📁 Created video directory: {video_dir}")
        
        # Save prompt to file
        prompt_file = os.path.join(video_dir, "prompt.txt")
        with open(prompt_file, "w", encoding="utf-8") as f:
            f.write(f"Original Prompt:\n{prompt}\n\n")
            f.write(f"Timeline:\n")
            f.write(f"Duration: {timeline.total_duration}s\n")
            f.write(f"Frames: {timeline.total_frames}\n")
            f.write(f"Style: {timeline.overall_style}\n\n")
            f.write(f"Keyframes:\n")
            for frame in timeline.frames:
                f.write(f"\nFrame {frame.frame_number} ({frame.timestamp}s):\n")
                f.write(f"  Description: {frame.description}\n")
                if frame.camera_movement:
                    f.write(f"  Camera: {frame.camera_movement}\n")
                if frame.lighting:
                    f.write(f"  Lighting: {frame.lighting}\n")
                if frame.action:
                    f.write(f"  Action: {frame.action}\n")
        
        print(f"      💾 Saved prompt and timeline to {prompt_file}")
        
        # Download each frame image
        print(f"      ⬇️  Downloading {len(frame_images)} frames...")
        async with httpx.AsyncClient(timeout=60.0) as client:
            for i, frame_data in enumerate(frame_images):
                frame_url = frame_data["url"]
                frame_path = os.path.join(video_dir, f"frame_{i:04d}.png")
                
                response = await client.get(frame_url)
                response.raise_for_status()
                
                with open(frame_path, "wb") as f:
                    f.write(response.content)
                
                print(f"         Frame {i+1}/{len(frame_images)} downloaded")
        
        print(f"      ✅ All frames downloaded")
        
        # Calculate frame duration (how long each frame shows)
        frame_duration = timeline.total_duration / len(frame_images)
        output_fps = 30  # Output video FPS
        
        print(f"      🎬 Assembling video...")
        print(f"         Frames: {len(frame_images)}")
        print(f"         Duration: {timeline.total_duration}s")
        print(f"         Frame duration: {frame_duration}s each")
        print(f"         Output FPS: {output_fps}")
        
        # Output video path
        output_path = os.path.join(video_dir, "video.mp4")
        
        # Create concat file for FFmpeg (Windows-compatible)
        concat_file = os.path.join(video_dir, "concat.txt")
        with open(concat_file, "w") as f:
            for i in range(len(frame_images)):
                frame_path = f"frame_{i:04d}.png"
                f.write(f"file '{frame_path}'\n")
                f.write(f"duration {frame_duration}\n")
            # Repeat last frame to ensure proper duration
            f.write(f"file 'frame_{len(frame_images)-1:04d}.png'\n")
        
        print(f"      📝 Created concat file with {len(frame_images)} frames")
        
        # Create video using FFmpeg with concat demuxer
        ffmpeg_cmd = [
            "ffmpeg",
            "-y",  # Overwrite output
            "-f", "concat",  # Use concat demuxer
            "-safe", "0",  # Allow any file paths
            "-i", concat_file,  # Input concat file
            "-vf", f"fps={output_fps}",  # Output FPS
            "-c:v", "libx264",
            "-pix_fmt", "yuv420p",
            "-preset", "fast",
            output_path
        ]
        
        # Run FFmpeg
        result = subprocess.run(
            ffmpeg_cmd,
            capture_output=True,
            text=True,
            cwd=video_dir
        )
        
        if result.returncode != 0:
            print(f"      ❌ FFmpeg error: {result.stderr}")
            raise Exception(f"FFmpeg failed: {result.stderr}")
        
        print(f"      ✅ Video assembled successfully")
        
        # Read video file and convert to base64 data URL
        with open(output_path, "rb") as f:
            video_data = f.read()
        
        video_base64 = base64.b64encode(video_data).decode('utf-8')
        video_data_url = f"data:video/mp4;base64,{video_base64}"
        
        print(f"      ✅ Video encoded as data URL ({len(video_data)} bytes)")
        print(f"      💾 Video saved to: {output_path}")
        
        return video_data_url
        
    except Exception as e:
        print(f"      ❌ Video assembly failed: {str(e)}")
        # Fallback: return first frame URL
        if frame_images:
            print(f"      ⚠️  Falling back to first frame as static image")
            return frame_images[0]["url"]
        raise Exception(f"Video assembly failed: {str(e)}")

async def analyze_prompt_category(prompt: str) -> CategoryResponse:
    """Use Gemini to analyze prompt and determine category"""
    if not gemini_model:
        # Default to image if Gemini not configured
        return CategoryResponse(
            category="image",
            confidence=0.5,
            reasoning="Gemini not configured, defaulting to image"
        )
    
    try:
        analysis_prompt = f"""Analyze this creative prompt and categorize it into ONE of these categories:
- "image": Single static image generation (photos, illustrations, art)
- "video": Moving/animated content, sequences, motion
- "ads": Advertisement, marketing material, promotional content

Prompt: "{prompt}"

Respond in JSON format:
{{
    "category": "image|video|ads",
    "confidence": 0.0-1.0,
    "reasoning": "brief explanation"
}}"""

        response = gemini_model.generate_content(analysis_prompt)
        
        # Parse JSON from response
        text = response.text.strip()
        # Remove markdown code blocks if present
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        text = text.strip()
        
        result = json.loads(text)
        return CategoryResponse(**result)
    
    except Exception as e:
        print(f"Gemini analysis error: {str(e)}")
        # Default to image on error
        return CategoryResponse(
            category="image",
            confidence=0.5,
            reasoning=f"Error in analysis: {str(e)}"
        )

async def poll_bria_status(status_url: str, max_attempts: int = 60, delay: int = 2) -> Dict[str, Any]:
    """Poll BRIA status URL until generation is complete"""
    headers = {
        "api_token": BRIA_API_KEY,
        "Content-Type": "application/json"
    }
    
    print(f"   🔄 Starting polling loop...")
    
    for attempt in range(max_attempts):
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(status_url, headers=headers)
                response.raise_for_status()
                result = response.json()
                
                status = result.get("status", "").lower()
                print(f"   Poll attempt {attempt + 1}/{max_attempts}: status = '{status}'")
                print(f"   Response keys: {list(result.keys())}")
                
                if status == "success" or status == "completed" or status == "done":
                    print(f"   ✅ Generation complete!")
                    print(f"   Final response: {json.dumps(result, indent=2)}")
                    return result
                elif status == "failed" or status == "error":
                    error_msg = result.get("error", result.get("message", "Unknown error"))
                    print(f"   ❌ Generation failed: {error_msg}")
                    raise HTTPException(status_code=500, detail=f"BRIA generation failed: {error_msg}")
                elif status == "processing" or status == "pending" or status == "in_progress":
                    # Still processing, wait and retry
                    print(f"   ⏳ Still processing, waiting {delay} seconds...")
                    await asyncio.sleep(delay)
                    continue
                else:
                    # Unknown status, log it and wait
                    print(f"   ⚠️  Unknown status '{status}', waiting {delay} seconds...")
                    await asyncio.sleep(delay)
                    continue
                    
        except httpx.HTTPError as e:
            print(f"   ⚠️  Poll error: {str(e)}")
            if attempt < max_attempts - 1:
                await asyncio.sleep(delay)
                continue
            raise
    
    print(f"   ❌ Timeout after {max_attempts} attempts")
    raise HTTPException(status_code=500, detail="BRIA generation timeout - took too long")

async def call_bria_api(category: str, prompt: str, params: Dict[str, Any]) -> Dict[str, Any]:
    """Call appropriate BRIA API based on category"""
    
    # Demo mode - return placeholder
    if DEMO_MODE:
        return generate_demo_response(category, prompt)
    
    if not BRIA_API_KEY:
        raise HTTPException(
            status_code=500, 
            detail="BRIA_API_KEY not configured. Add your BRIA API key to backend/.env or set DEMO_MODE=true for testing"
        )
    
    base_endpoint = BRIA_ENDPOINTS.get(category)
    if not base_endpoint:
        raise HTTPException(status_code=400, detail=f"Unknown category: {category}")
    
    # BRIA uses api_token header, not Bearer Authorization
    headers = {
        "api_token": BRIA_API_KEY,
        "Content-Type": "application/json"
    }
    
    # Start with base endpoint
    endpoint = base_endpoint
    
    # Build request payload based on BRIA API format
    payload = {}
    
    # Category-specific payload building
    if category == "image-to-video":
        # Image-to-video requires image URL
        if not params.get("image_url"):
            raise HTTPException(status_code=400, detail="image_url is required for image-to-video generation")
        payload["image"] = params["image_url"]
        if params.get("tailored_model_id"):
            payload["model_id"] = params["tailored_model_id"]
            
    elif category == "portrait-restyle":
        # Portrait restyle requires image URL and model ID
        if not params.get("image_url"):
            raise HTTPException(status_code=400, detail="image_url is required for portrait-restyle")
        if not params.get("tailored_model_id"):
            raise HTTPException(status_code=400, detail="tailored_model_id is required for portrait-restyle")
        payload["id_image_url"] = params["image_url"]
        payload["tailored_model_id"] = params["tailored_model_id"]
        payload["sync"] = False  # Async by default
        
    elif category == "text-to-vector":
        # Text-to-vector requires model ID
        if not params.get("tailored_model_id"):
            raise HTTPException(status_code=400, detail="tailored_model_id is required for text-to-vector")
        # Endpoint includes model_id in URL
        endpoint = f"{endpoint}/{params['tailored_model_id']}"
        payload["prompt"] = prompt
        payload["num_results"] = 1
        payload["sync"] = False  # Async by default
        
    elif category == "upscale-video":
        # Video upscaling requires video URL
        if not params.get("image_url"):
            raise HTTPException(status_code=400, detail="video URL is required for upscale-video")
        payload["video"] = params["image_url"]
        payload["desired_increase"] = 2  # 2x upscale by default
        payload["output_container_and_codec"] = "mp4_h265"
        
    elif category == "remove-bg-video":
        # Background removal requires video URL
        if not params.get("image_url"):
            raise HTTPException(status_code=400, detail="video URL is required for remove-bg-video")
        payload["video"] = params["image_url"]
        payload["background_color"] = "Transparent"
        payload["output_container_and_codec"] = "webm_vp9"  # Supports transparency
        
    elif category == "video-mask":
        # Foreground mask requires video URL
        if not params.get("image_url"):
            raise HTTPException(status_code=400, detail="video URL is required for video-mask")
        payload["video"] = params["image_url"]
        payload["output_container_and_codec"] = "mp4_h264"
        
    elif category == "tailored":
        # Tailored model requires model_id
        if not params.get("tailored_model_id"):
            raise HTTPException(status_code=400, detail="tailored_model_id is required for tailored generation")
        payload["prompt"] = prompt
        payload["model_id"] = params["tailored_model_id"]
        if params.get("seed"):
            payload["seed"] = params["seed"]
            
    else:
        # Standard generation
        payload["prompt"] = prompt
        if params.get("seed"):
            payload["seed"] = params["seed"]
        
        # Category-specific enhancements
        if category == "video":
            payload["video_length"] = params.get("duration", 5)
        elif category == "ads":
            payload["prompt"] = f"Professional advertisement: {prompt}"
    
    try:
        print(f"🔄 Calling BRIA {category} API...")
        print(f"   Endpoint: {endpoint}")
        print(f"   Prompt: {prompt[:50]}...")
        
        # Step 1: Submit generation request
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(endpoint, json=payload, headers=headers)
            response.raise_for_status()
            result = response.json()
            print(f"✅ BRIA API request submitted!")
            print(f"   Response keys: {list(result.keys())}")
            
            # Check if this is an async response (has status_url)
            print(f"   🔍 Checking response type...")
            print(f"   Has 'status_url': {'status_url' in result}")
            
            if "status_url" in result:
                print(f"   📡 Async generation detected - starting polling...")
                status_url = result["status_url"]
                print(f"   Status URL: {status_url}")
                
                # Step 2: Poll for completion
                final_result = await poll_bria_status(status_url)
                print(f"   ✅ Polling complete!")
                print(f"   Final result keys: {list(final_result.keys())}")
                return final_result
            else:
                # Synchronous response (immediate result)
                print(f"   ⚡ Sync generation - immediate result")
                return result
            
    except httpx.HTTPStatusError as e:
        # Try to get error details from response
        try:
            error_body = e.response.json()
            error_msg = error_body.get("message", str(error_body))
        except:
            error_msg = e.response.text
        
        error_detail = f"BRIA API error: {e.response.status_code} - {error_msg}"
        
        if e.response.status_code == 401:
            error_detail = f"BRIA API authentication failed. Check your api_token in backend/.env. Error: {error_msg}"
        elif e.response.status_code == 403:
            error_detail = f"BRIA API access forbidden. Verify API key permissions. Error: {error_msg}"
        elif e.response.status_code == 429:
            error_detail = f"BRIA API rate limit exceeded. Try again later. Error: {error_msg}"
        elif e.response.status_code == 400:
            error_detail = f"BRIA API bad request. Check prompt/parameters. Error: {error_msg}"
        
        print(f"❌ {error_detail}")
        print(f"🎭 Falling back to demo mode due to API error...")
        return generate_demo_response(category, prompt)
        
    except httpx.HTTPError as e:
        error_detail = f"BRIA API connection error: {str(e)}"
        print(f"❌ {error_detail}")
        print(f"🎭 Falling back to demo mode due to connection error...")
        return generate_demo_response(category, prompt)

def generate_demo_response(category: str, prompt: str) -> Dict[str, Any]:
    """Generate demo/placeholder response for testing without BRIA API"""
    import hashlib
    
    # Create a hash from the prompt for consistent demo images
    prompt_hash = hashlib.md5(prompt.encode()).hexdigest()[:8]
    
    # Use different placeholder services for variety
    placeholder_services = [
        f"https://picsum.photos/1024/1024?random={prompt_hash}",
        f"https://placehold.co/1024x1024/6366f1/white?text=Generated+Image",
        f"https://via.placeholder.com/1024x1024/8b5cf6/ffffff?text=AI+Generated",
    ]
    
    # Select service based on hash
    service_index = int(prompt_hash, 16) % len(placeholder_services)
    
    if category == "video":
        # For video, use a static image placeholder
        image_url = f"https://placehold.co/1920x1080/ec4899/white?text=Video+Generated+{prompt_hash}"
        return {
            "result": {
                "video_url": image_url,
                "image_url": image_url,  # Fallback
                "width": 1920,
                "height": 1080,
            },
            "demo_mode": True,
            "message": f"Demo video placeholder for: {prompt[:50]}..."
        }
    else:
        # For images, use varied placeholders
        image_url = placeholder_services[service_index]
        return {
            "result": {
                "image_url": image_url,
                "url": image_url,  # Fallback
                "width": 1024,
                "height": 1024,
            },
            "demo_mode": True,
            "message": f"Demo image placeholder for: {prompt[:50]}..."
        }

def structured_prompt_to_text(structured: StructuredPrompt) -> str:
    """Convert structured prompt to text prompt"""
    parts = []
    
    if structured.short_description:
        parts.append(structured.short_description)
    
    if structured.objects:
        for obj in structured.objects:
            obj_desc = []
            if obj.get("description"):
                obj_desc.append(obj["description"])
            if obj.get("relationship"):
                obj_desc.append(obj["relationship"])
            if obj.get("appearance_details"):
                obj_desc.append(obj["appearance_details"])
            if obj_desc:
                parts.append(", ".join(obj_desc))
    
    if structured.background_setting:
        parts.append(f"background: {structured.background_setting}")
    
    if structured.lighting:
        lighting_parts = [v for v in structured.lighting.values() if v]
        if lighting_parts:
            parts.append(f"lighting: {', '.join(lighting_parts)}")
    
    if structured.aesthetics:
        aesthetics_parts = [v for v in structured.aesthetics.values() if v]
        if aesthetics_parts:
            parts.append(f"aesthetics: {', '.join(aesthetics_parts)}")
    
    if structured.photographic_characteristics:
        photo_parts = [v for v in structured.photographic_characteristics.values() if v]
        if photo_parts:
            parts.append(f"photography: {', '.join(photo_parts)}")
    
    if structured.style_medium:
        parts.append(f"style: {structured.style_medium}")
    
    if structured.artistic_style:
        parts.append(f"artistic style: {structured.artistic_style}")
    
    return ", ".join(parts)

@app.post("/api/analyze-prompt")
async def analyze_prompt(request: StructuredPromptRequest):
    """Analyze prompt using Gemini to determine category"""
    category_result = await analyze_prompt_category(request.prompt)
    return {
        "category": category_result.category,
        "confidence": category_result.confidence,
        "reasoning": category_result.reasoning,
        "prompt": request.prompt
    }

@app.post("/api/structured-prompt")
async def convert_to_structured_prompt(request: StructuredPromptRequest):
    """Convert text prompt to structured JSON using Gemini"""
    if not gemini_model:
        # Simple fallback
        return {
            "structured_prompt": {
                "short_description": request.prompt,
                "seed": request.seed
            }
        }
    
    try:
        structure_prompt = f"""Convert this creative prompt into a structured JSON format with these fields:
- short_description: Brief summary
- objects: Array of objects with description, relationship, appearance_details
- background_setting: Description of background
- lighting: Object with conditions, direction, shadows
- aesthetics: Object with composition, color_scheme, mood_atmosphere
- photographic_characteristics: Object with depth_of_field, focus, camera_angle
- style_medium: Art style or medium
- artistic_style: Overall artistic approach

Prompt: "{request.prompt}"

Return ONLY valid JSON, no markdown."""

        response = gemini_model.generate_content(structure_prompt)
        text = response.text.strip()
        
        # Clean markdown
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        text = text.strip()
        
        structured = json.loads(text)
        structured["seed"] = request.seed
        
        return {"structured_prompt": structured}
    
    except Exception as e:
        print(f"Structured prompt error: {str(e)}")
        return {
            "structured_prompt": {
                "short_description": request.prompt,
                "seed": request.seed
            }
        }

@app.post("/api/preview-video-prompts")
async def preview_video_prompts(request: GenerateRequest):
    """Preview rewritten prompts for video generation without actually generating"""
    try:
        # Build the prompt
        if request.structured_prompt:
            prompt = structured_prompt_to_text(request.structured_prompt)
        elif request.prompt:
            prompt = request.prompt
        else:
            raise HTTPException(status_code=400, detail="Either prompt or structured_prompt is required")
        
        print(f"🔍 Previewing video prompts for: {prompt[:50]}...")
        
        # Step 1: Extract consistent context
        print("   🎯 Extracting video context...")
        video_context = await extract_video_context(prompt)
        
        # Step 2: Create timeline
        print("   📋 Creating timeline...")
        timeline = await analyze_video_timeline(prompt, duration=10.0, num_frames=8)
        
        # Step 3: Rewrite prompts for each frame
        print("   ✍️  Rewriting prompts for consistency...")
        rewritten_frames = []
        
        for frame in timeline.frames:
            # Rewrite prompt
            rewritten = await rewrite_frame_prompt_for_consistency(
                frame.description,
                video_context,
                frame.frame_number,
                timeline.total_frames
            )
            
            rewritten_frames.append({
                "frame_number": frame.frame_number,
                "timestamp": frame.timestamp,
                "original_description": frame.description,
                "rewritten_prompt": rewritten,
                "camera_movement": frame.camera_movement,
                "lighting": frame.lighting,
                "action": frame.action
            })
        
        print(f"   ✅ Generated {len(rewritten_frames)} rewritten prompts")
        
        return {
            "context": {
                "background": video_context.background,
                "characters": video_context.characters,
                "lighting_style": video_context.lighting_style,
                "color_palette": video_context.color_palette,
                "camera_style": video_context.camera_style,
                "overall_mood": video_context.overall_mood
            },
            "timeline": {
                "total_duration": timeline.total_duration,
                "total_frames": timeline.total_frames,
                "fps": timeline.fps,
                "overall_style": timeline.overall_style,
                "transition_type": timeline.transition_type
            },
            "frames": rewritten_frames
        }
    
    except Exception as e:
        print(f"Error previewing prompts: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/generate")
async def generate_content(request: GenerateRequest):
    """Generate content using Gemini routing + BRIA APIs"""
    try:
        # Build the prompt
        if request.structured_prompt:
            prompt = structured_prompt_to_text(request.structured_prompt)
        elif request.prompt:
            prompt = request.prompt
        else:
            raise HTTPException(status_code=400, detail="Either prompt or structured_prompt is required")
        
        # Step 1: Determine category (manual override or Gemini analysis)
        if request.force_category:
            # User manually selected category
            print(f"🎯 Manual category selected: {request.force_category}")
            category_result = CategoryResponse(
                category=request.force_category,
                confidence=1.0,
                reasoning="Manually selected by user"
            )
        else:
            # Use Gemini to analyze
            print(f"🤖 Analyzing prompt with Gemini: {prompt[:50]}...")
            category_result = await analyze_prompt_category(prompt)
            print(f"Category: {category_result.category} (confidence: {category_result.confidence})")
        
        # Step 2: Handle video generation (multi-frame workflow)
        if category_result.category == "video" and not request.image_url:
            print("🎬 Video generation: Using ENHANCED multi-frame workflow with AI consistency")
            
            # Step 2a: Extract consistent context from prompt
            print("   🎯 Step 1/5: Extracting consistent video context...")
            video_context = await extract_video_context(prompt)
            print(f"   ✅ Context extracted:")
            print(f"      Background: {video_context.background[:60]}...")
            print(f"      Lighting: {video_context.lighting_style}")
            print(f"      Color Palette: {video_context.color_palette}")
            
            # Step 2b: Analyze prompt and create timeline with Gemini
            print("   📋 Step 2/5: Analyzing prompt with Gemini to create timeline...")
            timeline = await analyze_video_timeline(prompt, duration=10.0, num_frames=8)  # 8 frames over 10 seconds
            print(f"   ✅ Timeline created: {timeline.total_frames} frames over {timeline.total_duration}s")
            print(f"   Style: {timeline.overall_style}, Transitions: {timeline.transition_type}")
            
            # Add context to timeline
            timeline.background_description = video_context.background
            timeline.character_description = ", ".join(video_context.characters)
            timeline.color_palette = video_context.color_palette
            
            # Step 2c: Generate image for each frame with consistency
            print(f"   🎨 Step 3/5: Generating {timeline.total_frames} consistent images...")
            frame_images = []
            
            for frame in timeline.frames:
                print(f"      Frame {frame.frame_number + 1}/{timeline.total_frames}: {frame.description[:60]}...")
                
                # Rewrite frame prompt for consistency
                if VIDEO_CONSISTENCY_ENABLED:
                    frame_prompt = await rewrite_frame_prompt_for_consistency(
                        frame.description,
                        video_context,
                        frame.frame_number,
                        timeline.total_frames
                    )
                else:
                    # Build detailed prompt for this frame (old method)
                    frame_prompt = frame.description
                    if frame.camera_movement:
                        frame_prompt += f", {frame.camera_movement} camera"
                    if frame.lighting:
                        frame_prompt += f", {frame.lighting} lighting"
                    if frame.action:
                        frame_prompt += f", {frame.action}"
                
                print(f"      📝 Consistent prompt: {frame_prompt[:80]}...")
                
                # Generate image for this frame
                params_frame = {
                    "aspect_ratio": request.aspect_ratio or "16:9",
                    "seed": request.seed,  # Use SAME seed for consistency
                    "guidance_scale": request.guidance_scale,
                    "num_inference_steps": request.num_inference_steps,
                }
                
                frame_result = await call_bria_api("image", frame_prompt, params_frame)
                
                # Extract image URL
                frame_url = None
                if "result" in frame_result and isinstance(frame_result["result"], dict):
                    frame_url = frame_result["result"].get("image_url")
                
                if not frame_url:
                    print(f"      ⚠️  Failed to generate frame {frame.frame_number}, skipping")
                    continue
                
                frame_images.append({
                    "frame_number": frame.frame_number,
                    "url": frame_url,
                    "timestamp": frame.timestamp,
                    "description": frame.description,
                    "consistent_prompt": frame_prompt
                })
                print(f"      ✅ Frame {frame.frame_number + 1} generated with consistency")
            
            if not frame_images:
                raise HTTPException(status_code=500, detail="Failed to generate any frames")
            
            print(f"   ✅ Generated {len(frame_images)} consistent frames successfully")
            
            # Step 2d: Download and assemble frames into video
            print(f"   🎞️  Step 4/5: Assembling frames into video with FFmpeg...")
            video_url = await assemble_video_from_frames(frame_images, timeline, prompt)
            
            print(f"   ✅ Video assembled successfully!")
            
            # Create result in expected format
            bria_result = {
                "result": {
                    "image_url": video_url,
                    "video_url": video_url,
                },
                "timeline": timeline.model_dump(),
                "frames_generated": len(frame_images),
                "method": "multi-frame-assembly",
                "video_available": True
            }
            
            print("   ✅ Multi-frame video generation complete!")
            
        else:
            # Step 2: Call appropriate BRIA API (standard flow)
            params = {
                "aspect_ratio": request.aspect_ratio,
                "seed": request.seed,
                "guidance_scale": request.guidance_scale,
                "num_inference_steps": request.num_inference_steps,
                "tailored_model_id": request.tailored_model_id,
                "image_url": request.image_url,
            }
            
            print(f"Calling BRIA {category_result.category} API...")
            bria_result = await call_bria_api(category_result.category, prompt, params)
        
        # Step 3: Format response - handle BRIA v2 API response structure
        # After polling, BRIA returns the final result with the image URL
        image_url = None
        
        print(f"📦 BRIA Final Response structure:")
        print(f"   Keys: {list(bria_result.keys())}")
        
        # Try different response structures (check for video_url first for video content)
        if "result" in bria_result and isinstance(bria_result["result"], dict):
            # BRIA v2 actual format: {"result": {"video_url": "..." or "image_url": "..."}}
            if "video_url" in bria_result["result"]:
                image_url = bria_result["result"]["video_url"]
                print(f"   ✅ Found result.video_url: {image_url[:100]}...")
            elif "image_url" in bria_result["result"]:
                image_url = bria_result["result"]["image_url"]
                print(f"   ✅ Found result.image_url: {image_url[:100]}...")
            elif "url" in bria_result["result"]:
                image_url = bria_result["result"]["url"]
                print(f"   ✅ Found result.url: {image_url[:100]}...")
        elif "video_url" in bria_result:
            # Direct video_url (for video content)
            image_url = bria_result["video_url"]
            print(f"   ✅ Found video_url: {image_url[:100]}...")
        elif "result_url" in bria_result:
            # Alternative format
            image_url = bria_result["result_url"]
            print(f"   ✅ Found result_url: {image_url[:100]}...")
        elif "image_url" in bria_result:
            # Direct image_url
            image_url = bria_result["image_url"]
            print(f"   ✅ Found image_url: {image_url[:100]}...")
        elif "urls" in bria_result and len(bria_result["urls"]) > 0:
            # Array of URLs
            image_url = bria_result["urls"][0]
            print(f"   ✅ Found in urls[0]: {image_url[:100]}...")
        elif "url" in bria_result:
            # Direct URL
            image_url = bria_result["url"]
            print(f"   ✅ Found url: {image_url[:100]}...")
        elif "output" in bria_result:
            # Output field
            if isinstance(bria_result["output"], dict):
                image_url = bria_result["output"].get("video_url") or bria_result["output"].get("url") or bria_result["output"].get("image_url")
            elif isinstance(bria_result["output"], str):
                image_url = bria_result["output"]
            print(f"   ✅ Found in output: {image_url[:100] if image_url else 'None'}...")
        
        if not image_url:
            error_msg = f"BRIA API returned success but no image URL found. Response keys: {list(bria_result.keys())}, Full response: {json.dumps(bria_result, indent=2)}"
            print(f"❌ {error_msg}")
            raise HTTPException(status_code=500, detail=error_msg)
        
        print(f"✅ Image URL extracted successfully: {image_url[:100]}...")
        
        response_data = {
            "category": category_result.category,
            "confidence": category_result.confidence,
            "reasoning": category_result.reasoning,
            "image": {
                "url": image_url,
                "width": 1024,
                "height": 1024,
                "content_type": "image/png" if category_result.category == "image" else "video/mp4"
            },
            "bria_response": bria_result
        }
        
        # Add video-specific data if available
        if "timeline" in bria_result:
            response_data["timeline"] = bria_result["timeline"]
        if "frames_generated" in bria_result:
            response_data["frames_generated"] = bria_result["frames_generated"]
        if "method" in bria_result:
            response_data["method"] = bria_result["method"]
        
        print(f"📤 Sending response with image.url: {response_data['image']['url'][:100]}...")
        if "timeline" in response_data:
            print(f"   📹 Video data included: {response_data.get('frames_generated', 0)} frames")
        return response_data
    
    except Exception as e:
        print(f"Error generating content: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/test-bria")
async def test_bria_direct():
    """Test BRIA API directly to see response structure"""
    if not BRIA_API_KEY:
        return {"error": "BRIA_API_KEY not configured"}
    
    try:
        headers = {
            "api_token": BRIA_API_KEY,
            "Content-Type": "application/json"
        }
        payload = {"prompt": "test image"}
        
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(
                "https://engine.prod.bria-api.com/v2/image/generate",
                json=payload,
                headers=headers
            )
            response.raise_for_status()
            result = response.json()
            
            return {
                "status": "success",
                "response_keys": list(result.keys()),
                "full_response": result
            }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e)
        }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    status = {
        "status": "healthy",
        "gemini_configured": gemini_model is not None,
        "bria_configured": BRIA_API_KEY is not None,
        "demo_mode": DEMO_MODE,
        "polling_enabled": True,  # NEW: Indicates polling code is active
        "version": "2.0-async",   # NEW: Version indicator
    }
    
    # Add helpful messages
    messages = []
    if not gemini_model:
        messages.append("⚠️  Add GEMINI_API_KEY to .env for smart routing")
    if not BRIA_API_KEY and not DEMO_MODE:
        messages.append("⚠️  Add BRIA_API_KEY to .env for real generation")
    if DEMO_MODE:
        messages.append("🎭 Demo mode active - using placeholder images")
    if gemini_model and BRIA_API_KEY:
        messages.append("✅ All systems ready with async polling!")
    
    status["messages"] = messages
    return status

# ============================================================================
# MUSIC-TO-VIDEO FEATURE
# ============================================================================

# Pydantic Models
class MusicAnalysis(BaseModel):
    duration: float
    tempo: Optional[float] = None
    mood: str
    energy: str
    genre: str
    key_moments: List[float]
    description: str

class MusicStory(BaseModel):
    title: str
    story: str
    scenes: List[Dict[str, Any]]
    timeline: List[Dict[str, Any]]

class CartoonStyle(BaseModel):
    style: str = "anime"  # anime, comic, watercolor, sketch, pixar

class MusicStoryRequest(BaseModel):
    duration: float
    tempo: Optional[float] = None
    mood: str
    energy: str
    genre: str
    key_moments: List[float]
    description: str
    content_type: Optional[str] = "music-video"

class YouTubeDownloadRequest(BaseModel):
    url: str

class YouTubeTranscriptRequest(BaseModel):
    url: str
    
class LyricVideoRequest(BaseModel):
    url: str
    style: Optional[str] = "modern"

class YouTubeVideoInfoRequest(BaseModel):
    url: str

@app.post("/api/music/download-youtube")
async def download_youtube_audio(request: YouTubeDownloadRequest):
    """Download audio from YouTube URL"""
    try:
        print(f"🎵 Downloading audio from YouTube: {request.url}")
        
        # Validate URL format
        if not any(domain in request.url for domain in ['youtube.com', 'youtu.be']):
            raise HTTPException(status_code=400, detail="Invalid YouTube URL")
        
        # Create temp directory
        temp_dir = tempfile.mkdtemp()
        print(f"📁 Created temp directory: {temp_dir}")
        
        try:
            import yt_dlp
            print("✅ yt-dlp imported successfully")
            
            # Configure yt-dlp options with better error handling
            ydl_opts = {
                'format': 'bestaudio/best',
                'postprocessors': [{
                    'key': 'FFmpegExtractAudio',
                    'preferredcodec': 'mp3',
                    'preferredquality': '192',
                }],
                'outtmpl': os.path.join(temp_dir, 'audio.%(ext)s'),
                'quiet': False,  # Enable logging for debugging
                'no_warnings': False,
                'extract_flat': False,
                'writethumbnail': False,
                'writeinfojson': False,
            }
            
            print("🔧 Configured yt-dlp options")
            
            # Download audio
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                print("📥 Starting download...")
                info = ydl.extract_info(request.url, download=True)
                title = info.get('title', 'Unknown')
                duration = info.get('duration', 0)
                uploader = info.get('uploader', 'Unknown')
                print(f"📋 Video info: {title} by {uploader} ({duration}s)")
            
            # Find the downloaded file (it might have a different name)
            audio_files = [f for f in os.listdir(temp_dir) if f.endswith('.mp3')]
            if not audio_files:
                # Try other audio formats
                audio_files = [f for f in os.listdir(temp_dir) if f.endswith(('.mp3', '.m4a', '.webm', '.ogg'))]
            
            if not audio_files:
                raise Exception(f"No audio file found in {temp_dir}. Files: {os.listdir(temp_dir)}")
            
            audio_file_path = os.path.join(temp_dir, audio_files[0])
            print(f"📄 Found audio file: {audio_files[0]}")
            
            # Read the downloaded file
            with open(audio_file_path, "rb") as f:
                audio_data = f.read()
            
            print(f"📊 Audio file size: {len(audio_data)} bytes")
            
            # Convert to base64 (limit size for response)
            if len(audio_data) > 50 * 1024 * 1024:  # 50MB limit
                raise Exception("Audio file too large (>50MB)")
            
            audio_base64 = base64.b64encode(audio_data).decode('utf-8')
            
            # Cleanup
            shutil.rmtree(temp_dir, ignore_errors=True)
            
            print(f"✅ Downloaded: {title} ({duration}s)")
            
            return {
                "success": True,
                "title": title,
                "duration": duration,
                "uploader": uploader,
                "audio_data": f"data:audio/mp3;base64,{audio_base64}",
                "file_size": len(audio_data)
            }
            
        except ImportError as e:
            print(f"❌ Import error: {str(e)}")
            raise HTTPException(
                status_code=500, 
                detail=f"yt-dlp not available: {str(e)}"
            )
        except Exception as e:
            print(f"❌ Download error: {str(e)}")
            # Cleanup on error
            shutil.rmtree(temp_dir, ignore_errors=True)
            raise e
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ YouTube download error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"YouTube download failed: {str(e)}")

@app.post("/api/music/youtube-info")
async def get_youtube_video_info(request: YouTubeVideoInfoRequest):
    """Get video information using official YouTube Data API v3"""
    try:
        print(f"📺 Getting YouTube video info: {request.url}")
        
        if not YOUTUBE_API_KEY:
            print("⚠️  YouTube API key not configured, using fallback method")
            # Fallback to yt-dlp for basic info
            import yt_dlp
            import re
            
            video_id_match = re.search(r'(?:v=|\/)([0-9A-Za-z_-]{11}).*', request.url)
            if not video_id_match:
                raise Exception("Invalid YouTube URL")
            
            video_id = video_id_match.group(1)
            
            ydl_opts = {'quiet': True, 'no_warnings': True}
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(request.url, download=False)
                
                return {
                    "success": True,
                    "video_id": video_id,
                    "title": info.get('title', 'Unknown'),
                    "description": info.get('description', ''),
                    "duration": info.get('duration', 0),
                    "channel": info.get('uploader', 'Unknown'),
                    "channel_id": info.get('channel_id', ''),
                    "view_count": info.get('view_count', 0),
                    "like_count": info.get('like_count', 0),
                    "thumbnail": info.get('thumbnail', ''),
                    "tags": info.get('tags', []),
                    "category": info.get('categories', ['Unknown'])[0] if info.get('categories') else 'Unknown',
                    "has_captions": len(info.get('subtitles', {})) > 0 or len(info.get('automatic_captions', {})) > 0,
                    "method": "yt-dlp"
                }
        
        try:
            from googleapiclient.discovery import build
            import re
            
            # Extract video ID
            video_id_match = re.search(r'(?:v=|\/)([0-9A-Za-z_-]{11}).*', request.url)
            if not video_id_match:
                raise Exception("Invalid YouTube URL")
            
            video_id = video_id_match.group(1)
            print(f"   Video ID: {video_id}")
            
            # Build YouTube API client
            youtube = build('youtube', 'v3', developerKey=YOUTUBE_API_KEY)
            
            # Get video details
            video_response = youtube.videos().list(
                part='snippet,contentDetails,statistics',
                id=video_id
            ).execute()
            
            if not video_response.get('items'):
                raise Exception("Video not found")
            
            video = video_response['items'][0]
            snippet = video['snippet']
            content_details = video['contentDetails']
            statistics = video['statistics']
            
            # Parse duration (ISO 8601 format)
            import isodate
            duration_seconds = int(isodate.parse_duration(content_details['duration']).total_seconds())
            
            # Check for captions
            captions_response = youtube.captions().list(
                part='snippet',
                videoId=video_id
            ).execute()
            
            has_captions = len(captions_response.get('items', [])) > 0
            caption_languages = [item['snippet']['language'] for item in captions_response.get('items', [])]
            
            print(f"   ✅ Video info retrieved via YouTube API")
            
            return {
                "success": True,
                "video_id": video_id,
                "title": snippet['title'],
                "description": snippet['description'],
                "duration": duration_seconds,
                "channel": snippet['channelTitle'],
                "channel_id": snippet['channelId'],
                "published_at": snippet['publishedAt'],
                "view_count": int(statistics.get('viewCount', 0)),
                "like_count": int(statistics.get('likeCount', 0)),
                "comment_count": int(statistics.get('commentCount', 0)),
                "thumbnail": snippet['thumbnails']['high']['url'],
                "tags": snippet.get('tags', []),
                "category_id": snippet['categoryId'],
                "has_captions": has_captions,
                "caption_languages": caption_languages,
                "method": "youtube-api"
            }
            
        except ImportError:
            raise HTTPException(
                status_code=500,
                detail="google-api-python-client not installed. Install with: pip install google-api-python-client"
            )
        
    except Exception as e:
        print(f"❌ YouTube info error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get YouTube info: {str(e)}")

@app.post("/api/music/get-transcript")
async def get_youtube_transcript(request: YouTubeTranscriptRequest):
    """Extract transcript/lyrics from YouTube video"""
    try:
        print(f"📝 Extracting transcript from: {request.url}")
        
        try:
            from youtube_transcript_api import YouTubeTranscriptApi
            import re
            
            # Extract video ID from URL
            video_id_match = re.search(r'(?:v=|\/)([0-9A-Za-z_-]{11}).*', request.url)
            if not video_id_match:
                raise Exception("Invalid YouTube URL")
            
            video_id = video_id_match.group(1)
            print(f"   Video ID: {video_id}")
            
            # Try to get transcript
            try:
                # Try to get transcript in English first
                transcript_list = YouTubeTranscriptApi.get_transcript(video_id, languages=['en'])
            except:
                # If English not available, get any available transcript
                transcript_list = YouTubeTranscriptApi.get_transcript(video_id)
            
            print(f"   ✅ Found {len(transcript_list)} transcript segments")
            
            # Format transcript with timestamps
            formatted_segments = []
            full_text = ""
            
            for segment in transcript_list:
                text = segment['text'].strip()
                start_time = segment['start']
                duration = segment['duration']
                
                formatted_segments.append({
                    "text": text,
                    "start": start_time,
                    "end": start_time + duration,
                    "duration": duration
                })
                
                full_text += text + " "
            
            # Use Gemini to format and clean the transcript
            if gemini_model:
                print("   🤖 Formatting transcript with AI...")
                
                format_prompt = f"""Format this transcript into proper lyric format. Clean up any repetitions, fix capitalization, add proper line breaks, and structure it like song lyrics.

Transcript:
{full_text[:3000]}  

Return ONLY the formatted lyrics, nothing else. Make it look professional."""

                response = gemini_model.generate_content(format_prompt)
                formatted_lyrics = response.text.strip()
            else:
                formatted_lyrics = full_text
            
            print(f"   ✅ Transcript extracted and formatted")
            
            return {
                "success": True,
                "video_id": video_id,
                "segments": formatted_segments,
                "full_text": full_text.strip(),
                "formatted_lyrics": formatted_lyrics,
                "total_segments": len(formatted_segments)
            }
            
        except ImportError:
            raise HTTPException(
                status_code=500,
                detail="youtube-transcript-api not installed. Install with: pip install youtube-transcript-api"
            )
        
    except Exception as e:
        print(f"❌ Transcript extraction error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Transcript extraction failed: {str(e)}")

@app.post("/api/music/generate-lyric-video")
async def generate_lyric_video(request: LyricVideoRequest):
    """Generate complete lyric video from YouTube URL"""
    try:
        print(f"🎬 Generating lyric video from: {request.url}")
        
        # Step 1: Download audio
        print("   📥 Step 1/5: Downloading audio...")
        audio_result = await download_youtube_audio(YouTubeDownloadRequest(url=request.url))
        
        # Step 2: Get transcript
        print("   📝 Step 2/5: Extracting lyrics...")
        transcript_result = await get_youtube_transcript(YouTubeTranscriptRequest(url=request.url))
        
        # Step 3: Break lyrics into sections for images
        print("   ✂️  Step 3/5: Breaking lyrics into sections...")
        segments = transcript_result["segments"]
        formatted_lyrics = transcript_result["formatted_lyrics"]
        
        # Group segments into ~10-15 second chunks
        lyric_sections = []
        current_section = {"text": "", "start": 0, "end": 0, "lines": []}
        section_duration = 10  # seconds per section
        
        for segment in segments:
            if current_section["text"] == "":
                current_section["start"] = segment["start"]
            
            current_section["text"] += segment["text"] + " "
            current_section["lines"].append(segment["text"])
            current_section["end"] = segment["end"]
            
            # If section is long enough, start new section
            if current_section["end"] - current_section["start"] >= section_duration:
                lyric_sections.append(current_section)
                current_section = {"text": "", "start": 0, "end": 0, "lines": []}
        
        # Add last section
        if current_section["text"]:
            lyric_sections.append(current_section)
        
        print(f"   ✅ Created {len(lyric_sections)} lyric sections")
        
        # Step 4: Generate background images for each section
        print(f"   🎨 Step 4/5: Generating {len(lyric_sections)} background images...")
        
        # Use Gemini to create visual themes for each section
        if gemini_model:
            theme_prompt = f"""Analyze these lyrics and create visual themes for a lyric video. For each section, describe a beautiful background scene that matches the mood and meaning.

Lyrics:
{formatted_lyrics[:2000]}

Create {len(lyric_sections)} distinct visual themes. Each should be:
- Beautiful and non-distracting (suitable for text overlay)
- Match the emotional tone of that part
- Varied and interesting
- Abstract or scenic (nature, urban, cosmic, etc.)

Respond in JSON format:
{{
    "themes": [
        {{
            "description": "Detailed visual description for background image",
            "mood": "emotional tone",
            "colors": "color palette"
        }},
        ...
    ]
}}"""

            response = gemini_model.generate_content(theme_prompt)
            text = response.text.strip()
            
            if text.startswith("```"):
                text = text.split("```")[1]
                if text.startswith("json"):
                    text = text[4:]
            text = text.strip()
            
            themes_data = json.loads(text)
            themes = themes_data.get("themes", [])
        else:
            # Fallback themes
            themes = [{"description": f"Abstract background {i+1}", "mood": "neutral", "colors": "soft"} 
                     for i in range(len(lyric_sections))]
        
        # Generate images for each section
        section_images = []
        for i, (section, theme) in enumerate(zip(lyric_sections, themes)):
            print(f"      Generating image {i+1}/{len(lyric_sections)}...")
            
            # Create prompt for background image
            bg_prompt = f"{theme['description']}, {theme['mood']} mood, {theme['colors']} colors, soft focus, suitable for text overlay, lyric video background, professional quality"
            
            # Generate image
            params = {
                "aspect_ratio": "16:9",
                "seed": 5555 + i,
                "guidance_scale": 7.5,
            }
            
            result = await call_bria_api("image", bg_prompt, params)
            
            # Extract image URL
            image_url = None
            if "result" in result and isinstance(result["result"], dict):
                image_url = result["result"].get("image_url")
            
            if not image_url:
                print(f"      ⚠️  Failed to generate image {i+1}, using placeholder")
                continue
            
            section_images.append({
                "index": i,
                "url": image_url,
                "start": section["start"],
                "end": section["end"],
                "lyrics": section["text"],
                "theme": theme
            })
            
            print(f"      ✅ Image {i+1} generated")
        
        print(f"   ✅ Generated {len(section_images)} background images")
        
        # Step 5: Assemble video
        print(f"   🎞️  Step 5/5: Assembling lyric video...")
        
        # Create output directory
        output_base = os.path.join(os.getcwd(), "generated_videos")
        os.makedirs(output_base, exist_ok=True)
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        video_dir = os.path.join(output_base, f"lyric_video_{timestamp}")
        os.makedirs(video_dir, exist_ok=True)
        
        # Save audio
        audio_data = audio_result["audio_data"].split(',')[1]
        audio_bytes = base64.b64decode(audio_data)
        audio_path = os.path.join(video_dir, "audio.mp3")
        with open(audio_path, "wb") as f:
            f.write(audio_bytes)
        
        # Download images
        async with httpx.AsyncClient(timeout=60.0) as client:
            for i, section in enumerate(section_images):
                if section["url"].startswith("data:"):
                    header, data = section["url"].split(",", 1)
                    image_data = base64.b64decode(data)
                else:
                    response = await client.get(section["url"])
                    response.raise_for_status()
                    image_data = response.content
                
                image_path = os.path.join(video_dir, f"bg_{i:04d}.png")
                with open(image_path, "wb") as f:
                    f.write(image_data)
        
        # Create video from images
        concat_file = os.path.join(video_dir, "concat.txt")
        with open(concat_file, "w") as f:
            for i, section in enumerate(section_images):
                duration = section["end"] - section["start"]
                f.write(f"file 'bg_{i:04d}.png'\n")
                f.write(f"duration {duration}\n")
            # Repeat last frame
            f.write(f"file 'bg_{len(section_images)-1:04d}.png'\n")
        
        # Create video
        video_no_audio = os.path.join(video_dir, "video_no_audio.mp4")
        ffmpeg_cmd = [
            "ffmpeg", "-y",
            "-f", "concat",
            "-safe", "0",
            "-i", concat_file,
            "-vf", "fps=30,scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2",
            "-c:v", "libx264",
            "-pix_fmt", "yuv420p",
            "-preset", "fast",
            video_no_audio
        ]
        
        result = subprocess.run(ffmpeg_cmd, capture_output=True, text=True, cwd=video_dir)
        if result.returncode != 0:
            raise Exception(f"Video creation failed: {result.stderr}")
        
        # Add audio
        output_path = os.path.join(video_dir, "lyric_video.mp4")
        ffmpeg_audio_cmd = [
            "ffmpeg", "-y",
            "-i", video_no_audio,
            "-i", audio_path,
            "-c:v", "copy",
            "-c:a", "aac",
            "-shortest",
            output_path
        ]
        
        result = subprocess.run(ffmpeg_audio_cmd, capture_output=True, text=True, cwd=video_dir)
        if result.returncode != 0:
            raise Exception(f"Audio merge failed: {result.stderr}")
        
        # Convert to base64
        with open(output_path, "rb") as f:
            video_data = f.read()
        
        video_base64 = base64.b64encode(video_data).decode('utf-8')
        video_url = f"data:video/mp4;base64,{video_base64}"
        
        # Save lyrics file
        lyrics_file = os.path.join(video_dir, "lyrics.txt")
        with open(lyrics_file, "w", encoding="utf-8") as f:
            f.write(f"Title: {audio_result['title']}\n")
            f.write(f"Artist: {audio_result['uploader']}\n\n")
            f.write(formatted_lyrics)
        
        print(f"   ✅ Lyric video complete!")
        
        return {
            "success": True,
            "video_url": video_url,
            "file_path": output_path,
            "title": audio_result["title"],
            "artist": audio_result["uploader"],
            "duration": audio_result["duration"],
            "sections": len(section_images),
            "lyrics": formatted_lyrics,
            "lyric_sections": section_images
        }
        
    except Exception as e:
        print(f"❌ Lyric video generation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Lyric video generation failed: {str(e)}")

@app.post("/api/music/analyze")
async def analyze_music(file: UploadFile = File(...)):
    """Analyze uploaded music file for mood, tempo, and characteristics"""
    try:
        # Save uploaded file temporarily
        temp_dir = tempfile.mkdtemp()
        file_path = os.path.join(temp_dir, file.filename)
        
        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)
        
        print(f"🎵 Analyzing music file: {file.filename}")
        
        # Try to use librosa for detailed analysis
        try:
            import librosa
            import numpy as np
            
            # Load audio
            y, sr = librosa.load(file_path, duration=60)  # Analyze first 60 seconds
            duration_full = librosa.get_duration(path=file_path)
            
            # Extract features
            tempo, _ = librosa.beat.beat_track(y=y, sr=sr)
            
            # Energy analysis
            rms = librosa.feature.rms(y=y)[0]
            energy_level = float(np.mean(rms))
            
            # Spectral features for mood
            spectral_centroid = librosa.feature.spectral_centroid(y=y, sr=sr)[0]
            brightness = float(np.mean(spectral_centroid))
            
            # Detect key moments (beat frames)
            onset_frames = librosa.onset.onset_detect(y=y, sr=sr)
            onset_times = librosa.frames_to_time(onset_frames, sr=sr)
            
            # Select key moments (every 5-10 seconds)
            key_moments = []
            for t in onset_times:
                if len(key_moments) == 0 or t - key_moments[-1] > 5:
                    key_moments.append(float(t))
                if len(key_moments) >= 8:
                    break
            
            # Determine mood based on features
            if tempo > 140:
                mood = "energetic and upbeat"
                genre = "electronic/dance"
            elif tempo > 120:
                mood = "lively and positive"
                genre = "pop/rock"
            elif tempo > 90:
                mood = "moderate and balanced"
                genre = "indie/alternative"
            else:
                mood = "calm and relaxed"
                genre = "ambient/chill"
            
            if energy_level > 0.1:
                energy = "high energy"
            elif energy_level > 0.05:
                energy = "medium energy"
            else:
                energy = "low energy"
            
            analysis = MusicAnalysis(
                duration=float(duration_full),
                tempo=float(tempo),
                mood=mood,
                energy=energy,
                genre=genre,
                key_moments=key_moments,
                description=f"A {mood} {genre} track with {energy} at {int(tempo)} BPM"
            )
            
        except ImportError:
            # Fallback: Basic analysis without librosa
            print("⚠️  librosa not available, using basic analysis")
            
            # Get file size and estimate duration
            file_size = os.path.getsize(file_path)
            estimated_duration = file_size / (128000 / 8)  # Assume 128kbps
            
            # Use Gemini for analysis if available
            if gemini_model:
                analysis_prompt = f"""Analyze this music file and provide characteristics:
                
Filename: {file.filename}
File size: {file_size} bytes
Estimated duration: {estimated_duration:.1f} seconds

Based on the filename and typical music patterns, estimate:
1. Mood (happy, sad, energetic, calm, dramatic, etc.)
2. Energy level (high, medium, low)
3. Likely genre
4. Tempo range (slow <90 BPM, moderate 90-120, fast >120)

Respond in JSON:
{{
    "mood": "description",
    "energy": "high|medium|low energy",
    "genre": "genre name",
    "tempo": 120,
    "description": "brief description"
}}"""
                
                response = gemini_model.generate_content(analysis_prompt)
                text = response.text.strip()
                
                if text.startswith("```"):
                    text = text.split("```")[1]
                    if text.startswith("json"):
                        text = text[4:]
                text = text.strip()
                
                ai_analysis = json.loads(text)
                
                # Generate key moments evenly spaced
                num_moments = min(8, int(estimated_duration / 5))
                key_moments = [i * (estimated_duration / num_moments) for i in range(num_moments)]
                
                analysis = MusicAnalysis(
                    duration=estimated_duration,
                    tempo=ai_analysis.get("tempo", 120),
                    mood=ai_analysis.get("mood", "balanced"),
                    energy=ai_analysis.get("energy", "medium energy"),
                    genre=ai_analysis.get("genre", "general"),
                    key_moments=key_moments,
                    description=ai_analysis.get("description", f"Music track from {file.filename}")
                )
            else:
                # Ultimate fallback
                key_moments = [i * 5.0 for i in range(min(8, int(estimated_duration / 5)))]
                analysis = MusicAnalysis(
                    duration=estimated_duration,
                    tempo=120,
                    mood="balanced",
                    energy="medium energy",
                    genre="general",
                    key_moments=key_moments,
                    description=f"Music track: {file.filename}"
                )
        
        # Cleanup
        shutil.rmtree(temp_dir, ignore_errors=True)
        
        print(f"✅ Music analysis complete: {analysis.mood}, {analysis.tempo} BPM")
        return analysis.model_dump()
        
    except Exception as e:
        print(f"❌ Music analysis error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Music analysis failed: {str(e)}")

@app.post("/api/music/generate-story")
async def generate_music_story(request: MusicStoryRequest):
    """Generate AI story and visual scenes based on music analysis"""
    try:
        if not gemini_model:
            raise HTTPException(status_code=500, detail="Gemini AI not configured")
        
        print(f"📖 Generating {request.content_type} for {request.mood} music...")
        
        # Customize prompt based on content type
        content_type_prompts = {
            "music-video": """Create a complete cinematic visual story that matches the music's emotional journey. Include:
1. A compelling title for this music video
2. A full narrative story (3-4 paragraphs) that captures the music's essence
3. {num_scenes} distinct visual scenes with cinematic storytelling
4. Each scene should have detailed descriptions for professional image generation
Make it feel like a high-budget music video with strong visual storytelling!""",
            
            "lyric-video": """Create a lyric video concept with beautiful visual backgrounds. Include:
1. A title for this lyric video
2. A description of the overall visual theme and mood
3. {num_scenes} background scenes that complement the lyrics
4. Each scene should have abstract or thematic visuals (nature, urban, cosmic, etc.)
Focus on creating beautiful, non-distracting backgrounds that enhance the lyrics!""",
            
            "visualizer": """Create an audio visualizer concept with abstract animated patterns. Include:
1. A title for this visualizer
2. A description of the overall visual style and color palette
3. {num_scenes} different visual patterns/themes that evolve with the music
4. Each scene should describe abstract geometric or organic patterns
Focus on creating mesmerizing, audio-reactive visual concepts!""",
            
            "story-video": """Create a narrative-driven visual journey that tells a complete story. Include:
1. A compelling story title
2. A full narrative with beginning, middle, and end (4-5 paragraphs)
3. {num_scenes} story beats that progress the narrative
4. Each scene should advance the plot with clear character actions and settings
Make it feel like a short film with a complete story arc!""",
            
            "album-art": """Create an animated album art concept. Include:
1. A title for this animated artwork
2. A description of how the album art comes to life
3. {num_scenes} different animation phases or effects
4. Each scene should describe motion, effects, or transformations of the artwork
Focus on bringing static album art to life with creative animations!""",
            
            "creative": """Create a creative visual concept with artistic elements. Include:
1. A title for this creative piece
2. A description of the overall artistic style and mood
3. {num_scenes} key visual moments or scenes
4. Each scene should describe the mood and transition effect for that moment
Focus on creating emotional, well-paced photo presentations!"""
        }
        
        content_prompt = content_type_prompts.get(request.content_type, content_type_prompts["music-video"])
        
        story_prompt = f"""You are a creative director specializing in music videos. Create content for a music track with these characteristics:

Duration: {request.duration:.1f} seconds
Tempo: {request.tempo} BPM
Mood: {request.mood}
Energy: {request.energy}
Genre: {request.genre}
Description: {request.description}
Content Type: {request.content_type}

{content_prompt.format(num_scenes=len(request.key_moments))}

For each scene provide:
- timestamp: when it appears in the music
- description: detailed visual description for image generation
- mood: emotional tone of this moment
- style: visual style (cinematic, dreamy, vibrant, dramatic, abstract, etc.)
- action: what's happening or what effect is applied

Respond in JSON format:
{{
    "title": "Content Title",
    "story": "Full description or narrative...",
    "scenes": [
        {{
            "timestamp": 0.0,
            "description": "Detailed visual description",
            "mood": "emotional tone",
            "style": "visual style",
            "action": "what's happening"
        }},
        ...
    ]
}}"""

        response = gemini_model.generate_content(story_prompt)
        text = response.text.strip()
        
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        text = text.strip()
        
        story_data = json.loads(text)
        
        # Create timeline matching key moments
        timeline = []
        for i, moment in enumerate(request.key_moments):
            if i < len(story_data["scenes"]):
                scene = story_data["scenes"][i]
                scene["timestamp"] = moment
                timeline.append({
                    "time": moment,
                    "scene_index": i,
                    "description": scene["description"]
                })
        
        result = MusicStory(
            title=story_data["title"],
            story=story_data["story"],
            scenes=story_data["scenes"],
            timeline=timeline
        )
        
        print(f"✅ {request.content_type} generated: '{result.title}' with {len(result.scenes)} scenes")
        return result.model_dump()
        
    except Exception as e:
        print(f"❌ Story generation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Story generation failed: {str(e)}")

@app.post("/api/music/cartoonize-image")
async def cartoonize_image(
    file: UploadFile = File(...),
    style: str = Form("anime")
):
    """Convert uploaded image to cartoon style"""
    try:
        print(f"🎨 Cartoonizing image: {file.filename} in {style} style")
        
        # Read image
        image_data = await file.read()
        image = Image.open(io.BytesIO(image_data))
        
        # Save temporarily
        temp_dir = tempfile.mkdtemp()
        input_path = os.path.join(temp_dir, "input.png")
        image.save(input_path)
        
        # Try OpenCV cartoon effect first (fast, local)
        try:
            import cv2
            import numpy as np
            
            # Read image
            img = cv2.imread(input_path)
            
            # Apply cartoon effect based on style
            if style == "anime":
                # Anime style: smooth colors, strong edges
                gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
                gray = cv2.medianBlur(gray, 5)
                edges = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_MEAN_C, cv2.THRESH_BINARY, 9, 9)
                
                color = cv2.bilateralFilter(img, 9, 300, 300)
                cartoon = cv2.bitwise_and(color, color, mask=edges)
                
            elif style == "comic":
                # Comic book style: bold colors, thick edges
                gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
                gray = cv2.medianBlur(gray, 7)
                edges = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_MEAN_C, cv2.THRESH_BINARY, 9, 2)
                
                color = cv2.bilateralFilter(img, 9, 250, 250)
                cartoon = cv2.bitwise_and(color, color, mask=edges)
                
            elif style == "watercolor":
                # Watercolor style: soft, blended
                cartoon = cv2.stylization(img, sigma_s=60, sigma_r=0.6)
                
            elif style == "sketch":
                # Pencil sketch style
                gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
                inv = cv2.bitwise_not(gray)
                blur = cv2.GaussianBlur(inv, (21, 21), 0)
                sketch = cv2.divide(gray, cv2.bitwise_not(blur), scale=256.0)
                cartoon = cv2.cvtColor(sketch, cv2.COLOR_GRAY2BGR)
                
            else:  # pixar or default
                # Pixar style: smooth, vibrant
                cartoon = cv2.bilateralFilter(img, 9, 300, 300)
                cartoon = cv2.edgePreservingFilter(cartoon, flags=1, sigma_s=60, sigma_r=0.4)
            
            # Save result
            output_path = os.path.join(temp_dir, "cartoon.png")
            cv2.imwrite(output_path, cartoon)
            
            # Convert to base64
            with open(output_path, "rb") as f:
                cartoon_data = f.read()
            
            cartoon_base64 = base64.b64encode(cartoon_data).decode('utf-8')
            cartoon_url = f"data:image/png;base64,{cartoon_base64}"
            
            # Cleanup
            shutil.rmtree(temp_dir, ignore_errors=True)
            
            print(f"✅ Image cartoonized using OpenCV {style} style")
            return {
                "url": cartoon_url,
                "style": style,
                "method": "opencv",
                "width": cartoon.shape[1],
                "height": cartoon.shape[0]
            }
            
        except ImportError:
            print("⚠️  OpenCV not available, using AI generation")
            
            # Fallback: Use BRIA AI to generate cartoon version
            # First convert image to base64 URL
            image_base64 = base64.b64encode(image_data).decode('utf-8')
            image_url = f"data:image/png;base64,{image_base64}"
            
            # Generate cartoon prompt
            style_prompts = {
                "anime": "anime style illustration, vibrant colors, clean lines, Studio Ghibli inspired",
                "comic": "comic book style, bold outlines, pop art colors, graphic novel aesthetic",
                "watercolor": "watercolor painting style, soft edges, artistic, hand-painted look",
                "sketch": "pencil sketch style, hand-drawn, artistic linework, black and white",
                "pixar": "Pixar 3D animation style, smooth rendering, vibrant colors, professional CGI"
            }
            
            cartoon_prompt = f"Transform this image into {style_prompts.get(style, 'cartoon style')}, maintain the composition and subject"
            
            # Use image-to-image generation
            params = {
                "image_url": image_url,
                "aspect_ratio": "1:1",
                "seed": 5555,
            }
            
            result = await call_bria_api("image", cartoon_prompt, params)
            
            # Extract URL
            cartoon_url = None
            if "result" in result and isinstance(result["result"], dict):
                cartoon_url = result["result"].get("image_url")
            
            if not cartoon_url:
                raise HTTPException(status_code=500, detail="Failed to generate cartoon image")
            
            # Cleanup
            shutil.rmtree(temp_dir, ignore_errors=True)
            
            print(f"✅ Image cartoonized using AI {style} style")
            return {
                "url": cartoon_url,
                "style": style,
                "method": "ai",
                "width": 1024,
                "height": 1024
            }
        
    except Exception as e:
        print(f"❌ Cartoonization error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Image cartoonization failed: {str(e)}")

@app.post("/api/music/generate-video")
async def generate_music_video(
    music_file: UploadFile = File(...),
    story_json: str = Form(...),
    cartoon_images: Optional[str] = Form(None)
):
    """Generate complete music video with story, images, and music"""
    try:
        print(f"🎬 Generating music video...")
        
        # Parse inputs
        story_data = json.loads(story_json)
        story = MusicStory(**story_data)
        
        cartoon_urls = []
        if cartoon_images:
            cartoon_urls = json.loads(cartoon_images)
        
        # Create output directory
        output_base = os.path.join(os.getcwd(), "generated_videos")
        os.makedirs(output_base, exist_ok=True)
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        video_dir = os.path.join(output_base, f"music_video_{timestamp}")
        os.makedirs(video_dir, exist_ok=True)
        
        print(f"   📁 Created directory: {video_dir}")
        
        # Save music file
        music_path = os.path.join(video_dir, "music.mp3")
        with open(music_path, "wb") as f:
            music_data = await music_file.read()
            f.write(music_data)
        
        print(f"   🎵 Saved music file")
        
        # Generate images for each scene
        print(f"   🎨 Generating {len(story.scenes)} scene images...")
        scene_images = []
        
        for i, scene in enumerate(story.scenes):
            print(f"      Scene {i+1}/{len(story.scenes)}: {scene['description'][:60]}...")
            
            # Use cartoon image if available, otherwise generate
            if i < len(cartoon_urls):
                image_url = cartoon_urls[i]
                print(f"         Using provided cartoon image")
            else:
                # Generate image for this scene
                scene_prompt = f"{scene['description']}, {scene['style']} style, {scene['mood']} mood, professional music video quality"
                
                params = {
                    "aspect_ratio": "16:9",
                    "seed": 5555 + i,
                    "guidance_scale": 7.5,
                }
                
                result = await call_bria_api("image", scene_prompt, params)
                
                # Extract URL
                if "result" in result and isinstance(result["result"], dict):
                    image_url = result["result"].get("image_url")
                else:
                    print(f"         ⚠️  Failed to generate scene {i}, using placeholder")
                    continue
            
            scene_images.append({
                "index": i,
                "url": image_url,
                "timestamp": scene.get("timestamp", i * (story_data.get("duration", 30) / len(story.scenes))),
                "description": scene["description"]
            })
            
            print(f"         ✅ Scene {i+1} ready")
        
        if not scene_images:
            raise HTTPException(status_code=500, detail="Failed to generate any scene images")
        
        print(f"   ✅ Generated {len(scene_images)} scene images")
        
        # Download scene images
        print(f"   ⬇️  Downloading scene images...")
        async with httpx.AsyncClient(timeout=60.0) as client:
            for i, scene in enumerate(scene_images):
                # Handle data URLs
                if scene["url"].startswith("data:"):
                    # Extract base64 data
                    header, data = scene["url"].split(",", 1)
                    image_data = base64.b64decode(data)
                else:
                    # Download from URL
                    response = await client.get(scene["url"])
                    response.raise_for_status()
                    image_data = response.content
                
                # Save image
                image_path = os.path.join(video_dir, f"scene_{i:04d}.png")
                with open(image_path, "wb") as f:
                    f.write(image_data)
                
                print(f"         Scene {i+1}/{len(scene_images)} downloaded")
        
        print(f"   ✅ All scenes downloaded")
        
        # Calculate timing for each scene
        total_duration = story_data.get("duration", 30)
        scene_duration = total_duration / len(scene_images)
        
        print(f"   🎬 Assembling video...")
        print(f"      Total duration: {total_duration}s")
        print(f"      Scenes: {len(scene_images)}")
        print(f"      Duration per scene: {scene_duration:.2f}s")
        
        # Create concat file for FFmpeg
        concat_file = os.path.join(video_dir, "concat.txt")
        with open(concat_file, "w") as f:
            for i in range(len(scene_images)):
                f.write(f"file 'scene_{i:04d}.png'\n")
                f.write(f"duration {scene_duration}\n")
            # Repeat last frame
            f.write(f"file 'scene_{len(scene_images)-1:04d}.png'\n")
        
        # Create video from images
        video_no_audio = os.path.join(video_dir, "video_no_audio.mp4")
        ffmpeg_video_cmd = [
            "ffmpeg", "-y",
            "-f", "concat",
            "-safe", "0",
            "-i", concat_file,
            "-vf", "fps=30,scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2",
            "-c:v", "libx264",
            "-pix_fmt", "yuv420p",
            "-preset", "fast",
            video_no_audio
        ]
        
        result = subprocess.run(ffmpeg_video_cmd, capture_output=True, text=True, cwd=video_dir)
        if result.returncode != 0:
            print(f"      ❌ FFmpeg video error: {result.stderr}")
            raise Exception(f"Video creation failed: {result.stderr}")
        
        print(f"      ✅ Video created")
        
        # Add music to video
        output_path = os.path.join(video_dir, "final_video.mp4")
        ffmpeg_audio_cmd = [
            "ffmpeg", "-y",
            "-i", video_no_audio,
            "-i", music_path,
            "-c:v", "copy",
            "-c:a", "aac",
            "-shortest",
            output_path
        ]
        
        result = subprocess.run(ffmpeg_audio_cmd, capture_output=True, text=True, cwd=video_dir)
        if result.returncode != 0:
            print(f"      ❌ FFmpeg audio error: {result.stderr}")
            raise Exception(f"Audio merge failed: {result.stderr}")
        
        print(f"      ✅ Music added to video")
        
        # Save story info
        story_file = os.path.join(video_dir, "story.txt")
        with open(story_file, "w", encoding="utf-8") as f:
            f.write(f"Title: {story.title}\n\n")
            f.write(f"Story:\n{story.story}\n\n")
            f.write(f"Scenes:\n")
            for i, scene in enumerate(story.scenes):
                f.write(f"\nScene {i+1} ({scene.get('timestamp', 0):.1f}s):\n")
                f.write(f"  Description: {scene['description']}\n")
                f.write(f"  Mood: {scene['mood']}\n")
                f.write(f"  Style: {scene['style']}\n")
                f.write(f"  Action: {scene['action']}\n")
        
        # Convert final video to base64
        with open(output_path, "rb") as f:
            video_data = f.read()
        
        video_base64 = base64.b64encode(video_data).decode('utf-8')
        video_url = f"data:video/mp4;base64,{video_base64}"
        
        print(f"   ✅ Music video complete!")
        print(f"   💾 Saved to: {output_path}")
        
        return {
            "video_url": video_url,
            "file_path": output_path,
            "title": story.title,
            "duration": total_duration,
            "scenes": len(scene_images),
            "story": story.story
        }
        
    except Exception as e:
        print(f"❌ Music video generation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Music video generation failed: {str(e)}")

# ============================================================================
# END MUSIC-TO-VIDEO FEATURE
# ============================================================================

# ============================================================================


# ============================================================================
# COMFYUI WORKFLOW BUILDER FEATURE
# ============================================================================

class WorkflowNode(BaseModel):
    id: str
    type: str
    position: Dict[str, float]
    data: Dict[str, Any]

class WorkflowEdge(BaseModel):
    id: str
    source: str
    target: str
    sourceHandle: Optional[str] = None
    targetHandle: Optional[str] = None

class WorkflowExecutionRequest(BaseModel):
    name: str
    nodes: List[WorkflowNode]
    edges: List[WorkflowEdge]

class WorkflowExecutionResponse(BaseModel):
    execution_id: str
    status: str
    progress: float
    results: Dict[str, Any]
    start_time: str
    end_time: Optional[str] = None

@app.post("/api/workflow/execute")
async def execute_workflow(request: WorkflowExecutionRequest):
    """Execute a ComfyUI-style workflow"""
    try:
        print(f"🔄 Executing workflow: {request.name}")
        print(f"   Nodes: {len(request.nodes)}")
        print(f"   Edges: {len(request.edges)}")
        
        execution_id = f"exec_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        start_time = datetime.now()
        
        # Create execution order using topological sort
        execution_order = get_workflow_execution_order(request.nodes, request.edges)
        print(f"   Execution order: {execution_order}")
        
        # Execute nodes in order
        results = {}
        total_nodes = len(execution_order)
        
        for i, node_id in enumerate(execution_order):
            node = next((n for n in request.nodes if n.id == node_id), None)
            if not node:
                continue
            
            print(f"   Executing node {i+1}/{total_nodes}: {node.type} ({node_id})")
            
            # Get input data from connected nodes
            input_data = get_workflow_node_inputs(node_id, request.edges, results)
            
            # Execute the node
            node_result = await execute_workflow_node(node, input_data)
            results[node_id] = node_result
            
            print(f"   ✅ Node {node.type} completed")
        
        end_time = datetime.now()
        
        print(f"✅ Workflow execution complete!")
        print(f"   Duration: {(end_time - start_time).total_seconds():.1f}s")
        
        return WorkflowExecutionResponse(
            execution_id=execution_id,
            status="completed",
            progress=100.0,
            results=results,
            start_time=start_time.isoformat(),
            end_time=end_time.isoformat()
        )
        
    except Exception as e:
        print(f"❌ Workflow execution error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Workflow execution failed: {str(e)}")

def get_workflow_execution_order(nodes: List[WorkflowNode], edges: List[WorkflowEdge]) -> List[str]:
    """Get execution order using topological sort"""
    # Build dependency graph
    dependencies = {node.id: [] for node in nodes}
    
    for edge in edges:
        if edge.target in dependencies:
            dependencies[edge.target].append(edge.source)
    
    # Topological sort
    visited = set()
    order = []
    
    def visit(node_id: str):
        if node_id in visited:
            return
        visited.add(node_id)
        
        # Visit dependencies first
        for dep in dependencies.get(node_id, []):
            visit(dep)
        
        order.append(node_id)
    
    for node in nodes:
        visit(node.id)
    
    return order

def get_workflow_node_inputs(node_id: str, edges: List[WorkflowEdge], results: Dict[str, Any]) -> Dict[str, Any]:
    """Get input data for a node from connected nodes"""
    inputs = {}
    
    for edge in edges:
        if edge.target == node_id:
            source_result = results.get(edge.source)
            if source_result is not None:
                handle = edge.targetHandle or "input"
                inputs[handle] = source_result
    
    return inputs

async def execute_workflow_node(node: WorkflowNode, inputs: Dict[str, Any]) -> Any:
    """Execute a single workflow node"""
    node_type = node.type
    node_data = node.data
    
    try:
        if node_type == "textInput":
            return node_data.get("value", "")
        
        elif node_type == "imageGeneration":
            # Get prompt from input or node data
            prompt = inputs.get("input", node_data.get("prompt", ""))
            if not prompt:
                raise Exception("No prompt provided for image generation")
            
            # Build generation parameters
            params = {
                "aspect_ratio": node_data.get("aspect_ratio", "1:1"),
                "seed": node_data.get("seed", 5555),
                "guidance_scale": node_data.get("guidance_scale", 7.5),
                "num_inference_steps": node_data.get("num_inference_steps", 30),
            }
            
            # Call BRIA API
            result = await call_bria_api("image", prompt, params)
            
            # Extract image URL
            if "result" in result and isinstance(result["result"], dict):
                return result["result"].get("image_url")
            return result.get("image_url")
        
        elif node_type == "videoGeneration":
            # Get prompt from input or node data
            prompt = inputs.get("input", node_data.get("prompt", ""))
            if not prompt:
                raise Exception("No prompt provided for video generation")
            
            # Build generation parameters
            params = {
                "aspect_ratio": node_data.get("aspect_ratio", "16:9"),
                "seed": node_data.get("seed", 5555),
                "guidance_scale": node_data.get("guidance_scale", 7.5),
                "num_inference_steps": node_data.get("num_inference_steps", 30),
            }
            
            # Call BRIA API for video
            result = await call_bria_api("video", prompt, params)
            
            # Extract video URL
            if "result" in result and isinstance(result["result"], dict):
                return result["result"].get("video_url") or result["result"].get("image_url")
            return result.get("video_url") or result.get("image_url")
        
        elif node_type == "musicAnalysis":
            # Return mock analysis for now
            return {
                "tempo": 120,
                "mood": "energetic",
                "energy": "high",
                "genre": "electronic",
                "duration": 180
            }
        
        elif node_type == "styleControl":
            # Apply style modifications to input
            input_data = inputs.get("input", {})
            style_data = {
                "style": node_data.get("style", "cinematic"),
                "intensity": node_data.get("intensity", 0.7),
                "color_palette": node_data.get("color_palette", "vibrant")
            }
            
            # If input is a string (prompt), enhance it with style
            if isinstance(input_data, str):
                enhanced_prompt = f"{input_data}, {style_data['style']} style, {style_data['color_palette']} colors"
                return enhanced_prompt
            
            # Otherwise merge style data
            if isinstance(input_data, dict):
                return {**input_data, **style_data}
            
            return style_data
        
        elif node_type == "cameraControl":
            # Apply camera control parameters
            input_data = inputs.get("input", "")
            camera_data = node_data
            
            # Build camera prompt enhancement
            camera_terms = []
            
            if camera_data.get("angle"):
                angle_map = {
                    "bird-eye": "bird's eye view, aerial perspective",
                    "high-angle": "high angle shot, looking down",
                    "eye-level": "eye level shot, natural perspective",
                    "low-angle": "low angle shot, looking up, dramatic",
                    "worm-eye": "worm's eye view, extreme low angle",
                    "dutch-angle": "dutch angle, tilted camera, dynamic"
                }
                camera_terms.append(angle_map.get(camera_data["angle"], ""))
            
            if camera_data.get("distance"):
                distance_map = {
                    "extreme-close-up": "extreme close-up shot",
                    "close-up": "close-up shot",
                    "medium-close-up": "medium close-up shot",
                    "medium": "medium shot",
                    "medium-wide": "medium wide shot",
                    "wide": "wide shot, establishing shot",
                    "extreme-wide": "extreme wide shot, panoramic"
                }
                camera_terms.append(distance_map.get(camera_data["distance"], ""))
            
            if camera_data.get("fov"):
                fov = camera_data["fov"]
                if fov < 35:
                    camera_terms.append("wide angle lens, distorted perspective")
                elif fov > 85:
                    camera_terms.append("telephoto lens, compressed perspective")
                else:
                    camera_terms.append("normal lens, natural perspective")
            
            if camera_data.get("movement") and camera_data["movement"] != "static":
                movement_map = {
                    "pan-left": "camera panning left",
                    "pan-right": "camera panning right",
                    "tilt-up": "camera tilting up",
                    "tilt-down": "camera tilting down",
                    "zoom-in": "zooming in, push in",
                    "zoom-out": "zooming out, pull back",
                    "dolly-in": "dolly in, moving closer",
                    "dolly-out": "dolly out, moving away",
                    "tracking": "tracking shot, following movement",
                    "handheld": "handheld camera, dynamic movement"
                }
                camera_terms.append(movement_map.get(camera_data["movement"], ""))
            
            if camera_data.get("depth_of_field"):
                dof = camera_data["depth_of_field"]
                if dof < 0.3:
                    camera_terms.append("shallow depth of field, bokeh background")
                elif dof > 0.7:
                    camera_terms.append("deep depth of field, everything in focus")
            
            # Combine with input
            camera_prompt = ", ".join([term for term in camera_terms if term])
            if isinstance(input_data, str):
                return f"{input_data}, {camera_prompt}" if camera_prompt else input_data
            
            return {"prompt": input_data, "camera": camera_prompt}
        
        elif node_type == "lightingControl":
            # Apply lighting control parameters
            input_data = inputs.get("input", "")
            lighting_data = node_data
            
            lighting_terms = []
            
            if lighting_data.get("setup"):
                setup_map = {
                    "three-point": "three-point lighting setup, professional",
                    "key-only": "single key light, dramatic shadows",
                    "rembrandt": "Rembrandt lighting, triangle highlight",
                    "butterfly": "butterfly lighting, glamour setup",
                    "split": "split lighting, half shadow",
                    "rim": "rim lighting, edge lighting, silhouette",
                    "silhouette": "silhouette lighting, backlit",
                    "natural": "natural lighting, soft ambient",
                    "studio": "studio lighting, controlled environment",
                    "dramatic": "dramatic lighting, high contrast"
                }
                lighting_terms.append(setup_map.get(lighting_data["setup"], ""))
            
            if lighting_data.get("temperature"):
                temp = lighting_data["temperature"]
                if temp < 3000:
                    lighting_terms.append("warm lighting, golden hour, candlelight")
                elif temp < 4000:
                    lighting_terms.append("warm tungsten lighting")
                elif temp < 5500:
                    lighting_terms.append("neutral daylight")
                elif temp < 7000:
                    lighting_terms.append("cool daylight, blue tones")
                else:
                    lighting_terms.append("cool blue lighting, sky light")
            
            if lighting_data.get("shadows"):
                shadow_map = {
                    "soft": "soft shadows, diffused light",
                    "hard": "hard shadows, sharp edges",
                    "dramatic": "dramatic shadows, high contrast",
                    "minimal": "minimal shadows, even lighting",
                    "long": "long shadows, low sun angle",
                    "contact": "contact shadows, grounded objects"
                }
                lighting_terms.append(shadow_map.get(lighting_data["shadows"], ""))
            
            if lighting_data.get("intensity"):
                intensity = lighting_data["intensity"]
                if intensity < 0.3:
                    lighting_terms.append("low key lighting, moody")
                elif intensity > 0.7:
                    lighting_terms.append("high key lighting, bright")
            
            # Combine with input
            lighting_prompt = ", ".join([term for term in lighting_terms if term])
            if isinstance(input_data, str):
                return f"{input_data}, {lighting_prompt}" if lighting_prompt else input_data
            
            return {"prompt": input_data, "lighting": lighting_prompt}
        
        elif node_type == "compositionControl":
            # Apply composition control parameters
            input_data = inputs.get("input", "")
            comp_data = node_data
            
            comp_terms = []
            
            if comp_data.get("rule"):
                rule_map = {
                    "rule-of-thirds": "rule of thirds composition",
                    "golden-ratio": "golden ratio composition, fibonacci spiral",
                    "center-composition": "centered composition, symmetrical",
                    "diagonal": "diagonal composition, dynamic lines",
                    "triangular": "triangular composition, stable base",
                    "s-curve": "S-curve composition, flowing lines",
                    "radial": "radial composition, circular flow",
                    "pattern": "pattern composition, repetitive elements"
                }
                comp_terms.append(rule_map.get(comp_data["rule"], ""))
            
            if comp_data.get("balance"):
                balance_map = {
                    "symmetrical": "symmetrical balance, mirror composition",
                    "asymmetrical": "asymmetrical balance, dynamic tension",
                    "radial": "radial balance, circular symmetry",
                    "dynamic": "dynamic balance, movement and energy",
                    "crystallographic": "crystallographic balance, all-over pattern"
                }
                comp_terms.append(balance_map.get(comp_data["balance"], ""))
            
            if comp_data.get("leading_lines"):
                lines_map = {
                    "diagonal": "diagonal leading lines, dynamic energy",
                    "horizontal": "horizontal leading lines, calm stability",
                    "vertical": "vertical leading lines, strength and power",
                    "curved": "curved leading lines, organic flow",
                    "converging": "converging lines, perspective depth",
                    "zigzag": "zigzag lines, energetic movement",
                    "implied": "implied lines, subtle direction"
                }
                comp_terms.append(lines_map.get(comp_data["leading_lines"], ""))
            
            if comp_data.get("negative_space"):
                space = comp_data["negative_space"]
                if space < 0.2:
                    comp_terms.append("minimal negative space, filled frame")
                elif space > 0.5:
                    comp_terms.append("lots of negative space, minimalist composition")
            
            if comp_data.get("depth_layers"):
                layers = comp_data["depth_layers"]
                if layers >= 4:
                    comp_terms.append("multiple depth layers, complex perspective")
                elif layers == 3:
                    comp_terms.append("foreground, midground, background layers")
                elif layers == 2:
                    comp_terms.append("foreground and background separation")
            
            # Combine with input
            comp_prompt = ", ".join([term for term in comp_terms if term])
            if isinstance(input_data, str):
                return f"{input_data}, {comp_prompt}" if comp_prompt else input_data
            
            return {"prompt": input_data, "composition": comp_prompt}
        
        elif node_type == "colorPalette":
            # Apply color palette parameters
            input_data = inputs.get("input", "")
            color_data = node_data
            
            color_terms = []
            
            if color_data.get("scheme"):
                scheme_map = {
                    "monochromatic": "monochromatic color scheme, single hue variations",
                    "analogous": "analogous colors, harmonious adjacent hues",
                    "complementary": "complementary colors, opposite hues, high contrast",
                    "triadic": "triadic color scheme, three evenly spaced hues",
                    "tetradic": "tetradic color scheme, four balanced colors",
                    "split-complementary": "split complementary, softer contrast",
                    "warm": "warm color palette, reds oranges yellows",
                    "cool": "cool color palette, blues greens purples",
                    "earth-tones": "earth tone palette, natural browns and ochres",
                    "pastel": "pastel color palette, soft muted tones",
                    "neon": "neon color palette, vibrant electric colors",
                    "muted": "muted color palette, desaturated tones"
                }
                color_terms.append(scheme_map.get(color_data["scheme"], ""))
            
            if color_data.get("saturation"):
                sat = color_data["saturation"]
                if sat < 0.3:
                    color_terms.append("desaturated colors, muted tones")
                elif sat > 0.7:
                    color_terms.append("highly saturated colors, vivid and intense")
            
            if color_data.get("brightness"):
                bright = color_data["brightness"]
                if bright < 0.3:
                    color_terms.append("dark color palette, moody tones")
                elif bright > 0.7:
                    color_terms.append("bright color palette, light and airy")
            
            if color_data.get("contrast"):
                contrast = color_data["contrast"]
                if contrast < 0.3:
                    color_terms.append("low contrast colors, subtle differences")
                elif contrast > 0.7:
                    color_terms.append("high contrast colors, bold differences")
            
            if color_data.get("temperature"):
                temp_map = {
                    "very-warm": "very warm color temperature, golden sunset tones",
                    "warm": "warm color temperature, cozy amber tones",
                    "neutral": "neutral color temperature, balanced daylight",
                    "cool": "cool color temperature, crisp blue tones",
                    "very-cool": "very cool color temperature, icy blue tones"
                }
                color_terms.append(temp_map.get(color_data["temperature"], ""))
            
            # Add specific colors if provided
            if color_data.get("primary_color"):
                color_terms.append(f"primary color {color_data['primary_color']}")
            if color_data.get("secondary_color"):
                color_terms.append(f"secondary color {color_data['secondary_color']}")
            if color_data.get("accent_color"):
                color_terms.append(f"accent color {color_data['accent_color']}")
            
            # Combine with input
            color_prompt = ", ".join([term for term in color_terms if term])
            if isinstance(input_data, str):
                return f"{input_data}, {color_prompt}" if color_prompt else input_data
            
            return {"prompt": input_data, "colors": color_prompt}
        
        elif node_type == "conditional":
            condition = node_data.get("condition", "")
            input_value = inputs.get("input")
            
            # Simple condition evaluation
            try:
                # Replace 'input' with actual value in condition
                condition_code = condition.replace("input", repr(input_value))
                result = eval(condition_code)
                
                if result:
                    return inputs.get("true", input_value)
                else:
                    return inputs.get("false", None)
            except:
                return inputs.get("false", None)
        
        elif node_type == "loop":
            iterations = node_data.get("iterations", 3)
            input_value = inputs.get("input")
            
            # Execute loop
            results = []
            for i in range(iterations):
                results.append(input_value)
            
            return results
        
        elif node_type == "imageInput":
            # Handle image input node
            images = node_data.get("images", [])
            image_urls = node_data.get("imageUrls", [])
            
            return {
                "type": "image_collection",
                "count": len(images),
                "urls": image_urls,
                "images": images
            }
        
        elif node_type == "imageMerge":
            # Handle image merging with BRIA API
            images_input = inputs.get("images", {})
            style_input = inputs.get("style", "")
            
            if not images_input or not isinstance(images_input, dict):
                raise Exception("No images provided for merging")
            
            image_urls = images_input.get("urls", [])
            if not image_urls:
                raise Exception("No image URLs found")
            
            # Build merge prompt based on settings
            merge_mode = node_data.get("merge_mode", "composite")
            blend_mode = node_data.get("blend_mode", "normal")
            layout = node_data.get("layout", "grid")
            
            merge_prompt = f"Merge multiple images using {merge_mode} technique, {blend_mode} blending, {layout} layout"
            
            if style_input:
                merge_prompt += f", {style_input}"
            
            # For now, use the first image as base and enhance with merge description
            # In a full implementation, you'd use a specialized image merging API
            base_image_url = image_urls[0] if image_urls else None
            
            params = {
                "image_url": base_image_url,
                "aspect_ratio": "1:1",
                "seed": 5555,
            }
            
            result = await call_bria_api("image", merge_prompt, params)
            
            # Extract image URL
            if "result" in result and isinstance(result["result"], dict):
                return result["result"].get("image_url")
            return result.get("image_url")
        
        elif node_type == "styleTransfer":
            # Handle style transfer
            content_input = inputs.get("content", "")
            style_input = inputs.get("style", "")
            
            style_type = node_data.get("style_type", "artistic")
            preset_style = node_data.get("preset_style", "van-gogh")
            style_strength = node_data.get("style_strength", 0.7)
            
            # Build style transfer prompt
            style_prompts = {
                "van-gogh": "Van Gogh style, swirling brushstrokes, vibrant colors, post-impressionist",
                "picasso": "Picasso cubist style, geometric shapes, fragmented perspective",
                "monet": "Monet impressionist style, soft brushstrokes, light and color",
                "kandinsky": "Kandinsky abstract style, geometric forms, bold colors",
                "hokusai": "Hokusai Japanese style, woodblock print, traditional Japanese art",
                "basquiat": "Basquiat street art style, graffiti, expressive, urban",
                "pollock": "Jackson Pollock style, abstract expressionist, paint splatters",
                "warhol": "Andy Warhol pop art style, bright colors, commercial aesthetic",
                "dali": "Salvador Dalí surrealist style, dreamlike, melting forms",
                "rothko": "Mark Rothko color field style, large color blocks, emotional",
                "anime": "anime art style, Japanese animation, clean lines, vibrant",
                "comic": "comic book style, bold outlines, pop art colors",
                "watercolor": "watercolor painting style, soft edges, flowing colors",
                "oil-painting": "oil painting style, rich textures, classical technique",
                "pencil-sketch": "pencil sketch style, hand-drawn, artistic linework"
            }
            
            style_desc = style_prompts.get(preset_style, f"{preset_style} style")
            strength_desc = "subtle" if style_strength < 0.4 else "strong" if style_strength > 0.7 else "balanced"
            
            transfer_prompt = f"{content_input}, {style_desc}, {strength_desc} style transfer, {style_type} approach"
            
            if style_input:
                transfer_prompt += f", {style_input}"
            
            params = {
                "aspect_ratio": "1:1",
                "seed": 5555,
                "guidance_scale": 7.5 + (style_strength * 5),  # Adjust guidance based on strength
            }
            
            result = await call_bria_api("image", transfer_prompt, params)
            
            # Extract image URL
            if "result" in result and isinstance(result["result"], dict):
                return result["result"].get("image_url")
            return result.get("image_url")
        
        elif node_type == "previewOutput":
            # Handle preview output node
            input_value = inputs.get("input")
            
            if isinstance(input_value, str) and (input_value.startswith("http") or input_value.startswith("data:")):
                return {
                    "url": input_value,
                    "format": node_data.get("format", "png"),
                    "quality": node_data.get("quality", "high"),
                    "width": 1024,
                    "height": 1024
                }
            
            return input_value
        
        elif node_type == "merge":
            merge_type = node_data.get("merge_type", "combine")
            
            # Collect all inputs
            all_inputs = []
            for key, value in inputs.items():
                if key.startswith("input"):
                    all_inputs.append(value)
            
            if merge_type == "combine":
                return all_inputs
            elif merge_type == "priority":
                priority = node_data.get("priority", "first")
                if priority == "first" and all_inputs:
                    return all_inputs[0]
                elif priority == "last" and all_inputs:
                    return all_inputs[-1]
            
            return all_inputs
        
        elif node_type == "audioInput":
            # Handle audio input node
            audio_file = node_data.get("audioFile")
            audio_url = node_data.get("audioUrl", "")
            youtube_url = node_data.get("youtubeUrl", "")
            duration = node_data.get("duration", 0)
            
            return {
                "type": "audio",
                "url": audio_url,
                "youtube_url": youtube_url,
                "duration": duration,
                "has_file": bool(audio_file)
            }
        
        elif node_type == "textProcessor":
            # Handle text processing
            input_text = inputs.get("input", "")
            operation = node_data.get("operation", "enhance")
            style = node_data.get("style", "creative")
            tone = node_data.get("tone", "professional")
            length = node_data.get("length", "medium")
            enhancement_level = node_data.get("enhancement_level", 0.7)
            
            # Simulate text processing based on operation
            operations = {
                "enhance": f"Enhanced version: {input_text} (improved with {style} style, {tone} tone)",
                "summarize": f"Summary: Key points from the input text in {tone} tone",
                "expand": f"Expanded: Detailed elaboration of '{input_text}' with {style} approach",
                "translate": f"Translated: {input_text} (translated content)",
                "rewrite": f"Rewritten: Fresh perspective on '{input_text}' with {style} style",
                "format": f"Formatted: Properly structured version of '{input_text}'"
            }
            
            processed_text = operations.get(operation, f"Processed: {input_text}")
            
            # Apply enhancement level
            if enhancement_level > 0.5:
                processed_text += f" (enhanced {int(enhancement_level * 100)}%)"
            
            return processed_text
        
        elif node_type == "imageFilter":
            # Handle image filtering
            input_image = inputs.get("input", "")
            filter_type = node_data.get("filter_type", "enhance")
            intensity = node_data.get("intensity", 0.5)
            brightness = node_data.get("brightness", 0)
            contrast = node_data.get("contrast", 0)
            saturation = node_data.get("saturation", 0)
            blur = node_data.get("blur", 0)
            sharpen = node_data.get("sharpen", 0)
            rotation = node_data.get("rotation", 0)
            
            # Build filter prompt
            filter_prompts = {
                "enhance": "auto enhanced, improved quality",
                "vintage": "vintage filter, retro aesthetic, aged look",
                "black-white": "black and white, monochrome, classic",
                "sepia": "sepia tone, warm brown tints, nostalgic",
                "warm": "warm filter, golden tones, cozy atmosphere",
                "cool": "cool filter, blue tones, crisp feeling",
                "dramatic": "dramatic filter, high contrast, moody",
                "soft": "soft focus, dreamy, gentle blur",
                "vivid": "vivid colors, saturated, vibrant",
                "matte": "matte finish, desaturated, film look",
                "film": "film grain, analog photography aesthetic",
                "hdr": "HDR effect, enhanced dynamic range"
            }
            
            filter_desc = filter_prompts.get(filter_type, f"{filter_type} filter")
            
            # Add adjustment descriptions
            adjustments = []
            if brightness != 0:
                adjustments.append(f"brightness {'+' if brightness > 0 else ''}{int(brightness * 100)}")
            if contrast != 0:
                adjustments.append(f"contrast {'+' if contrast > 0 else ''}{int(contrast * 100)}")
            if saturation != 0:
                adjustments.append(f"saturation {'+' if saturation > 0 else ''}{int(saturation * 100)}")
            if blur > 0:
                adjustments.append(f"blur {blur * 10:.1f}px")
            if sharpen > 0:
                adjustments.append(f"sharpen {int(sharpen * 100)}%")
            if rotation != 0:
                adjustments.append(f"rotated {rotation}°")
            
            filter_prompt = f"{input_image}, {filter_desc}"
            if adjustments:
                filter_prompt += f", {', '.join(adjustments)}"
            
            filter_prompt += f", filter intensity {int(intensity * 100)}%"
            
            # If input is an image URL, use it for image-to-image generation
            if isinstance(input_image, str) and (input_image.startswith("http") or input_image.startswith("data:")):
                params = {
                    "image_url": input_image,
                    "aspect_ratio": "1:1",
                    "seed": 5555,
                    "guidance_scale": 7.5,
                }
                
                result = await call_bria_api("image", filter_prompt, params)
                
                if "result" in result and isinstance(result["result"], dict):
                    return result["result"].get("image_url")
                return result.get("image_url")
            
            # Otherwise return the filter description
            return filter_prompt
        
        elif node_type == "dataTransform":
            # Handle data transformation
            input_data = inputs.get("input", "")
            transform_type = node_data.get("transform_type", "format")
            format_from = node_data.get("format_from", "json")
            format_to = node_data.get("format_to", "csv")
            custom_mapping = node_data.get("custom_mapping", "")
            validation_rules = node_data.get("validation_rules", "")
            
            # Simulate data transformation
            if transform_type == "format":
                return {
                    "type": "transformed_data",
                    "original_format": format_from,
                    "target_format": format_to,
                    "data": f"Data converted from {format_from} to {format_to}",
                    "input": input_data
                }
            elif transform_type == "filter":
                return {
                    "type": "filtered_data",
                    "rules": validation_rules,
                    "data": f"Data filtered using rules: {validation_rules}",
                    "input": input_data
                }
            elif transform_type == "validate":
                return {
                    "type": "validation_result",
                    "rules": validation_rules,
                    "valid": True,
                    "data": f"Data validated against: {validation_rules}",
                    "input": input_data
                }
            elif transform_type == "aggregate":
                return {
                    "type": "aggregated_data",
                    "mapping": custom_mapping,
                    "data": f"Data aggregated using: {custom_mapping}",
                    "input": input_data
                }
            elif transform_type == "clean":
                return {
                    "type": "cleaned_data",
                    "data": f"Cleaned and normalized data",
                    "input": input_data
                }
            elif transform_type == "merge":
                return {
                    "type": "merged_data",
                    "mapping": custom_mapping,
                    "data": f"Data merged using: {custom_mapping}",
                    "input": input_data
                }
            elif transform_type == "split":
                return {
                    "type": "split_data",
                    "data": f"Data split into components",
                    "input": input_data
                }
            elif transform_type == "normalize":
                return {
                    "type": "normalized_data",
                    "data": f"Data normalized and standardized",
                    "input": input_data
                }
            
            return {
                "type": "transformed_data",
                "transform": transform_type,
                "data": f"Data transformed using {transform_type}",
                "input": input_data
            }

        elif node_type == "output":
            # Output node just passes through the input
            input_value = inputs.get("input")
            return {
                "url": input_value,
                "format": node_data.get("format", "png"),
                "quality": node_data.get("quality", "high")
            }
        
        else:
            # Unknown node type, return input
            return inputs.get("input")
    
    except Exception as e:
        print(f"   ❌ Node execution error: {str(e)}")
        # Instead of failing the entire workflow, return an error result
        return {
            "error": True,
            "message": f"Node {node_type} failed: {str(e)}",
            "type": "error"
        }

@app.post("/api/workflow/save")
async def save_workflow(request: WorkflowExecutionRequest):
    """Save a workflow to file"""
    try:
        # Create workflows directory
        workflows_dir = os.path.join(os.getcwd(), "saved_workflows")
        os.makedirs(workflows_dir, exist_ok=True)
        
        # Generate filename
        safe_name = "".join(c for c in request.name if c.isalnum() or c in (' ', '-', '_')).rstrip()
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{safe_name}_{timestamp}.json"
        filepath = os.path.join(workflows_dir, filename)
        
        # Save workflow
        workflow_data = {
            "name": request.name,
            "nodes": [node.model_dump() for node in request.nodes],
            "edges": [edge.model_dump() for edge in request.edges],
            "created_at": datetime.now().isoformat(),
            "version": "1.0"
        }
        
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(workflow_data, f, indent=2)
        
        print(f"✅ Workflow saved: {filepath}")
        
        return {
            "success": True,
            "filename": filename,
            "filepath": filepath,
            "message": f"Workflow '{request.name}' saved successfully"
        }
        
    except Exception as e:
        print(f"❌ Workflow save error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to save workflow: {str(e)}")

@app.get("/api/workflow/templates")
async def get_workflow_templates():
    """Get predefined workflow templates"""
    templates = [
        {
            "id": "image-generation-pipeline",
            "name": "Image Generation Pipeline",
            "description": "Basic text-to-image generation with style controls",
            "category": "image",
            "nodes": [
                {
                    "id": "text-input",
                    "type": "textInput",
                    "position": {"x": 100, "y": 100},
                    "data": {"label": "Text Input", "value": "A beautiful landscape"}
                },
                {
                    "id": "style-control",
                    "type": "styleControl",
                    "position": {"x": 350, "y": 100},
                    "data": {"label": "Style Control", "style": "cinematic"}
                },
                {
                    "id": "image-gen",
                    "type": "imageGeneration",
                    "position": {"x": 600, "y": 100},
                    "data": {"label": "Image Generation"}
                },
                {
                    "id": "output",
                    "type": "output",
                    "position": {"x": 850, "y": 100},
                    "data": {"label": "Output", "format": "png"}
                }
            ],
            "edges": [
                {"id": "e1", "source": "text-input", "target": "style-control", "sourceHandle": "output", "targetHandle": "input"},
                {"id": "e2", "source": "style-control", "target": "image-gen", "sourceHandle": "output", "targetHandle": "input"},
                {"id": "e3", "source": "image-gen", "target": "output", "sourceHandle": "output", "targetHandle": "input"}
            ]
        },
        {
            "id": "deterministic-image-control",
            "name": "Deterministic Image Control",
            "description": "Complete deterministic control over camera, lighting, composition, and colors",
            "category": "professional",
            "nodes": [
                {
                    "id": "text-input",
                    "type": "textInput",
                    "position": {"x": 100, "y": 200},
                    "data": {"label": "Base Prompt", "value": "Professional portrait photography"}
                },
                {
                    "id": "camera-control",
                    "type": "cameraControl",
                    "position": {"x": 350, "y": 100},
                    "data": {"label": "Camera Setup", "angle": "eye-level", "fov": 85, "distance": "medium-close-up"}
                },
                {
                    "id": "lighting-control",
                    "type": "lightingControl",
                    "position": {"x": 350, "y": 250},
                    "data": {"label": "Lighting Setup", "setup": "three-point", "temperature": 5500}
                },
                {
                    "id": "composition-control",
                    "type": "compositionControl",
                    "position": {"x": 350, "y": 400},
                    "data": {"label": "Composition", "rule": "rule-of-thirds", "balance": "asymmetrical"}
                },
                {
                    "id": "color-palette",
                    "type": "colorPalette",
                    "position": {"x": 600, "y": 200},
                    "data": {"label": "Color Palette", "scheme": "complementary", "primary_color": "#2563EB"}
                },
                {
                    "id": "merge-controls",
                    "type": "merge",
                    "position": {"x": 850, "y": 250},
                    "data": {"label": "Merge Controls", "merge_type": "combine"}
                },
                {
                    "id": "image-gen",
                    "type": "imageGeneration",
                    "position": {"x": 1100, "y": 250},
                    "data": {"label": "Generate Image"}
                },
                {
                    "id": "output",
                    "type": "output",
                    "position": {"x": 1350, "y": 250},
                    "data": {"label": "Output", "format": "png"}
                }
            ],
            "edges": [
                {"id": "e1", "source": "text-input", "target": "camera-control", "sourceHandle": "output", "targetHandle": "input"},
                {"id": "e2", "source": "camera-control", "target": "lighting-control", "sourceHandle": "output", "targetHandle": "input"},
                {"id": "e3", "source": "lighting-control", "target": "composition-control", "sourceHandle": "output", "targetHandle": "input"},
                {"id": "e4", "source": "composition-control", "target": "color-palette", "sourceHandle": "output", "targetHandle": "input"},
                {"id": "e5", "source": "color-palette", "target": "merge-controls", "sourceHandle": "output", "targetHandle": "input1"},
                {"id": "e6", "source": "merge-controls", "target": "image-gen", "sourceHandle": "output", "targetHandle": "input"},
                {"id": "e7", "source": "image-gen", "target": "output", "sourceHandle": "output", "targetHandle": "input"}
            ]
        },
        {
            "id": "video-creation-workflow",
            "name": "Video Creation Workflow",
            "description": "Complete video generation with multiple scenes",
            "category": "video",
            "nodes": [
                {
                    "id": "text-input",
                    "type": "textInput",
                    "position": {"x": 100, "y": 100},
                    "data": {"label": "Story Input", "value": "Epic adventure story"}
                },
                {
                    "id": "video-gen",
                    "type": "videoGeneration",
                    "position": {"x": 350, "y": 100},
                    "data": {"label": "Video Generation", "duration": 10}
                },
                {
                    "id": "output",
                    "type": "output",
                    "position": {"x": 600, "y": 100},
                    "data": {"label": "Output", "format": "mp4"}
                }
            ],
            "edges": [
                {"id": "e1", "source": "text-input", "target": "video-gen", "sourceHandle": "output", "targetHandle": "input"},
                {"id": "e2", "source": "video-gen", "target": "output", "sourceHandle": "output", "targetHandle": "input"}
            ]
        },
        {
            "id": "music-video-generator",
            "name": "Music Video Generator",
            "description": "Generate visuals synchronized with music",
            "category": "music",
            "nodes": [
                {
                    "id": "music-analysis",
                    "type": "musicAnalysis",
                    "position": {"x": 100, "y": 100},
                    "data": {"label": "Music Analysis"}
                },
                {
                    "id": "style-control",
                    "type": "styleControl",
                    "position": {"x": 350, "y": 100},
                    "data": {"label": "Visual Style", "style": "vibrant"}
                },
                {
                    "id": "video-gen",
                    "type": "videoGeneration",
                    "position": {"x": 600, "y": 100},
                    "data": {"label": "Video Generation"}
                },
                {
                    "id": "output",
                    "type": "output",
                    "position": {"x": 850, "y": 100},
                    "data": {"label": "Output", "format": "mp4"}
                }
            ],
            "edges": [
                {"id": "e1", "source": "music-analysis", "target": "style-control", "sourceHandle": "output", "targetHandle": "input"},
                {"id": "e2", "source": "style-control", "target": "video-gen", "sourceHandle": "output", "targetHandle": "input"},
                {"id": "e3", "source": "video-gen", "target": "output", "sourceHandle": "output", "targetHandle": "input"}
            ]
        },
        {
            "id": "batch-image-processing",
            "name": "Batch Image Processing",
            "description": "Process multiple images with loops and conditions",
            "category": "processing",
            "nodes": [
                {
                    "id": "text-input",
                    "type": "textInput",
                    "position": {"x": 100, "y": 100},
                    "data": {"label": "Base Prompt", "value": "Transform this image"}
                },
                {
                    "id": "loop",
                    "type": "loop",
                    "position": {"x": 350, "y": 100},
                    "data": {"label": "Process Loop", "iterations": 5}
                },
                {
                    "id": "style-control",
                    "type": "styleControl",
                    "position": {"x": 600, "y": 100},
                    "data": {"label": "Style Variations"}
                },
                {
                    "id": "image-gen",
                    "type": "imageGeneration",
                    "position": {"x": 850, "y": 100},
                    "data": {"label": "Generate Variations"}
                },
                {
                    "id": "output",
                    "type": "output",
                    "position": {"x": 1100, "y": 100},
                    "data": {"label": "Output", "format": "png"}
                }
            ],
            "edges": [
                {"id": "e1", "source": "text-input", "target": "loop", "sourceHandle": "output", "targetHandle": "input"},
                {"id": "e2", "source": "loop", "target": "style-control", "sourceHandle": "output", "targetHandle": "input"},
                {"id": "e3", "source": "style-control", "target": "image-gen", "sourceHandle": "output", "targetHandle": "input"},
                {"id": "e4", "source": "image-gen", "target": "output", "sourceHandle": "output", "targetHandle": "input"}
            ]
        },
        {
            "id": "multi-image-merge-workflow",
            "name": "Multi-Image Merge & Style Workflow",
            "description": "Upload multiple images, merge them with style transfer and preview output",
            "category": "advanced",
            "nodes": [
                {
                    "id": "image-input",
                    "type": "imageInput",
                    "position": {"x": 100, "y": 200},
                    "data": {"label": "Upload Images", "maxImages": 5}
                },
                {
                    "id": "style-transfer",
                    "type": "styleTransfer",
                    "position": {"x": 350, "y": 100},
                    "data": {"label": "Style Transfer", "preset_style": "van-gogh", "style_strength": 0.7}
                },
                {
                    "id": "camera-control",
                    "type": "cameraControl",
                    "position": {"x": 350, "y": 300},
                    "data": {"label": "Camera Setup", "angle": "eye-level", "fov": 50}
                },
                {
                    "id": "image-merge",
                    "type": "imageMerge",
                    "position": {"x": 600, "y": 200},
                    "data": {"label": "Merge Images", "merge_mode": "composite", "layout": "grid"}
                },
                {
                    "id": "color-palette",
                    "type": "colorPalette",
                    "position": {"x": 850, "y": 200},
                    "data": {"label": "Color Grading", "scheme": "complementary"}
                },
                {
                    "id": "preview-output",
                    "type": "previewOutput",
                    "position": {"x": 1100, "y": 200},
                    "data": {"label": "Preview & Download", "format": "png", "quality": "high"}
                }
            ],
            "edges": [
                {"id": "e1", "source": "image-input", "target": "style-transfer", "sourceHandle": "output", "targetHandle": "content"},
                {"id": "e2", "source": "image-input", "target": "image-merge", "sourceHandle": "output", "targetHandle": "images"},
                {"id": "e3", "source": "style-transfer", "target": "image-merge", "sourceHandle": "output", "targetHandle": "style"},
                {"id": "e4", "source": "camera-control", "target": "image-merge", "sourceHandle": "output", "targetHandle": "mask"},
                {"id": "e5", "source": "image-merge", "target": "color-palette", "sourceHandle": "output", "targetHandle": "input"},
                {"id": "e6", "source": "color-palette", "target": "preview-output", "sourceHandle": "output", "targetHandle": "input"}
            ]
        },
        {
            "id": "artistic-photo-collage",
            "name": "Artistic Photo Collage Creator",
            "description": "Create artistic collages from multiple photos with style effects",
            "category": "creative",
            "nodes": [
                {
                    "id": "image-input",
                    "type": "imageInput",
                    "position": {"x": 100, "y": 150},
                    "data": {"label": "Photo Collection", "maxImages": 8}
                },
                {
                    "id": "composition-control",
                    "type": "compositionControl",
                    "position": {"x": 350, "y": 100},
                    "data": {"label": "Composition", "rule": "golden-ratio", "balance": "dynamic"}
                },
                {
                    "id": "lighting-control",
                    "type": "lightingControl",
                    "position": {"x": 350, "y": 250},
                    "data": {"label": "Lighting", "setup": "dramatic", "intensity": 0.8}
                },
                {
                    "id": "style-transfer",
                    "type": "styleTransfer",
                    "position": {"x": 600, "y": 100},
                    "data": {"label": "Artistic Style", "preset_style": "picasso", "style_strength": 0.6}
                },
                {
                    "id": "image-merge",
                    "type": "imageMerge",
                    "position": {"x": 850, "y": 150},
                    "data": {"label": "Collage Merge", "merge_mode": "collage", "layout": "masonry"}
                },
                {
                    "id": "preview-output",
                    "type": "previewOutput",
                    "position": {"x": 1100, "y": 150},
                    "data": {"label": "Artistic Collage", "format": "jpg", "quality": "ultra"}
                }
            ],
            "edges": [
                {"id": "e1", "source": "image-input", "target": "composition-control", "sourceHandle": "output", "targetHandle": "input"},
                {"id": "e2", "source": "composition-control", "target": "lighting-control", "sourceHandle": "output", "targetHandle": "input"},
                {"id": "e3", "source": "lighting-control", "target": "style-transfer", "sourceHandle": "output", "targetHandle": "style"},
                {"id": "e4", "source": "image-input", "target": "style-transfer", "sourceHandle": "output", "targetHandle": "content"},
                {"id": "e5", "source": "style-transfer", "target": "image-merge", "sourceHandle": "output", "targetHandle": "style"},
                {"id": "e6", "source": "image-input", "target": "image-merge", "sourceHandle": "output", "targetHandle": "images"},
                {"id": "e7", "source": "image-merge", "target": "preview-output", "sourceHandle": "output", "targetHandle": "input"}
            ]
        }
    ]
    
    return {"templates": templates}

# ============================================================================
# END COMFYUI WORKFLOW BUILDER FEATURE
# ============================================================================

# ============================================================================
# ADVANCED IMAGE PROCESSING ENDPOINTS
# ============================================================================

class ImageMergeRequest(BaseModel):
    image_urls: List[str]
    merge_mode: str = "composite"
    blend_mode: str = "normal"
    layout: str = "grid"
    opacity: float = 1.0
    spacing: int = 10
    background_color: str = "#FFFFFF"
    output_size: str = "auto"
    quality: float = 0.9

class StyleTransferRequest(BaseModel):
    content_url: str
    style_type: str = "artistic"
    preset_style: str = "van-gogh"
    style_strength: float = 0.7
    preserve_content: float = 0.8
    color_preservation: float = 0.5
    style_image_url: Optional[str] = None

@app.post("/api/image/merge")
async def merge_images(request: ImageMergeRequest):
    """Merge multiple images using various techniques"""
    try:
        print(f"🔗 Merging {len(request.image_urls)} images with {request.merge_mode} mode")
        
        if not request.image_urls:
            raise HTTPException(status_code=400, detail="No image URLs provided")
        
        # Create merge prompt based on settings
        merge_descriptions = {
            "composite": "seamlessly composite and blend multiple images together",
            "collage": "create an artistic photo collage arrangement",
            "grid": "arrange images in a clean grid layout",
            "overlay": "layer and overlay images with transparency effects",
            "mosaic": "create a mosaic pattern from multiple images",
            "panorama": "stitch images together into a panoramic view",
            "double-exposure": "create double exposure effect blending images",
            "split-screen": "arrange images in split-screen composition"
        }
        
        layout_descriptions = {
            "grid": "organized grid pattern",
            "horizontal": "horizontal strip arrangement",
            "vertical": "vertical column layout",
            "circular": "circular radial arrangement",
            "spiral": "spiral flow pattern",
            "random": "artistic random placement",
            "masonry": "masonry brick-like layout",
            "diagonal": "diagonal flow composition"
        }
        
        merge_desc = merge_descriptions.get(request.merge_mode, "composite blend")
        layout_desc = layout_descriptions.get(request.layout, "grid layout")
        
        # Build comprehensive prompt
        prompt = f"Professional image composition: {merge_desc} using {layout_desc}, "
        prompt += f"{request.blend_mode} blending mode, "
        prompt += f"high quality digital art, seamless integration, "
        prompt += f"balanced composition, professional photography"
        
        if request.opacity < 1.0:
            prompt += f", {int(request.opacity * 100)}% opacity transparency effects"
        
        # Use BRIA API to generate merged result
        # Note: In a full implementation, you'd process the actual images
        # For now, we use the prompt to guide generation
        params = {
            "aspect_ratio": "16:9" if request.layout in ["horizontal", "panorama"] else "1:1",
            "seed": 5555,
            "guidance_scale": 8.0,
            "num_inference_steps": 35,
        }
        
        result = await call_bria_api("image", prompt, params)
        
        # Extract image URL
        image_url = None
        if "result" in result and isinstance(result["result"], dict):
            image_url = result["result"].get("image_url")
        
        if not image_url:
            raise HTTPException(status_code=500, detail="Failed to merge images")
        
        print(f"✅ Images merged successfully")
        
        return {
            "success": True,
            "merged_image_url": image_url,
            "merge_mode": request.merge_mode,
            "layout": request.layout,
            "blend_mode": request.blend_mode,
            "source_count": len(request.image_urls),
            "settings": {
                "opacity": request.opacity,
                "spacing": request.spacing,
                "background_color": request.background_color,
                "quality": request.quality
            }
        }
        
    except Exception as e:
        print(f"❌ Image merge error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Image merge failed: {str(e)}")

@app.post("/api/image/style-transfer")
async def apply_style_transfer(request: StyleTransferRequest):
    """Apply artistic style transfer to an image"""
    try:
        print(f"🎨 Applying {request.preset_style} style transfer")
        
        # Style descriptions for different presets
        style_prompts = {
            "van-gogh": "Van Gogh post-impressionist style, swirling brushstrokes, vibrant colors, expressive texture",
            "picasso": "Picasso cubist style, geometric fragmentation, multiple perspectives, bold angular forms",
            "monet": "Monet impressionist style, soft light effects, loose brushwork, atmospheric color",
            "kandinsky": "Kandinsky abstract expressionist style, geometric forms, spiritual abstraction, bold colors",
            "hokusai": "Hokusai Japanese ukiyo-e style, woodblock print aesthetic, traditional Japanese art",
            "basquiat": "Basquiat neo-expressionist style, graffiti influences, raw energy, urban art",
            "pollock": "Jackson Pollock abstract expressionist style, drip painting technique, energetic composition",
            "warhol": "Andy Warhol pop art style, commercial aesthetic, bright colors, screen print effect",
            "dali": "Salvador Dalí surrealist style, dreamlike imagery, melting forms, hyperrealistic detail",
            "rothko": "Mark Rothko color field style, large color blocks, emotional depth, spiritual abstraction",
            "anime": "Japanese anime art style, clean vector lines, vibrant colors, stylized characters",
            "comic": "American comic book style, bold outlines, halftone patterns, dynamic composition",
            "watercolor": "traditional watercolor painting, soft edges, transparent washes, organic flow",
            "oil-painting": "classical oil painting technique, rich impasto, luminous colors, fine detail",
            "pencil-sketch": "detailed pencil drawing, graphite shading, artistic linework, realistic rendering"
        }
        
        style_desc = style_prompts.get(request.preset_style, f"{request.preset_style} artistic style")
        
        # Build style transfer prompt
        strength_levels = {
            0.0: "barely noticeable",
            0.3: "subtle",
            0.5: "balanced",
            0.7: "strong",
            0.9: "dominant",
            1.0: "complete transformation"
        }
        
        strength_key = min(strength_levels.keys(), key=lambda x: abs(x - request.style_strength))
        strength_desc = strength_levels[strength_key]
        
        prompt = f"Artistic style transfer: transform image with {style_desc}, "
        prompt += f"{strength_desc} style application, "
        prompt += f"preserve {int(request.preserve_content * 100)}% of original content structure, "
        prompt += f"maintain {int(request.color_preservation * 100)}% of original colors, "
        prompt += f"professional digital art, high quality rendering"
        
        # Adjust generation parameters based on style settings
        guidance_scale = 7.5 + (request.style_strength * 3)  # Higher guidance for stronger style
        steps = int(30 + (request.style_strength * 20))  # More steps for complex styles
        
        params = {
            "image_url": request.content_url,
            "aspect_ratio": "1:1",
            "seed": 5555,
            "guidance_scale": guidance_scale,
            "num_inference_steps": steps,
        }
        
        result = await call_bria_api("image", prompt, params)
        
        # Extract image URL
        image_url = None
        if "result" in result and isinstance(result["result"], dict):
            image_url = result["result"].get("image_url")
        
        if not image_url:
            raise HTTPException(status_code=500, detail="Failed to apply style transfer")
        
        print(f"✅ Style transfer applied successfully")
        
        return {
            "success": True,
            "styled_image_url": image_url,
            "style_type": request.style_type,
            "preset_style": request.preset_style,
            "style_strength": request.style_strength,
            "settings": {
                "preserve_content": request.preserve_content,
                "color_preservation": request.color_preservation,
                "guidance_scale": guidance_scale,
                "steps": steps
            }
        }
        
    except Exception as e:
        print(f"❌ Style transfer error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Style transfer failed: {str(e)}")

@app.post("/api/image/batch-process")
async def batch_process_images(
    images: List[UploadFile] = File(...),
    operation: str = Form("enhance"),
    style: str = Form("photographic"),
    strength: float = Form(0.7)
):
    """Process multiple images in batch with the same operation"""
    try:
        print(f"📦 Batch processing {len(images)} images with {operation}")
        
        if len(images) > 20:
            raise HTTPException(status_code=400, detail="Maximum 20 images allowed for batch processing")
        
        results = []
        
        for i, image_file in enumerate(images):
            print(f"   Processing image {i+1}/{len(images)}: {image_file.filename}")
            
            # Read and convert image to base64
            image_data = await image_file.read()
            image_base64 = base64.b64encode(image_data).decode('utf-8')
            image_url = f"data:image/png;base64,{image_base64}"
            
            # Build operation prompt
            operation_prompts = {
                "enhance": f"enhance and improve image quality, {style} style, professional photography",
                "stylize": f"apply {style} artistic style transformation, creative enhancement",
                "restore": f"restore and repair image, remove noise, enhance clarity, {style} quality",
                "colorize": f"enhance colors and saturation, {style} color grading, vibrant enhancement",
                "upscale": f"upscale and enhance resolution, {style} quality, sharp details"
            }
            
            process_prompt = operation_prompts.get(operation, f"{operation} image processing, {style} style")
            
            params = {
                "image_url": image_url,
                "aspect_ratio": "1:1",
                "seed": 5555 + i,  # Different seed for each image
                "guidance_scale": 7.5 + strength,
            }
            
            try:
                result = await call_bria_api("image", process_prompt, params)
                
                # Extract result URL
                result_url = None
                if "result" in result and isinstance(result["result"], dict):
                    result_url = result["result"].get("image_url")
                
                results.append({
                    "original_filename": image_file.filename,
                    "success": True,
                    "processed_url": result_url,
                    "operation": operation,
                    "style": style
                })
                
            except Exception as e:
                print(f"      ❌ Failed to process {image_file.filename}: {str(e)}")
                results.append({
                    "original_filename": image_file.filename,
                    "success": False,
                    "error": str(e),
                    "operation": operation,
                    "style": style
                })
        
        successful_count = sum(1 for r in results if r["success"])
        
        print(f"✅ Batch processing complete: {successful_count}/{len(images)} successful")
        
        return {
            "success": True,
            "total_images": len(images),
            "successful_count": successful_count,
            "failed_count": len(images) - successful_count,
            "operation": operation,
            "style": style,
            "strength": strength,
            "results": results
        }
        
    except Exception as e:
        print(f"❌ Batch processing error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Batch processing failed: {str(e)}")

# ============================================================================
# JSON TO IMAGE FEATURE
# ============================================================================

class JsonToImageRequest(BaseModel):
    jsonData: str
    visualStyle: Optional[str] = "modern"
    colorScheme: Optional[str] = "blue"
    layout: Optional[str] = "tree"

@app.post("/api/json-to-image")
async def convert_json_to_image(request: JsonToImageRequest):
    """Convert JSON data to visual image representation"""
    try:
        print(f"🎨 Converting JSON to image with {request.visualStyle} style")
        
        # Validate JSON
        try:
            json_obj = json.loads(request.jsonData)
        except json.JSONDecodeError as e:
            raise HTTPException(status_code=400, detail=f"Invalid JSON: {str(e)}")
        
        # Analyze JSON structure
        def analyze_json_structure(obj, depth=0):
            if isinstance(obj, dict):
                return {
                    "type": "object",
                    "keys": list(obj.keys()),
                    "depth": depth,
                    "size": len(obj),
                    "children": {k: analyze_json_structure(v, depth+1) for k, v in obj.items()}
                }
            elif isinstance(obj, list):
                return {
                    "type": "array",
                    "length": len(obj),
                    "depth": depth,
                    "children": [analyze_json_structure(item, depth+1) for item in obj[:5]]  # Limit to first 5 items
                }
            else:
                return {
                    "type": type(obj).__name__,
                    "value": str(obj)[:50],  # Truncate long values
                    "depth": depth
                }
        
        structure = analyze_json_structure(json_obj)
        
        # Build visualization prompt based on style and layout
        style_descriptions = {
            "modern": "clean modern design, sleek typography, minimalist aesthetic, professional layout",
            "minimal": "ultra-minimal design, lots of white space, simple lines, elegant typography",
            "technical": "technical diagram style, monospace fonts, grid layout, engineering aesthetic",
            "artistic": "creative artistic visualization, flowing organic shapes, expressive design",
            "infographic": "professional infographic style, clear hierarchy, data visualization elements"
        }
        
        color_schemes = {
            "blue": "blue color palette, navy and light blue tones, professional blue theme",
            "green": "green color scheme, forest and mint green tones, natural green palette",
            "purple": "purple color palette, deep purple and lavender tones, elegant purple theme",
            "orange": "orange color scheme, warm orange and amber tones, energetic orange palette",
            "monochrome": "black and white monochrome, grayscale tones, high contrast",
            "rainbow": "vibrant rainbow colors, multicolor palette, bright and colorful"
        }
        
        layout_descriptions = {
            "tree": "hierarchical tree structure, branching layout, parent-child relationships",
            "graph": "network graph visualization, connected nodes, relationship mapping",
            "table": "structured table format, rows and columns, organized data grid",
            "chart": "chart and graph visualization, data representation, statistical display",
            "mindmap": "mind map style, central topic with branches, organic flow"
        }
        
        # Count data elements for complexity
        def count_elements(obj):
            if isinstance(obj, dict):
                return sum(count_elements(v) for v in obj.values()) + len(obj)
            elif isinstance(obj, list):
                return sum(count_elements(item) for item in obj) + len(obj)
            else:
                return 1
        
        element_count = count_elements(json_obj)
        complexity = "simple" if element_count < 10 else "moderate" if element_count < 50 else "complex"
        
        # Build comprehensive prompt
        prompt = f"Create a {complexity} data visualization of JSON structure, "
        prompt += f"{style_descriptions[request.visualStyle]}, "
        prompt += f"{color_schemes[request.colorScheme]}, "
        prompt += f"{layout_descriptions[request.layout]}, "
        
        # Add structure-specific details
        if structure["type"] == "object":
            prompt += f"showing {len(structure['keys'])} main properties: {', '.join(structure['keys'][:5])}, "
        elif structure["type"] == "array":
            prompt += f"displaying array with {structure['length']} items, "
        
        prompt += f"maximum depth of {structure.get('depth', 0)} levels, "
        prompt += "clear labels and connections, readable typography, professional data visualization, "
        prompt += "high quality digital illustration, clean and organized layout"
        
        # Generate image using BRIA API
        params = {
            "aspect_ratio": "16:9",  # Good for data visualization
            "seed": hash(request.jsonData) % 10000,  # Consistent seed based on JSON content
            "guidance_scale": 8.0,  # Higher guidance for structured content
            "num_inference_steps": 35,  # More steps for detailed visualization
        }
        
        print(f"   📊 JSON structure: {structure['type']} with {element_count} elements")
        print(f"   🎨 Style: {request.visualStyle}, Colors: {request.colorScheme}, Layout: {request.layout}")
        
        result = await call_bria_api("image", prompt, params)
        
        # Extract image URL
        image_url = None
        if "result" in result and isinstance(result["result"], dict):
            image_url = result["result"].get("image_url")
        
        if not image_url:
            raise HTTPException(status_code=500, detail="Failed to generate JSON visualization")
        
        print(f"✅ JSON visualization generated successfully")
        
        return {
            "success": True,
            "image": {
                "url": image_url,
                "width": 1024,
                "height": 576,  # 16:9 aspect ratio
                "content_type": "image/png"
            },
            "analysis": {
                "structure_type": structure["type"],
                "element_count": element_count,
                "complexity": complexity,
                "max_depth": structure.get("depth", 0)
            },
            "settings": {
                "visual_style": request.visualStyle,
                "color_scheme": request.colorScheme,
                "layout": request.layout
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ JSON to image conversion error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"JSON to image conversion failed: {str(e)}")

# ============================================================================
# END JSON TO IMAGE FEATURE
# ============================================================================





# ============================================================================
# SYSTEM ARCHITECTURE GENERATOR FEATURE
# ============================================================================

class SystemArchitectureAnalyzeRequest(BaseModel):
    prompt: str
    systemType: Optional[str] = "web-application"
    architectureStyle: Optional[str] = "microservices"
    scale: Optional[str] = "medium"

class SystemArchitectureGenerateRequest(BaseModel):
    system_architecture: Dict[str, Any]
    analyzed_prompt: str
    diagram_types: List[str] = ["overview", "data-flow", "component", "deployment", "tech-stack"]

async def analyze_system_architecture_prompt(prompt: str, system_type: str, architecture_style: str, scale: str) -> Dict[str, Any]:
    """Use Gemini to analyze system prompt and create comprehensive architecture"""
    if not gemini_model:
        # Fallback system architecture
        return {
            "analyzed_prompt": f"Professional {architecture_style} {system_type} architecture for {scale} scale: {prompt}",
            "system_architecture": {
                "systemName": "Generated System",
                "description": prompt[:200],
                "systemType": system_type,
                "scale": scale,
                "components": {
                    "frontend": [{"name": "Web App", "type": "SPA", "category": "frontend", "description": "Single page application", "technologies": ["React"], "connections": ["API Gateway"]}],
                    "backend": [{"name": "API Service", "type": "REST API", "category": "backend", "description": "Main API service", "technologies": ["Node.js"], "connections": ["Database"]}],
                    "database": [{"name": "Primary DB", "type": "SQL", "category": "database", "description": "Main database", "technologies": ["PostgreSQL"], "connections": []}],
                    "infrastructure": [{"name": "Load Balancer", "type": "LB", "category": "infrastructure", "description": "Traffic distribution", "technologies": ["AWS ALB"], "connections": []}],
                    "external": []
                },
                "dataFlow": [{"source": "Frontend", "target": "Backend", "description": "API calls", "type": "HTTP"}],
                "technologies": {
                    "languages": ["JavaScript", "SQL"],
                    "frameworks": ["React", "Express"],
                    "databases": ["PostgreSQL"],
                    "infrastructure": ["AWS", "Docker"],
                    "tools": ["Git", "CI/CD"]
                },
                "architecture_patterns": ["Microservices", "REST API"],
                "scalability_features": ["Load Balancing", "Horizontal Scaling"],
                "security_measures": ["HTTPS", "Authentication"]
            }
        }
    
    try:
        analysis_prompt = f"""You are a senior software architect and system designer. Analyze this system description and create a comprehensive technical architecture.

System Description: "{prompt}"
System Type: {system_type}
Architecture Style: {architecture_style}
Scale: {scale}

Create a detailed system architecture analysis with:

1. ENHANCED TECHNICAL PROMPT: Rewrite the original prompt with professional technical terminology, specific requirements, scalability needs, and architectural considerations.

2. COMPLETE SYSTEM ARCHITECTURE JSON: Create a structured architecture with:

{{
  "systemName": "Clear system name",
  "description": "Detailed technical description with architectural goals",
  "systemType": "{system_type}",
  "scale": "{scale}",
  "components": {{
    "frontend": [
      {{
        "name": "Component name",
        "type": "Component type (SPA, Mobile App, etc.)",
        "category": "frontend",
        "description": "What this component does",
        "technologies": ["React", "TypeScript", "etc."],
        "connections": ["API Gateway", "CDN"]
      }}
    ],
    "backend": [
      {{
        "name": "Service name",
        "type": "Service type (API, Microservice, etc.)",
        "category": "backend", 
        "description": "Service responsibility",
        "technologies": ["Node.js", "Python", "etc."],
        "connections": ["Database", "Cache", "Queue"]
      }}
    ],
    "database": [
      {{
        "name": "Database name",
        "type": "Database type (SQL, NoSQL, etc.)",
        "category": "database",
        "description": "Data storage purpose",
        "technologies": ["PostgreSQL", "Redis", "etc."],
        "connections": ["Backup Service"]
      }}
    ],
    "infrastructure": [
      {{
        "name": "Infrastructure component",
        "type": "Component type (Load Balancer, CDN, etc.)",
        "category": "infrastructure",
        "description": "Infrastructure purpose",
        "technologies": ["AWS ALB", "CloudFront", "etc."],
        "connections": ["Backend Services"]
      }}
    ],
    "external": [
      {{
        "name": "External service",
        "type": "Service type (Payment, Auth, etc.)",
        "category": "external",
        "description": "External integration purpose",
        "technologies": ["Stripe", "Auth0", "etc."],
        "connections": ["API Gateway"]
      }}
    ]
  }},
  "dataFlow": [
    {{
      "source": "Frontend",
      "target": "API Gateway", 
      "description": "User requests",
      "type": "HTTPS"
    }},
    {{
      "source": "API Gateway",
      "target": "Backend Services",
      "description": "Routed requests", 
      "type": "HTTP"
    }}
  ],
  "technologies": {{
    "languages": ["JavaScript", "Python", "Go", "SQL"],
    "frameworks": ["React", "Express", "FastAPI", "Django"],
    "databases": ["PostgreSQL", "Redis", "MongoDB", "Elasticsearch"],
    "infrastructure": ["AWS", "Docker", "Kubernetes", "Terraform"],
    "tools": ["Git", "Jenkins", "Monitoring", "Logging"]
  }},
  "architecture_patterns": [
    "Microservices Architecture",
    "Event-Driven Architecture", 
    "CQRS",
    "API Gateway Pattern",
    "Circuit Breaker"
  ],
  "scalability_features": [
    "Horizontal Pod Autoscaling",
    "Database Sharding",
    "CDN Distribution",
    "Caching Strategy",
    "Load Balancing"
  ],
  "security_measures": [
    "OAuth 2.0 Authentication",
    "JWT Tokens",
    "HTTPS/TLS Encryption",
    "API Rate Limiting",
    "Input Validation",
    "SQL Injection Prevention"
  ]
}}

Make the architecture specific to the system type, scale, and style. Include appropriate technologies, patterns, and scalability considerations for the intended use case.

Respond with JSON in this exact format:
{{
  "analyzed_prompt": "Enhanced technical system description with architectural specifications",
  "system_architecture": {{ ... complete system architecture object ... }}
}}"""

        response = gemini_model.generate_content(analysis_prompt)
        text = response.text.strip()
        
        # Clean markdown
        if text.startswith("```"):
            lines = text.split("\n")
            text = "\n".join(lines[1:-1])
            if text.startswith("json"):
                text = text[4:]
        text = text.strip()
        
        result = json.loads(text)
        
        print(f"   ✅ System architecture analyzed: {result['system_architecture']['systemName']}")
        return result
        
    except Exception as e:
        print(f"   ❌ System architecture analysis error: {str(e)}")
        # Fallback to basic architecture
        return {
            "analyzed_prompt": f"Professional {architecture_style} {system_type} system architecture for {scale} scale. {prompt}. Focus on scalability, reliability, and modern architectural patterns.",
            "system_architecture": {
                "systemName": "AI Generated System Architecture",
                "description": prompt,
                "systemType": system_type,
                "scale": scale,
                "components": {
                    "frontend": [
                        {
                            "name": "Web Application",
                            "type": "Single Page Application",
                            "category": "frontend",
                            "description": "User interface and client-side logic",
                            "technologies": ["React", "TypeScript", "Webpack"],
                            "connections": ["API Gateway", "CDN"]
                        }
                    ],
                    "backend": [
                        {
                            "name": "API Gateway",
                            "type": "Gateway Service",
                            "category": "backend",
                            "description": "Request routing and authentication",
                            "technologies": ["Express.js", "JWT"],
                            "connections": ["Microservices", "Database"]
                        },
                        {
                            "name": "Business Logic Service",
                            "type": "Microservice",
                            "category": "backend", 
                            "description": "Core business logic processing",
                            "technologies": ["Node.js", "Express"],
                            "connections": ["Database", "Cache", "Message Queue"]
                        }
                    ],
                    "database": [
                        {
                            "name": "Primary Database",
                            "type": "Relational Database",
                            "category": "database",
                            "description": "Main data storage",
                            "technologies": ["PostgreSQL"],
                            "connections": ["Read Replicas"]
                        },
                        {
                            "name": "Cache Layer",
                            "type": "In-Memory Cache",
                            "category": "database",
                            "description": "High-speed data access",
                            "technologies": ["Redis"],
                            "connections": ["Backend Services"]
                        }
                    ],
                    "infrastructure": [
                        {
                            "name": "Load Balancer",
                            "type": "Application Load Balancer",
                            "category": "infrastructure",
                            "description": "Traffic distribution and high availability",
                            "technologies": ["AWS ALB", "NGINX"],
                            "connections": ["Backend Services"]
                        },
                        {
                            "name": "Container Orchestration",
                            "type": "Kubernetes Cluster",
                            "category": "infrastructure",
                            "description": "Container management and scaling",
                            "technologies": ["Kubernetes", "Docker"],
                            "connections": ["All Services"]
                        }
                    ],
                    "external": [
                        {
                            "name": "Authentication Service",
                            "type": "Identity Provider",
                            "category": "external",
                            "description": "User authentication and authorization",
                            "technologies": ["Auth0", "OAuth 2.0"],
                            "connections": ["API Gateway"]
                        }
                    ]
                },
                "dataFlow": [
                    {"source": "Web Application", "target": "Load Balancer", "description": "User requests", "type": "HTTPS"},
                    {"source": "Load Balancer", "target": "API Gateway", "description": "Routed requests", "type": "HTTP"},
                    {"source": "API Gateway", "target": "Business Logic Service", "description": "Authenticated requests", "type": "HTTP"},
                    {"source": "Business Logic Service", "target": "Primary Database", "description": "Data operations", "type": "SQL"},
                    {"source": "Business Logic Service", "target": "Cache Layer", "description": "Cache operations", "type": "Redis Protocol"}
                ],
                "technologies": {
                    "languages": ["JavaScript", "TypeScript", "SQL"],
                    "frameworks": ["React", "Express.js", "Node.js"],
                    "databases": ["PostgreSQL", "Redis"],
                    "infrastructure": ["AWS", "Docker", "Kubernetes", "NGINX"],
                    "tools": ["Git", "CI/CD", "Monitoring", "Logging"]
                },
                "architecture_patterns": [
                    "Microservices Architecture",
                    "API Gateway Pattern",
                    "Database per Service",
                    "Event Sourcing",
                    "CQRS"
                ],
                "scalability_features": [
                    "Horizontal Pod Autoscaling",
                    "Database Read Replicas",
                    "CDN Distribution",
                    "Redis Caching",
                    "Load Balancing",
                    "Container Orchestration"
                ],
                "security_measures": [
                    "OAuth 2.0 Authentication",
                    "JWT Token Validation",
                    "HTTPS/TLS Encryption",
                    "API Rate Limiting",
                    "Input Sanitization",
                    "Network Security Groups"
                ]
            }
        }

@app.post("/api/system-architecture/analyze")
async def analyze_system_architecture(request: SystemArchitectureAnalyzeRequest):
    """Analyze system prompt and generate comprehensive architecture"""
    try:
        print(f"🏗️  Analyzing system architecture: {request.prompt[:50]}...")
        
        result = await analyze_system_architecture_prompt(
            request.prompt,
            request.systemType,
            request.architectureStyle,
            request.scale
        )
        
        print(f"✅ System architecture analysis complete")
        return result
        
    except Exception as e:
        print(f"❌ System architecture analysis error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"System architecture analysis failed: {str(e)}")

@app.post("/api/system-architecture/generate")
async def generate_system_architecture_diagrams(request: SystemArchitectureGenerateRequest):
    """Generate professional system architecture diagrams"""
    try:
        print(f"📊 Generating system architecture diagrams...")
        
        system_arch = request.system_architecture
        base_prompt = request.analyzed_prompt
        
        # Define diagram generation prompts for different views
        diagram_prompts = {
            "overview": f"Complete system architecture overview diagram, {base_prompt}, showing all components: frontend, backend, database, infrastructure, external services, clean technical diagram style, professional system architecture documentation, boxes and arrows, component relationships, high-level system view",
            
            "data-flow": f"Data flow diagram, {base_prompt}, showing data movement between components, arrows indicating data direction, request/response flows, database transactions, API calls, message queues, technical flow diagram, professional documentation style",
            
            "component": f"Detailed component architecture diagram, {base_prompt}, microservices breakdown, component interactions, service boundaries, API endpoints, database connections, technical component diagram, software architecture visualization",
            
            "deployment": f"Deployment architecture diagram, {base_prompt}, infrastructure layout, servers, containers, load balancers, CDN, cloud services, network topology, deployment view, infrastructure as code visualization, DevOps architecture",
            
            "tech-stack": f"Technology stack visualization, {base_prompt}, tech stack layers, programming languages, frameworks, databases, infrastructure tools, technology logos and icons, modern tech stack diagram, development stack overview"
        }
        
        generated_images = []
        
        for diagram_type in request.diagram_types:
            if diagram_type in diagram_prompts:
                print(f"   📈 Generating {diagram_type} diagram...")
                
                prompt = diagram_prompts[diagram_type]
                
                # Add specific technology context
                if system_arch.get('technologies'):
                    tech_context = f", technologies: {', '.join(system_arch['technologies'].get('languages', [])[:3])}"
                    prompt += tech_context
                
                # Generate diagram using BRIA API
                params = {
                    "aspect_ratio": "16:9",  # Good for technical diagrams
                    "seed": hash(f"{system_arch.get('systemName', 'system')}-{diagram_type}") % 10000,
                    "guidance_scale": 9.0,  # Higher guidance for technical accuracy
                    "num_inference_steps": 45,  # More steps for detailed diagrams
                }
                
                result = await call_bria_api("image", prompt, params)
                
                # Extract image URL
                image_url = None
                if "result" in result and isinstance(result["result"], dict):
                    image_url = result["result"].get("image_url")
                
                if image_url:
                    generated_images.append(image_url)
                    print(f"      ✅ {diagram_type} diagram generated")
                else:
                    print(f"      ❌ Failed to generate {diagram_type} diagram")
        
        print(f"✅ Generated {len(generated_images)} architecture diagrams")
        
        return {
            "success": True,
            "images": generated_images,
            "system_architecture": system_arch,
            "diagram_types": request.diagram_types
        }
        
    except Exception as e:
        print(f"❌ System architecture diagram generation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Architecture diagram generation failed: {str(e)}")

# ============================================================================
# END SYSTEM ARCHITECTURE GENERATOR FEATURE
# ============================================================================

# ============================================================================
# END ADVANCED IMAGE PROCESSING ENDPOINTS
# ============================================================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
