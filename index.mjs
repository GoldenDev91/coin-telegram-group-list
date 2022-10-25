import { delay, load_db } from "./utils.mjs";
import { Console, timeLog } from "node:console";
import { default as _ } from "lodash";
import { default as Coingecko } from "./coingecko.mjs";
import { default as CoinMarketCap } from "./coinmarketcap.mjs";

// await CoinMarketCap.getCoinList();
// await CoinMarketCap.getCoinDetails();
// await CoinMarketCap.getLinks();

// await Coingecko.getCoinList();
// await Coingecko.getCoinDetails();
// await Coingecko.getLinks();

const links_db = await load_db("links");

const getRandomLinks = (len) => {
  console.log(`Getting ${len} telegram links of ${links_db.data.telegrams.length}...`);
  //console.log(db.data.discords.length);
  return _.sortBy(links_db.data.telegrams, [() => 0.5 - Math.random()]).slice(0, len);
};

getRandomLinks(100).forEach((link) => console.log(link));
