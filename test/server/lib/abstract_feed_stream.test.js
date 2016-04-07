import { PassThrough } from 'stream';
import { assert } from 'chai';
import AbstractFeedStream from '../../../server/lib/abstract_feed_stream';

describe('abstract_feed_stream', () => {
  let stream;

  beforeEach(() => {
    stream = new AbstractFeedStream();
  });

  it('extends PassThrough stream', () => {
    assert.instanceOf(stream, PassThrough);
  });

  describe('streamFeed', () => {
    it('throws an error', () => {
      const expectedErrorMsg = 'The "streamFeed" method must be implemented!';
      assert.throws(() => { stream.streamFeed(); }, expectedErrorMsg);
    });
  });
});
