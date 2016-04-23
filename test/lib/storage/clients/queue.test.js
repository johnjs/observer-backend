import { assert } from 'chai';
import * as sinon from 'sinon';
import Q from 'q';
import ampq from 'amqplib';
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
    const fakeChannel = { name: 'frederico' };

    beforeEach(() => {
      sandbox.stub(ampq, 'connect').returns(new Q(fakeChannel));
    });

    it('returns a promise resolving with a rabbitmq channel', (done) => {
      queue.createConnection().then((actualChannel) => {
        assert.equal(actualChannel, fakeChannel);
        done();
      });
    });
  });
});
