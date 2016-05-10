/**
 * Module exports project's configuration. It extends global parameters
 * with environment-specific ones.
 **/
import { extend } from 'underscore';
import globalConfig from './global.json';

let config = null;

export default {
  init() {
    const envConfig = require(`./${process.env.NODE_ENV || 'development'}.json`);
    config = extend(globalConfig, envConfig);

    if (process.env.NODE_ENV !== 'test') {
      extend(config, process.env);
    }
  },

  get(key) {
    if (!config) {
      this.init();
    }
    return config[key];
  },
};
