from flask import Flask, request, jsonify, send_file, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
import sys
import uuid
from datetime import datetime
import threading
import json
import subprocess

# Add parent directory to path to import main
PARENT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(PARENT_DIR)
from main import main as analyze_video

app = Flask(__name__)
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

# Configuration
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')
OUTPUT_FOLDER = os.path.join(BASE_DIR, 'outputs')
ALLOWED_EXTENSIONS = {'mp4', 'avi', 'mov', 'mkv'}
MAX_FILE_SIZE = 500 * 1024 * 1024  # 500MB

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['OUTPUT_FOLDER'] = OUTPUT_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_FILE_SIZE

# Create necessary folders
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

# Dictionary to track processing status
processing_status = {}
status_file = os.path.join(BASE_DIR, 'status.json')

# Load existing status from file
def load_status():
    global processing_status
    if os.path.exists(status_file):
        try:
            with open(status_file, 'r') as f:
                processing_status = json.load(f)
        except Exception as e:
            print(f"Error loading status: {e}")
            processing_status = {}

# Save status to file
def save_status():
    try:
        with open(status_file, 'w') as f:
            json.dump(processing_status, f, indent=2)
    except Exception as e:
        print(f"Error saving status: {e}")

load_status()

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def process_video_async(analysis_id, input_path, output_path):
    """Process video in background thread"""
    try:
        print(f"[{analysis_id}] Starting video processing...")
        print(f"[{analysis_id}] Current working directory: {os.getcwd()}")
        print(f"[{analysis_id}] Parent directory: {PARENT_DIR}")
        
        # Change to parent directory to access models
        original_cwd = os.getcwd()
        os.chdir(PARENT_DIR)
        print(f"[{analysis_id}] Changed working directory to: {os.getcwd()}")
        
        processing_status[analysis_id]['status'] = 'processing'
        processing_status[analysis_id]['progress'] = 10
        save_status()
        
        # Run the analysis
        result_path = analyze_video(input_path, output_path)
        
        # Convert to browser-compatible format using ffmpeg
        print(f"[{analysis_id}] Converting video to browser-compatible format...")
        temp_output = output_path.replace('.mp4', '_temp.avi')
        if os.path.exists(result_path):
            # Rename original output
            os.rename(result_path, temp_output)
            
            # Convert with ffmpeg to H.264 MP4
            try:
                subprocess.run([
                    'ffmpeg', '-i', temp_output,
                    '-c:v', 'libx264',  # H.264 codec
                    '-preset', 'fast',
                    '-crf', '23',
                    '-c:a', 'aac',  # AAC audio
                    '-b:a', '128k',
                    '-movflags', '+faststart',  # Enable streaming
                    '-y',  # Overwrite output
                    result_path
                ], check=True, capture_output=True)
                
                # Remove temporary file
                os.remove(temp_output)
                print(f"[{analysis_id}] Video converted successfully!")
            except subprocess.CalledProcessError as e:
                print(f"[{analysis_id}] FFmpeg conversion failed: {e.stderr.decode()}")
                # If conversion fails, keep the original
                if os.path.exists(temp_output):
                    os.rename(temp_output, result_path)
            except FileNotFoundError:
                print(f"[{analysis_id}] FFmpeg not found, using original format")
                if os.path.exists(temp_output):
                    os.rename(temp_output, result_path)
        
        # Change back to original directory
        os.chdir(original_cwd)
        
        # Get file size
        file_size = os.path.getsize(result_path) if os.path.exists(result_path) else 0
        
        processing_status[analysis_id]['status'] = 'completed'
        processing_status[analysis_id]['progress'] = 100
        processing_status[analysis_id]['outputFile'] = os.path.basename(output_path)
        processing_status[analysis_id]['fileSize'] = file_size
        processing_status[analysis_id]['completedTime'] = datetime.now().isoformat()
        save_status()
        
        print(f"[{analysis_id}] Video processing completed successfully!")
        
    except Exception as e:
        print(f"[{analysis_id}] Error processing video: {str(e)}")
        import traceback
        print(f"[{analysis_id}] Full traceback:")
        traceback.print_exc()
        
        # Change back to original directory on error
        try:
            os.chdir(original_cwd)
        except:
            pass
            
        processing_status[analysis_id]['status'] = 'failed'
        processing_status[analysis_id]['error'] = str(e)
        processing_status[analysis_id]['progress'] = 0
        save_status()

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'message': 'Backend server is running',
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/upload', methods=['POST'])
def upload_video():
    """Upload video endpoint"""
    print("Received upload request")
    
    # Check if file is present
    if 'video' not in request.files:
        print("No video file in request")
        return jsonify({'error': 'No video file provided'}), 400
    
    file = request.files['video']
    
    if file.filename == '':
        print("Empty filename")
        return jsonify({'error': 'No file selected'}), 400
    
    if not allowed_file(file.filename):
        print(f"Invalid file type: {file.filename}")
        return jsonify({'error': 'Invalid file format. Allowed: MP4, AVI, MOV, MKV'}), 400
    
    try:
        # Generate unique ID for this analysis
        analysis_id = str(uuid.uuid4())
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        
        print(f"Generated analysis ID: {analysis_id}")
        
        # Save uploaded file
        filename = secure_filename(file.filename)
        file_extension = filename.rsplit('.', 1)[1].lower()
        input_filename = f"{timestamp}_{analysis_id}.{file_extension}"
        input_path = os.path.join(app.config['UPLOAD_FOLDER'], input_filename)
        
        print(f"Saving file to: {input_path}")
        file.save(input_path)
        
        # Prepare output path
        output_filename = f"{timestamp}_{analysis_id}_analyzed.mp4"
        output_path = os.path.join(app.config['OUTPUT_FOLDER'], output_filename)
        
        print(f"Output will be saved to: {output_path}")
        
        # Initialize processing status
        processing_status[analysis_id] = {
            'status': 'queued',
            'progress': 0,
            'inputFile': input_filename,
            'outputFile': None,
            'error': None,
            'uploadedTime': datetime.now().isoformat()
        }
        save_status()
        
        # Start processing in background thread
        thread = threading.Thread(target=process_video_async, args=(analysis_id, input_path, output_path))
        thread.daemon = True
        thread.start()
        
        print(f"Processing thread started for {analysis_id}")
        
        return jsonify({
            'success': True,
            'analysisId': analysis_id,
            'message': 'Video uploaded successfully and processing started'
        }), 200
        
    except Exception as e:
        print(f"Error during upload: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Upload failed: {str(e)}'}), 500

@app.route('/api/analysis/<analysis_id>', methods=['GET'])
def get_analysis_status(analysis_id):
    """Get analysis status endpoint"""
    print(f"Status check for: {analysis_id}")
    
    if analysis_id not in processing_status:
        print(f"Analysis ID not found: {analysis_id}")
        return jsonify({'error': 'Analysis ID not found'}), 404
    
    status_info = processing_status[analysis_id]
    print(f"Current status: {status_info['status']}")
    
    return jsonify(status_info), 200

@app.route('/api/video/<filename>', methods=['GET'])
def stream_video(filename):
    """Stream video endpoint"""
    print(f"Video stream request for: {filename}")
    
    video_path = os.path.join(app.config['OUTPUT_FOLDER'], filename)
    
    if not os.path.exists(video_path):
        print(f"Video file not found: {video_path}")
        return jsonify({'error': 'Video file not found'}), 404
    
    return send_file(
        video_path, 
        mimetype='video/mp4',
        as_attachment=False,
        download_name=filename
    )

@app.route('/outputs/<filename>', methods=['GET'])
def download_video(filename):
    """Download video endpoint"""
    print(f"Download request for: {filename}")
    
    video_path = os.path.join(app.config['OUTPUT_FOLDER'], filename)
    
    if not os.path.exists(video_path):
        print(f"Video file not found: {video_path}")
        return jsonify({'error': 'Video file not found'}), 404
    
    return send_file(video_path, as_attachment=True, download_name='tennis_analysis.mp4')

@app.route('/api/analyses', methods=['GET'])
def list_analyses():
    """List all analyses"""
    analyses = []
    for analysis_id, status_info in processing_status.items():
        analyses.append({
            'analysisId': analysis_id,
            'status': status_info['status'],
            'uploadedTime': status_info.get('uploadedTime'),
            'completedTime': status_info.get('completedTime')
        })
    
    # Sort by upload time, newest first
    analyses.sort(key=lambda x: x.get('uploadedTime', ''), reverse=True)
    
    return jsonify({'analyses': analyses}), 200

if __name__ == '__main__':
    print("Starting Flask backend server...")
    print(f"Upload folder: {UPLOAD_FOLDER}")
    print(f"Output folder: {OUTPUT_FOLDER}")
    print("Server will run on http://localhost:5000")
    app.run(debug=True, host='0.0.0.0', port=5000, threaded=True)
