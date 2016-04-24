import EventEmitter from 'events';
import { default as childProcess } from 'child_process';
import Q from 'q';
import { assert } from 'chai';
import * as sinon from 'sinon';
import * as db from '../../../lib//storage/clients/db';
import ScraperRunner from '../../../lib/jobs/scraper_runner';
import logger from '../../../lib/utils/logger';


describe('scraper_runner', () => {
  let sandbox;
  let fakeJob;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    fakeJob = {
      account: 'michael_corleone',
      scheduleNextRun: sandbox.stub(),
      markAsRunning: sandbox.stub(),
      type: 'twitter',
    };
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

    it('runs the scraper for each job returned by ScrapingJob#findJobsToRun()', (done) => {
      const fakeJobs = [{ a: 1 }, { a: 2 }];
      sandbox.stub(ScraperRunner, '_runSingleJob');

      ScraperRunner.run();
      deferred.resolve(fakeJobs);

      process.nextTick(() => {
        assert.ok(ScraperRunner._runSingleJob.calledTwice);
        assert.deepEqual(ScraperRunner._runSingleJob.firstCall.args, [{ a: 1 }]);
        assert.deepEqual(ScraperRunner._runSingleJob.secondCall.args, [{ a: 2 }]);
        done();
      });
    });

    describe('if an error is thrown when jobs to run are loaded', () => {
      beforeEach(() => {
        sandbox.stub(logger, 'logError');
      });

      it('logs the error', (done) => {
        const expectedError = new Error('Ohh no!');

        ScraperRunner.run();
        deferred.reject(expectedError);

        process.nextTick(() => {
          assert.ok(logger.logError.calledOnce);
          assert.ok(logger.logError.calledWith(expectedError));
          done();
        });
      });
    });
  });

  describe('_runSingleJob', () => {
    let markAsRunningDefer;

    beforeEach(() => {
      markAsRunningDefer = Q.defer();
      fakeJob.markAsRunning.returns(markAsRunningDefer.promise);
      sandbox.stub(ScraperRunner, '_runScraper');
    });

    describe('when the job type is not defined', () => {
      beforeEach(() => {
        delete fakeJob.type;
      });

      it('throws an error', () => {
        const expectedErrorMsg = 'Allowed types of scraping jobs are: facebook,twitter';
        assert.throws(() => { ScraperRunner._runSingleJob(fakeJob); }, expectedErrorMsg);
      });
    });

    describe('when the job has been successfully marked as running', () => {
      it('creates a child process running the scraper', (done) => {
        ScraperRunner._runSingleJob(fakeJob);
        markAsRunningDefer.resolve();

        process.nextTick(() => {
          assert.ok(ScraperRunner._runScraper.calledOnce);
          const actualArgs = ScraperRunner._runScraper.firstCall.args;

          assert.match(actualArgs[0], /twitter_scraper$/);
          assert.deepEqual(actualArgs[1], [fakeJob.account]);
          assert.deepEqual(actualArgs[2], fakeJob);
          done();
        });
      });
    });

    describe('if the job could not be marked as running due to an error', () => {
      beforeEach(() => {
        sandbox.stub(logger, 'logError');
      });

      it('logs the error', (done) => {
        const expectedError = new Error('No running, please!');

        ScraperRunner._runSingleJob(fakeJob);
        markAsRunningDefer.reject(expectedError);

        process.nextTick(() => {
          assert.ok(logger.logError.calledWith(expectedError));
          done();
        });
      });
    });
  });

  describe('_runScraper', () => {
    let scraperProcess;
    const fakeScraperPath = './usa/new_york/manhattan/luca_brasi';

    beforeEach(() => {
      scraperProcess = new EventEmitter();
      sandbox.stub(childProcess, 'fork').returns(scraperProcess);
    });

    it('creates a new scraper process', () => {
      ScraperRunner._runScraper(fakeScraperPath, [fakeJob.account], fakeJob);
      assert.ok(childProcess.fork.calledWith(fakeScraperPath, [fakeJob.account]));
    });

    it('adds the "exit" event listener to the created event', (done) => {
      const exitCode = 0;
      sandbox.stub(ScraperRunner, '_handleScraperExit');

      ScraperRunner._runScraper(fakeScraperPath, [fakeJob.account], fakeJob);
      scraperProcess.emit('exit', exitCode);

      process.nextTick(() => {
        assert.ok(ScraperRunner._handleScraperExit.calledWith(fakeJob, exitCode));
        done();
      });
    });
  });

  describe('_handleScraperExit', () => {
    let scheduleNextRunDefer;

    beforeEach(() => {
      scheduleNextRunDefer = Q.defer();
      fakeJob.scheduleNextRun.returns(scheduleNextRunDefer.promise);
    });

    describe('when the scraper process exits with 0 status', () => {
      beforeEach(() => {
        sandbox.stub(logger, 'logInfo');
        sandbox.stub(logger, 'logError');
      });

      it('logs the success info', (done) => {
        const expectedLog = 'Scraping of michael_corleone finished with success';

        ScraperRunner._handleScraperExit(fakeJob, 0);
        scheduleNextRunDefer.resolve();

        process.nextTick(() => {
          assert.ok(logger.logInfo.calledOnce);
          assert.ok(logger.logInfo.calledWith(expectedLog));
          done();
        });
      });

      it('schedules next run of the job', (done) => {
        ScraperRunner._handleScraperExit(fakeJob, 0);
        scheduleNextRunDefer.resolve();

        process.nextTick(() => {
          assert.ok(fakeJob.scheduleNextRun.calledOnce);
          done();
        });
      });

      describe('when scheduling of next job`s run failed', () => {
        it('logs the error', (done) => {
          const expectedError = new Error('The Italian job could not be scheduled!');

          ScraperRunner._handleScraperExit(fakeJob, 0);
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
        ScraperRunner._handleScraperExit(fakeJob, 1);

        process.nextTick(() => {
          assert.ok(logger.logInfo.calledOnce);
          assert.ok(logger.logInfo.calledWith('Scraping of michael_corleone failed'));
          done();
        });
      });
    });
  });
});
