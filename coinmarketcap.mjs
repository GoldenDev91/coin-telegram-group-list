import { default as axios } from "axios";
import { default as _ } from "lodash";
import { load_db } from "./utils.mjs";
import * as dotenv from "dotenv";
dotenv.config();

const API_KEY = process.env.COINMARKETCAP_API_KEY;

const getCoinList = async () => {
  let step = 0;
  let stepCount;
  db.data.list = [];
  do {
    await axios
      .get(
        `https://pro-api.coinmarketcap.com/v1/cryptocurrency/map?listing_status=active,inactive,untracked&aux&start=
          ${step * 5000 + 1}
          &limit=5000`,
        {
          headers: {
            "X-CMC_PRO_API_KEY": API_KEY,
          },
        }
      )
      .then(async (res) => {
        if (res.data.status.error_code == 0) {
          stepCount = res.data.data.length;
          db.data.list = _.concat(db.data.list, res.data.data);
          await db.write();
        } else console.error(res.data.status.error_message);
      })
      .catch(async (err) => console.error(err.code));
    console.log(`${step} : ${stepCount}`);
    step++;
  } while (stepCount == 5000);
  console.log(db.data.list.length + " coins saved.");
};

const getCoinDetails = async () => {
  const STEP = 10;
  for (let coin_idx = db.data.coins.length; coin_idx < db.data.list.length; coin_idx += STEP) {
    var ids = "";
    for (let idx = 0; idx < Math.min(10, db.data.list.length - coin_idx); idx++) ids += db.data.list[coin_idx + idx].id + ",";
    console.log(ids);
    await axios
      .get(`https://pro-api.coinmarketcap.com/v2/cryptocurrency/info?id=${ids.slice(0, ids.length - 1)}&aux=urls`, {
        headers: {
          "X-CMC_PRO_API_KEY": API_KEY,
        },
      })
      .then(async (res) => {
        if (res.data.status.error_code == 0) {
          db.data.coins = _.concat(db.data.coins, ...Object.values(res.data.data));
          await db.write();
        } else console.error(res.data.status.error_message);
      })
      .catch(async (err) => console.error(err));
  }
};

const getLinks = async () => {
  let telegrams = [];
  let discords = [];
  for (let coin of db.data.coins) {
    let chat_url = coin.urls.chat;
    for (let url of chat_url) {
      if (typeof url != "string") continue;
      if (url.startsWith("https://t.me/")) {
        telegrams.push(url);
      }
      if (url.startsWith("https://discord")) {
        discords.push(url);
      }
    }
  }
  links_db.data.telegrams = _.uniq(_.concat(links_db.data.telegrams, telegrams));
  links_db.data.discords = _.uniq(_.concat(links_db.data.telegrams, discords));
  await links_db.write();
  console.log(`Found ${links_db.data.telegrams.length} telegram links.`);
  console.log(`Found ${links_db.data.discords.length} discord links.`);
};

const db = await load_db("coinmarketcap");
const links_db = await load_db("links");

export default {
  getCoinList,
  getCoinDetails,
  getLinks,
};
