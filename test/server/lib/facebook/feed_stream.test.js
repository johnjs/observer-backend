import { PassThrough } from 'stream';
import { assert } from 'chai';
import * as sinon from 'sinon';
import FeedStream from '../../../../server/lib/facebook/feed_stream';
import fbgraph from '../../../../server/lib/facebook/fbgraph.js';

describe('FeedStream', () => {
  let stream;

  beforeEach(() => {
    stream = new FeedStream();
  });

  it('extends PassThrough stream', () => {
    assert.instanceOf(stream, PassThrough);
  });

  describe('callGraphAPI', () => {
    const url = 'https://fake.url.com';
    let sandbox;

    beforeEach(() => {
      sandbox = sinon.sandbox.create();
      sandbox.spy(stream, 'callGraphAPI');
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
          assert.ok(stream.callGraphAPI.calledOnce);
          assert.ok(stream.write.calledOnce);
          assert.ok(stream.write.calledWith(apiResponse.data));
          done();
        });

        stream.callGraphAPI(url);
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
          assert.ok(stream.callGraphAPI.calledTwice);
          assert.equal(stream.callGraphAPI.firstCall.args[0], url);
          assert.equal(stream.callGraphAPI.secondCall.args[0], firstApiResponse.paging.next);

          assert.ok(stream.write.calledTwice);
          assert.equal(stream.write.firstCall.args[0], firstApiResponse.data);
          assert.equal(stream.write.secondCall.args[0], secondApiResponse.data);

          done();
        });

        stream.callGraphAPI(url);
      });
    });
  });
});
