const { Migration } = require('mongration');
const Q = require('q');
const sinon = require('sinon');
const { assert } = require('chai');
const { pluck } = require('underscore');
const db = require('../../../../lib/storage/clients/db');
const migrate = require('../../../../lib/config/db/migrations_performer');

describe('migrations_performer', () => {
  let connection;
  let sandbox;

  before(() => {
    sandbox = sinon.sandbox.create();
    connection = db.connect();
  });

  beforeEach((done) => {
    connection.db.dropDatabase(done);
  });

  afterEach(() => {
    sandbox.restore();
  });

  after((done) => {
    migrate.applyAllMigrations().then(() => {
      connection.close(done);
    });
  });

  describe('migrations', () => {
    describe('000001-scraping_jobs-collection.js', () => {
      beforeEach(() => migrate.applyMigrationsUpTo('000001-scraping_jobs-collection.js'));
      it('creates scraping_jobs collection', (done) => {
        connection.db.listCollections().toArray((err, collsInfo) => {
          assert.include(pluck(collsInfo, 'name'), 'scraping_jobs');
          done();
        });
      });
    });
  });

  describe('methods', () => {
    const migrationsIds = ['first', 'second', 'third'];

    describe('getAllMigrationsScripts', () => {
      it('returns ids of all the migration scripts defined in the project', () => {
        const expectedIds = ['000001-scraping_jobs-collection.js'];
        return migrate.getAllMigrationsScripts().then((actualIds) => {
          assert.deepEqual(actualIds, expectedIds);
        });
      });
    });

    describe('applyMigrations', () => {
      it('applies the migrations scripts passed as function arguments', () => {
        const addMigrationStub = sandbox.stub(Migration.prototype, 'add');
        sandbox.stub(Migration.prototype, 'migrate').yieldsAsync();

        return migrate.applyMigrations(migrationsIds).then(() => {
          assert.equal(addMigrationStub.firstCall.args[0].length, 3);
          addMigrationStub.firstCall.args[0].forEach((actualScriptPath, index) => {
            const expectedScriptPath = `/lib/config/db/migrations/${migrationsIds[index]}`;
            assert.ok(actualScriptPath.endsWith(expectedScriptPath));
          });
        });
      });
    });


    describe('applyAllMigrations', () => {
      it('applies all the migrations scripts defined in the project', () => {
        sandbox.stub(migrate, 'getAllMigrationsScripts').returns(new Q(migrationsIds));
        sandbox.stub(migrate, 'applyMigrations').returns(new Q({}));

        return migrate.applyAllMigrations().then(() => {
          assert.ok(migrate.applyMigrations.calledWith(migrationsIds));
        });
      });
    });

    describe('applyMigrationsUpTo', () => {
      it('applies all the migrations starting = require(the first one'
      + ' and ending with the one passed as the argument', () => {
        sandbox.stub(migrate, 'getAllMigrationsScripts').returns(new Q(migrationsIds));
        sandbox.stub(migrate, 'applyMigrations').returns(new Q({}));

        return migrate.applyMigrationsUpTo('second').then(() => {
          assert.ok(migrate.applyMigrations.calledWith(['first', 'second']));
        });
      });

      it('throws an error if the migration script with specified id does not exist', () => {
        const expectedErrorMessage = 'There is no migration script called: fourth.'
        + ' Allowed scripts are: first,second,third';
        sandbox.stub(migrate, 'getAllMigrationsScripts').returns(new Q(migrationsIds));

        return migrate.applyMigrationsUpTo('fourth').catch((err) => {
          assert.equal(err.message, expectedErrorMessage);
        });
      });
    });
  });
});
