import { extend } from 'underscore';
import globalConfig from './global.json';

const envConfig = require(`./${process.env.NODE_ENV || 'development'}.json`);
const config = extend(globalConfig, envConfig);

config.FACEBOOK_ACCOUNT = process.env.FACEBOOK_ACCOUNT || config.FACEBOOK_ACCOUNT;
config.FACEBOOK_TOKEN = process.env.FACEBOOK_TOKEN || config.FACEBOOK_TOKEN;
config.FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID || config.FACEBOOK_APP_ID;
config.FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET || config.FACEBOOK_APP_SECRET;
config.FEED_DESTINATION = process.env.FEED_DESTINATION || config.FEED_DESTINATION;

export default config;
