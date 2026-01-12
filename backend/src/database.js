const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Ensure data directory exists
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'luckydraw.db');
const db = new Database(dbPath);

// Initialize database schema
db.exec(`
  CREATE TABLE IF NOT EXISTS participants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_name TEXT NOT NULL,
    employee_id TEXT NOT NULL UNIQUE,
    company TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS winners (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    participant_id INTEGER NOT NULL,
    employee_name TEXT NOT NULL,
    employee_id TEXT NOT NULL,
    company TEXT NOT NULL,
    prize_name TEXT,
    prize_rank INTEGER NOT NULL,
    draw_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (participant_id) REFERENCES participants(id)
  );

  CREATE INDEX IF NOT EXISTS idx_employee_id ON participants(employee_id);
  CREATE INDEX IF NOT EXISTS idx_winners_employee_id ON winners(employee_id);
  CREATE INDEX IF NOT EXISTS idx_prize_rank ON winners(prize_rank);
`);

console.log('Database initialized at:', dbPath);

module.exports = db;
