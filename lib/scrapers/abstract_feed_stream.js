/**
 * Base class for feed streams.
 **/
const { Readable } = require('stream');

module.exports = class AbstractFeedStream extends Readable {
  constructor() {
    super({
      decodeStrings: true,
      objectMode: true,
    });
  }
};
