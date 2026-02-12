import time
import random
import sqlite3
import os
import requests
from bs4 import BeautifulSoup

DB_PATH = os.path.join(os.path.dirname(__file__), '../storage/raw_data.db')

class KoubaSpider:
    def __init__(self):
        self.base_url = "https://koubacomputer.store/?s={}&post_type=product"
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'
        }

    def scrape(self, query="laptop"):
        import urllib.parse
        encoded_query = urllib.parse.quote(query)
        
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        saved_count = 0
        
        for page in range(1, 4): # Scrape first 3 pages
            url = f"https://koubacomputer.store/page/{page}/?s={encoded_query}&post_type=product"
            print(f"[Spider-Kouba] Scrape started for: {query} (Page {page})")
            print(f"[Spider-Kouba] URL: {url}")
            
            try:
                resp = requests.get(url, headers=self.headers, timeout=30)
                if resp.status_code != 200:
                    print(f"[Spider-Kouba] Failed with status {resp.status_code}")
                    break

                soup = BeautifulSoup(resp.text, 'html.parser')
                products = soup.select('.product')
                
                if not products:
                    print("[Spider-Kouba] No more products found.")
                    break
                
                print(f"[Spider-Kouba] Found {len(products)} products on page {page}.")
                
                for item in products:
                    # Get raw HTML of product card
                    raw_html = str(item)
                    
                    # We need a unique ID. Link is good.
                    link_el = item.select_one('a.woocommerce-LoopProduct-link')
                    if not link_el: continue
                    
                    link = link_el.get('href')
                    
                    # Insert Raw
                    try:
                        import hashlib
                        # ID is hash of link
                        item_id = hashlib.md5(link.encode('utf-8')).hexdigest()
                        
                        c.execute("""
                            INSERT OR IGNORE INTO listings (id, title, link, raw_html, source, scraped_at) 
                            VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
                        """, (item_id, "Pending Parse", link, raw_html, 'kouba'))
                        saved_count += 1
                    except Exception as e:
                        print(f"Error inserting: {e}")
                        
            except Exception as e:
                print(f"[Spider-Kouba] Error on page {page}: {e}")
                
        conn.commit()
        conn.close()
        print(f"[Spider-Kouba] Total saved {saved_count} items to Raw DB.")
            


if __name__ == "__main__":
    s = KoubaSpider()
    s.scrape()
