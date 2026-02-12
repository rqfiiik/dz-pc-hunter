import argparse
import sys
import schedule
import time
from colorama import init, Fore

init(autoreset=True)

def job():
    print(f"{Fore.CYAN}[Scheduler] Starting daily scrape job...")
    # TODO: Call spiders here
    print(f"{Fore.GREEN}[Scheduler] Job complete.")

def run_scheduler():
    from updater.scheduler import start_scheduler
    start_scheduler()

def main():
    parser = argparse.ArgumentParser(description="DZ PC Hunter - Data Engine")
    parser.add_argument('--mode', choices=['once', 'scheduler', 'process'], default='once', help='Run mode')
    parser.add_argument('--spider', help='Specific spider to run (e.g. laptops)')
    parser.add_argument('--query', default='laptop', help='Search query for the spider')
    args = parser.parse_args()

    print(f"{Fore.GREEN}=== DZ PC Hunter Data Engine ===")
    
    if args.mode == 'scheduler':
        run_scheduler()
    else:
        print(f"{Fore.CYAN}[System] Running one-off job...")
        # TODO: Logic to run specific spider or all
        # TODO: Logic to run specific spider or all
        if args.spider == 'laptops':
            print(f"Running spider: {args.spider} with query: {args.query}")
            from spiders.laptops import LaptopSpider
            spider = LaptopSpider(headless=False)
            spider.scrape_ouedkniss(query=args.query)
        elif args.spider == 'kouba':
            print(f"Running spider: {args.spider} with query: {args.query}")
            from spiders.kouba import KoubaSpider
            spider = KoubaSpider()
            if hasattr(spider, 'scrape'):
                spider.scrape(query=args.query)
        elif args.mode == 'process':
             from processor import DataProcessor
             p = DataProcessor()
             p.process_all()
        else:
            print("Running all spiders (Not implemented yet)...")

if __name__ == "__main__":
    main()
