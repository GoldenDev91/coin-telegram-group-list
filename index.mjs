import { delay, load_db } from "./utils.mjs";
import { Console, timeLog } from "node:console";
import { default as _ } from "lodash";
import { default as Coingecko } from "./coingecko.mjs";

Coingecko.getRandomLinks(500).forEach((link) => console.log(link));
