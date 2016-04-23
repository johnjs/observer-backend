import { assert } from 'chai';
import * as sinon from 'sinon';
import proxyquire from 'proxyquire';
import config from '../../../lib/config/config';
import * as db from '../../../lib/storage/clients/db.js';
import scheduleJobs from '../../../lib/jobs/scheduler.js';
import ScraperRunner from '../../../lib/jobs/scraper_runner.js';

describe('scheduler', () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    sandbox.stub(db, 'connect');
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
      scheduleJobs();

      clock.tick(scrapingIntervalInMiliSec);
      assert.isTrue(runFacebookStub.calledOnce);
      clock.tick(scrapingIntervalInMiliSec - 10);
      assert.isTrue(runFacebookStub.calledOnce);
      clock.tick(10);
      assert.isTrue(runFacebookStub.calledTwice);
    });

    it('initialises the db connection', () => {
      scheduleJobs();
      assert.ok(db.connect.calledOnce);
    });

    describe('when the scheduler is invoked as an executable node script', () => {
      it('automatically starts jobs scheduling', () => {
        proxyquire('../../../lib/jobs/scheduler', {
          '../utils/module_utils': {
            isExecutedAsScript: () => true,
          },
        });

        clock.tick(scrapingIntervalInMiliSec);
        assert.isTrue(runFacebookStub.calledOnce);
      });
    });
  });
});
