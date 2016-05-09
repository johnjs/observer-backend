import diehard from 'diehard';
import Q from 'q';
import ampq from 'amqplib';
import { assert } from 'chai';
import * as sinon from 'sinon';
import logger from '../../../../lib/utils/logger';
import * as queue from '../../../../lib/storage/clients/queue';

describe('queue', () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('createConnection', () => {
    let fakeConnection;

    beforeEach(() => {
      fakeConnection = {
        close: sandbox.stub().returns(new Q()),
      };
      sandbox.stub(ampq, 'connect').returns(new Q(fakeConnection));
      sandbox.stub(diehard, 'register');
    });

    it('returns a promise resolving with a rabbitmq channel', (done) => {
      queue.createConnection().then((actualConnection) => {
        assert.equal(actualConnection, fakeConnection);
        done();
      });
    });

    it('registers a diehard listener for `process killed/interrupted` events '
          + 'which closes the queue connection', (done) => {
      const expecteMsg = 'RabbitMQ connection disconnected due to app termination';
      sandbox.stub(logger, 'logInfo');

      diehard.register.callsArgWithAsync(0, () => {
        assert.ok(logger.logInfo.calledWith(expecteMsg));
        done();
      });
      queue.createConnection();
    });
  });
});
