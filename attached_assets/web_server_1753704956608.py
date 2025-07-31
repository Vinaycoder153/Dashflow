import os
import json
import asyncio
from datetime import datetime
from flask import Flask, request, jsonify, send_from_directory, render_template_string
from flask_cors import CORS
from dotenv import load_dotenv

# Import your existing assistant components
from prompts import AGENT_INSTRUCTION, SESSION_INSTRUCTION_FUNCTION
from tools import (
    get_weather, search_web, send_email,
    get_current_time, open_app, run_command,
    db_add_data, db_query_data
)

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Serve static files
@app.route('/')
def index():
    return send_from_directory('static', 'index.html')

@app.route('/<path:filename>')
def static_files(filename):
    return send_from_directory('static', filename)

# API endpoint for chat
@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        user_message = data.get('message', '').strip()
        user_id = data.get('user_id', 'default_user')
        
        if not user_message:
            return jsonify({'error': 'No message provided'}), 400
        
        # Process the message using your existing assistant logic
        response = process_message(user_message, user_id)
        
        return jsonify({
            'response': response,
            'timestamp': datetime.now().isoformat(),
            'user_id': user_id
        })
        
    except Exception as e:
        print(f"Error processing chat request: {e}")
        return jsonify({'error': 'Internal server error'}), 500

def process_message(message, user_id):
    """
    Process user message using your existing assistant logic.
    This is a simplified version - you can enhance it based on your needs.
    """
    try:
        # Simple response logic - you can enhance this
        message_lower = message.lower()
        
        # Check for specific commands
        if any(word in message_lower for word in ['weather', 'temperature']):
            # You can call your get_weather tool here
            return "I can help you with weather information. What city would you like to know about?"
        
        elif any(word in message_lower for word in ['time', 'clock']):
            # You can call your get_current_time tool here
            current_time = datetime.now().strftime("%I:%M %p")
            return f"The current time is {current_time}."
        
        elif any(word in message_lower for word in ['search', 'find', 'look up']):
            return "I can help you search for information. What would you like me to look up?"
        
        elif any(word in message_lower for word in ['email', 'mail']):
            return "I can help you send emails. What would you like to send?"
        
        elif any(word in message_lower for word in ['reminder', 'remind']):
            return "I can help you set reminders. What would you like me to remind you about?"
        
        elif any(word in message_lower for word in ['note', 'write down']):
            return "I can help you take notes. What would you like me to write down?"
        
        elif any(word in message_lower for word in ['hello', 'hi', 'hey']):
            return "Hello! How can I assist you today?"
        
        elif any(word in message_lower for word in ['help', 'what can you do']):
            return """I can help you with various tasks:
            • Get weather information
            • Tell you the current time
            • Search the web for information
            • Send emails
            • Set reminders and take notes
            • Open applications
            • Run commands
            
            Just ask me what you need help with!"""
        
        else:
            # Default response
            responses = [
                f"I understand you said: '{message}'. How can I help you with that?",
                f"That's interesting! Let me think about '{message}'... What would you like me to do?",
                f"I heard you mention '{message}'. Is there something specific you'd like me to help you with?",
                f"Thanks for sharing that with me. How can I assist you regarding '{message}'?",
                f"I'm here to help! What would you like me to do with that information?"
            ]
            import random
            return random.choice(responses)
            
    except Exception as e:
        print(f"Error in process_message: {e}")
        return "I'm sorry, I encountered an error processing your request. Please try again."

# API endpoint for assistant status
@app.route('/api/status', methods=['GET'])
def status():
    return jsonify({
        'status': 'online',
        'timestamp': datetime.now().isoformat(),
        'features': [
            'voice_recognition',
            'text_to_speech',
            'weather_info',
            'time_info',
            'web_search',
            'email_sending',
            'reminders',
            'notes'
        ]
    })

# API endpoint for user preferences
@app.route('/api/preferences', methods=['GET', 'POST'])
def preferences():
    if request.method == 'POST':
        try:
            data = request.get_json()
            user_id = data.get('user_id', 'default_user')
            preferences = data.get('preferences', {})
            
            # Save preferences (you can implement database storage here)
            # For now, we'll just return success
            return jsonify({
                'success': True,
                'message': 'Preferences saved successfully'
            })
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    else:
        # GET request - return default preferences
        return jsonify({
            'voice_speed': 1.0,
            'voice_pitch': 1.0,
            'auto_scroll': True,
            'theme': 'light'
        })

# Health check endpoint
@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'version': '1.0.0'
    })

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    # Create static directory if it doesn't exist
    os.makedirs('static', exist_ok=True)
    
    # Run the Flask app
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=True
    ) 