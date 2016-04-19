/**
 * Module extends the Writable stream and is used to save feed chunks in JSON file
 * as an array.
 **/

import { Writable } from 'stream';
import fs from 'fs';
import Q from 'q';

/**
 * Method returns a closure which produces a string used to separate data chunks
 * when saving to JSON file. If the closure is invoked for the first time (which means
 * that the first chunk of data is being saved) it returns "[". In any other cases
 * it returns a comma. Would be a perfect place for using generators :)
 * @returns {String} data chunk separator
 **/
function jsonArrayItemsSeparator() {
  let arrayOpened = false;
  return () => {
    if (!arrayOpened) {
      arrayOpened = true;
      return '[\n';
    }
    return ', \n';
  };
}

export default class FileFeedOutputStream extends Writable {

  /**
   * @constructor
   * @param accountName - name of the account whose feed is being saved
   * @param source - source of the data (e.g. facebook)
   **/
  constructor(accountName, source) {
    super({
      decodeStrings: true,
      objectMode: true,
    });

    this.accountName = accountName;
    this.source = source;

    this.chunkSeparator = jsonArrayItemsSeparator();
    this.fileStream = fs.createWriteStream(this._getOutputFileName());

    this.on('finish', () => {
      this.fileStream.write('\n]');
      this.fileStream.end();
    });
  }

  /**
   * Builds the name of a file which will store the feed.
   * @returns {String} path to the feed destination file
   **/
  _getOutputFileName() {
    const feedDir = `./feed/${this.source}/`;
    return `${feedDir}${this.accountName}_${(new Date()).toISOString()}.json`;
  }

  /**
   * Implementation of Writable._write method. Processes the data chunk given as
   * an input as forwards it to the file stream.
   **/
  _write(chunk, encoding, next) {
    if (chunk.length > 0) {
      const text = chunk.map((item) => JSON.stringify(item)).join(', \n');
      this.fileStream.write(this.chunkSeparator() + text, encoding, next);
      return;
    }
    next();
  }

  /**
   * Retruns an instance of the stream. In order to stay aligned with
   * QueueFeedOutputStream the method returns a promise resolving with actual
   * stream instance.
   * @returns {Promise}
   */
  static getInstance(account, source) {
    const stream = new FileFeedOutputStream(account, source);
    return new Q(stream);
  }
}
