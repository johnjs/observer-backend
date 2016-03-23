import { assert } from 'chai';
import * as sinon from 'sinon';
import config from '../../server/config/test.json';
import * as FacebookRunner from '../../server/lib/facebook/facebook_scraper_runner.js';
import scheduleJobs from '../../server/scheduler.js';

describe('scheduler', () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('scheduleJobs', () => {
    let runFacebookStub;
    let clock;
    const scrapingIntervalInSec = config.SCRAPING_INTERVAL;

    beforeEach(() => {
      clock = sandbox.useFakeTimers();
      runFacebookStub = sandbox.stub(FacebookRunner, 'run');
    });

    it('it runs FacebookRunner in the interval defined in the config file', () => {
      const scrapingIntervalInMiliSec = scrapingIntervalInSec * 1000;

      scheduleJobs();

      clock.tick(scrapingIntervalInMiliSec);
      assert.isTrue(runFacebookStub.calledOnce);
      clock.tick(scrapingIntervalInMiliSec - 10);
      assert.isTrue(runFacebookStub.calledOnce);
      clock.tick(10);
      assert.isTrue(runFacebookStub.calledTwice);
    });
  });
});
