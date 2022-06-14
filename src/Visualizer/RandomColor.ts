const tinyColor = require('tinycolor2');

function getRandomColor() {
  const number = Math.floor(Math.random() * 360);
  return tinyColor(`hsl(${number}, 80%, 50%)`).toHexString();
}

export default getRandomColor;
