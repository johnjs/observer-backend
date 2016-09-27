const { assert } = require('chai');
const NotImplementedError = require('../../../lib/errors/not_implemented_error');

describe('not_implemented_error', () => {
  const notImplementedMethodName = 'hireLucaBrasi';
  let errorInstance;

  beforeEach(() => {
    errorInstance = new NotImplementedError(notImplementedMethodName);
  });

  it('extends Error', () => {
    assert.instanceOf(errorInstance, Error);
  });

  it('has a proper message', () => {
    const expectedMessage = 'The "hireLucaBrasi" method must be implemented!';
    assert.equal(errorInstance.message, expectedMessage);
  });

  it('has a proper name', () => {
    assert.equal(errorInstance.name, 'NotImplementedError');
  });

  it('has a stack property', () => {
    assert.isDefined(errorInstance.stack);
  });
});
