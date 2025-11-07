import { default as moment } from 'moment';

/**
 * @param date: string
 * @example date = <[2014-08-25, 2018-08-25]>
 * @example date = 2014-08-25, 2018-08-25
 * @example date = 2014-08-25/ 2018-08-25
 * @example date = 2014-08-25
 */
export function parseDateString(
  date: string | [min: string, max: string]
): Date | [min: Date, max: Date] | undefined {
  let dateStrings: string[];

  if (Array.isArray(date)) {
    dateStrings = date;
  } else {
    if (date.startsWith('[') && date.endsWith(']')) {
      dateStrings = date.replace(/[\[\]]/g, '').split(',');
    } else if (date.includes('/')) {
      dateStrings = date.split('/');
    } else {
      dateStrings = date.split(',');
    }
  }

  const dates = dateStrings.map((date) => moment(date));

  if (dates.length === 1) {
    return dates[0].isValid() ? dates[0].toDate() : undefined;
  }

  const startDate = dates[0];
  const endDate = dates[1];

  if (endDate.isBefore(startDate)) {
    console.error('Please check the order min and max dates');
    return undefined;
  }

  if (startDate.isValid() && endDate.isValid()) {
    return [startDate.toDate(), endDate.toDate()];
  }

  return undefined;
}

function isValidAndWithinRange(date: Date, [min, max]: [min: Date, max: Date]) {
  const value = moment(date);
  return (
    value.isValid() &&
    value.isBetween(moment(min), moment(max), undefined, '[]')
  );
}

export function isDateOrRangeInRange(
  dateOrRange: Date | [min: Date, max: Date],
  [min, max]: [min: Date, max: Date]
): boolean {
  if (Array.isArray(dateOrRange)) {
    const [start, end] = dateOrRange;
    return (
      isValidAndWithinRange(start, [min, max]) &&
      isValidAndWithinRange(end, [min, max])
    );
  }
  return isValidAndWithinRange(dateOrRange, [min, max]);
}
