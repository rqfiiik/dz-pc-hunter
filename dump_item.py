import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), 'data_engine/storage/raw_data.db')

conn = sqlite3.connect(DB_PATH)
c = conn.cursor()
c.execute("SELECT raw_html FROM listings LIMIT 1")
row = c.fetchone()

if row:
    with open('debug_item.html', 'w', encoding='utf-8') as f:
        f.write(row[0])
    print("Saved debug_item.html")
else:
    print("No items found.")

conn.close()
