/**
 * Base class for feed streams.
 **/
import { Readable } from 'stream';

export default class AbstractFeedStream extends Readable {

  constructor() {
    super({
      decodeStrings: true,
      objectMode: true,
    });
  }
}
