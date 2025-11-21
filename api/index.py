"""
Vercel API Handler
This file serves as the entry point for all API requests in Vercel's serverless environment.
"""

import sys
import os

# Add backend directory to Python path
backend_path = os.path.join(os.path.dirname(__file__), '..', 'backend')
sys.path.insert(0, backend_path)

from backend.app import app

# Export the Flask app for Vercel
handler = app
