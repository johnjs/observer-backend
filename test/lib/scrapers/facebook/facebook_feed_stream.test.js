import { assert } from 'chai';
import * as sinon from 'sinon';
import AbstractFeedStream from '../../../../lib/scrapers/abstract_feed_stream';
import FacebookFeedStream from '../../../../lib/scrapers/facebook/facebook_feed_stream';
import fbgraph from '../../../../lib/scrapers/facebook/fbgraph.js';

describe('facebook_feed_stream', () => {
  const url = 'https://fake.url.com';
  let stream;

  beforeEach(() => {
    stream = new FacebookFeedStream(url);
  });

  describe('constructor', () => {
    it('extends AbstractFeedStream stream', () => {
      assert.instanceOf(stream, AbstractFeedStream);
    });

    it('saves the url passed to the constructor', () => {
      assert.equal(stream._url, url);
    });

    it('initialises the "_feedFetched" flag with "false"', () => {
      assert.equal(stream._feedFetched, false);
    });
  });


  describe('_read', () => {
    let sandbox;

    beforeEach(() => {
      sandbox = sinon.sandbox.create();
      sandbox.spy(stream, '_read');
      sandbox.stub(fbgraph, 'get');
    });

    afterEach(() => {
      sandbox.restore();
    });

    describe('when the API returns single page', () => {
      it('pushes to the buffer this page', (done) => {
        const firstApiResponse = { data: [{ a: 1 }] };
        const dataHandler = sandbox.stub();

        fbgraph.get.yieldsAsync(null, firstApiResponse);

        stream.on('data', dataHandler);
        stream.on('end', () => {
          assert.ok(dataHandler.calledWith(firstApiResponse.data));
          done();
        });
      });
    });

    describe('when the API returns a multi-page response', () => {
      it('pushes to the buffer each page single individually', (done) => {
        const secondApiResponse = { data: [{ b: 2 }] };
        const firstApiResponse = {
          data: [{ a: 1 }],
          paging: {
            next: 'https://fake.url.com/?page=2',
          },
        };
        const dataHandler = sandbox.stub();

        fbgraph.get.onCall(0).yieldsAsync(null, firstApiResponse);
        fbgraph.get.onCall(1).yieldsAsync(null, secondApiResponse);

        stream.on('data', dataHandler);
        stream.on('end', () => {
          assert.ok(dataHandler.calledTwice);
          assert.deepEqual(dataHandler.firstCall.args, [firstApiResponse.data]);
          assert.deepEqual(dataHandler.secondCall.args, [secondApiResponse.data]);
          done();
        });
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
        stream._read();
      });
    });
  });
});
