import requests
import sqlite3
import os
import json

DB_PATH = os.path.join(os.path.dirname(__file__), '../storage/clean_data.db')
API_URL = "http://localhost:5000/api/prices/bulk" # Node.js endpoint

def push_data():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    
    # Get products that haven't been synced? 
    # For now, just specific query or all
    try:
        c.execute("SELECT * FROM products LIMIT 50")
        rows = c.fetchall()
        
        payload = []
        for row in rows:
            item = dict(row)
            # Parse specs back to JSON object if string
            if isinstance(item['specs'], str):
                try:
                    item['specs'] = json.loads(item['specs'])
                except:
                    pass
            payload.append(item)
            
        if payload:
            print(f"[Uploader] Pushing {len(payload)} items to {API_URL}")
            # resp = requests.post(API_URL, json=payload)
            # print(f"[Uploader] Response: {resp.status_code}")
            print(f"[Uploader] Simulated Push: Success")
        else:
            print("[Uploader] No data to push.")
            
    except Exception as e:
        print(f"[Uploader] Error: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    push_data()
