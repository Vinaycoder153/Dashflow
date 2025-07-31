import sqlite3

class PersonalAssistantDB:
    def __init__(self, db_name="assistant_data.db"):
        self.conn = sqlite3.connect(db_name)
        self.create_tables()

    def create_tables(self):
        cursor = self.conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS schedule (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                task TEXT NOT NULL,
                time TEXT NOT NULL
            )
        """)
        self.conn.commit()

    def add_schedule(self, task, time):
        cursor = self.conn.cursor()
        cursor.execute("INSERT INTO schedule (task, time) VALUES (?, ?)", (task, time))
        self.conn.commit()

    def get_all_schedules(self):
        cursor = self.conn.cursor()
        cursor.execute("SELECT * FROM schedule")
        return cursor.fetchall()
