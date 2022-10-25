import { default as axios } from "axios";
import { default as _ } from "lodash";
import { load_db } from "./utils.mjs";

const getCoinList = async () => {
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
};

const getCoinDetails = async () => {
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
        //await delay(2000);
      })
      .catch(async (err) => {
        console.error(err.code);
        let time_left = 60;
        console.log("waiting for 60 seconds");
        while (time_left-- > 0) {
          console.log("remaining " + time_left + " seconds ...");
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
};
const getLinks = async () => {
  let telegrams = [];
  let discords = [];
  for (let coin of db.data.coingecko.coins) {
    let chat_url = coin.links.chat_url;
    for (let url of chat_url) {
      if (typeof url != "string") continue;
      if (url.startsWith("https://t.me/")) {
        telegrams.push(url);
        console.log(url);
      }
      if (url.startsWith("https://discord")) {
        discords.push(url);
        //console.log(url);
      }
    }
    if (
      coin.telegram_channel_identifier !== "" &&
      coin.telegram_channel_identifier !== null
    ) {
      telegrams.push("https://t.me/" + coin.telegram_channel_identifier);
    }
  }
  db.data.coingecko.telegrams = _.uniq(telegrams);
  db.data.coingecko.discords = _.uniq(discords);
  console.log(`Found ${db.data.coingecko.telegrams.length} telegram links.`);
  console.log(`Found ${db.data.coingecko.discords.length} discord links.`);
  await db.write();
};

const getRandomLinks = (len) => {
  return _.sortBy(db.data.coingecko.telegrams, [
    () => 0.5 - Math.random(),
  ]).slice(0, len);
};

const db = await load_db();

export default {
  getCoinList,
  getCoinDetails,
  getLinks,
  getRandomLinks,
};
