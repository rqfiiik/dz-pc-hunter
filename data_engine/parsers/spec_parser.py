import re
import json

class SpecParser:
    def __init__(self):
        self.patterns = {
            'cpu': [
                r'(i[3579]-?\d{4,5}[A-Z]*)', # Intel Core i series
                r'(Ryzen\s?\d\s?\d{4}[A-Z]*)', # AMD Ryzen
                r'(M1|M2|M3\s?(Pro|Max|Ultra)?)', # Apple Silicon
                r'(Celeron|Pentium|Athlon)'
            ],
            'ram': [
                r'(\d{1,3})\s?GB\s?(RAM)?', # 8GB, 16 GB RAM
            ],
            'storage': [
                r'(\d{3,4})\s?GB\s?(SSD|HDD|NVMe)', # 512GB SSD
                r'(\d)\s?TB\s?(SSD|HDD|NVMe)', # 1TB SSD
                r'(SSD|HDD)\s?(\d{3,4})\s?GB' # SSD 512GB
            ],
            'gpu': [
                r'(RTX\s?\d{3,4}\s?(Ti|Super|Laptop)?)', # RTX 3060
                r'(GTX\s?\d{3,4}\s?(Ti|Super)?)', # GTX 1650
                r'(Radeon\s?RX\s?\d{3,4}[A-Z]*)', # Radeon RX
                r'(Iris\s?Xe|UHD|Vega\s?\d{1,2})' # Integrated
            ]
        }

    def parse_specs(self, title):
        specs = {}
        
        # CPU Extraction
        for pattern in self.patterns['cpu']:
            match = re.search(pattern, title, re.IGNORECASE)
            if match:
                specs['cpu'] = match.group(1).strip()
                break
        
        # RAM Extraction
        for pattern in self.patterns['ram']:
            match = re.search(pattern, title, re.IGNORECASE)
            if match:
                specs['ram'] = f"{match.group(1)}GB"
                break

        # Storage Extraction
        for pattern in self.patterns['storage']:
            match = re.search(pattern, title, re.IGNORECASE)
            if match:
                if 'TB' in match.group(0).upper():
                     specs['storage'] = f"{match.group(1)}TB {match.group(2) if match.lastindex >= 2 else ''}".strip()
                else:
                    # Handle "SSD 512GB" vs "512GB SSD"
                    if match.lastindex >= 2:
                        val = match.group(1) if match.group(1).isdigit() else match.group(2)
                        type_ = match.group(2) if match.group(1).isdigit() else match.group(1)
                        specs['storage'] = f"{val}GB {type_}"
                    else:
                        specs['storage'] = match.group(0)
                break

        # GPU Extraction
        for pattern in self.patterns['gpu']:
            match = re.search(pattern, title, re.IGNORECASE)
            if match:
                specs['gpu'] = match.group(1).strip()
                break
                
        return specs

if __name__ == "__main__":
    parser = SpecParser()
    test_titles = [
        "ASUS TUF FX505 Ryzen 5 3550H 16GB 512SSD GTX1650",
        "Dell XPS 13 i7-1165G7 32GB 1TB NVMe Iris Xe",
        "HP Laptop 15 8GB RAM 256GB SSD Celeron N4020"
    ]
    
    for t in test_titles:
        print(f"Title: {t}")
        print(f"Specs: {json.dumps(parser.parse_specs(t), indent=2)}")
        print("-" * 30)
