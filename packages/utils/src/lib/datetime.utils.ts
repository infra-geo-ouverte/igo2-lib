import moment from 'moment';

export function dateTransform(date: Date, format: string): string {
  return moment(date).format(format);
}
