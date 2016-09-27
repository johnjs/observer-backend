const { assert } = require('chai');
const sinon = require('sinon');
const EventEmitter = require('events');
const stream = require('stream');
const Q = require('q');
const NotImplementedError = require('../../../lib/errors/not_implemented_error');
const AbstractScraper = require('../../../lib/scrapers/abstract_scraper');
const FeedOutputStreamFactory = require('../../../lib/scrapers/feed_output_stream_factory');
const logger = require('../../../lib/utils/logger');

describe('abstract_scraper', () => {
  let sandbox;
  let scraper;
  const accountName = 'michael_corleone';

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    scraper = new AbstractScraper(accountName);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('scrape', () => {
    let fakeInputStream;
    let fakeOutputStream;
    let outputStreamDeferred;

    beforeEach(() => {
      outputStreamDeferred = Q.defer();
      fakeInputStream = new EventEmitter();
      fakeOutputStream = new EventEmitter();

      sandbox.stub(FeedOutputStreamFactory, 'getStream').returns(outputStreamDeferred.promise);
      sandbox.stub(scraper, '_getDataStream').returns(fakeInputStream);
      sandbox.stub(scraper, '_startDataFlow');
    });

    it('starts the data flow by piping input and output data streams', (done) => {
      scraper.scrape();
      outputStreamDeferred.resolve(fakeOutputStream);

      process.nextTick(() => {
        assert.ok(scraper._startDataFlow.calledWith(fakeInputStream, fakeOutputStream));
        done();
      });
    });
  });

  describe('_startDataFlow', () => {
    let dataInputStream;
    let dataOutputStream;

    beforeEach(() => {
      class TestInputStream extends stream.Readable {
        _read() {}
      }

      class TestOutputStream extends stream.Writable {
        _write(chunk, encoding, next) { next(); }
      }

      dataInputStream = new TestInputStream();
      dataOutputStream = new TestOutputStream();
    });

    it('runs the "_success" method when the output stream triggers the "finish" event', (done) => {
      sandbox.stub(scraper, '_success', () => {
        done();
      });
      scraper._startDataFlow(dataInputStream, dataOutputStream);
      dataOutputStream.emit('finish');
    });

    it('runs the "_failure" method when one of the streams triggers the "error" event', (done) => {
      const expectedError = new Error();
      sandbox.stub(scraper, '_failure', (actualError) => {
        assert.equal(actualError, expectedError);
        done();
      });
      scraper._startDataFlow(dataInputStream, dataOutputStream);
      dataInputStream.emit('error', expectedError);
    });
  });

  ['_getDataStream'].forEach((methodName) => {
    describe(methodName, () => {
      it('throws an error', () => {
        const expectedErrorMsg = `The "${methodName}" method must be implemented!`;
        assert.throws(scraper[methodName].bind(scraper), NotImplementedError, expectedErrorMsg);
      });
    });
  });

  describe('_success', () => {
    it('ends the process with `0` status', () => {
      sandbox.stub(process, 'exit');
      scraper._success();
      assert.ok(process.exit.calledWith(0));
    });
  });

  describe('_failure', () => {
    it('logs the error and ends the process with `1` status', () => {
      const error = new Error('Ohh no!');
      sandbox.stub(process, 'exit');
      sandbox.stub(logger, 'logError');

      scraper._failure(error);
      assert.ok(process.exit.calledWith(1));
      assert.ok(logger.logError.calledWith(error));
    });
  });
});
