import fs from 'fs';
import Q from 'q';
import { assert } from 'chai';
import * as sinon from 'sinon';
import config from '../../../../server/config/config.js';
import logger from '../../../../server/utils/logger.js';
import FeedStream from '../../../../server/lib/facebook/feed_stream';
import FacebookScraper from '../../../../server/lib/facebook/facebook_scraper.js';

describe('FacebookScraper', () => {
  let sandbox;
  let scraper;
  const fakeAccount = 'manchesterunited';
  const fakeToken = 'my_token';

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    scraper = new FacebookScraper(fakeAccount, fakeToken);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('constructor', () => {
    it('initialises token and account name', () => {
      assert.equal(scraper.token, fakeToken);
      assert.equal(scraper.account, fakeAccount);
    });
  });

  describe('scrape', () => {
    let fakeStream;

    beforeEach(() => {
      fakeStream = new FeedStream();
      sandbox.stub(scraper, '_getDataStream').returns(fakeStream);
      sandbox.stub(scraper, '_saveFeed');
      sandbox.stub(FeedStream.prototype, 'callGraphAPI');
      scraper.scrape();
    });

    it('logs the error when the feed stream emits one', () => {
      const expectedError = new Error('There`s no milk in the fridge!');

      sandbox.stub(logger, 'logError');

      fakeStream.emit('error', expectedError);
      assert.isOk(logger.logError.calledOnce);
      assert.isOk(logger.logError.calledWith(expectedError));
    });

    it('builds the result by aggregating each chunk of data and saves it', () => {
      const firstChunk = [{ a: 1 }];
      const secondChunk = [{ b: 2 }];
      const expectedSavedResult = [{ a: 1 }, { b: 2 }];

      fakeStream.emit('data', firstChunk);
      fakeStream.emit('data', secondChunk);

      assert.equal(scraper._saveFeed.callCount, 0);

      fakeStream.emit('finish');

      assert.isOk(scraper._saveFeed.calledOnce);
      assert.isOk(scraper._saveFeed.calledWith(expectedSavedResult));
    });
  });

  describe('_getDataStream', () => {
    it('returns instance of FeedStream', () => {
      const stream = scraper._getDataStream();
      assert.instanceOf(stream, FeedStream);
    });
  });


  describe('_buildRequestUrl', () => {
    const currentTime = '2016-03-26T05:50:25.300Z';
    const expectedSinceParam = '2016-03-25T05:50:25.300Z';

    beforeEach(() => {
      sandbox.useFakeTimers(new Date(currentTime).valueOf());
    });

    it('returns proper url which is supposed to download the feed from last 24 hours', () => {
      const expectedUrl = [
        `${fakeAccount}/feed?`,
        `access_token=${fakeToken}`,
        `&since=${expectedSinceParam}&limit=100`,
      ].join('');
      const actualUrl = scraper._buildRequestUrl();

      assert.equal(actualUrl, expectedUrl);
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
    const expectedFilePath = `./feed/facebook/${fakeAccount}_${currentTime}.json`;

    beforeEach(() => {
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
