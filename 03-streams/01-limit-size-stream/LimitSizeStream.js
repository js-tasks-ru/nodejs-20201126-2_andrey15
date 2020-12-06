const stream = require('stream');
const LimitExceededError = require('./LimitExceededError');

class LimitSizeStream extends stream.Transform {
  #totalSizeStream = 0;
  #maxSizeStream;

  constructor(options) {
    super(options);

    this.#maxSizeStream =  options && options.limit || Infinity;
  }

  _transform(chunk, encoding, callback) {
    this.#totalSizeStream += chunk.length;
    const error = this.#totalSizeStream > this.#maxSizeStream ? new LimitExceededError : null;

    callback(error, error ? undefined : chunk);
  }
}

module.exports = LimitSizeStream;
