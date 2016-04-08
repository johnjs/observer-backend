/**
 * The module exports a class responsible for scraping data from Twitter API
 * When the file is invoked as an individual module it fetches
 * twitter data for account passed as the first argument of command line invocation.
 *
 * FEED_DESTINATION=FILE node ./build/lib/twitter/twitter_scraper.js TWITTER_ACCOUNT
 *
 */

import { isExecutedAsScript } from '../../utils/module_utils';
import TwitterFeedStream from './twitter_feed_stream';
import AbstractScraper from './../abstract_scraper';

export default class TwitterScraper extends AbstractScraper {

  /**
   * Prepares invocation arguments for the `stream` method of TwitterFeedStream.
   * The 'statuses/user_timeline' endpoint returns tweets shown on user's timeline
   * (without @mentions).
   **/
  _getStreamingOptions() {
    const defaultOptions = {
      screen_name: this.accountName,
      count: 10,
      trim_user: 1,
      exclude_replies: 1,
    };

    return ['statuses/user_timeline', defaultOptions];
  }

  /**
   * Creates an instance of the stream returning Twitter data.
   * @returns {TwitterFeedStream}
   */
  _getDataStream() {
    return new TwitterFeedStream();
  }

  /**
   * Returns a relative path to the directory where twitter feed should be stored
   * @returns {String} directory path
   **/
  _getFeedDirectory() {
    return './feed/twitter/';
  }
}

if (isExecutedAsScript(module)) {
  const args = process.argv;
  const scraper = new TwitterScraper(args[2]);
  scraper.scrape();
}
