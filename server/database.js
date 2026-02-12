const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'dzpchunter.db');
const db = new sqlite3.Database(dbPath);

function initDb() {
    db.serialize(() => {
        // Models table (to track search history and cached stats)
        db.run(`CREATE TABLE IF NOT EXISTS models (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE,
            avg_price INTEGER,
            min_price INTEGER,
            max_price INTEGER,
            last_updated DATETIME
        )`);

        // Listings table
        db.run(`CREATE TABLE IF NOT EXISTS listings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            model_id INTEGER,
            title TEXT,
            price INTEGER,
            raw_price TEXT,
            source TEXT,
            link TEXT,
            score TEXT, -- 'great', 'good', 'bad'
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(model_id) REFERENCES models(id)
        )`);
        
        console.log('Database initialized successfully.');
    });
}

module.exports = { db, initDb };
