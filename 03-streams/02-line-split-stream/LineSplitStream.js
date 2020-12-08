const stream = require('stream');
const os = require('os');

class LineSplitStream extends stream.Transform {
  #listPositionEOL = [];
  #remainder;

  constructor(options) {
    super(options);
  }

  _transform(chunk, encoding, callback) {
    const chunkString = chunk.toString();

    for (let i = 0; i < chunkString.length; i++) {
      if (chunkString[i] === os.EOL) {
        this.#listPositionEOL.push(i);
      }
    }

    let startSlicePosition = 0;

    this.#listPositionEOL.forEach((item) => {
      const pushString = chunkString.slice(startSlicePosition, item);

      this.push(this.#remainder ? (this.#remainder + pushString) : pushString);

      this.#remainder = null;
      startSlicePosition = item + 1;
    });

    const amountEQL = this.#listPositionEOL.length - 1;

    if (this.#listPositionEOL[amountEQL] !== chunkString.length) {
      this.#remainder = chunkString.slice(this.#listPositionEOL[amountEQL] + 1);
    }

    callback();
  }

  _flush(callback) {
    if (this.#remainder) {
      this.push(this.#remainder);
    }

    callback();
  }
}

module.exports = LineSplitStream;
