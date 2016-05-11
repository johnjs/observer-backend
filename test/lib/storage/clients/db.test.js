import EventEmitter from 'events';
import mongoose from 'mongoose';
import diehard from 'diehard';
import { assert } from 'chai';
import * as sinon from 'sinon';
import logger from '../../../../lib/utils/logger';
import scrapingJobSchema from '../../../../lib/jobs/scraping_job_schema';
import * as db from '../../../../lib/storage/clients/db';

describe('db', () => {
  let sandbox;
  let connectionStub;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();

    connectionStub = new EventEmitter();
    connectionStub.model = sandbox.stub();
    connectionStub.close = sandbox.stub().yields();
    sandbox.stub(mongoose, 'createConnection').returns(connectionStub);

    sandbox.stub(logger, 'logError');
    sandbox.stub(logger, 'logInfo');
    sandbox.stub(diehard, 'register');
  });

  afterEach(() => {
    db.removeModelClasses();
    sandbox.restore();
  });

  describe('connect', () => {
    it('creates and returns a connection to mongodb', () => {
      const connection = db.connect();

      assert.equal(connection, connectionStub);
    });

    it('adds a listener to mongodb `connected` event', (done) => {
      db.connect();

      connectionStub.emit('connected');

      process.nextTick(() => {
        assert.ok(logger.logInfo.calledOnce);
        done();
      });
    });

    it('adds a listener to mongo `error` event', (done) => {
      const expectedError = new Error('Wow!');

      db.connect();
      connectionStub.emit('error', expectedError);

      process.nextTick(() => {
        assert.ok(logger.logError.calledOnce);
        assert.ok(logger.logError.calledWith(expectedError));
        done();
      });
    });

    it('adds a listener to mongo `disconnected` event', (done) => {
      db.connect();

      connectionStub.emit('disconnected');

      process.nextTick(() => {
        assert.ok(logger.logInfo.calledOnce);
        done();
      });
    });

    it('registers a diehard listener for `process killed/interrupted` events '
          + 'which closes the db connection', (done) => {
      diehard.register.callsArgWithAsync(0, () => {
        assert.ok(connectionStub.close.calledOnce);
        done();
      });
      db.connect();
    });
  });

  describe('getModelClass', () => {
    it('returns the data model for a given name', () => {
      const fakeScrapingJobModel = { a: 1 };
      connectionStub.model
                .withArgs('scraping_jobs', scrapingJobSchema)
                .returns(fakeScrapingJobModel);

      db.connect();
      db.registerModel('scraping_job', 'scraping_jobs', scrapingJobSchema);

      assert.equal(db.getModelClass('scraping_job'), fakeScrapingJobModel);
    });

    it('throws an error if data models have not been'
            + 'initialised yet by the `connect` method', () => {
      const expectedErrorMsg = 'Models has not been initialised yet.';
      assert.throws(() => { db.getModelClass('scraping_job'); }, expectedErrorMsg);
    });
  });
});
