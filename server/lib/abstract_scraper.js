/**
 * Base class for scrapers.
 **/

import jsonfile from 'jsonfile';
import config from './../config/config';
import logger from './../utils/logger.js';
import NotImplementedError from '../errors/not_implemented_error';
import Q from 'q';

const FEED_FILE_FORMATTING_OPTIONS = { spaces: 2 };

export default class AbstractScraper {

  /**
   * @constructor
   * @param {String} accountName - name of the scraped account
   **/
  constructor(accountName) {
    this.accountName = accountName;
  }

  /**
   * Uses a data stream to fetch posts/mentions and saves the feed
   * when fetching is done.
   **/
  scrape() {
    const stream = this._getDataStream();
    const streamingOptions = this._getStreamingOptions();
    const feed = [];

    stream.on('error', err => this._failure(err));
    stream.on('data', chunk => Array.prototype.push.apply(feed, chunk));
    stream.on('finish', () => this._saveFeed(feed).done(this._success));

    stream.streamFeed.apply(stream, streamingOptions);
  }

  /**
   * Handles successful scraping.
   **/
  _success() {
    process.exit(0);
  }

  /**
   * Handles unsucessful scraping.
   **/
  _failure(error) {
    logger.logError(error);
    process.exit(1);
  }

  /**
   * Abstract method which should be overriden by child classes. Method should
   * return an instance of a stream class extending AbstractFeedStream.
   * @throws {NotImplementedError}
   **/
  _getDataStream() {
    throw new NotImplementedError('_getDataStream');
  }

  /**
   * Abstract method which should be overriden by child classes. Method should
   * return parameters needed to invoke the `streamFeed` method of the object
   * returned by `_getDataStream` method.
   * @throws {NotImplementedError}
   **/
  _getStreamingOptions() {
    throw new NotImplementedError('_getStreamingOptions');
  }

  /**
   * Abstract method which should be overriden by child classes. Method should
   * return a relative path to the directory used to store feed as a json file.
   * @throws {NotImplementedError}
   **/
  _getFeedDirectory() {
    throw new NotImplementedError('_getFeedDirectory');
  }

  _saveFeed(feed) {
    if (config.FEED_DESTINATION === 'FILE') {
      return this._saveFeedInFile(feed);
    }
    return new Q();
  }

  /**
   * Saves the feed in JSON file in the directory defined by #_getFeedDirectory method.
   * Name of the file is built as a concatenation of account's name and current date time.
   * @param {object} feed - posts/mentions fetched for a given account
   */
  _saveFeedInFile(feed) {
    const feedDir = this._getFeedDirectory();
    const fileName = `${feedDir}${this.accountName}_${(new Date()).toISOString()}.json`;
    return Q.denodeify(jsonfile.writeFile)(fileName, feed, FEED_FILE_FORMATTING_OPTIONS);
  }
}
