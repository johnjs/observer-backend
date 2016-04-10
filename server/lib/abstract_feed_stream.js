/**
 * Base class for feed streams.
 **/
import NotImplementedError from '../errors/not_implemented_error';
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
    throw new NotImplementedError('streamFeed');
  }
}
