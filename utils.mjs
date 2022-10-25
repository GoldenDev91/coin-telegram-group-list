import { Low } from "lowdb";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { JSONFile } from "lowdb/node";

/**
 * @desc Returns a promise with delay
 * @param { number } ms - Delay time in miliseconds.
 * @returns { Promise } A promise with delay.
 */
export const delay = (ms) => new Promise((res) => setTimeout(res, ms));

export const load_db = async () => {
  const __dirname = dirname(fileURLToPath(import.meta.url));

  const dbjson = join(__dirname, "db.json");
  const adapter = new JSONFile(dbjson);
  const db = new Low(adapter);
  await db.read();
  db.data ||= {
    coingecko: {
      list: [],
      coins: [],
      telegrams: [],
      discords: [],
    },
  };
  return db;
};
