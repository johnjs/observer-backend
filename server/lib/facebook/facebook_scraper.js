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
import moment from 'moment';
import { isExecutedAsScript } from '../../utils/module_utils';
import FacebookFeedStream from './facebook_feed_stream';
import AbstractScraper from '../abstract_scraper';

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

export default class FacebookScraper extends AbstractScraper {

  /**
   * @constructor
   * @param {string} accountName - name of Facebook account tracked by the scraper
   * @param {string} token - access token used to access Facebook Graph API
   */
  constructor(accountName, token) {
    super(accountName);
    this.token = token;
  }

  /**
   * Creates an instance of the stream returning Facebook data.
   */
  _getDataStream() {
    return new FacebookFeedStream();
  }

  /**
  * Builds the path and the query parts of the url used when Facebook API is called
  * Example: /manchesterunited/feed?since=XXX&limit=100
  */
  _getStreamingOptions() {
    const reqParams = extend({ access_token: this.token }, getDefaultRequestParams());
    const reqParamsStr = Object.keys(reqParams).reduce(
      (p, k) => p.concat(`${k}=${reqParams[k]}`), []).join('&');
    return [`${this.accountName}/feed?${reqParamsStr}`];
  }

  /**
   * Return a relative path to the directory containing feed which was fetched
   * and saved as a JSON file.
   * @returns {String} path
   **/
  _getFeedDirectory() {
    return './feed/facebook/';
  }
}

if (isExecutedAsScript(module)) {
  const args = process.argv;
  const scraper = new FacebookScraper(args[2], args[3]);
  scraper.scrape();
}
