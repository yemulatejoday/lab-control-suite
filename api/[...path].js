import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const app = require('../server/app.cjs');
const { initDB } = require('../server/db.cjs');

let initPromise;

const ensureDb = () => {
  if (!initPromise) {
    initPromise = initDB();
  }
  return initPromise;
};

export default async function handler(req, res) {
  await ensureDb();
  return app(req, res);
}
