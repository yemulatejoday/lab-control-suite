const app = require('../server/app');
const { initDB } = require('../server/db');

let initPromise;

const ensureDb = () => {
  if (!initPromise) {
    initPromise = initDB();
  }
  return initPromise;
};

module.exports = async (req, res) => {
  await ensureDb();
  return app(req, res);
};
