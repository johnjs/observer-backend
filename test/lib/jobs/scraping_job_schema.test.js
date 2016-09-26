const { assert } = require('chai');
const sinon = require('sinon');
const mongoose = require('mongoose');
const ScrapingJobSchema = require('../../../lib/jobs/scraping_job_schema');

describe('scraping_job_schema', () => {
  let sandbox;
  let currentTime;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    currentTime = '2016-04-02T06:00:00.000Z';
    sandbox.useFakeTimers(new Date(currentTime).valueOf());
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('is an instance of mongoose#Schema', () => {
    assert.instanceOf(ScrapingJobSchema, mongoose.Schema);
  });

  describe('statics', () => {
    describe('findJobsToRun', () => {
      it('looks for jobs whose `next_run` date is earlier than the current time', () => {
        const method = ScrapingJobSchema.statics.findJobsToRun;
        const expectedResult = [{ a: 1 }];
        const fakeJobInstance = {
          find: sandbox.stub().yieldsAsync(null, expectedResult),
        };

        return method.apply(fakeJobInstance).then((actualResult) => {
          assert.equal(actualResult, expectedResult);
          assert.ok(fakeJobInstance.find.calledOnce);
          assert.deepEqual(
            fakeJobInstance.find.firstCall.args[0],
            {
              next_run: { $lte: new Date(currentTime) },
              is_running: { $eq: false },
            }
          );
        });
      });
    });
  });

  describe('methods', () => {
    let fakeJobInstance;

    beforeEach(() => {
      fakeJobInstance = {
        scraping_interval: 10,
        update: sandbox.stub().yieldsAsync(),
      };
    });

    describe('scheduleNextRun', () => {
      it('sets job`s next_run date', () => {
        const method = ScrapingJobSchema.methods.scheduleNextRun;
        const expectedNextRunDate = new Date('2016-04-02T06:10:00.000Z');

        return method.apply(fakeJobInstance).then(() => {
          assert.ok(fakeJobInstance.update.calledOnce);
          assert.deepEqual(
            fakeJobInstance.update.firstCall.args[0],
            {
              next_run: expectedNextRunDate,
              is_running: false,
            }
          );
        });
      });
    });

    describe('markAsRunning', () => {
      it('sets marks the job as currently running', () => {
        const method = ScrapingJobSchema.methods.markAsRunning;

        return method.apply(fakeJobInstance).then(() => {
          assert.ok(fakeJobInstance.update.calledOnce);
          assert.deepEqual(
            fakeJobInstance.update.firstCall.args[0],
            {
              is_running: true,
            }
          );
        });
      });
    });
  });
});
