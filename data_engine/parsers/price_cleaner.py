import re

def clean_price(price_str):
    if not price_str:
        return None
    
    # Lowercase and remove spaces
    s = price_str.lower().replace(' ', '').replace(',', '').replace('.', '')
    
    # Reject foreign currencies
    if any(c in s for c in ['€', '$', 'eur', 'usd']):
        return None
        
    # Remove Algerian currency symbols
    s = s.replace('da', '').replace('dzd', '')
    
    try:
        if 'm' in s:
            # "6m" -> 6 million centimes -> 60,000 DA
            val = float(re.findall(r"[\d\.]+", s)[0])
            return int(val * 10000)
        elif 'k' in s:
            # "60k" -> 60,000 DA
            val = float(re.findall(r"[\d\.]+", s)[0])
            return int(val * 1000)
        else:
            # "60000" -> 60,000
             val = int(re.findall(r"\d+", s)[0])
             # heuristic: if < 100, might be "millions" shorthand?
             # e.g. "6" -> 60,000. But "13" -> 130,000? 
             # Safe formatting: pure number is usually DA if large, or millions if small.
             if val < 500: # Assuming laptop price < 500DA is impossible
                 return val * 10000
             return val
    except:
        return None

if __name__ == "__main__":
    tests = ["6m", "60k", "15000 DA", "12.5m", "8", "60000"]
    for t in tests:
        print(f"{t} -> {clean_price(t)}")
