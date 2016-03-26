/**
 * The module exports a class responsible for fetching data from Facebook API
 * using fbgraph library. When the file is run as an individual module it fetches
 * fb data for account passed as a first argument of command line invocation. The
 * valid access token should be defined as a second argument.
 */
import { extend } from 'underscore';
import jsonfile from 'jsonfile';
import config from '../../config/config';
import logger from '../../utils/logger.js';
import Q from 'q';
import moment from 'moment';
import FeedStream from './feed_stream';

const FEED_DIRECTORY = './feed/facebook/';
const FEED_FILE_FORMATTING_OPTIONS = { spaces: 2 };

function getDefaultRequestParams() {
  return {
    // fields: 'likes.summary(true)',
    since: moment().subtract({ h: 24 }).toISOString(),
    limit: 100,
  };
}

export default class FacebookScraper {

  constructor(account, token) {
    this.account = account;
    this.token = token;
  }

  scrape() {
    const url = this._buildRequestUrl();
    const stream = this._getDataStream();
    const data = [];

    stream.on('error', err => logger.logError(err));
    stream.on('data', chunk => Array.prototype.push.apply(data, chunk));
    stream.on('end', () => this._saveFeed(data));

    stream.callGraphAPI(url);
  }

  _getDataStream() {
    return new FeedStream();
  }

  _buildRequestUrl() {
    const reqParams = extend({ access_token: this.token }, getDefaultRequestParams());
    const reqParamsStr = Object.keys(reqParams).reduce(
      (p, k) => p.concat(`${k}=${reqParams[k]}`), []).join('&');
    return `${this.account}/feed?${reqParamsStr}`;
  }

  _saveFeed(feed) {
    if (config.FEED_DESTINATION === 'FILE') {
      this._saveFeedInFile(feed);
    }
  }

  _saveFeedInFile(feed) {
    const fileName = `${FEED_DIRECTORY}${this.account}_${(new Date()).toISOString()}.json`;
    return Q.denodeify(jsonfile.writeFile)(fileName, feed, FEED_FILE_FORMATTING_OPTIONS)
      .catch((e) => {
        logger.logError(e);
      });
  }
}

if (require.main === module) {
  const args = process.argv;
  const scraper = new FacebookScraper(args[2], args[3]);
  scraper.scrape();
}
