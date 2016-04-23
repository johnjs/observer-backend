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
import AbstractScraper from '../abstract_scraper';

const FEED_PAGE_SIZE = 10;
const NUMBER_OF_PAGES_IN_FEED = 10;
const TIMELINE_URL_PATH = 'statuses/user_timeline';

export default class TwitterScraper extends AbstractScraper {

  constructor(accountName) {
    super('twitter', accountName);
  }

  /**
   * Creates an instance of the stream returning Twitter data.
   * @returns {TwitterFeedStream}
   */
  _getDataStream() {
    const { urlPath, numberOfPagesToFetch, requestParameters } = this._getStreamingOptions();
    return new TwitterFeedStream(urlPath, requestParameters, numberOfPagesToFetch);
  }

  /**
   * Returns parameters needed to initialise the data feed stream.
   * @returns {Object}
   **/
  _getStreamingOptions() {
    return {
      urlPath: TIMELINE_URL_PATH,
      numberOfPagesToFetch: NUMBER_OF_PAGES_IN_FEED,
      requestParameters: {
        screen_name: this.accountName,
        count: FEED_PAGE_SIZE,
        trim_user: 1,
        exclude_replies: 1,
      },
    };
  }
}

if (isExecutedAsScript(module)) {
  const args = process.argv;
  const scraper = new TwitterScraper(args[2]);
  scraper.scrape();
}
