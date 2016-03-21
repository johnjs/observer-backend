import * as _ from "underscore";
import globalConfig from "./global.json";

const envConfig = require(`./${process.env.NODE_ENV || 'development'}.json`);
let config = _.extend(globalConfig, envConfig)

config.FACEBOOK_TOKEN = process.env.FACEBOOK_TOKEN || config.FACEBOOK_TOKEN;
config.FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID || config.FACEBOOK_APP_ID;
config.FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET || config.FACEBOOK_APP_SECRET;

export default config;
