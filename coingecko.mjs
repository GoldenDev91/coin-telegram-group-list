import { default as axios } from "axios";
import { default as _ } from "lodash";
import { load_db } from "./utils.mjs";

const getCoinList = async () => {
  db.data.list = [];
  await axios
    .get("https://api.coingecko.com/api/v3/coins/list", {
      params: {
        include_platform: false,
      },
    })
    .then(async (res) => {
      db.data.list = res.data;
      await db.write();
      console.log(res.data.length + " coins saved.");
    })
    .catch(async (err) => console.error(err.code));
};

const getCoinDetails = async () => {
  for (let coin_idx = db.data.coins.length; coin_idx < db.data.list.length; coin_idx++) {
    await axios
      .get(
        "https://api.coingecko.com/api/v3/coins/" +
          db.data.list[coin_idx].id +
          "?localization=false&tickers=false&market_data=false&community_data=true&developer_data=false&sparkline=false"
      )
      .then(async (res) => {
        console.log(coin_idx + " : " + res.data.name);
        db.data.coins.push(res.data);
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
  }
};
const getLinks = async () => {
  let telegrams = [];
  let discords = [];
  for (let coin of db.data.coins) {
    let chat_url = coin.links.chat_url;
    for (let url of chat_url) {
      if (typeof url != "string") continue;
      if (url.startsWith("https://t.me/")) {
        telegrams.push(url);
      }
      if (url.startsWith("https://discord")) {
        discords.push(url);
      }
    }
    if (coin.links.telegram_channel_identifier != "" && coin.links.telegram_channel_identifier != undefined && coin.links.telegram_channel_identifier != null) {
      telegrams.push("https://t.me/" + coin.links.telegram_channel_identifier);
    }
  }
  links_db.data.telegrams = _.uniq(_.concat(links_db.data.telegrams, telegrams));
  links_db.data.discords = _.uniq(_.concat(links_db.data.telegrams, discords));
  await db.write();
  console.log(`Found ${links_db.data.telegrams.length} telegram links.`);
  console.log(`Found ${links_db.data.discords.length} discord links.`);
};

const db = await load_db("coingecko");
const links_db = await load_db("links");

export default {
  getCoinList,
  getCoinDetails,
  getLinks,
};
