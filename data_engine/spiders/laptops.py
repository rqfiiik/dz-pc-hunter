import time
import random
import json
import sqlite3
import os
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By
from fake_useragent import UserAgent

DB_PATH = os.path.join(os.path.dirname(__file__), '../storage/raw_data.db')

class LaptopSpider:
    def __init__(self, headless=True):
        self.options = Options()
        if headless:
            self.options.add_argument('--headless=new')
        self.options.add_argument('--no-sandbox')
        self.options.add_argument('--disable-dev-shm-usage')
        self.options.add_argument("--disable-blink-features=AutomationControlled")
        
        # Eager strategy for faster scraping (waits for DOMContentLoaded, not all images)
        self.options.page_load_strategy = 'eager'
        
        # Fake User Agent
        ua = UserAgent()
        user_agent = ua.random
        self.options.add_argument(f'user-agent={user_agent}')
        
        self.driver = None

    def start_driver(self):
        print("[Spider] Starting Standard Chrome (via Manager)...")
        service = Service(ChromeDriverManager().install())
        self.driver = webdriver.Chrome(service=service, options=self.options)

    def scrape_ouedkniss(self, query="laptop"):
        if not self.driver:
            self.start_driver()
            
        # Google First Strategy as requested by user
        search_term = f"{query} ouedkniss"
        print(f"[Spider] Google-First Strategy: Searching for '{search_term}'...")
        
        try:
            self.driver.get("https://www.google.com")
            time.sleep(2)
            
            # Type into search
            search_box = self.driver.find_element(By.NAME, "q")
            search_box.send_keys(search_term)
            search_box.submit()
            time.sleep(3)
            
            # Find first Ouedkniss link
            # Selector for standard google results
            # Try multiple selectors for Google results
            # h3 is usually the title, closest a is parent
            
            print("[Spider] dumping google debug...")
            self.driver.save_screenshot("debug_google_search.png")
            with open("debug_google_search.html", "w", encoding="utf-8") as f:
                f.write(self.driver.page_source)

            links = self.driver.find_elements(By.XPATH, "//a[contains(@href, 'ouedkniss.com')]")
            
            target_url = None
            for link in links:
                href = link.get_attribute("href")
                if href and "ouedkniss.com" in href and "google" not in href:
                    target_url = href
                    print(f"[Spider] Found Google Result: {target_url}")
                    break
            
            if not target_url:
                print("[Spider] Could not find a valid Ouedkniss link on Google. Falling back to direct URL.")
                formatted_query = query.replace(" ", "-") 
                target_url = f"https://www.ouedkniss.com/s/1?keywords={formatted_query}"

            print(f"[Spider] Navigating to Target: {target_url}")
            self.driver.get(target_url)
            time.sleep(5) # Let Ouedkniss load properly
            time.sleep(random.uniform(3, 6))
            
            # Check for Cloudflare challenge
            title = self.driver.title
            if "Cloudflare" in title or "Just a moment" in title:
                print("[Spider] Cloudflare detected! Waiting/Saving snapshot...")
                time.sleep(10)
                # Attempt to save snapshot anyway
                
            # Scroll to load more items (store layout)
            self.driver.execute_script("window.scrollTo(0, document.body.scrollHeight/2);")
            time.sleep(2)
            self.driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
            time.sleep(3)

            # Extract raw listings (store items typically in divs)
            # 2026 Updated Selectors based on debug HTML
            # Container: div.o-announ-card
            products = self.driver.find_elements(By.CSS_SELECTOR, 'div.o-announ-card')
            
            if not products:
                 print("[Spider] Found 0 listings via new selector. Dumping HTML for debug...")
                 with open("debug_ouedkniss_source.html", "w", encoding="utf-8") as f:
                     f.write(self.driver.page_source)
                 
                 # Fallback to old selectors just in case
                 products = self.driver.find_elements(By.CSS_SELECTOR, 'div.announce-browse-item, a.announce-link, div[class*="AnnounceItem"]')

            print(f"[Spider] Found {len(products)} potential listings.")
            
            saved_count = 0
            conn = sqlite3.connect(DB_PATH)
            c = conn.cursor()

            for item in products:
                try:
                    # Extract link - The card itself might contain the link or be wrapped
                    link_el = item.find_element(By.TAG_NAME, 'a')
                    if not link_el: continue
                    
                    link = link_el.get_attribute('href')
                    
                    # Title (optional for raw, but good for debug)
                    try:
                        title = item.find_element(By.CSS_SELECTOR, 'h3, div[class*="title"]').text
                    except:
                        title = "Unknown"
                    
                    # Raw HTML of the card
                    raw_html = item.get_attribute('outerHTML')
                    
                    # Generate ID
                    import hashlib
                    item_id = hashlib.md5(link.encode('utf-8')).hexdigest()
                    
                    c.execute("""
                        INSERT OR IGNORE INTO listings (id, title, link, raw_html, source, scraped_at) 
                        VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
                    """, (item_id, title, link, raw_html, 'ouedkniss'))
                    saved_count += 1
                    
                except Exception as e:
                    # print(f"Error parsing item: {e}")
                    continue
            
            conn.commit()
            conn.close()
            print(f"[Spider] Saved {saved_count} raw items to DB.")

        except Exception as e:
            print(f"[Spider] Error: {e}")
            
        finally:
            if self.driver:
                self.driver.quit()

if __name__ == "__main__":
    spider = LaptopSpider(headless=False)
    spider.scrape_ouedkniss()
