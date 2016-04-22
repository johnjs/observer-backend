import proxyquire from 'proxyquire';
import { assert } from 'chai';

describe('config', () => {
  let config;

  beforeEach(() => {
    const globalConfig = {
      name: 'tom',
      surname: 'brasi',
    };
    const testConfig = {
      surname: 'hagen',
      nationality: 'irish',
    };

    config = proxyquire('../../../server/config/config', {
      './global.json': globalConfig,
      './test.json': testConfig,
    }).default;
  });

  it('extends global configuration with environment ' +
          ' config and exposes the result via the "get" method', () => {
    assert.equal(config.get('name'), 'tom');
    assert.equal(config.get('surname'), 'hagen');
    assert.equal(config.get('nationality'), 'irish');
  });
});
