import { extend } from 'underscore';
import globalConfig from './global.json';

const envConfig = require(`./${process.env.NODE_ENV || 'development'}.json`);
const config = extend(globalConfig, envConfig);

if (process.env.NODE_ENV !== 'test') {
  extend(config, process.env);
}

export default config;
