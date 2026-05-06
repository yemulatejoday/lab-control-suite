const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');
const fs = require('fs');

let db;
const isRender = Boolean(process.env.RENDER || process.env.RENDER_EXTERNAL_URL);
const dbPath =
  process.env.DB_PATH ||
  (process.env.VERCEL
    ? path.join('/tmp', 'database.sqlite')
    : isRender
    ? path.join('/var/data', 'database.sqlite')
    : path.join(__dirname, 'database.sqlite'));

async function initDB() {
  const dbDir = path.dirname(dbPath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE,
      password TEXT,
      name TEXT
    );

    CREATE TABLE IF NOT EXISTS bots (
      id TEXT PRIMARY KEY,
      userId INTEGER,
      name TEXT,
      FOREIGN KEY(userId) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS telemetry (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      botId TEXT,
      distance REAL,
      area REAL,
      pesticide REAL,
      battery INTEGER,
      tank INTEGER,
      status TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(botId) REFERENCES bots(id)
    );
  `);
}

async function getUser(email) {
  return db.get('SELECT * FROM users WHERE email = ?', [email]);
}

async function createUser(email, password, name) {
  const res = await db.run('INSERT INTO users (email, password, name) VALUES (?, ?, ?)', [email, password, name]);
  return res.lastID;
}

async function getBots(userId) {
  return db.all(
    `SELECT DISTINCT b.*
     FROM bots b
     INNER JOIN telemetry t ON t.botId = b.id
     WHERE b.userId = ?`,
    [userId],
  );
}

async function addBot(userId, botId, name) {
  return db.run('INSERT OR REPLACE INTO bots (id, userId, name) VALUES (?, ?, ?)', [botId, userId, name]);
}

async function addTelemetry(botId, data) {
  return db.run(
    'INSERT INTO telemetry (botId, distance, area, pesticide, battery, tank, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [botId, data.distance, data.area, data.pesticide, data.battery, data.tank, data.status]
  );
}

async function getLatestTelemetry(botId) {
  return db.get('SELECT * FROM telemetry WHERE botId = ? ORDER BY timestamp DESC LIMIT 1', [botId]);
}

async function getTelemetryLogs(botId) {
  return db.all('SELECT * FROM telemetry WHERE botId = ? ORDER BY timestamp DESC', [botId]);
}

async function getAvailableBots() {
  return db.all(`
    SELECT DISTINCT botId as id, 'Ready to Pair' as name 
    FROM telemetry 
    WHERE botId NOT IN (SELECT id FROM bots)
  `);
}

async function hasTelemetry(botId) {
  const row = await db.get('SELECT 1 FROM telemetry WHERE botId = ? LIMIT 1', [botId]);
  return !!row;
}

async function removeBotData(botId) {
  await db.run('DELETE FROM telemetry WHERE botId = ?', [botId]);
  await db.run('DELETE FROM bots WHERE id = ?', [botId]);
}

module.exports = { initDB, getUser, createUser, getBots, addBot, addTelemetry, getLatestTelemetry, getTelemetryLogs, getAvailableBots, removeBotData, hasTelemetry };
