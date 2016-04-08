import { assert } from 'chai';
import * as sinon from 'sinon';
import proxyquire from 'proxyquire';
import AbstractScraper from '../../../../server/lib/abstract_scraper.js';
import TwitterFeedStream from '../../../../server/lib/twitter/twitter_feed_stream';
import TwitterScraper from '../../../../server/lib/twitter/twitter_scraper.js';


describe('twitter_scraper', () => {
  let sandbox;
  let scraper;
  const fakeAccount = 'michael_corleone';

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    scraper = new TwitterScraper(fakeAccount);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('constructor', () => {
    it('extends the abstract scraper', () => {
      assert.instanceOf(scraper, AbstractScraper);
    });

    it('initialises token and account name', () => {
      assert.equal(scraper.accountName, fakeAccount);
    });
  });

  describe('_getDataStream', () => {
    it('returns instance of FacebookFeedStream', () => {
      assert.instanceOf(scraper._getDataStream(), TwitterFeedStream);
    });
  });

  describe('_getStreamingOptions', () => {
    it('returns proper arguments used to run feed streaming', () => {
      const expectedOptions = ['statuses/user_timeline', {
        screen_name: fakeAccount,
        count: 10,
        trim_user: 1,
        exclude_replies: 1,
      }];
      const actualOptions = scraper._getStreamingOptions();

      assert.deepEqual(actualOptions, expectedOptions);
    });
  });

  describe('_getFeedDirectory', () => {
    it('returns a proper relative path to the directory', () => {
      const expectedDirPath = './feed/twitter/';
      assert.equal(scraper._getFeedDirectory(), expectedDirPath);
    });
  });

  describe('when the scraper is invoked as an executable node script', () => {
    it('creates an instance of TwitterScraper and starts scraping', () => {
      const scrapeStub = sandbox.stub(AbstractScraper.prototype, 'scrape');
      proxyquire('../../../../server/lib/twitter/twitter_scraper.js', {
        '../../utils/module_utils': {
          isExecutedAsScript: () => true,
        },
      });
      assert.ok(scrapeStub.calledOnce);
    });
  });
});
