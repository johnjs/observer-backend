import { assert } from 'chai';
import * as sinon from 'sinon';
import mongoose from 'mongoose';
import FacebookJobSchema from '../../../../server/lib/facebook/facebook_job_schema';

describe('facebook_job_schema', () => {
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
    assert.instanceOf(FacebookJobSchema, mongoose.Schema);
  });

  describe('statics', () => {
    describe('findJobsToRun', () => {
      it('looks for jobs whose `next_run` date is earlier than the current time', (done) => {
        const method = FacebookJobSchema.statics.findJobsToRun;
        const expectedResult = [{ a: 1 }];
        const fakeJobInstance = {
          find: sandbox.stub().yieldsAsync(null, expectedResult),
        };

        method.apply(fakeJobInstance).then((actualResult) => {
          assert.equal(actualResult, expectedResult);
          assert.ok(fakeJobInstance.find.calledOnce);
          assert.deepEqual(
            fakeJobInstance.find.firstCall.args[0],
            { next_run: { $lte: new Date(currentTime) } }
          );
          done();
        });
      });
    });
  });

  describe('methods', () => {
    describe('scheduleNextRun', () => {
      it('sets job`s next_run date', (done) => {
        const method = FacebookJobSchema.methods.scheduleNextRun;
        const expectedNextRunDate = new Date('2016-04-02T06:10:00.000Z');
        const fakeJobInstance = {
          scraping_interval: 10,
          update: sandbox.stub().yieldsAsync(),
        };

        method.apply(fakeJobInstance).then(() => {
          assert.ok(fakeJobInstance.update.calledOnce);
          assert.deepEqual(
            fakeJobInstance.update.firstCall.args[0],
            { next_run: expectedNextRunDate }
          );
          done();
        });
      });
    });
  });
});
