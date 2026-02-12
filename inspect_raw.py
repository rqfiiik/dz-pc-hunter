import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), 'data_engine/storage/raw_data.db')

conn = sqlite3.connect(DB_PATH)
c = conn.cursor()
c.execute("SELECT title, link, raw_html FROM listings ORDER BY scraped_at DESC LIMIT 5")
rows = c.fetchall()

print(f"Found {len(rows)} rows.")
for r in rows:
    print(f"Title: {r[0]}")
    print(f"Link: {r[1]}")
    # Print a snippet of raw_html to see the title inside it
    print(f"HTML Snippet: {r[2][:500]}...")
    print("-" * 20)

conn.close()
