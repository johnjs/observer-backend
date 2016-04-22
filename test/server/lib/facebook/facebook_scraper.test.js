import { assert } from 'chai';
import * as sinon from 'sinon';
import proxyquire from 'proxyquire';
import AbstractScraper from '../../../../server/lib/abstract_scraper.js';
import FacebookFeedStream from '../../../../server/lib/facebook/facebook_feed_stream';
import FacebookScraper from '../../../../server/lib/facebook/facebook_scraper.js';

describe('facebook_scraper', () => {
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
    it('extends the abstract scraper', () => {
      assert.instanceOf(scraper, AbstractScraper);
    });

    it('initialises token and account name', () => {
      assert.equal(scraper.token, fakeToken);
      assert.equal(scraper.accountName, fakeAccount);
    });
  });

  describe('_getDataStream', () => {
    it('returns instance of FacebookFeedStream', () => {
      assert.instanceOf(scraper._getDataStream(), FacebookFeedStream);
    });
  });

  describe('_buildRequestUrlPath', () => {
    const currentTime = '2016-03-26T05:50:25.300Z';
    const expectedSinceParam = '2016-03-25T05:50:25.300Z';
    const expectedFielsParam = ['message', 'created_time', 'comments.limit(0).summary(true)',
            'likes.limit(0).summary(true)', 'link', 'message_tags'].join(',');

    beforeEach(() => {
      sandbox.useFakeTimers(new Date(currentTime).valueOf());
    });

    it('returns proper url which is supposed to download the feed from last 24 hours', () => {
      const expectedUrl = [
        `${fakeAccount}/feed?`,
        `access_token=${fakeToken}`,
        `&fields=${expectedFielsParam}`,
        `&since=${expectedSinceParam}&limit=100`,
      ].join('');
      const actualUrl = scraper._buildRequestUrlPath();

      assert.deepEqual(actualUrl, expectedUrl);
    });
  });

  describe('when the scraper is invoked as an executable node script', () => {
    it('creates an instance of FacebookScraper and starts scraping', () => {
      const scrapeStub = sandbox.stub(AbstractScraper.prototype, 'scrape');
      proxyquire('../../../../server/lib/facebook/facebook_scraper.js', {
        '../../utils/module_utils': {
          isExecutedAsScript: () => true,
        },
      });
      assert.ok(scrapeStub.calledOnce);
    });
  });
});
