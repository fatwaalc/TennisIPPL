# Tennis Analysis Backend

Backend API untuk Tennis Video Analysis menggunakan Flask.

## Setup

1. Install dependencies:
```bash
cd backend
pip install -r requirements.txt
```

2. Jalankan server:
```bash
python app.py
```

Server akan berjalan di `http://localhost:5000`

## API Endpoints

### Health Check
```
GET /api/health
```

### Upload Video
```
POST /api/upload
Content-Type: multipart/form-data
Body: video file

Response:
{
  "success": true,
  "analysisId": "uuid",
  "message": "Video uploaded successfully"
}
```

### Check Analysis Status
```
GET /api/analysis/<analysisId>

Response:
{
  "status": "processing" | "completed" | "failed",
  "progress": 0-100,
  "outputFile": "filename.mp4",
  "error": "error message if failed"
}
```

### Stream Video
```
GET /api/video/<filename>
```

### Download Video
```
GET /outputs/<filename>
```

### List All Analyses
```
GET /api/analyses

Response:
{
  "analyses": [
    {
      "analysisId": "uuid",
      "status": "completed",
      "uploadedTime": "ISO timestamp",
      "completedTime": "ISO timestamp"
    }
  ]
}
```

## Folder Structure

```
backend/
├── app.py              # Main Flask application
├── requirements.txt    # Python dependencies
├── uploads/           # Uploaded videos
├── outputs/           # Analyzed videos
└── status.json        # Processing status (auto-generated)
```
