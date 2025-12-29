# Tennis Analysis - Full Stack Web Application

## 🎯 Introduction
This project analyzes Tennis players in a video to measure their speed, ball shot speed and number of shots. **Now with a complete web interface** for easy upload and real-time analysis!

**🚀 New Features:**
- ✅ Web-based video upload (5-10 seconds recommended)
- ✅ Real-time processing status
- ✅ Stream analyzed video in browser
- ✅ Download results
- ✅ Modern UI with Next.js + TypeScript

## 🚀 Quick Start

### Easiest Way - Run Everything at Once
```bash
start-all.bat
```
This script opens 2 terminals:
- **Backend** (Flask) at http://localhost:5000
- **Frontend** (Next.js) at http://localhost:3000

Wait a few seconds, then open **http://localhost:3000** in your browser!

### Manual Start

#### 1. Start Backend (Flask API)
```bash
start-backend.bat
```
Or manually:
```bash
cd backend
pip install -r requirements.txt
python app.py
```

#### 2. Start Frontend (Next.js)
In a **new terminal**:
```bash
start-frontend.bat
```
Or manually:
```bash
cd front-end
npm install
npm run dev
```

## 📁 Project Structure

```
tennis_analysis-main/
├── backend/                    # Flask API Backend
│   ├── app.py                 # Main API server
│   ├── requirements.txt       # Python dependencies
│   ├── uploads/               # Uploaded videos
│   ├── outputs/               # Analyzed videos
│   └── README.md
│
├── front-end/                  # Next.js Frontend
│   ├── app/
│   │   ├── analysis/
│   │   │   ├── upload/       # Upload page
│   │   │   └── result/       # Results page
│   │   ├── dashboard/         # Dashboard
│   │   └── history/           # History
│   ├── components/            # UI components
│   └── package.json
│
├── trackers/                   # Player & Ball tracking
│   ├── player_tracker.py
│   └── ball_tracker.py
│
├── court_line_detector/        # Court line detection
├── mini_court/                 # Mini court coordinates
├── utils/                      # Utilities
├── models/                     # AI Models
│   ├── yolo5_last.pt          # Ball detection model
│   └── keypoints_model.pth    # Court keypoints model
│
├── main.py                     # Core analysis engine
├── start-all.bat              # Start everything
├── start-backend.bat          # Start backend only
└── start-frontend.bat         # Start frontend only
```

## 🎬 Output Videos
Here is a screenshot from one of the output videos:

![Screenshot](output_videos/screenshot.jpeg)

## 🤖 Models Used
* **YOLO v8** for player detection
* **Fine-tuned YOLO v5** for tennis ball detection
* **CNN** for court keypoint extraction

### Pre-trained Models
* Trained YOLOV5 model: https://drive.google.com/file/d/1UZwiG1jkWgce9lNhxJ2L0NVjX1vGM05U/view?usp=sharing
* Trained tennis court keypoint model: https://drive.google.com/file/d/1QrTOF1ToQ4plsSZbkBs3zOLkVt3MBlta/view?usp=sharing

## 📚 Training Notebooks
* Tennis ball detector with YOLO: `training/tennis_ball_detector_training.ipynb`
* Tennis court keypoints with PyTorch: `training/tennis_court_keypoints_training.ipynb`

## 🔧 Technology Stack

### Backend
- **Flask 3.0** - Web framework & REST API
- **OpenCV** - Video processing
- **YOLOv8** - Player detection (Ultralytics)
- **YOLOv5** - Ball detection (fine-tuned)
- **PyTorch** - Deep learning inference
- **Pandas** - Data analysis

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first styling
- **Shadcn UI** - Beautiful UI components
- **React Hooks** - Modern state management

## 📡 API Endpoints

### Health Check
```http
GET /api/health
Response: {"status": "healthy", "message": "Backend server is running"}
```

### Upload Video
```http
POST /api/upload
Content-Type: multipart/form-data
Body: video file (max 500MB)

Response: {
  "success": true,
  "analysisId": "uuid-string",
  "message": "Video uploaded successfully"
}
```

### Check Analysis Status
```http
GET /api/analysis/{analysisId}

Response: {
  "status": "processing|completed|failed",
  "progress": 0-100,
  "outputFile": "filename.mp4",
  "error": "error message if failed"
}
```

### Stream Video
```http
GET /api/video/{filename}
Returns: Video stream (video/mp4)
```

### Download Video
```http
GET /outputs/{filename}
Returns: Video file download
```

### List All Analyses
```http
GET /api/analyses

Response: {
  "analyses": [...]
}
```

## 🎯 Features

### What the AI Detects:
- ✅ **Players**: Bounding boxes around both players
- ✅ **Ball**: Real-time ball tracking with trajectory
- ✅ **Court Lines**: Automatic court line detection
- ✅ **Statistics**:
  - Ball speed (km/h)
  - Player speed (km/h)
  - Number of shots
  - Average speeds

### Video Output Includes:
- Player bounding boxes with IDs
- Ball trajectory with yellow marker
- Court keypoints overlay
- Real-time statistics display
- Frame counter

## 💻 Requirements

### Python Dependencies (Backend)
```txt
python >= 3.8
flask==3.0.0
flask-cors==4.0.0
opencv-python==4.8.1.78
ultralytics==8.0.196
torch==2.1.0
torchvision==0.16.0
pandas==2.1.3
numpy==1.24.3
```

### Node.js Dependencies (Frontend)
```json
node.js >= 18.0.0
next >= 14.0.0
react >= 18.0.0
typescript >= 5.0.0
tailwindcss >= 3.0.0
```

## 🔄 How It Works

1. **User** opens http://localhost:3000
2. **Upload** tennis video (5-10 seconds, max 500MB)
3. **Backend** processes video:
   - Detects players using YOLOv8
   - Tracks ball using fine-tuned YOLOv5
   - Detects court lines with CNN
   - Calculates speeds and statistics
   - Generates output video with overlays
4. **Frontend** polls status every 2 seconds
5. **Results** page shows:
   - Processing progress
   - Video player with analyzed video
   - Download button
6. **Download** or stream directly in browser

## 🐛 Troubleshooting

### Backend Not Starting
- ✅ Check Python installed: `python --version` (need 3.8+)
- ✅ Install dependencies: `pip install -r backend/requirements.txt`
- ✅ Check port 5000 not in use: `netstat -ano | findstr :5000`
- ✅ Make sure models exist in `models/` folder

### Frontend Not Starting
- ✅ Check Node.js installed: `node --version` (need 18+)
- ✅ Install dependencies: `npm install` in `front-end/` folder
- ✅ Check port 3000 not in use: `netstat -ano | findstr :3000`

### CORS Errors
- ✅ Backend must be running on port 5000
- ✅ Check `.env.local` in `front-end/`: `NEXT_PUBLIC_API_URL=http://localhost:5000`
- ✅ Clear browser cache and reload

### Upload Fails
- ✅ Max file size: 500MB
- ✅ Supported formats: MP4, AVI, MOV, MKV
- ✅ Recommended duration: 5-10 seconds
- ✅ Check backend console for errors

### Video Processing Fails
- ✅ Check models are downloaded in `models/` folder
- ✅ Check Python dependencies installed correctly
- ✅ Look at backend console for stack trace
- ✅ Make sure video has tennis players and ball visible

### Can't See Video Result
- ✅ Wait for processing to complete (check progress)
- ✅ Check file exists in `backend/outputs/`
- ✅ Try downloading instead of streaming
- ✅ Check browser console for errors

## 🎓 Usage Tips

### For Best Results:
1. Use videos with:
   - Clear view of court
   - Both players visible
   - Ball visible (yellow tennis ball works best)
   - Good lighting
   
2. Video recommendations:
   - Duration: 5-10 seconds
   - Resolution: 720p or higher
   - Format: MP4 (best compatibility)
   - Framerate: 24-30 fps

3. Processing time:
   - 5 sec video ≈ 30-60 seconds
   - 10 sec video ≈ 60-120 seconds
   - Depends on: video resolution, CPU/GPU speed

## 📦 Installation from Scratch

### 1. Clone or Download Project
```bash
cd d:\vscode\tennis_analysis-main
```

### 2. Download Models
Place these files in `models/` folder:
- `yolo5_last.pt` - Ball detection model
- `keypoints_model.pth` - Court keypoints model

Links provided in "Models Used" section above.

### 3. Install Backend Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 4. Install Frontend Dependencies
```bash
cd front-end
npm install
```

### 5. Run the Application
```bash
# From project root
start-all.bat

# Or manually:
# Terminal 1:
cd backend && python app.py

# Terminal 2:
cd front-end && npm run dev
```

## 📄 License
MIT License - Free to use for personal and commercial projects

## 🙏 Credits
Original analysis code by [Original Author]
Web application wrapper by Assistant

Built with ❤️ for tennis enthusiasts and AI developers!

---

**Need Help?** Check the troubleshooting section or open an issue on GitHub.
