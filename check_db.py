import sqlite3
import os
import json

CLEAN_DB = os.path.join(os.path.dirname(__file__), 'data_engine/storage/clean_data.db')
RAW_DB = os.path.join(os.path.dirname(__file__), 'data_engine/storage/raw_data.db')

def check():
    if not os.path.exists(RAW_DB):
        print("Raw DB not found.")
        return

    conn = sqlite3.connect(RAW_DB)
    c = conn.cursor()
    c.execute("SELECT count(*) FROM listings")
    raw_count = c.fetchone()[0]
    conn.close()
    print(f"Raw Items: {raw_count}")

    if not os.path.exists(CLEAN_DB):
        print("Clean DB not found.")
        return

    conn = sqlite3.connect(CLEAN_DB)
    c = conn.cursor()
    c.execute("SELECT count(*) FROM products")
    clean_count = c.fetchone()[0]
    
    if clean_count > 0:
        print(f"Clean Items: {clean_count}")
        c.execute("SELECT * FROM products LIMIT 3")
        rows = c.fetchall()
        print("Sample Data:")
        for r in rows:
            print(r)
    else:
        print("Clean DB is empty (run processor).")
    conn.close()

if __name__ == "__main__":
    check()
