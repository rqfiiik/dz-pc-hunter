# DZ PC Hunter 🇩🇿💻

**Algerian PC Deal Intelligence Platform**

A production-ready system to find, normalize, and score PC deals from Ouedkniss (and other sources). Built with modern web technologies for scalability and performance.

## 🚀 Features

-   **Smart Search**: Scrapes real-time listings for any PC model (e.g., "ThinkPad T480", "MacBook Pro M1").
-   **Price Normalization**: Automatically converts ambiguous Algerian pricing formats:
    -   `6m` → `60,000 DA`
    -   `6` → `60,000 DA`
    -   `60k` → `60,000 DA`
-   **Deal Intelligence**: Classifies deals based on market average:
    -   🟢 **GREAT**: < 80% of average price
    -   🟡 **GOOD**: < 105% of average price
    -   🔴 **BAD**: > 105% of average price
-   **Resilient Scraping**: Includes anti-blocking measures and fallback mechanisms (mock data) to ensure system reliability.
-   **Modern Dashboard**: Clean, responsive UI built with Next.js and Tailwind CSS.
-   **Data Persistence**: SQLite database for storing history and caching results.

## 🛠 Tech Stack

-   **Frontend**: Next.js 13+ (App Router), Tailwind CSS, Lucide Icons.
-   **Backend**: Node.js, Express.js.
-   **Scraping**: Playwright (Headless Chromium) with stealth techniques.
-   **Database**: SQLite.
-   **Utilities**: `axios`, `clsx`, `node-cron`.

## 📦 Installation

### Prerequisites
-   Node.js (v18+ recommended)
-   npm or yarn

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/dz-pc-hunter.git
cd dz-pc-hunter
```

### 2. Setup Backend (`/server`)
```bash
cd server
npm install
# Install Playwright browsers (required for scraping)
npx playwright install chromium
```

### 3. Setup Frontend (`/client`)
```bash
cd ../client
npm install
```

## 🏃‍♂️ Usage

### Start the Backend
The backend server runs on port `5000`.
```bash
cd server
node index.js
```

### Start the Frontend
The frontend runs on port `3000`.
```bash
cd client
npm run dev
```

### Access the App
Open your browser and navigate to:
[http://localhost:3000](http://localhost:3000)

1.  Enter a PC model name (e.g., `Lenovo Legion 5`).
2.  Click **Hunt Deals**.
3.  View the analyzed results, statistics, and deal scores.

## 🧩 Architecture

```
dz-pc-hunter/
├── client/                 # Next.js Frontend
│   ├── app/                # App Router pages
│   └── package.json        
├── server/                 # Express Backend
│   ├── index.js            # API Entry Point
│   ├── scraper.js          # Playwright Logic
│   ├── database.js         # SQLite Connection
│   ├── utils.js            # Price Normalization
│   └── dzpchunter.db       # SQLite Database File
└── README.md               # Documentation
```

## 🛡 Disclaimer
This tool is for educational purposes. Please respect the Terms of Service of any website you scrape.

---
*Built with ❤️ for the DZ Tech Community.*
