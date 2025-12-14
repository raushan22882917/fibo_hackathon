# BRIA FIBO Backend (Gemini + BRIA APIs)

⚡ **Fast, intelligent content generation** using Google Gemini AI for routing and BRIA APIs for professional-quality results.

## 🚀 Quick Start

### 1. Setup (One-time)
```bash
setup_new.bat
```

### 2. Configure API Keys
Edit `.env` file:
```
GEMINI_API_KEY=your_gemini_key_here
BRIA_API_KEY=your_bria_key_here
```

**Get Keys:**
- **Gemini** (FREE): https://makersuite.google.com/app/apikey
- **BRIA**: Contact BRIA support for API access

### 3. Run Server
```bash
run.bat
```

Server starts at: **http://127.0.0.1:8000**

## 🎯 How It Works

```
User Prompt → Gemini Analysis → Category Detection → BRIA API → Result
```

1. **User enters prompt**: "Create a cinematic video of sunset"
2. **Gemini analyzes**: Detects category = "video" (95% confidence)
3. **Routes to BRIA**: Calls BRIA Video Generation API
4. **Returns result**: Professional quality video

## 📡 API Endpoints

### `GET /health`
Check backend status
```bash
curl http://127.0.0.1:8000/health
```

### `POST /api/analyze-prompt`
Analyze prompt category with Gemini
```bash
curl -X POST http://127.0.0.1:8000/api/analyze-prompt \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Create a video of sunset"}'
```

### `POST /api/structured-prompt`
Convert text to structured JSON
```bash
curl -X POST http://127.0.0.1:8000/api/structured-prompt \
  -H "Content-Type: application/json" \
  -d '{"prompt": "A cinematic scene", "seed": 5555}'
```

### `POST /api/generate`
Smart generation with routing
```bash
curl -X POST http://127.0.0.1:8000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Cinematic video of ocean waves",
    "aspect_ratio": "16:9",
    "seed": 5555
  }'
```

## 🏗️ Architecture

### Old Approach (Slow)
- ❌ Load 5-10GB Stable Diffusion model
- ❌ Requires GPU
- ❌ 2-5 minute startup
- ❌ Slow generation

### New Approach (Fast)
- ✅ No model loading (instant startup)
- ✅ No GPU required
- ✅ Gemini AI intelligence
- ✅ Professional BRIA quality
- ✅ Supports image/video/ads

## 📦 Dependencies

```
fastapi - Web framework
uvicorn - ASGI server
google-generativeai - Gemini AI
httpx - HTTP client for BRIA APIs
pydantic - Data validation
python-dotenv - Environment variables
```

## 🔧 Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | Yes | Google Gemini API key |
| `BRIA_API_KEY` | Yes | BRIA API key |

### BRIA Endpoints

- **Image**: `https://engine.prod.bria-api.com/v1/text-to-image`
- **Video**: `https://engine.prod.bria-api.com/v1/text-to-video`
- **Ads**: `https://engine.prod.bria-api.com/v1/text-to-ad`

## 🎨 Category Detection

Gemini AI automatically detects:

### IMAGE
- Static photos
- Illustrations
- Art pieces
- Product shots

### VIDEO
- Motion content
- Animations
- Time-lapses
- Cinematic sequences

### ADS
- Marketing materials
- Social media posts
- Promotional content
- Banners

## 🐛 Troubleshooting

### "Gemini not configured"
- Check `GEMINI_API_KEY` in `.env`
- Verify key at https://makersuite.google.com/app/apikey
- System falls back to "image" category

### "BRIA API error"
- Check `BRIA_API_KEY` in `.env`
- Verify API access with BRIA
- Check API rate limits

### Port already in use
```bash
# Kill process on port 8000
netstat -ano | findstr :8000
taskkill /PID <process_id> /F
```

## 📚 Documentation

- **Quick Start**: `../QUICK_START.md`
- **Full Setup**: `../SETUP.md`
- **Architecture**: `../ARCHITECTURE.md`
- **Routing Guide**: `../GEMINI_ROUTING_GUIDE.md`

## 🚀 Performance

| Metric | Time |
|--------|------|
| Startup | < 1 second |
| Gemini Analysis | 1-2 seconds |
| BRIA Generation | 5-15 seconds |
| **Total** | **6-17 seconds** |

Compare to old approach: 2-5 minutes startup + 30-60 seconds generation!

## 🔒 Security

- API keys stored in `.env` (not committed to git)
- CORS configured for localhost only
- HTTPS for external API calls
- Input validation with Pydantic

## 📝 License

This project uses:
- Google Gemini AI (subject to Google's terms)
- BRIA APIs (subject to BRIA's terms)
