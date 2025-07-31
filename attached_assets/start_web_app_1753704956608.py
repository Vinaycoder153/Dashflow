#!/usr/bin/env python3
"""
AI Voice Assistant Web App - Startup Script
"""

import os
import sys
import webbrowser
import time
from pathlib import Path

def check_dependencies():
    """Check if required dependencies are installed"""
    try:
        import flask
        import flask_cors
        print("✅ Flask dependencies found")
    except ImportError as e:
        print(f"❌ Missing dependency: {e}")
        print("Please run: pip install flask flask-cors")
        return False
    return True

def check_static_files():
    """Check if static files exist"""
    static_dir = Path("static")
    required_files = ["index.html", "styles.css", "script.js"]
    
    if not static_dir.exists():
        print("❌ Static directory not found")
        return False
    
    missing_files = []
    for file in required_files:
        if not (static_dir / file).exists():
            missing_files.append(file)
    
    if missing_files:
        print(f"❌ Missing static files: {', '.join(missing_files)}")
        return False
    
    print("✅ Static files found")
    return True

def start_server():
    """Start the Flask web server"""
    try:
        from web_server import app
        
        print("🚀 Starting AI Voice Assistant Web App...")
        print("📱 Open your browser to: http://localhost:5000")
        print("🎤 Make sure to allow microphone access for voice features")
        print("💡 Press Ctrl+C to stop the server")
        print("-" * 50)
        
        # Try to open browser after a short delay
        def open_browser():
            time.sleep(2)
            try:
                webbrowser.open('http://localhost:5000')
            except:
                pass
        
        import threading
        threading.Thread(target=open_browser, daemon=True).start()
        
        # Start the Flask app
        app.run(
            host='0.0.0.0',
            port=5000,
            debug=True,
            use_reloader=False  # Disable reloader to avoid double startup
        )
        
    except KeyboardInterrupt:
        print("\n👋 Shutting down AI Voice Assistant...")
        sys.exit(0)
    except Exception as e:
        print(f"❌ Error starting server: {e}")
        sys.exit(1)

def main():
    """Main function"""
    print("🎤 AI Voice Assistant Web App")
    print("=" * 40)
    
    # Check dependencies
    if not check_dependencies():
        sys.exit(1)
    
    # Check static files
    if not check_static_files():
        sys.exit(1)
    
    # Start the server
    start_server()

if __name__ == "__main__":
    main() 