const { assert } = require('chai');
const sinon = require('sinon');
const config = require('../../../lib/config/config');
const scheduler = require('../../../lib/jobs/scheduler.js');
const ScraperRunner = require('../../../lib/jobs/scraper_runner.js');

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
    const scrapingIntervalInSec = config.get('SCHEDULER_POLLING_INTERVAL');
    const scrapingIntervalInMiliSec = scrapingIntervalInSec * 1000;

    beforeEach(() => {
      clock = sandbox.useFakeTimers();
      runFacebookStub = sandbox.stub(ScraperRunner, 'run');
    });

    it('it runs ScraperRunner in the interval defined in the config file', () => {
      scheduler.scheduleJobs();

      clock.tick(scrapingIntervalInMiliSec);
      assert.isTrue(runFacebookStub.calledOnce);
      clock.tick(scrapingIntervalInMiliSec - 10);
      assert.isTrue(runFacebookStub.calledOnce);
      clock.tick(10);
      assert.isTrue(runFacebookStub.calledTwice);
    });
  });
});
