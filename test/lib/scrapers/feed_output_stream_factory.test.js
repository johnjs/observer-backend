const { assert } = require('chai');
const sinon = require('sinon');
const fs = require('fs');
const Q = require('q');
const config = require('../../../lib/config/config.js');
const FeedOutputStreamFactory = require('../../../lib/scrapers/feed_output_stream_factory');
const FileFeedOutputStream = require('../../../lib/storage/file_feed_output_stream');
const QueueFeedOutputStream = require('../../../lib/storage/queue_feed_output_stream');

describe('feed_output_stream_factory', () => {
  let sandbox;
  const fakeAccount = 'tom_hagen';
  const fakeSource = 'irish_district';

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('getStream', () => {
    describe('when the FEED_DESTINATION config variable equals QUEUE', () => {
      beforeEach(() => {
        const fakeStream = new QueueFeedOutputStream(fakeAccount, fakeSource);
        sinon.stub(QueueFeedOutputStream, 'getInstance').returns(new Q(fakeStream));
      });

      afterEach(() => {
        QueueFeedOutputStream.getInstance.restore();
      });

      it('returns a promise resolving to instance of QueueFeedOutputStream', (done) => {
        sandbox.stub(config, 'get').withArgs('FEED_DESTINATION').returns('QUEUE');

        FeedOutputStreamFactory.getStream(fakeAccount, fakeSource).then((stream) => {
          assert.instanceOf(stream, QueueFeedOutputStream);
          done();
        });
      });
    });

    describe('when the FEED_DESTINATION config variable equals FILE', () => {
      it('returns a promise resolving to instance of FileFeedOutputStream', (done) => {
        sandbox.stub(config, 'get').withArgs('FEED_DESTINATION').returns('FILE');
        sandbox.stub(fs, 'createWriteStream');
        FeedOutputStreamFactory.getStream(fakeAccount, fakeSource).then((stream) => {
          assert.instanceOf(stream, FileFeedOutputStream);
          done();
        });
      });
    });

    describe('when the FEED_DESTINATION config variable ' +
                ' is not a valid feed destination', () => {
      it('throws an error', () => {
        sandbox.stub(config, 'get').withArgs('FEED_DESTINATION').returns('SICILIA');
        const expectedErrorMsg = 'No streams defined for SICILIA. Use one of: [FILE,QUEUE].';

        assert.throws(() => {
          FeedOutputStreamFactory.getStream(fakeAccount, fakeSource);
        }, expectedErrorMsg);
      });
    });
  });
});
