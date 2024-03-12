export const dynamicFormatSize = (size: number): string => {
  const formated = size / (1000 * 1000 * 1000);
  return formated < 1
    ? (formated * 1000).toFixed(2) + ' MB'
    : formated.toFixed(2) + ' GB';
};
