import schedule
import time
import subprocess
import sys
from colorama import Fore

def run_spider():
    print(f"{Fore.CYAN}[Scheduler] Starting daily scrape job...")
    # Run the spider logic via subprocess or direct import
    # Subprocess is safer for memory leaks in Selenium
    try:
        subprocess.run([sys.executable, "data_engine/main.py", "--mode", "once", "--spider", "laptops"], check=True)
        print(f"{Fore.GREEN}[Scheduler] Spider job finished.")
        
        # Then process
        subprocess.run([sys.executable, "data_engine/main.py", "--mode", "process"], check=True)
        print(f"{Fore.GREEN}[Scheduler] Processing job finished.")
        
        # Then upload (optional, or part of process)
        # subprocess.run([sys.executable, "data_engine/uploader/push_to_api.py"], check=True)
        
    except Exception as e:
        print(f"{Fore.RED}[Scheduler] Job failed: {e}")

def start_scheduler():
    print(f"{Fore.YELLOW}[System] Scheduler started. Running daily at 00:00...")
    schedule.every().day.at("00:00").do(run_spider)
    
    while True:
        schedule.run_pending()
        time.sleep(60)
