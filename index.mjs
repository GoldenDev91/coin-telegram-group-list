import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { default as axios } from "axios";
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import { delay } from "./utils.js";
import { Console, timeLog } from "node:console";

const __dirname = dirname(fileURLToPath(import.meta.url));

const file = join(__dirname, "db.json");
const adapter = new JSONFile(file);
const db = new Low(adapter);
db.data ||= {
  coingecko: {
    list: [],
    coins: [],
  },
};
await db.write();
await db.read();

async function getCoingecko() {
  await axios
    .get("https://api.coingecko.com/api/v3/coins/list", {
      params: {
        include_platform: false,
      },
    })
    .then(async (res) => {
      db.data.coingecko.list = res.data;
      await db.write();
      console.log(res.data.length + " coins saved.");
    })
    .catch(async (err) => console.error(err.code));
  for (
    let coin_idx = db.data.coingecko.coins.length;
    coin_idx < db.data.coingecko.list.length;
    coin_idx++
  ) {
    await axios
      .get(
        "https://api.coingecko.com/api/v3/coins/" +
          db.data.coingecko.list[coin_idx].id +
          "?localization=false&tickers=false&market_data=false&community_data=true&developer_data=false&sparkline=false"
      )
      .then(async (res) => {
        console.log(coin_idx + " : " + res.data.name);
        db.data.coingecko.coins.push(res.data);
        await db.write();
        await delay(2000);
      })
      .catch(async (err) => {
        console.error(err.code);
        let time_left = 60;
        console.log("waiting for 60 seconds");
        while (time_left-- > 0) {
          console.log("remaining " + time_left + "seconds ...");
          await delay(1000);
        }
        coin_idx--;
      });
    // {
    // localization: "false",
    // tickers: "false",
    // market_data: "false",
    // community_data: "true",
    // developer_data: "false",
    // sparkline: "false",
    // }
  }
}
getCoingecko();
await db.write();
