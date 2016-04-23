import { assert } from 'chai';
import * as sinon from 'sinon';
import proxyquire from 'proxyquire';

describe('start_app', () => {
  let sandbox;
  let schedulerMock;
  let dbMock;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    schedulerMock = {
      scheduleJobs: sinon.stub(),
    };
    dbMock = {
      connect: sinon.stub(),
    };

    proxyquire('../../lib/start', {
      './jobs/scheduler': {
        default: schedulerMock,
      },
      './storage/clients/db': dbMock,
    });
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('initiates the db connection', () => {
    assert.ok(dbMock.connect.calledOnce);
  });

  it('initiates jobs scheduling', () => {
    assert.ok(schedulerMock.scheduleJobs.calledOnce);
  });
});
