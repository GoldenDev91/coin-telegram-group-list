import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { default as axios } from "axios";
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import { delay } from "./utils.js";
import { Console } from "node:console";

const __dirname = dirname(fileURLToPath(import.meta.url));

const file = join(__dirname, "db.json");
const adapter = new JSONFile(file);
const db = new Low(adapter);
await db.read();
db.data ||= {
  coingecko: {
    list: [],
    coins: [],
  },
};

async function getCoingecko() {
  try {
    const list_response = await axios.get(
      "https://api.coingecko.com/api/v3/coins/list",
      {
        params: {
          include_platform: false,
        },
      }
    );
    var coin_list = list_response.data;
    db.data.coingecko.list = coin_list;
    await db.write();

    let coin_details = [];
    for (let coin_idx in db.data.coingecko.list) {
      let coin = db.data.coingecko.list[coin_idx];
      const detail_response = await axios.get(
        "https://api.coingecko.com/api/v3/coins/" +
          coin.id +
          "?localization=false&tickers=false&market_data=false&community_data=true&developer_data=false&sparkline=false"
      );
      // {
      // localization: "false",
      // tickers: "false",
      // market_data: "false",
      // community_data: "true",
      // developer_data: "false",
      // sparkline: "false",
      // }
      console.log(coin_idx + " : " + detail_response.data.name);
      db.data.coingecko.coins.push(detail_response.data);
      await db.write();
      await delay(2000);
    }
    db.data.coingecko.coin = coin_data;
  } catch (error) {
    console.error(error);
  }
}

getCoingecko();
await db.write();
