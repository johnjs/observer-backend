/**
 * The module exports a class responsible for fetching data from Facebook API
 * using fbgraph library. When the file is run as an individual module it fetches
 * fb data for account passed as the first argument of command line invocation. The
 * valid access token should be defined as the second argument.
 *
 * FEED_DESTINATION=FILE node ./build/lib/facebook/facebook_scraper.js FB_ACCOUNT FB_TOKEN
 *
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

/**
* Returns default parameters of Facebook API call. Since we are not interested
* in actual authors of comments and likes of a given post but only in the `total_count`
* number (which is provided in `summary`), both `comments` and 'likes' fields are limited to 0.
*/
function getDefaultRequestParams() {
  return {
    fields: ['message', 'created_time', 'comments.limit(0).summary(true)',
            'likes.limit(0).summary(true)', 'link', 'message_tags'].join(','),
    since: moment().subtract({ h: 24 }).toISOString(),
    limit: 100,
  };
}

export default class FacebookScraper {

  /**
   * @constructor
   * @param {string} account - name of Facebook account tracked by the scraper
   * @param {string} token - access token used to access Facebook Graph API
   */
  constructor(account, token) {
    this.account = account;
    this.token = token;
  }

  /**
   * The function uses the data stream to collect Facebook data.
   */
  scrape() {
    const url = this._buildRequestUrl();
    const stream = this._getDataStream();
    const feed = [];

    stream.on('error', err => this._failure(err));
    stream.on('data', chunk => Array.prototype.push.apply(feed, chunk));
    stream.on('finish', () => this._saveFeed(feed).done(this._success));

    stream.callGraphAPI(url);
  }

  _failure(error) {
    logger.logError(error);
    process.exit(1);
  }

  _success() {
    process.exit(0);
  }

  /**
   * Creates an instance of the stream returning Facebook data.
   */
  _getDataStream() {
    return new FeedStream();
  }

  /**
   * Builds the path and the query parts of the url used when Facebook API is called
   * Example: /manchesterunited/feed?since=XXX&limit=100
   */
  _buildRequestUrl() {
    const reqParams = extend({ access_token: this.token }, getDefaultRequestParams());
    const reqParamsStr = Object.keys(reqParams).reduce(
      (p, k) => p.concat(`${k}=${reqParams[k]}`), []).join('&');
    return `${this.account}/feed?${reqParamsStr}`;
  }

  _saveFeed(feed) {
    if (config.FEED_DESTINATION === 'FILE') {
      return this._saveFeedInFile(feed);
    }
    return new Q();
  }

  /**
   * Saves the feed in JSON file in `/feed/facebook` directory. Name of the file
   * is built as a concatenation of Facebook account's name and current date time.
   * @param {object} feed - Facebook posts gathered from Facebook API for a given account
   */
  _saveFeedInFile(feed) {
    const fileName = `${FEED_DIRECTORY}${this.account}_${(new Date()).toISOString()}.json`;
    return Q.denodeify(jsonfile.writeFile)(fileName, feed, FEED_FILE_FORMATTING_OPTIONS);
  }
}

if (require.main === module) {
  const args = process.argv;
  const scraper = new FacebookScraper(args[2], args[3]);
  scraper.scrape();
}
