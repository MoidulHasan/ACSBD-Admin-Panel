export const shortenString = (str: string, maxLength = 200) => {
  if (str.length > maxLength) {
    return str.substring(0, maxLength - 3) + "...";
  }
  return str;
};
