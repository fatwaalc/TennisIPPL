"""
Initialize database tables
Run this script to create all tables in the database
"""
import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add parent directory to path
PARENT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(PARENT_DIR)

from flask import Flask
from backend.models import db, User, Analysis

# Create Flask app
app = Flask(__name__)

# Database Configuration
DATABASE_URL = os.getenv('DATABASE_URL', None)
if DATABASE_URL and DATABASE_URL.startswith('postgres://'):
    # Fix Railway's postgres:// to postgresql://
    DATABASE_URL = DATABASE_URL.replace('postgres://', 'postgresql://', 1)

app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL or 'sqlite:///tennis.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize db with app
db.init_app(app)

def init_database():
    """Create all tables"""
    with app.app_context():
        print("Creating database tables...")
        print(f"Database URI: {app.config['SQLALCHEMY_DATABASE_URI'][:50]}...")
        
        # Create all tables
        db.create_all()
        
        print("✅ Database tables created successfully!")
        print("Tables created:")
        print("  - users")
        print("  - analyses")

if __name__ == '__main__':
    init_database()
