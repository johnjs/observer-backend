import { assert } from 'chai';
import * as sinon from 'sinon';
import proxyquire from 'proxyquire';
import config from '../../server/config/config';
import * as db from '../../server/db.js';
import scheduleJobs from '../../server/scheduler.js';
import ScraperRunner from '../../server/lib/scraper_runner.js';

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
        proxyquire('../../server/scheduler.js', {
          './utils/module_utils': {
            isExecutedAsScript: () => true,
          },
        });

        clock.tick(scrapingIntervalInMiliSec);
        assert.isTrue(runFacebookStub.calledOnce);
      });
    });
  });
});
