import { assert } from 'chai';
import * as sinon from 'sinon';
import { Writable } from 'stream';
import multipipe from 'multipipe';
import es from 'event-stream';
import Q from 'q';
import * as queue from '../../../lib/storage/clients/queue';
import QueueFeedOutputStream from '../../../lib/storage/queue_feed_output_stream';

describe('queue_feed_output_stream', () => {
  const fakeAccount = 'tom_hagen';
  const fakeSource = 'corleone_family';
  let sandbox;
  let fakeChannel;
  let stream;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    const fakeConnection = {
      createConfirmChannel: sandbox.stub(),
      close: sandbox.stub(),
    };
    fakeChannel = {
      assertExchange: sandbox.stub().returns(new Q({})),
      assertQueue: sandbox.stub().returns(new Q({})),
      bindQueue: sandbox.stub().returns(new Q({})),
      publish: sandbox.stub().callsArgAsync(4),
      connection: fakeConnection,
    };
    fakeConnection.createConfirmChannel.returns(new Q(fakeChannel));
    sandbox.stub(queue, 'createConnection').returns(new Q(fakeConnection));
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('constructor', () => {
    beforeEach(() => {
      stream = new QueueFeedOutputStream(fakeAccount, fakeSource);
    });

    it('extends Writable stream class', () => {
      assert.instanceOf(stream, Writable);
    });

    it('initialises the "accountName" property', () => {
      assert.equal(stream.accountName, fakeAccount);
    });

    it('initialises the "source" property', () => {
      assert.equal(stream.source, fakeSource);
    });

    it('adds a listener closing the queue connection after the "finish" event', (done) => {
      sandbox.stub(stream, '_cleanUpConnection', () => {
        done();
      });
      stream.emit('finish');
    });
  });

  describe('init', () => {
    it('should establish the queue channel', (done) => {
      stream = new QueueFeedOutputStream(fakeAccount, fakeSource);
      stream.init().then(() => {
        assert.equal(stream.channel, fakeChannel);
        done();
      });
    });
  });

  describe('getInstance', () => {
    it('returns initialised instance of the stream', (done) => {
      const initSpy = sandbox.spy(QueueFeedOutputStream.prototype, 'init');
      QueueFeedOutputStream.getInstance().then((instance) => {
        assert.instanceOf(instance, QueueFeedOutputStream);
        assert.ok(initSpy.calledOnce);
        done();
      });
    });
  });

  describe('when the stream is piped to the readable stream', () => {
    beforeEach(() => {
      stream = new QueueFeedOutputStream(fakeAccount, fakeSource);
      return stream.init();
    });

    it('sends the data chunks to the queue separately', (done) => {
      const inputDataChunks = [
        [{ id: 1 }, { id: 2 }],
        [{ id: 3 }, { id: 4 }],
      ];
      const firstExpectedMsg = {
        account: fakeAccount,
        source: fakeSource,
        data: inputDataChunks[0],
      };
      const secondExpectedMsg = {
        account: fakeAccount,
        source: fakeSource,
        data: inputDataChunks[1],
      };

      multipipe(es.readArray(inputDataChunks), stream, () => {
        assert.equal(fakeChannel.publish.callCount, 2);

        const actualMessages = [
          fakeChannel.publish.firstCall.args[2],
          fakeChannel.publish.secondCall.args[2],
        ].map((buffer) => JSON.parse(buffer.toString()));

        assert.deepEqual(actualMessages[0], firstExpectedMsg);
        assert.deepEqual(actualMessages[1], secondExpectedMsg);
        done();
      });
    });
  });
});
