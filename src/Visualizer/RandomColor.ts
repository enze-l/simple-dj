const tinyColor = require('tinycolor2');

/**
 * Returns a random color that is constant in brightness
 * and saturation to all colours provided by this function
 */
function getRandomColor() {
  const number = Math.floor(Math.random() * 360);
  return tinyColor(`hsl(${number}, 80%, 50%)`).toHexString();
}

export default getRandomColor;
