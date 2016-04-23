import { assert } from 'chai';
import * as sinon from 'sinon';
import AbstractFeedStream from '../../../../lib/scrapers/abstract_feed_stream';
import TwitterFeedStream from '../../../../lib/scrapers/twitter/twitter_feed_stream';

describe('twitter_feed_stream', () => {
  let stream;
  const fakeUrlPath = 'victims/clemenza_timeline';
  const fakeRequestParams = { count: 10 };
  const fakeNumberOfPagesToFetch = 2;

  beforeEach(() => {
    stream = new TwitterFeedStream(fakeUrlPath, fakeRequestParams, fakeNumberOfPagesToFetch);
  });

  it('extends AbstractFeedStream stream', () => {
    assert.instanceOf(stream, AbstractFeedStream);
  });

  describe('constructor', () => {
    it('initialises url path', () => {
      assert.equal(stream._urlPath, fakeUrlPath);
    });

    it('initialises number of pages that should be fetched by the stream', () => {
      assert.equal(stream._numberOfPagesToFetch, fakeNumberOfPagesToFetch);
    });

    it('initialises parameters of twitter API calls', () => {
      assert.deepEqual(stream._requestParameters, fakeRequestParams);
    });
  });

  describe('read', () => {
    let sandbox;
    let dataHandler;

    beforeEach(() => {
      sandbox = sinon.sandbox.create();
      sandbox.stub(stream._twitterApi, 'get');
      dataHandler = sandbox.stub();
    });

    afterEach(() => {
      sandbox.restore();
    });

    describe('when the stream is supposed to fetch only one page', () => {
      const apiResponse = [[{ id: 1 }]];

      beforeEach(() => {
        stream._numberOfPagesToFetch = 1;
        stream._twitterApi.get.yieldsAsync(null, [apiResponse]);
      });

      it('calls twitter API once', (done) => {
        stream.on('data', dataHandler);
        stream.on('end', () => {
          assert.ok(stream._twitterApi.get.calledWith(fakeUrlPath, fakeRequestParams));
          done();
        });
      });

      it('pushes the response to the buffer and ends the ' +
              'stream once the response is fetched', (done) => {
        stream.on('data', dataHandler);
        stream.on('end', () => {
          assert.ok(dataHandler.calledWith(apiResponse));
          done();
        });
      });
    });

    describe('when the stream is supposed to fetch two pages', () => {
      const secondApiResponse = [[{ id: 1 }]];
      const firstApiResponse = [[{ id: 1 }, { id: 2 }]];
      const expectedSecondRequestParams = {
        count: 10,
        max_id: 1,
      };

      beforeEach(() => {
        stream._twitterApi.get.onCall(0).yieldsAsync(null, firstApiResponse);
        stream._twitterApi.get.onCall(1).yieldsAsync(null, secondApiResponse);
      });

      it('calls twitter API twice', (done) => {
        stream.on('data', dataHandler);
        stream.on('end', () => {
          assert.ok(stream._twitterApi.get.calledTwice);
          done();
        });
      });

      describe('when it calls twitter API for the second time', () => {
        it('extends default request parameters with max_id param ' +
              'equal the lowest id coming in the previous response', (done) => {
          stream.on('data', dataHandler);
          stream.on('end', () => {
            const actualArgs = stream._twitterApi.get.secondCall.args;
            assert.equal(actualArgs[0], fakeUrlPath);
            assert.deepEqual(actualArgs[1], expectedSecondRequestParams);
            done();
          });
        });
      });

      it('pushes both reponses to the buffer and ends streaming', (done) => {
        stream.on('data', dataHandler);
        stream.on('end', () => {
          assert.ok(dataHandler.calledTwice);
          assert.deepEqual(dataHandler.firstCall.args, firstApiResponse);
          assert.deepEqual(dataHandler.secondCall.args, secondApiResponse);
          done();
        });
      });
    });

    describe('when the API returns an error', () => {
      it('emits the error', (done) => {
        const expectedError = new Error('There\'s no feed! I\'m hungry!');
        stream._twitterApi.get.yieldsAsync(expectedError);

        stream.on('error', (actualError) => {
          assert.deepEqual(actualError, expectedError);
          done();
        });

        stream._read();
      });
    });
  });
});
