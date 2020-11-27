const {isNumber} = require('lodash');

function sum(a, b) {
  if (!isNumber(a) || !isNumber(b)) {
    throw new TypeError('Аргументы функции должны быть типа number');
  }

  return a + b;
}

module.exports = sum;
