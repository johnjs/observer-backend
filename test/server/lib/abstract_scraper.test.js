import { assert } from 'chai';
import * as sinon from 'sinon';
import Q from 'q';
import fs from 'fs';
import logger from '../../../server/utils/logger.js';
import config from '../../../server/config/config.js';
import AbstractFeedStream from '../../../server/lib/abstract_feed_stream';
import AbstractScraper from '../../../server/lib/abstract_scraper';

describe('abstract_scraper', () => {
  let sandbox;
  let scraper;
  const accountName = 'michael_corleone';

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    scraper = new AbstractScraper(accountName);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('scrape', () => {
    let fakeStream;
    const fakeStreamingOpts = [{ bar: 'foo' }];

    beforeEach(() => {
      fakeStream = new AbstractFeedStream();

      sandbox.stub(scraper, '_getDataStream').returns(fakeStream);
      sandbox.stub(scraper, '_saveFeed').returns(new Q());
      sandbox.stub(scraper, '_success');
      sandbox.stub(scraper, '_failure');
      sandbox.stub(scraper, '_getStreamingOptions').returns(fakeStreamingOpts);
      sandbox.stub(AbstractFeedStream.prototype, 'streamFeed');
    });

    it('should invoke the "streamFeed" method with proper streaming options', () => {
      scraper.scrape();
      assert.deepEqual(fakeStream.streamFeed.firstCall.args, fakeStreamingOpts);
    });

    it('logs the error when the feed stream emits one', () => {
      const expectedError = new Error('There`s no milk in the fridge!');

      sandbox.stub(logger, 'logError');

      scraper.scrape();
      fakeStream.emit('error', expectedError);

      assert.isOk(scraper._failure.calledOnce);
      assert.isOk(scraper._failure.calledWith(expectedError));
    });

    it('builds the result by aggregating each chunk of data and saves it', () => {
      const firstChunk = [{ a: 1 }];
      const secondChunk = [{ b: 2 }];
      const expectedSavedResult = [{ a: 1 }, { b: 2 }];

      scraper.scrape();
      fakeStream.emit('data', firstChunk);
      fakeStream.emit('data', secondChunk);

      assert.equal(scraper._saveFeed.callCount, 0);

      fakeStream.emit('finish');

      assert.isOk(scraper._saveFeed.calledOnce);
      assert.isOk(scraper._saveFeed.calledWith(expectedSavedResult));
    });
  });

  ['_getDataStream', '_getFeedDirectory', '_getStreamingOptions'].forEach((methodName) => {
    describe(methodName, () => {
      it('throws an error', () => {
        const expectedErrorMsg = `The "${methodName}" method must be implemented!`;
        assert.throws(scraper[methodName].bind(scraper), expectedErrorMsg);
      });
    });
  });

  describe('_success', () => {
    it('ends the process with `0` status', () => {
      sandbox.stub(process, 'exit');
      scraper._success();
      assert.ok(process.exit.calledOnce);
      assert.ok(process.exit.calledWith(0));
    });
  });

  describe('_failure', () => {
    it('logs the error and ends the process with `1` status', () => {
      const error = new Error('Ohh no!');
      sandbox.stub(process, 'exit');
      sandbox.stub(logger, 'logError');

      scraper._failure(error);

      assert.ok(process.exit.calledOnce);
      assert.ok(process.exit.calledWith(1));
      assert.ok(logger.logError.calledOnce);
      assert.ok(logger.logError.calledWith(error));
    });
  });

  describe('_saveFeed', () => {
    describe('when the config.FEED_DESTINATION equals FILE', () => {
      let INITIAL_FEED_DESTINATION;

      beforeEach(() => {
        INITIAL_FEED_DESTINATION = config.FEED_DESTINATION;
        config.FEED_DESTINATION = 'FILE';
      });

      afterEach(() => {
        config.FEED_DESTINATION = INITIAL_FEED_DESTINATION;
      });

      it('runs the `_saveFeedInFile` method', () => {
        const dataToSave = { a: 1 };

        sandbox.stub(scraper, '_saveFeedInFile');
        scraper._saveFeed(dataToSave);

        assert.ok(scraper._saveFeedInFile.calledWith(dataToSave));
      });
    });
  });

  describe('_saveFeedInFile', () => {
    const currentTime = '2016-03-26T05:50:25.300Z';
    const expectedFeedDir = './test/server/lib/fixtures/';
    const expectedFilePath = `${expectedFeedDir}/${accountName}_${currentTime}.json`;

    beforeEach(() => {
      sandbox.stub(scraper, '_getFeedDirectory').returns(expectedFeedDir);
      sandbox.useFakeTimers(new Date(currentTime).valueOf());
    });

    afterEach(() => Q.denodeify(fs.unlink)(expectedFilePath));

    it('saves the feed in a json file', () => {
      const expectedFeed = { a: 1 };

      return scraper._saveFeedInFile(expectedFeed)
        .then(() => Q.denodeify(fs.readFile)(expectedFilePath, 'utf8'))
        .then((data) => { assert.deepEqual(expectedFeed, JSON.parse(data)); });
    });
  });
});
