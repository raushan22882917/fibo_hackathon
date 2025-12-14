import { create } from "zustand";
import { StructuredPrompt } from "@/lib/bria-api";

export interface Character {
  id: string;
  name: string;
  description?: string;
  clothing?: string;
  expression?: string;
  pose?: string;
}

export interface CameraSettings {
  fov: number;
  lens: string;
  exposure: number;
  dof: number;
  hdrEnabled: boolean;
  angle: string;
}

export interface SceneSettings {
  environment: string;
  timeOfDay: string;
  lightIntensity: number;
  lightTemperature: number;
  objects: Array<{
    id: number;
    name: string;
    x: number;
    y: number;
    z: number;
  }>;
}

export interface ColorSettings {
  contrast: number;
  saturation: number;
  lut: string;
  filmGrain: number;
  bloom: number;
  sharpness: number;
}

export interface VideoState {
  // Generation state
  prompt: string;
  style: string;
  aspectRatio: string;
  seed: number;
  stepsNum: number;
  guidanceScale: number;
  
  // Structured prompt (from BRIA)
  structuredPrompt: StructuredPrompt | null;
  
  // Generated result
  generatedImageUrl: string | null;
  isGenerating: boolean;
  generationError: string | null;
  generationProgress: string;
  detectedCategory: string | null;
  categoryConfidence: number | null;
  
  // Multi-frame video generation
  videoTimeline: any | null;
  framesGenerated: number;
  totalFramesToGenerate: number;
  
  // Editor settings
  characters: Character[];
  selectedCharacter: string | null;
  camera: CameraSettings;
  scene: SceneSettings;
  colors: ColorSettings;
  
  // Timeline
  currentFrame: number;
  totalFrames: number;
  
  // Actions
  setPrompt: (prompt: string) => void;
  setStyle: (style: string) => void;
  setAspectRatio: (ratio: string) => void;
  setSeed: (seed: number) => void;
  setStepsNum: (steps: number) => void;
  setGuidanceScale: (scale: number) => void;
  setStructuredPrompt: (prompt: StructuredPrompt | null) => void;
  setGeneratedImageUrl: (url: string | null) => void;
  setIsGenerating: (generating: boolean) => void;
  setGenerationError: (error: string | null) => void;
  setGenerationProgress: (progress: string) => void;
  setDetectedCategory: (category: string | null, confidence?: number | null) => void;
  setVideoTimeline: (timeline: any | null) => void;
  setFramesGenerated: (frames: number) => void;
  setTotalFramesToGenerate: (total: number) => void;
  setSelectedCharacter: (id: string | null) => void;
  updateCamera: (settings: Partial<CameraSettings>) => void;
  updateScene: (settings: Partial<SceneSettings>) => void;
  updateColors: (settings: Partial<ColorSettings>) => void;
  setCurrentFrame: (frame: number) => void;
  reset: () => void;
}

const initialState = {
  prompt: "",
  style: "Cinematic",
  aspectRatio: "16:9",
  seed: 5555,
  stepsNum: 50,
  guidanceScale: 5,
  structuredPrompt: null,
  generatedImageUrl: null,
  isGenerating: false,
  generationError: null,
  generationProgress: "",
  detectedCategory: null,
  categoryConfidence: null,
  videoTimeline: null,
  framesGenerated: 0,
  totalFramesToGenerate: 0,
  characters: [
    { id: "C1", name: "Character 1" },
    { id: "C2", name: "Character 2" },
  ],
  selectedCharacter: "C1",
  camera: {
    fov: 35,
    lens: "35mm",
    exposure: 0,
    dof: 50,
    hdrEnabled: true,
    angle: "eye",
  },
  scene: {
    environment: "studio",
    timeOfDay: "Morning",
    lightIntensity: 75,
    lightTemperature: 50,
    objects: [
      { id: 1, name: "Table", x: 0, y: 0, z: 0 },
      { id: 2, name: "Chair", x: 1, y: 0, z: -1 },
    ],
  },
  colors: {
    contrast: 0,
    saturation: 0,
    lut: "none",
    filmGrain: 0,
    bloom: 0,
    sharpness: 50,
  },
  currentFrame: 0,
  totalFrames: 120,
};

export const useVideoStore = create<VideoState>((set) => ({
  ...initialState,
  
  setPrompt: (prompt) => set({ prompt }),
  setStyle: (style) => set({ style }),
  setAspectRatio: (aspectRatio) => set({ aspectRatio }),
  setSeed: (seed) => set({ seed }),
  setStepsNum: (stepsNum) => set({ stepsNum }),
  setGuidanceScale: (guidanceScale) => set({ guidanceScale }),
  setStructuredPrompt: (structuredPrompt) => set({ structuredPrompt }),
  setGeneratedImageUrl: (generatedImageUrl) => set({ generatedImageUrl }),
  setIsGenerating: (isGenerating) => set({ isGenerating }),
  setGenerationError: (generationError) => set({ generationError }),
  setGenerationProgress: (generationProgress) => set({ generationProgress }),
  setDetectedCategory: (detectedCategory, categoryConfidence = null) => 
    set({ detectedCategory, categoryConfidence }),
  setVideoTimeline: (videoTimeline) => set({ videoTimeline }),
  setFramesGenerated: (framesGenerated) => set({ framesGenerated }),
  setTotalFramesToGenerate: (totalFramesToGenerate) => set({ totalFramesToGenerate }),
  setSelectedCharacter: (selectedCharacter) => set({ selectedCharacter }),
  
  updateCamera: (settings) => 
    set((state) => ({ camera: { ...state.camera, ...settings } })),
  
  updateScene: (settings) => 
    set((state) => ({ scene: { ...state.scene, ...settings } })),
  
  updateColors: (settings) => 
    set((state) => ({ colors: { ...state.colors, ...settings } })),
  
  setCurrentFrame: (currentFrame) => set({ currentFrame }),
  
  reset: () => set(initialState),
}));
