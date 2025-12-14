#!/bin/bash

# Deployment script for Google Cloud Run
# Make sure you have gcloud CLI installed and authenticated

set -e

echo "🚀 Deploying FIBO Hackathon Backend to Google Cloud Run..."

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ gcloud CLI not found. Please install it first:"
    echo "   https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check if user is authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo "❌ Not authenticated with gcloud. Please run:"
    echo "   gcloud auth login"
    exit 1
fi

# Get project ID
PROJECT_ID=$(gcloud config get-value project)
if [ -z "$PROJECT_ID" ]; then
    echo "❌ No project set. Please run:"
    echo "   gcloud config set project YOUR_PROJECT_ID"
    exit 1
fi

echo "📋 Project ID: $PROJECT_ID"

# Enable required APIs
echo "🔧 Enabling required Google Cloud APIs..."
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com

# Build and deploy using Cloud Build
echo "🏗️  Building and deploying with Cloud Build..."
gcloud builds submit --config cloudbuild.yaml

echo "✅ Deployment complete!"
echo ""
echo "🌐 Your API should be available at:"
gcloud run services describe fibo-hackathon-backend --region=us-central1 --format="value(status.url)"
echo ""
echo "📝 Next steps:"
echo "1. Set your environment variables in Cloud Run console:"
echo "   - GEMINI_API_KEY"
echo "   - BRIA_API_KEY" 
echo "   - YOUTUBE_API_KEY"
echo "2. Test your API at: [YOUR_URL]/health"
echo "3. Update CORS origins in main.py if needed"