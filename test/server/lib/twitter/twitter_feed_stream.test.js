import { assert } from 'chai';
import * as sinon from 'sinon';
import AbstractFeedStream from '../../../../server/lib/abstract_feed_stream';
import TwitterFeedStream from '../../../../server/lib/twitter/twitter_feed_stream';

describe('twitter_feed_stream', () => {
  let stream;

  beforeEach(() => {
    stream = new TwitterFeedStream();
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
      sandbox.stub(stream.twitterApi, 'get');
    });

    afterEach(() => {
      sandbox.restore();
    });

    describe('when the API returns single page', () => {
      it('writes results to the stream', (done) => {
        const apiResponse = [[{ id: 1 }]];
        const requestsParams = { param: 'value' };

        stream.twitterApi.get.yieldsAsync(null, [apiResponse]);

        stream.on('finish', () => {
          assert.ok(stream.streamFeed.calledOnce);
          assert.ok(stream.streamFeed.calledWith(url, requestsParams));
          assert.ok(stream.write.calledOnce);
          assert.ok(stream.write.calledWith(apiResponse));
          done();
        });

        stream.streamFeed(url, requestsParams);
      });
    });

    describe('when the API returns a multi-page response', () => {
      it('sends multiple requests to the API and writes every'
            + ' single response to the stream individually', (done) => {
        const requestsParams = {
          param: 'value',
        };
        const expectedSecondRequestParams = {
          param: 'value',
          max_id: 1,
        };
        const secondApiResponse = [[{ id: 1 }]];
        const firstApiResponse = [[{ id: 1 }, { id: 2 }]];

        stream.twitterApi.get.onCall(0).yieldsAsync(null, firstApiResponse);
        stream.twitterApi.get.onCall(1).yieldsAsync(null, secondApiResponse);

        stream.on('finish', () => {
          assert.ok(stream.streamFeed.calledTwice);
          assert.deepEqual(stream.streamFeed.secondCall.args, [
            url, expectedSecondRequestParams, 1,
          ]);

          assert.ok(stream.write.calledTwice);
          assert.deepEqual(stream.write.firstCall.args, firstApiResponse);
          assert.deepEqual(stream.write.secondCall.args, secondApiResponse);

          done();
        });

        stream.streamFeed(url, requestsParams, 2);
      });
    });

    describe('when the API returns an error', () => {
      it('emits the error', (done) => {
        const expectedError = new Error('There\'s no feed! I\'m hungry!');
        stream.twitterApi.get.yieldsAsync(expectedError);

        stream.on('error', (actualError) => {
          assert.deepEqual(actualError, expectedError);
          done();
        });
        stream.streamFeed();
      });
    });
  });
});
