import { assert } from 'chai';
import * as sinon from 'sinon';
import AbstractFeedStream from '../../../../server/lib/abstract_feed_stream';
import FacebookFeedStream from '../../../../server/lib/facebook/facebook_feed_stream';
import fbgraph from '../../../../server/lib/facebook/fbgraph.js';

describe('facebook_feed_stream', () => {
  let stream;

  beforeEach(() => {
    stream = new FacebookFeedStream();
  });

  it('extends AbstractFeedStream stream', () => {
    assert.instanceOf(stream, AbstractFeedStream);
  });

  describe('streamFeed', () => {
    const url = 'https://fake.url.com';
    let sandbox;

    beforeEach(() => {
      sandbox = sinon.sandbox.create();
      sandbox.spy(stream, 'streamFeed');
      sandbox.spy(stream, 'write');
      sandbox.stub(fbgraph, 'get');
    });

    afterEach(() => {
      sandbox.restore();
    });

    describe('when the API returns single page', () => {
      it('writes results to the stream', (done) => {
        const apiResponse = { data: [{ a: 1 }] };

        fbgraph.get.yieldsAsync(null, apiResponse);

        stream.on('finish', () => {
          assert.ok(stream.streamFeed.calledOnce);
          assert.ok(stream.write.calledOnce);
          assert.ok(stream.write.calledWith(apiResponse.data));
          done();
        });

        stream.streamFeed(url);
      });
    });

    describe('when the API returns a multi-page response', () => {
      it('sends multiple requests to the API and writes every'
            + ' single response to the stream individually', (done) => {
        const secondApiResponse = { data: [{ b: 2 }] };
        const firstApiResponse = {
          data: [{ a: 1 }],
          paging: {
            next: 'https://fake.url.com/?page=2',
          },
        };

        fbgraph.get.onCall(0).yieldsAsync(null, firstApiResponse);
        fbgraph.get.onCall(1).yieldsAsync(null, secondApiResponse);

        stream.on('finish', () => {
          assert.ok(stream.streamFeed.calledTwice);
          assert.equal(stream.streamFeed.firstCall.args[0], url);
          assert.equal(stream.streamFeed.secondCall.args[0], firstApiResponse.paging.next);

          assert.ok(stream.write.calledTwice);
          assert.equal(stream.write.firstCall.args[0], firstApiResponse.data);
          assert.equal(stream.write.secondCall.args[0], secondApiResponse.data);

          done();
        });

        stream.streamFeed(url);
      });
    });

    describe('when the API returns an error', () => {
      it('emits the error', (done) => {
        const expectedError = new Error('There`s no feed! I`m hungry!');
        fbgraph.get.yieldsAsync(expectedError);

        stream.on('error', (actualError) => {
          assert.deepEqual(actualError, expectedError);
          done();
        });
        stream.streamFeed();
      });
    });
  });
});
