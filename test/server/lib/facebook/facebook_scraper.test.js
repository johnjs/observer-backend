import { assert } from 'chai';
import * as sinon from 'sinon';
import graph from 'fbgraph';

import FacebookScraper from '../../../../server/lib/facebook/facebook_scraper.js';

describe('FacebookScraper', () => {
  let sandbox;
  let scraper;
  const fakeAccount = 'manchesterunited';
  const fakeToken = 'my_token';

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    scraper = new FacebookScraper(fakeAccount, fakeToken);
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('initialises the facebook graph module with the proper token', () => {
    assert.equal(graph.getAccessToken(), fakeToken);
  });

  it('has the `getFeed` method defined', () => {
    assert.isFunction(scraper.getFeed);
  });
});
