// Backend API endpoint
import { getApiBaseUrl } from '@/config/api';

const getApiUrl = () => getApiBaseUrl();

export interface StructuredPrompt {
  short_description?: string;
  objects?: Array<{
    description?: string;
    location?: string;
    relationship: string;
    relative_size?: string;
    shape_and_color?: string;
    texture?: string;
    appearance_details?: string;
    number_of_objects?: number;
    pose?: string;
    expression?: string;
    clothing?: string;
    action?: string;
    gender?: string;
    skin_tone_and_texture?: string;
    orientation?: string;
  }>;
  background_setting?: string;
  lighting?: {
    conditions?: string;
    direction?: string;
    shadows?: string;
  };
  aesthetics?: {
    composition?: string;
    color_scheme?: string;
    mood_atmosphere?: string;
  };
  photographic_characteristics?: {
    depth_of_field?: string;
    focus?: string;
    camera_angle?: string;
    lens_focal_length?: string;
  };
  style_medium?: string;
  context?: string;
  artistic_style?: string;
}

export interface BriaGenerateRequest {
  prompt?: string;
  structured_prompt?: StructuredPrompt;
  seed?: number;
  steps_num?: number;
  aspect_ratio?: string;
  negative_prompt?: string;
  guidance_scale?: number;
  image_url?: string;
  force_category?: string;  // Manual category override: "image", "video", "ads", "tailored", "image-to-video"
  tailored_model_id?: string;  // For tailored models
}

export interface BriaImage {
  url: string;
  content_type?: string;
  file_name?: string;
  file_size?: number;
  width?: number;
  height?: number;
}

export interface BriaGenerateResponse {
  image?: BriaImage;
  images?: BriaImage[];
  structured_prompt?: StructuredPrompt;
  category?: string;
  confidence?: number;
  reasoning?: string;
  error?: string;
  details?: string;
  url?: string;  // Direct URL field
  result_url?: string;  // BRIA v2 async result
  // Video generation fields
  timeline?: {
    total_frames: number;
    fps: number;
    duration: number;
    frames: Array<{
      frame_number: number;
      timestamp: number;
      description: string;
      image_url?: string;
    }>;
  };
  frames_generated?: number;
  method?: string;
}

export interface BriaStructuredPromptResponse {
  structured_prompt: StructuredPrompt;
  error?: string;
  details?: string;
}

// Convert text prompt to structured JSON using local backend
export async function convertToStructuredPrompt(
  prompt: string,
  seed?: number
): Promise<BriaStructuredPromptResponse> {
  try {
    const response = await fetch(`${getApiUrl()}/api/structured-prompt`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt, seed }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error);
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to convert prompt to structured format");
  }
}

// Generate image using local backend with Stable Diffusion
export async function generateImage(
  request: BriaGenerateRequest
): Promise<BriaGenerateResponse> {
  try {
    const response = await fetch(`${getApiUrl()}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: request.prompt,
        structured_prompt: request.structured_prompt,
        seed: request.seed,
        num_inference_steps: request.steps_num || 30,
        aspect_ratio: request.aspect_ratio || "1:1",
        guidance_scale: request.guidance_scale || 7.5,
        negative_prompt: request.negative_prompt,
        force_category: request.force_category,
        tailored_model_id: request.tailored_model_id,
        image_url: request.image_url,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error);
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to generate image");
  }
}

// Full pipeline: text prompt -> structured JSON -> image
export async function generateFromPrompt(
  prompt: string,
  options: Omit<BriaGenerateRequest, "prompt" | "structured_prompt"> = {}
): Promise<BriaGenerateResponse> {
  // Step 1: Convert prompt to structured JSON
  const structuredResult = await convertToStructuredPrompt(prompt, options.seed);
  
  // Step 2: Generate image from structured prompt
  const imageResult = await generateImage({
    structured_prompt: structuredResult.structured_prompt,
    ...options,
  });

  return imageResult;
}

// Generate directly from structured prompt (for editing controls)
export async function generateFromStructured(
  structured_prompt: StructuredPrompt,
  options: Omit<BriaGenerateRequest, "prompt" | "structured_prompt"> = {}
): Promise<BriaGenerateResponse> {
  return generateImage({
    structured_prompt,
    ...options,
  });
}

// Preview video prompts before generation
export async function previewVideoPrompts(
  prompt: string,
  options: Omit<BriaGenerateRequest, "prompt" | "structured_prompt"> = {}
): Promise<any> {
  try {
    const response = await fetch(`${getApiUrl()}/api/preview-video-prompts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        seed: options.seed,
        aspect_ratio: options.aspect_ratio,
        force_category: "video",
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to preview video prompts");
  }
}

// Health check for backend connection
export async function checkBackendHealth(): Promise<{
  status: string;
  model_loaded: boolean;
  cuda_available: boolean;
}> {
  try {
    const response = await fetch(`${getApiUrl()}/health`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    throw new Error(`Backend is not reachable. Make sure it's running on ${getApiUrl()}`);
  }
}
