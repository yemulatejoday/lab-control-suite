const app = require('./app.cjs');
const { initDB, removeBotData } = require('./db.cjs');

const PORT = process.env.PORT || 5000;

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
