import { assert } from 'chai';
import * as moduleUtils from '../../../lib/utils/module_utils';

describe('module_utils', () => {
  describe('isExecutedAsScript', () => {
    it('returns true if the module is the main one', () => {
      const mainModule = require.main;
      assert.ok(moduleUtils.isExecutedAsScript(mainModule));
    });

    it('returns false if the module is not the main one', () => {
      const fakeModule = { foo: 'bar' };
      assert.isNotOk(moduleUtils.isExecutedAsScript(fakeModule));
    });
  });
});
