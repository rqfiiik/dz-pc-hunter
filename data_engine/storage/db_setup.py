import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), 'raw_data.db')
CLEAN_DB_PATH = os.path.join(os.path.dirname(__file__), 'clean_data.db')

def init_db():
    # Raw Data DB
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS listings (
        id TEXT PRIMARY KEY,
        title TEXT,
        price TEXT,
        link TEXT UNIQUE,
        source TEXT,
        raw_html TEXT,
        scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )''')
    conn.commit()
    conn.close()
    print(f"[Storage] Initialized Raw DB at {DB_PATH}")

    # Clean Data DB
    conn = sqlite3.connect(CLEAN_DB_PATH)
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS products (
        hash_id TEXT PRIMARY KEY,
        category TEXT,
        brand TEXT,
        model TEXT,
        specs TEXT, -- JSON string
        price REAL,
        currency TEXT,
        source TEXT,
        link TEXT,
        scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )''')
    conn.commit()
    conn.close()
    print(f"[Storage] Initialized Clean DB at {CLEAN_DB_PATH}")

if __name__ == "__main__":
    init_db()
