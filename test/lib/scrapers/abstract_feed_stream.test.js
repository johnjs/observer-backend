const { Readable } = require('stream');
const { assert } = require('chai');
const AbstractFeedStream = require('../../../lib/scrapers/abstract_feed_stream');

describe('abstract_feed_stream', () => {
  let stream;

  beforeEach(() => {
    stream = new AbstractFeedStream();
  });

  it('extends Readable stream', () => {
    assert.instanceOf(stream, Readable);
  });
});
