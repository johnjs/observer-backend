import Q from 'q';
import { assert } from 'chai';
import * as sinon from 'sinon';
import proxyquire from 'proxyquire';
import logger from '../../../../lib/utils/logger';

describe('runAllMigrations', () => {
  let sandbox;
  let migrationsDeferred;
  let applyAllMigrationsStub;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    migrationsDeferred = Q.defer();

    applyAllMigrationsStub = sandbox.stub().returns(migrationsDeferred.promise);

    proxyquire('../../../../lib/config/db/runAllMigrations', {
      './migrations_performer': {
        default: {
          applyAllMigrations: applyAllMigrationsStub,
        },
      },
    });
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('if all the migrations have been successfully applied', () => {
    it('logs the results returned by the migration mechanism', (done) => {
      const expecteMsg = 'Migration performed successfully:\n{"status":"successful"}';
      const actualMigrationResults = { status: 'successful' };
      sandbox.stub(logger, 'logInfo', (msg) => {
        assert.deepEqual(msg, expecteMsg);
        done();
      });

      migrationsDeferred.resolve(actualMigrationResults);
    });
  });

  describe('if an error occurred when applying migrations', () => {
    it('logs the error', (done) => {
      const expectedError = new Error('Sorry, migrations are not allowed!');
      sandbox.stub(logger, 'logError', (err) => {
        assert.deepEqual(err, expectedError);
        done();
      });

      migrationsDeferred.reject(expectedError);
    });
  });
});
