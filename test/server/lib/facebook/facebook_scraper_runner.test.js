import EventEmitter from 'events';
import { default as childProcess } from 'child_process';
import Q from 'q';
import { assert } from 'chai';
import * as sinon from 'sinon';
import * as db from '../../../../server/db';
import FacebookScraperRunner from '../../../../server/lib/facebook/facebook_scraper_runner';
import logger from '../../../../server/utils/logger';


describe('facebook_scraper_runner', () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('run', () => {
    let deferred;

    beforeEach(() => {
      deferred = Q.defer();
      sandbox.stub(db, 'getModelClass').returns({
        findJobsToRun: sandbox.stub().returns(deferred.promise),
      });
    });

    it('runs the scraper for each facebook job returned by FacebookJob#findJobsToRun()', (done) => {
      const fakeJobs = [{ a: 1 }, { a: 2 }];
      sandbox.stub(FacebookScraperRunner, '_runSingleScraper');

      FacebookScraperRunner.run();
      deferred.resolve(fakeJobs);

      process.nextTick(() => {
        assert.ok(FacebookScraperRunner._runSingleScraper.calledTwice);
        assert.deepEqual(FacebookScraperRunner._runSingleScraper.firstCall.args, [{ a: 1 }]);
        assert.deepEqual(FacebookScraperRunner._runSingleScraper.secondCall.args, [{ a: 2 }]);
        done();
      });
    });

    describe('if an error is thrown when jobs to run are loaded', () => {
      beforeEach(() => {
        sandbox.stub(logger, 'logError');
      });

      it('logs the error', (done) => {
        const expectedError = new Error('Ohh no!');

        FacebookScraperRunner.run();
        deferred.reject(expectedError);

        process.nextTick(() => {
          assert.ok(logger.logError.calledOnce);
          assert.ok(logger.logError.calledWith(expectedError));
          done();
        });
      });
    });
  });

  describe('_runSingleScraper', () => {
    let fakeJob;
    let fakeScaperProcess;

    beforeEach(() => {
      fakeJob = {
        facebook_account: 'michael_corleone',
        facebook_token: 'godfather',
        scheduleNextRun: sandbox.stub(),
      };
      fakeScaperProcess = new EventEmitter();
      sandbox.stub(childProcess, 'fork').returns(fakeScaperProcess);
    });

    it('creates a child process running the scraper', () => {
      FacebookScraperRunner._runSingleScraper(fakeJob);
      assert.ok(childProcess.fork.calledOnce);
      const forkArgs = childProcess.fork.firstCall.args;

      assert.match(forkArgs[0], /facebook_scraper$/);
      assert.deepEqual(forkArgs[1], [fakeJob.facebook_account, fakeJob.facebook_token]);
      assert.deepEqual(forkArgs[2], { silent: false });
    });

    describe('when the scraper process exits with 0 status', () => {
      let scheduleNextRunDefer;

      beforeEach(() => {
        scheduleNextRunDefer = Q.defer();
        fakeJob.scheduleNextRun.returns(scheduleNextRunDefer.promise);
        sandbox.stub(logger, 'logInfo');
        sandbox.stub(logger, 'logError');
      });

      it('logs the success info', (done) => {
        const expectedLog = 'Scraping of michael_corleone finished with success';
        FacebookScraperRunner._runSingleScraper(fakeJob);

        fakeScaperProcess.emit('exit', 0);

        process.nextTick(() => {
          assert.ok(logger.logInfo.calledOnce);
          assert.ok(logger.logInfo.calledWith(expectedLog));
          done();
        });
      });

      it('schedules next run of the job', (done) => {
        FacebookScraperRunner._runSingleScraper(fakeJob);

        fakeScaperProcess.emit('exit', 0);

        process.nextTick(() => {
          assert.ok(fakeJob.scheduleNextRun.calledOnce);
          done();
        });
      });

      describe('when scheduling of next job`s run failed', () => {
        it('logs the error', (done) => {
          const expectedError = new Error('They killed Michael!');
          FacebookScraperRunner._runSingleScraper(fakeJob);

          fakeScaperProcess.emit('exit', 0);
          scheduleNextRunDefer.reject(expectedError);

          process.nextTick(() => {
            assert.ok(logger.logError.calledOnce);
            assert.ok(logger.logError.calledWith(expectedError));
            done();
          });
        });
      });
    });

    describe('when the scraper process exits with status different than 0', () => {
      beforeEach(() => {
        sandbox.stub(logger, 'logInfo');
      });

      it('logs the info', (done) => {
        FacebookScraperRunner._runSingleScraper(fakeJob);
        fakeScaperProcess.emit('exit', 1);

        process.nextTick(() => {
          assert.ok(logger.logInfo.calledOnce);
          assert.ok(logger.logInfo.calledWith('Scraping of michael_corleone failed'));
          done();
        });
      });
    });
  });
});
