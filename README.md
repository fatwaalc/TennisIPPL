# 🎾 Tennis Analysis Web Application

Aplikasi web untuk analisis video tenis menggunakan Computer Vision dan Deep Learning. Sistem ini dapat mendeteksi pemain, tracking bola, dan menghitung statistik pertandingan secara otomatis.

## ✨ Features

- 🎥 Upload video tenis (5-10 detik)
- 🤖 Deteksi pemain otomatis menggunakan YOLOv8
- 🎾 Tracking bola real-time dengan YOLOv5
- 📊 Analisis statistik:
  - Kecepatan shot (km/h)
  - Kecepatan pergerakan pemain (km/h)
  - Jumlah shot per pemain
  - Average speeds
- 🎬 Output video dengan visualisasi analisis
- 📱 Responsive web interface
- ⚡ Real-time processing status
- 💾 Download hasil analisis

## 🏗️ Tech Stack

### Backend
- **Python 3.8+** - Programming language
- **Flask** - REST API framework
- **YOLOv8** - Player detection (Ultralytics)
- **YOLOv5** - Ball tracking (fine-tuned)
- **OpenCV** - Video processing
- **PyTorch** - Deep learning inference
- **FFmpeg** - Video encoding

### Frontend
- **Next.js 14** - React framework
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Beautiful UI components

## 📋 Prerequisites

- Python 3.8 atau lebih tinggi
- Node.js 18 atau lebih tinggi
- FFmpeg (untuk video conversion)
- Git
- CUDA (opsional, untuk GPU acceleration)

## 🚀 Installation

### 1. Clone Repository

```bash
git clone https://github.com/username/tennis-analysis-web.git
cd tennis-analysis-web
```

### 2. Download Model Files

⚠️ **PENTING:** Model files tidak disertakan dalam repository karena ukurannya besar.

Download kedua model berikut dan letakkan di folder `models/`:

1. **YOLOv5 Ball Detection Model** - `yolo5_last.pt`
   - Download: [Google Drive Link](https://drive.google.com/file/d/1UZwiG1jkWgce9lNhxJ2L0NVjX1vGM05U/view?usp=sharing)
   - Letakkan di: `models/yolo5_last.pt`

2. **Court Keypoints Model** - `keypoints_model.pth`
   - Download: [Google Drive Link](https://drive.google.com/file/d/1QrTOF1ToQ4plsSZbkBs3zOLkVt3MBlta/view?usp=sharing)
   - Letakkan di: `models/keypoints_model.pth`

### 3. Setup Backend

```bash
cd backend
pip install -r requirements.txt
cd ..
```

### 4. Setup Frontend

```bash
cd front-end
npm install
cd ..
```

### 5. Install FFmpeg

**Windows:**
```bash
# Download dari https://ffmpeg.org/download.html
# Atau gunakan chocolatey:
choco install ffmpeg
```

**Linux:**
```bash
sudo apt-get install ffmpeg
```

**macOS:**
```bash
brew install ffmpeg
```

Verifikasi instalasi:
```bash
ffmpeg -version
```

## 🎯 Usage

### Metode 1: Start All (Recommended) - Windows

```bash
start-all.bat
```

Script ini akan membuka 2 terminal:
- Backend (Flask) di http://localhost:5000
- Frontend (Next.js) di http://localhost:3000

### Metode 2: Manual Start

**Terminal 1 - Backend:**
```bash
cd backend
python app.py
```

**Terminal 2 - Frontend:**
```bash
cd front-end
npm run dev
```

### Akses Aplikasi

Buka browser dan akses: **http://localhost:3000**

## 📁 Project Structure

```
tennis-analysis-web/
├── backend/
│   ├── app.py              # Flask API server
│   ├── requirements.txt    # Python dependencies
│   ├── uploads/           # Uploaded videos (gitignored)
│   ├── outputs/           # Analyzed videos (gitignored)
│   └── README.md
│
├── front-end/
│   ├── app/
│   │   ├── analysis/
│   │   │   ├── upload/    # Upload page
│   │   │   └── result/    # Results page
│   │   ├── dashboard/     # Dashboard
│   │   └── history/       # History
│   ├── components/        # React components
│   ├── lib/              # Utilities
│   └── public/           # Static assets
│
├── models/
│   ├── yolo5_last.pt      # Ball detection model (download required)
│   └── keypoints_model.pth # Court keypoints model (download required)
│
├── trackers/              # Detection & tracking modules
│   ├── player_tracker.py
│   └── ball_tracker.py
│
├── court_line_detector/   # Court line detection
├── mini_court/           # Mini court coordinates
├── utils/                # Utility functions
├── constants/            # Constants
│
├── main.py               # Main analysis pipeline
├── start-all.bat         # Start both servers (Windows)
├── start-backend.bat     # Start backend only (Windows)
├── start-frontend.bat    # Start frontend only (Windows)
└── README.md
```

## 🔌 API Endpoints

### Health Check
```http
GET /api/health
```
Response: `{"status": "healthy", "message": "Backend server is running"}`

### Upload Video
```http
POST /api/upload
Content-Type: multipart/form-data
Body: video file (max 500MB)
```
Response: `{"success": true, "analysisId": "uuid", "message": "..."}`

### Check Analysis Status
```http
GET /api/analysis/{analysisId}
```
Response: `{"status": "processing|completed|failed", "progress": 0-100, ...}`

### Stream Video
```http
GET /api/video/{filename}
```
Returns video stream (video/mp4)

### Download Video
```http
GET /outputs/{filename}
```
Returns video file download

### List All Analyses
```http
GET /api/analyses
```
Returns list of all analyses

## 🎬 How It Works

1. **User** mengakses web interface di http://localhost:3000
2. **Upload** video tenis (format: MP4, AVI, MOV, MKV | durasi: 5-10 detik)
3. **Backend** memproses video:
   - Deteksi pemain menggunakan YOLOv8
   - Track bola menggunakan fine-tuned YOLOv5
   - Deteksi garis lapangan dengan CNN
   - Kalkulasi kecepatan dan statistik
   - Generate video output dengan overlay
   - Convert ke H.264 MP4 (browser-compatible)
4. **Frontend** polling status setiap 2 detik untuk update progress
5. **Results** page menampilkan:
   - Video player dengan analyzed video
   - Processing status
   - Download button
6. **Download** atau stream langsung di browser

## 🛠️ Configuration

### Backend Settings (`backend/app.py`)

```python
MAX_FILE_SIZE = 500 * 1024 * 1024  # 500MB
ALLOWED_EXTENSIONS = {'mp4', 'avi', 'mov', 'mkv'}
```

### Frontend Settings (`front-end/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Analysis Settings (`main.py`)

```python
# Untuk deteksi real-time (tidak pakai cache):
read_from_stub=False

# Untuk development (pakai cache):
read_from_stub=True
```

## 🎓 Tips for Best Results

### Video Requirements:
- ✅ Duration: 5-10 seconds (optimal)
- ✅ Resolution: 720p or higher
- ✅ Format: MP4 (best compatibility)
- ✅ Framerate: 24-30 fps
- ✅ Clear view of tennis court
- ✅ Both players visible
- ✅ Ball visible (yellow tennis ball works best)
- ✅ Good lighting conditions

### Processing Time:
- 5 sec video ≈ 30-60 seconds
- 10 sec video ≈ 60-120 seconds
- Varies based on: video resolution, CPU/GPU speed

## 🐛 Troubleshooting

### Backend Issues

**Backend tidak start:**
```bash
# Check Python version
python --version  # Need 3.8+

# Install dependencies
cd backend
pip install -r requirements.txt

# Check port 5000
netstat -ano | findstr :5000
```

**Model files not found:**
- Download models dari links di atas
- Pastikan file ada di folder `models/`
- Check file names: `yolo5_last.pt` dan `keypoints_model.pth`

### Frontend Issues

**Frontend tidak start:**
```bash
# Check Node.js version
node --version  # Need 18+

# Install dependencies
cd front-end
npm install

# Check port 3000
netstat -ano | findstr :3000
```

**CORS Errors:**
- Pastikan backend running di port 5000
- Check `.env.local`: `NEXT_PUBLIC_API_URL=http://localhost:5000`
- Clear browser cache

### Upload Issues

**Upload fails:**
- Max file size: 500MB
- Supported formats: MP4, AVI, MOV, MKV
- Check backend console for errors

**Video tidak terdeteksi:**
- Ubah `read_from_stub=False` di `main.py` line 27 & 31
- Pastikan video memiliki pemain dan bola yang visible
- Try with better quality video

### Video Processing Issues

**Processing fails:**
- Check models downloaded correctly
- Check Python dependencies installed
- Look at backend console for stack trace
- Ensure video has visible tennis players and ball

**Video tidak bisa diputar:**
- Check FFmpeg installed: `ffmpeg -version`
- Browser support: Chrome/Firefox/Edge recommended
- Try downloading instead of streaming

### Performance Issues

**Slow processing:**
- Enable GPU acceleration (install CUDA)
- Reduce video resolution
- Use shorter video duration

## 🔧 Development

### Backend Development

```bash
cd backend
python app.py
# Server runs on http://localhost:5000
# Debug mode enabled by default
```

### Frontend Development

```bash
cd front-end
npm run dev
# Server runs on http://localhost:3000
# Hot reload enabled
```

### Training Models

Notebooks tersedia di folder `training/`:
- `tennis_ball_detector_training.ipynb` - Train ball detector
- `tennis_court_keypoints_training.ipynb` - Train court keypoints

## 📦 Dependencies

### Backend (`backend/requirements.txt`)

```txt
flask==3.0.0
flask-cors==4.0.0
opencv-python==4.8.1.78
ultralytics==8.0.196
torch==2.1.0
torchvision==0.16.0
pandas==2.1.3
numpy==1.24.3
```

### Frontend (`front-end/package.json`)

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "typescript": "^5.0.0",
    "tailwindcss": "^3.0.0"
  }
}
```

## 📸 Output Videos

Here is a screenshot from one of the output videos:

![Screenshot](output_videos/screenshot.jpeg)

## 🙏 Acknowledgments

- [Ultralytics YOLOv8](https://github.com/ultralytics/ultralytics) - Player detection
- [Ultralytics YOLOv5](https://github.com/ultralytics/yolov5) - Ball tracking
- [Next.js](https://nextjs.org/) - React framework
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Flask](https://flask.palletsprojects.com/) - Python web framework

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

If you encounter any issues or have questions:
1. Check the Troubleshooting section
2. Review existing GitHub Issues
3. Create a new Issue with detailed information

---

Built with ❤️ for tennis enthusiasts and AI developers!
