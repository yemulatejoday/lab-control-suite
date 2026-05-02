const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { initDB, getUser, createUser, getBots, addBot, addTelemetry, getLatestTelemetry, getTelemetryLogs, getAvailableBots, removeBotData, hasTelemetry } = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;
const SECRET = process.env.JWT_SECRET || 'agri-bot-prod-secret-999'; 

app.use(cors());
app.use(express.json());

// Auth Middleware
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch (e) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// --- AUTH ROUTES ---
app.post('/api/auth/register', async (req, res) => {
  const { email, password, name } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const userId = await createUser(email, hashedPassword, name);
    const token = jwt.sign({ id: userId, email }, SECRET);
    res.json({ token, user: { email, name } });
  } catch (e) {
    res.status(400).json({ error: 'User already exists' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await getUser(email);
  if (!user) {
    return res.status(404).json({ error: 'Account does not exist, please create an account' });
  }
  if (!(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid password or email' });
  }
  const token = jwt.sign({ id: user.id, email }, SECRET);
  res.json({ token, user: { email: user.email, name: user.name } });
});

// --- BOT ROUTES ---
app.get('/api/available-bots', authenticate, async (req, res) => {
  const bots = await getAvailableBots();
  res.json(bots);
});

app.get('/api/bots', authenticate, async (req, res) => {
  const bots = await getBots(req.user.id);
  res.json(bots);
});

app.post('/api/bots', authenticate, async (req, res) => {
  const { botId, name } = req.body;
  const hasData = await hasTelemetry(botId);
  if (!hasData) {
    return res.status(400).json({ error: 'No real telemetry found for this bot yet' });
  }
  await addBot(req.user.id, botId, name);
  res.json({ success: true });
});

// --- TELEMETRY ROUTES ---
// This is what the ESP32 calls
app.post('/api/telemetry', async (req, res) => {
  const { botId, distance, area, pesticide, battery, tank, status } = req.body;
  await addTelemetry(botId, { distance, area, pesticide, battery, tank, status });
  res.json({ success: true });
});

app.get('/api/telemetry/:botId', authenticate, async (req, res) => {
  const data = await getLatestTelemetry(req.params.botId);
  res.json(data || {});
});

app.get('/api/reports/:botId', authenticate, async (req, res) => {
  const logs = await getTelemetryLogs(req.params.botId);
  res.json(logs);
});

initDB().then(async () => {
  const sampleBotIds = [
    "bot123",
    "bot 321",
    "BOT-AG-102",
    "BOT-AG-118",
    "BOT-AG-125",
    "BOT-AG-131",
    "DEMO-BOT-01",
    "DEMO-BOT-02",
    "DEMO-BOT-03",
  ];
  await Promise.all(sampleBotIds.map((id) => removeBotData(id)));
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
