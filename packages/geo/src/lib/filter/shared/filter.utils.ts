import { TimeFrame } from '@igo2/utils';

import moment from 'moment';

import {
  AnyBaseOgcFilterOptions,
  IgoLogicalArrayOptions,
  OgcFilterConditionsArrayOptions,
  OgcFilterDuringOptions,
  OgcFilterSpatialOptions
} from './ogc-filter.interface';

export const TimeUnit = [
  'years',
  'months',
  'weeks',
  'days',
  'hours',
  'seconds'
] as const;
export type TimeUnit = (typeof TimeUnit)[number];

export const ArithmeticSymbol = ['+', '-'] as const;
export type ArithmeticSymbol = (typeof ArithmeticSymbol)[number];

/**
 * this function to parse date with specific format
 * exemple 'today' or 'today + 1 days' or 'now + 1 years'
 * @param value string date
 * @returns date
 */
export function parseDateOperation(dateOperation: string): string {
  const normalizedOp = dateOperation.replace(/\s+/g, '');

  if (normalizedOp === TimeFrame[0]) {
    return moment().utc().toISOString();
  } else if (normalizedOp === TimeFrame[1]) {
    return moment().endOf('day').utc().toISOString();
  }

  const regex = new RegExp(
    `(${TimeFrame.join('|')})([${ArithmeticSymbol.join('|')}]\\d+)(${TimeUnit.join('|')})?`,
    'i'
  );

  const match = normalizedOp.match(regex);

  if (!match) {
    console.warn('Invalid format. example: today or today + 1 year...');
    return moment().utc().toString();
  }

  let date = match[1] === TimeFrame[0] ? moment() : moment().endOf('day');

  if (!match[2]) {
    console.warn(
      `Invalid arithmetic symbol or value. Expected one of: ${ArithmeticSymbol.join(', ')}`
    );
    return date.utc().toString();
  }

  const operator = match[2][0] as ArithmeticSymbol;
  const value = parseInt(match[2].slice(1), 10);
  const unit = match[3]?.toLowerCase() as TimeUnit;

  if (!match[3] && !TimeUnit.includes(unit)) {
    console.warn(`Invalid time unit. Expected one of: ${TimeUnit.join(', ')}`);
    return date.utc().toString();
  }

  if (operator === ArithmeticSymbol['0']) {
    date = date.add(value, unit);
  } else {
    date = date.subtract(value, unit);
  }

  return date.utc().toString();
}

export function isIgoLogicalArray(
  filters: IgoLogicalArrayOptions | AnyBaseOgcFilterOptions
): filters is IgoLogicalArrayOptions {
  return 'filters' in filters && 'logical' in filters;
}

export function isFilterAttributeOptions(
  filters: AnyBaseOgcFilterOptions
): filters is Exclude<
  AnyBaseOgcFilterOptions & {
    filterid?: string;
  },
  OgcFilterConditionsArrayOptions | OgcFilterSpatialOptions
> {
  return 'propertyName' in filters;
}

export function isOgcFilterDuringOptions(
  filters: IgoLogicalArrayOptions | AnyBaseOgcFilterOptions
): filters is OgcFilterDuringOptions {
  return 'begin' in filters && 'end' in filters;
}

/**
 * Recursive
 * Search inside filters of OgcFiltersOptions
 */
export function searchFilter(
  filters: IgoLogicalArrayOptions | AnyBaseOgcFilterOptions,
  key: 'propertyName' | 'filterid',
  value: string
):
  | ((IgoLogicalArrayOptions | AnyBaseOgcFilterOptions) & {
      filterid?: string;
    })
  | undefined {
  if (isIgoLogicalArray(filters)) {
    if (Array.isArray(filters.filters)) {
      return filters.filters.find((filter) => searchFilter(filter, key, value));
    } else {
      searchFilter(filters, key, value);
    }
  } else if (isFilterAttributeOptions(filters)) {
    if (filters[key] === value) {
      return filters;
    }
  }
  return undefined;
}
