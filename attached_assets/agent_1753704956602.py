from dotenv import load_dotenv
from livekit import agents
from livekit.agents import AgentSession, Agent, RoomInputOptions
from livekit.plugins import noise_cancellation, google
from prompts import AGENT_INSTRUCTION, SESSION_INSTRUCTION_FUNCTION  # FIXED: function not variable
from tools import (
    get_weather, search_web, send_email,
    get_current_time, open_app, run_command,
    db_add_data, db_query_data
)

load_dotenv()

class Assistant(Agent):
    def __init__(self) -> None:
        super().__init__(
            instructions=AGENT_INSTRUCTION,
            llm=google.beta.realtime.RealtimeModel(
                voice="Aoede",
                temperature=0.7,
            ),
            tools=[
                get_weather,
                search_web,
                send_email,
                get_current_time,
                open_app,
                run_command,
                db_add_data,
                db_query_data
            ],
        )

async def entrypoint(ctx: agents.JobContext):
    session = AgentSession()

    await session.start(
        room=ctx.room,
        agent=Assistant(),
        room_input_options=RoomInputOptions(
            video_enabled=True,
            noise_cancellation=noise_cancellation.BVC(),
        ),
    )

    await ctx.connect()

    # ✅ Await the SESSION_INSTRUCTION_FUNCTION to get the dynamic greeting
    session_greeting = await SESSION_INSTRUCTION_FUNCTION()
    await session.generate_reply(instructions=session_greeting)

if __name__ == "__main__":
    agents.cli.run_app(agents.WorkerOptions(entrypoint_fnc=entrypoint))
