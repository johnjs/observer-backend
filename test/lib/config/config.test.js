const proxyquire = require('proxyquire');
const { assert } = require('chai');

describe('config.test.js', () => {
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

    config = proxyquire('../../../lib/config/config', {
      './global.json': globalConfig,
      './test.json': testConfig,
    });
  });

  it('extends global configuration with environment ' +
          ' config and exposes the result via the "get" method', () => {
    assert.equal(config.get('name'), 'tom');
    assert.equal(config.get('surname'), 'hagen');
    assert.equal(config.get('nationality'), 'irish');
  });
});
