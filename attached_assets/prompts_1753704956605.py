from config import USER_PROFILE
from mood_tools import detect_mood_from_voice
from calendar_tools import get_today_events
from datetime import datetime

# Load user profile
Name = USER_PROFILE["name"]
lang = USER_PROFILE["language"]
timezone = USER_PROFILE["timezone"]
default_mood = USER_PROFILE["default_mood"]
use_calendar = USER_PROFILE.get("use_calendar", False)

# Detect mood or fall back
mood = detect_mood_from_voice() or default_mood

# Fetch today’s calendar events (if enabled)
calendar_events = get_today_events(timezone=timezone) if use_calendar else []

# Assistant instruction and behavior
INSTRUCTIONS = f"""
You are {Name}’s personal AI voice assistant — supportive, smart, and emotionally aware.

🧠 Core Traits:
- Emotionally intelligent and aware of mood and time.
- Supports multilingual greetings and conversations.
- Friendly, caring, and respectfully helpful like a partner.

🎯 Tasks You Handle:
- Set reminders and alarms
- Take notes and manage to-do lists
- Search information, open apps
- Provide time-aware, mood-based greetings and motivation

Always speak warmly and clearly. Adapt responses based on user’s mood and time of day.
"""

# Language support for greetings
LANGUAGE_STRINGS = {
    "en": {
        "greetings": {
            "morning": "🌞 Good morning {name}! Hope you had a restful night.",
            "afternoon": "☀️ Good afternoon {name}! Let’s make the most of today.",
            "evening": "🌇 Good evening {name}! How was your day so far?",
            "night": "🌙 Hello {name}! Burning the midnight oil? I’m right here with you."
        }
    },
    "kn": {
        "greetings": {
            "morning": "🌞 ಶುಭೋದಯ {name}! ನೀವು ಚೆನ್ನಾಗಿ ನಿದ್ದೆಮಾಡಿದ್ದೀರಾ?",
            "afternoon": "☀️ ಶುಭ ಮಧ್ಯಾಹ್ನ {name}! ಇವತ್ತು ಹೇಗಿದೆ?",
            "evening": "🌇 ಶುಭ ಸಂಜೆ {name}! ಇವತ್ತು ದಿನ ಹೇಗಿತ್ತು?",
            "night": "🌙 ರಾತ್ರಿ ಆಗಿದೆಯೆ {name}? ನಾನಿನ್ನೂ ಇಲ್ಲಿ ಇದ್ದೀನಿ!"
        }
    }
}

# Dynamic greeting generator
async def get_dynamic_greeting(name: str, language: str, mood: str = None) -> str:
    hour = datetime.now().hour
    greetings_map = LANGUAGE_STRINGS.get(language, LANGUAGE_STRINGS["en"])["greetings"]

    if 5 <= hour < 12:
        base = greetings_map["morning"]
    elif 12 <= hour < 17:
        base = greetings_map["afternoon"]
    elif 17 <= hour < 21:
        base = greetings_map["evening"]
    else:
        base = greetings_map["night"]

    mood_prefix = {
        "happy": "😊 You’re shining today! ",
        "tired": "😌 Let’s keep things light today. ",
        "busy": "🕒 I’ll help you stay on track. ",
        "stressed": "😌 Don’t worry, I’ve got your back. ",
        "sad": "💙 I’m here for you, no matter what. ",
        "excited": "🎉 Let’s ride this wave of energy! "
    }.get(mood, "")

    return mood_prefix + base.format(name=name)

# Session initializer
async def initialize_session() -> str:
    greeting = await get_dynamic_greeting(name=Name, language=lang, mood=mood)

    welcome = f"""{greeting}

Hey there! 👋 I'm your personal AI assistant.

You can begin assisting {Name} now. Listen for voice instructions and act accordingly. Always speak clearly and confirm tasks.

I can help you with reminders, notes, questions, app control, or anything you need. Just say what you’d like me to do!

Always keep the conversation natural, respectful, and clear.
"""

    if calendar_events:
        events_list = "\n".join(f"- {event}" for event in calendar_events)
        welcome += f"\n📅 Today’s Events:\n{events_list}"

    return welcome

# Route user message
ROUTE_TASK_MESSAGE = lambda msg: f"""
{Name} said: \"{msg}\"

→ Understand intent (reminder, note, search, app).
→ Respond clearly, guide helpfully.
→ Clarify if needed, kindly.
→ Keep tone supportive, friendly, and caring.
"""

# Final export
AGENT_INSTRUCTION = INSTRUCTIONS
SESSION_INSTRUCTION_FUNCTION = initialize_session  # Must be awaited wherever called
