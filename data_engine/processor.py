import sqlite3
import os
import json
from bs4 import BeautifulSoup
from parsers.spec_parser import SpecParser
from parsers.price_cleaner import clean_price

class DataProcessor:
    def __init__(self):
        self.parser = SpecParser()

    def process_all(self):
        print("[Processor] Starting batch processing...")
        
        # Resolve paths relative to this file
        base_dir = os.path.dirname(__file__)
        storage_dir = os.path.join(base_dir, 'storage')
        
        # Ensure directory exists
        os.makedirs(storage_dir, exist_ok=True)
        
        CLEAN_DB = os.path.join(storage_dir, 'clean_data.db')
        RAW_DB = os.path.join(storage_dir, 'raw_data.db')
        
        print(f"[Processor] Raw DB Path: {RAW_DB}")
        print(f"[Processor] Clean DB Path: {CLEAN_DB}")
        
        # Connect to both DBs
        conn_raw = sqlite3.connect(RAW_DB)
        conn_clean = sqlite3.connect(CLEAN_DB)
        
        c_raw = conn_raw.cursor()
        c_clean = conn_clean.cursor()
        
        # Reset Clean DB Table to ensure schema matches
        c_clean.execute("DROP TABLE IF EXISTS products")
        c_clean.execute("""
            CREATE TABLE IF NOT EXISTS products (
                hash_id TEXT PRIMARY KEY,
                title TEXT,
                category TEXT,
                brand TEXT,
                model TEXT,
                specs TEXT,
                price REAL,
                currency TEXT,
                source TEXT,
                link TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Fetch unprocessed items? For now fetch all
        c_raw.execute("SELECT id, raw_html, source, link FROM listings") # Link might be missing in raw logic, need to fix spider if so
        rows = c_raw.fetchall()
        
        print(f"[Processor] found {len(rows)} raw items.")
        
        processed_count = 0
        for row in rows:
            uid, html, source, link = row
            
            try:
                soup = BeautifulSoup(html, 'html.parser')
                
                # Title extraction
                # Title extraction
                # Ouedkniss specific fallback + WooCommerce (Kouba)
                title_el = soup.select_one('.woocommerce-loop-product__title, h2, .announce-title, div[class*="Title"]')
                title = title_el.get_text(strip=True) if title_el else "Unknown Product"
                if title == "Unknown Product":
                     # Fallback to link text if title missing
                     link_el = soup.select_one('a')
                     if link_el:
                         title = link_el.get_text(strip=True)
                
                # Price Extraction
                price_el = soup.select_one('.price, span[class*="Price"]')
                price_str = price_el.get_text(strip=True) if price_el else None
                clean_val = clean_price(price_str)
                
                if not clean_val:
                    # print(f"Skipping {uid}: No valid price ({price_str})")
                    continue
                
                # Spec Extraction
                specs = self.parser.parse_specs(title)
                
                # Categorization (Basic)
                category = "laptop" if "laptop" in title.lower() or "portab" in title.lower() else "pc"
                
                # Generic Brand extraction (first word usually)
                brand = title.split()[0].upper()
                
                # Upsert into Clean DB
                c_clean.execute("""
                    INSERT OR REPLACE INTO products 
                    (hash_id, title, category, brand, model, specs, price, currency, source, link)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    uid,
                    title,
                    category,
                    brand,
                    specs.get('model', 'Unknown'), # Extractor doesn't do model yet, generic
                    json.dumps(specs),
                    clean_val,
                    'DZD',
                    source,
                    link or ''
                ))
                processed_count += 1
                
            except Exception as e:
                print(f"[Processor] Error row {uid}: {e}")
                
        conn_clean.commit()
        conn_raw.close()
        conn_clean.close()
        print(f"[Processor] Successfully processed {processed_count} items.")

if __name__ == "__main__":
    p = DataProcessor()
    p.process_all()
