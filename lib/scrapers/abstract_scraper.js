/**
 * Base class for scrapers.
 **/
const logger = require('../utils/logger');
const NotImplementedError = require('../errors/not_implemented_error');
const FeedOutputStreamFactory = require('./feed_output_stream_factory');
const multipipe = require('multipipe');

module.exports = class AbstractScraper {

  /**
   * @constructor
   * @param {String} serivce - name of data provider (e.g. 'facebook')
   * @param {String} accountName - name of the scraped account
   **/
  constructor(source, accountName) {
    this.source = source;
    this.accountName = accountName;
  }

  /**
   * Reads feed from the input data stream and redirects it using pipes to
   * the output data stream returned by FeedStorageFactory.
   **/
  scrape() {
    const inputDataStream = this._getDataStream();
    FeedOutputStreamFactory.getStream(this.accountName, this.source).then((outputDataStream) => {
      this._startDataFlow(inputDataStream, outputDataStream);
    });
  }

  /**
   * Initiates the data flow between input and output streams passed
   * as function arguments. Once streams are combined, transmission is started.
   * Uses the "multipipe" module to create a duplex stream and handle errors coming
   * from the whole pipeline in once place.
   * @param {Readable} input stream
   * @param {Writable} output stream
   **/
  _startDataFlow(inputDataStream, outputDataStream) {
    const pipeline = multipipe(inputDataStream, outputDataStream, (err) => {
      if (!err) {
        this._success();
      }
    });
    pipeline.on('error', err => {
      this._failure(err);
    });
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
};
