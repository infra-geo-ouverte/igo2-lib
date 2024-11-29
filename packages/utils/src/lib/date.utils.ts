const ISO8601_REGEX = new RegExp(
  '(d{4}-[01]d-[0-3]dT[0-2]d:[0-5]d:[0-5]d.d+)|(d{4}-[01]d-[0-3]dT[0-2]d:[0-5]d:[0-5]d)|(d{4}-[01]d-[0-3]dT[0-2]d:[0-5]d)'
);
const ISO8601_UTCTIME_REGEX = new RegExp(
  '(-?(?:[1-9][0-9]*)?[0-9]{4})-(1[0-2]|0[1-9])-(3[01]|0[1-9]|[12][0-9])T(2[0-3]|[01][0-9]):([0-5][0-9]):([0-5][0-9])(\\.[0-9]+)?(Z)?'
);

export function isIsoDate(value: string): boolean {
  if (!ISO8601_REGEX.test(value) && !ISO8601_UTCTIME_REGEX.test(value)) {
    return false;
  }
  const d = new Date(value);
  return d instanceof Date && !isNaN(d.getTime());
}
