/**
 * formates the provided Filename to a length of 40 characters.
 * If the name is longer then 40 symbols, "..." is added to signal
 * character have been cut off
 * @param fileName the name that should be formatted
 */
function formate(fileName: string | undefined) {
  const maxLength = 40;
  let name;
  if (fileName) {
    name = fileName.slice(0, fileName.length - 4);
    if (name.length > maxLength + 4) {
      name = name.slice(0, maxLength);
      name = `${name}...`;
    } else {
      name = name.slice(0, maxLength + 4);
    }
  }
  return name;
}

export default formate;
