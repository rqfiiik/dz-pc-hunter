import sqlite3
import os
import json
import statistics

CLEAN_DB = os.path.join(os.path.dirname(__file__), 'data_engine/storage/clean_data.db')

def analyze(query):
    print(f"\n[Analysis] Generating report for: '{query}'...")
    
    conn = sqlite3.connect(CLEAN_DB)
    c = conn.cursor()
    
    # Simple search in title/model
    c.execute("SELECT brand, model, specs, price, currency, source, link FROM products WHERE model LIKE ? OR brand LIKE ?", 
              (f'%{query}%', f'%{query}%'))
    
    # Actually, the processor splits brand/model. 
    # Let's just fetch all and filter in python for flexibility if the query is complex
    c.execute("SELECT brand, model, specs, price, currency, source, link, hash_id, title FROM products")
    rows = c.fetchall()
    
    matches = []
    prices = []
    
    query_parts = query.lower().split()
    
    for r in rows:
        brand, model, specs_json, price, currency, source, link, uid, title_raw = r
        specs = json.loads(specs_json)
        
        # Construct a full search string
        full_text = f"{title_raw} {brand} {model} {specs.get('cpu','') } {specs.get('gpu','') } {specs.get('ram','') } {specs.get('storage','') }".lower()
        
        # Check if all query parts are in the full text
        if all(part in full_text for part in query_parts):
            matches.append({
                'title': f"{brand} {model}",
                'specs': specs,
                'price': price,
                'link': link,
                'source': source
            })
            if price:
                prices.append(price)

    print(f"[Analysis] Found {len(matches)} matching items.")
    
    sys.stdout.reconfigure(encoding='utf-8')

    if prices:
        avg_price = statistics.mean(prices)
        min_price = min(prices)
        max_price = max(prices)
        
        print(f"\n{'-'*40}")
        print(f" STATISTICS: {query.upper()}")
        print(f"{'-'*40}")
        print(f" Average Price: {avg_price:,.0f} DZD")
        print(f" Min Price::    {min_price:,.0f} DZD")
        print(f" Max Price:    {max_price:,.0f} DZD")
        print(f"{'-'*40}\n")
        
        print(f" TOP RESULTS:")
        for i, m in enumerate(matches[:5]):
            print(f"{i+1}. {m['title']} | {m['specs'].get('cpu')} / {m['specs'].get('ram')} | {m['price']:,.0f} DZD | {m['source']}")
            
    else:
        print("[Analysis] No price data found for this query.")
        
    conn.close()

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        q = sys.argv[1]
    else:
        q = "hp elitebook"
    analyze(q)
