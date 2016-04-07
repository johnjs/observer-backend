/**
 * Base class for feed streams.
 **/

import { PassThrough } from 'stream';

export default class AbstractFeedStream extends PassThrough {

  constructor() {
    super({
      decodeStrings: true,
      objectMode: true,
    });
  }

  /**
   * The abstract function which is responsible for handling feed requests to
   * specific services. Needs to be implemented in child classes.
   **/
  streamFeed() {
    throw new Error('The "streamFeed" method must be implemented!');
  }
}
