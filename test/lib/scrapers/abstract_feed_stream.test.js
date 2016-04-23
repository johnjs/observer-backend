import { Readable } from 'stream';
import { assert } from 'chai';
import AbstractFeedStream from '../../../lib/scrapers/abstract_feed_stream';

describe('abstract_feed_stream', () => {
  let stream;

  beforeEach(() => {
    stream = new AbstractFeedStream();
  });

  it('extends Readable stream', () => {
    assert.instanceOf(stream, Readable);
  });
});
