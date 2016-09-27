const { inherits } = require('util');

const NotImplementedError = function NotImplementedError(methodName) {
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.message = `The "${methodName}" method must be implemented!`;
};

inherits(NotImplementedError, Error);

module.exports = NotImplementedError;
