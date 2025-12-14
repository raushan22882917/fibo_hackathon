// API Configuration from environment variables
export const API_CONFIG = {
  // Get backend URL from environment variables
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://fibo-hackathon-backend-121270846496.us-central1.run.app',
  
  // Fallback to local development if needed
  LOCAL_URL: import.meta.env.VITE_API_LOCAL_URL || 'http://127.0.0.1:8000',
  
  // Check if we're in development mode
  IS_DEVELOPMENT: import.meta.env.DEV,
  
  // Use local in development, production otherwise
  USE_LOCAL: import.meta.env.VITE_USE_LOCAL_API === 'true'
};

// Get the appropriate API base URL
export const getApiBaseUrl = (): string => {
  // Use local API if explicitly set or in development mode and local server is preferred
  if (API_CONFIG.USE_LOCAL || (API_CONFIG.IS_DEVELOPMENT && import.meta.env.VITE_PREFER_LOCAL === 'true')) {
    return API_CONFIG.LOCAL_URL;
  }
  
  // Otherwise use the production backend
  return API_CONFIG.BASE_URL;
};

// API endpoints
export const API_ENDPOINTS = {
  // JSON to Image
  JSON_TO_IMAGE: '/api/json-to-image',
  
  // System Architecture
  SYSTEM_ARCHITECTURE_ANALYZE: '/api/system-architecture/analyze',
  SYSTEM_ARCHITECTURE_GENERATE: '/api/system-architecture/generate',
  
  // Music & Video
  MUSIC_DOWNLOAD_YOUTUBE: '/api/music/download-youtube',
  MUSIC_ANALYZE: '/api/music/analyze',
  MUSIC_GENERATE_STORY: '/api/music/generate-story',
  MUSIC_GENERATE_VIDEO: '/api/music/generate-video',
  MUSIC_GENERATE_LYRIC_VIDEO: '/api/music/generate-lyric-video',
  MUSIC_CARTOONIZE_IMAGE: '/api/music/cartoonize-image',
  
  // Slideshow
  SLIDESHOW_GENERATE: '/api/slideshow/generate',
  
  // Workflow
  WORKFLOW_EXECUTE: '/api/workflow/execute',
  WORKFLOW_SAVE: '/api/workflow/save',
  WORKFLOW_TEMPLATES: '/api/workflow/templates',
  
  // Generation
  GENERATE: '/api/generate',
  ANALYZE_PROMPT: '/api/analyze-prompt',
  STRUCTURED_PROMPT: '/api/structured-prompt',
  PREVIEW_VIDEO_PROMPTS: '/api/preview-video-prompts',
  
  // Health
  HEALTH: '/health'
};

// Helper function to build full API URL
export const buildApiUrl = (endpoint: string): string => {
  return `${getApiBaseUrl()}${endpoint}`;
};

// Helper function for making API calls with consistent error handling
export const apiCall = async (endpoint: string, options: RequestInit = {}): Promise<Response> => {
  const url = buildApiUrl(endpoint);
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    mode: 'cors', // Enable CORS
    credentials: 'omit', // Don't send credentials for cross-origin requests
    ...options,
  };

  try {
    console.log(`Making API call to: ${url}`);
    const response = await fetch(url, defaultOptions);
    
    if (!response.ok) {
      console.error(`API call failed with status ${response.status}: ${response.statusText}`);
    }
    
    return response;
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error);
    
    // If it's a connection error, try to provide helpful information
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      console.error('This might be a CORS issue or the server is not accessible');
      console.error('Current API URL:', url);
      console.error('Check if the backend server is running and CORS is properly configured');
    }
    
    throw error;
  }
};

// Test API connection
export const testApiConnection = async (): Promise<boolean> => {
  try {
    const response = await apiCall('/health', { method: 'GET' });
    return response.ok;
  } catch (error) {
    console.error('API connection test failed:', error);
    return false;
  }
};

// Get the current API base URL being used
export const getCurrentApiUrl = (): string => {
  return getApiBaseUrl();
};

// Get API status information
export const getApiStatus = async (): Promise<{
  url: string;
  isConnected: boolean;
  isProduction: boolean;
}> => {
  const url = getCurrentApiUrl();
  const isProduction = url.includes('fibo-hackathon-backend');
  const isConnected = await testApiConnection();
  
  return {
    url,
    isConnected,
    isProduction
  };
};