import { assert } from 'chai';
import * as sinon from 'sinon';
import fs from 'fs';
import multipipe from 'multipipe';
import es from 'event-stream';
import Q from 'q';
import FileFeedOutputStream from '../../../server/lib/file_feed_output_stream';

describe('file_feed_output_stream', () => {
  let sandbox;
  let stream;
  const fakeAccount = 'tom_hagen';
  const fakeSource = 'corleone_family';
  const fakeFileFeedPath = './test/server/lib/fixtures/test.json';

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('constructor', () => {
    beforeEach(() => {
      sandbox.useFakeTimers(new Date('2016-04-20T13:58:51.084Z').getTime());
      stream = new FileFeedOutputStream(fakeAccount, fakeSource);
    });

    it('initialises the "source" property', () => {
      assert.equal(stream.source, fakeSource);
    });

    it('initialises the "accountName" property', () => {
      assert.equal(stream.accountName, fakeAccount);
    });

    it('initialises the file output stream', () => {
      const expectedPath = './feed/corleone_family/tom_hagen_2016-04-20T13:58:51.084Z.json';
      assert.isDefined(stream.fileStream);
      assert.equal(stream.fileStream.path, expectedPath);
    });
  });

  describe('when the stream is piped to the readable stream', () => {
    beforeEach(() => {
      sandbox.stub(FileFeedOutputStream.prototype, '_getOutputFileName').returns(fakeFileFeedPath);
      stream = new FileFeedOutputStream(fakeAccount, fakeSource);
    });

    afterEach(() => Q.denodeify(fs.unlink)(fakeFileFeedPath));

    it('should save data chunks provided by an input stream in JSON file', (done) => {
      const inputDataChunks = [
        [{ id: 1 }, { id: 2 }],
        [{ id: 3 }, { id: 4 }],
        [],
      ];
      const expectedAggregatedChunks = [
        { id: 1 }, { id: 2 }, { id: 3 }, { id: 4 },
      ];

      multipipe(es.readArray(inputDataChunks), stream, () => {
        Q.denodeify(fs.readFile)(fakeFileFeedPath).then((data) => {
          assert.deepEqual(JSON.parse(data), expectedAggregatedChunks);
          done();
        });
      });
    });
  });

  describe('getInstance', () => {
    afterEach(() => Q.denodeify(fs.unlink)(fakeFileFeedPath));

    it('returns a promise resolving to instance of the stream', (done) => {
      sandbox.stub(FileFeedOutputStream.prototype, '_getOutputFileName').returns(fakeFileFeedPath);
      FileFeedOutputStream.getInstance(fakeAccount, fakeSource).then((s) => {
        assert.instanceOf(s, FileFeedOutputStream);
        done();
      });
    });
  });
});
