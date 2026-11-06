/**
 * Declarative configuration of the OGC filter domain.
 *
 * `OgcFilterJson` is the JSON contract accepted in contexts: it is
 * structurally compatible with the legacy `ogcFilters.filters` shape so
 * existing contexts keep working unchanged.
 */

export interface OgcFilterJson {
  readonly operator?: string;
  readonly logical?: string;
  readonly filters?: readonly OgcFilterJson[] | OgcFilterJson;
  readonly propertyName?: string;
  readonly expression?: string | number;
  readonly matchCase?: boolean;
  readonly pattern?: string;
  readonly wildCard?: string;
  readonly singleChar?: string;
  readonly escapeChar?: string;
  readonly lowerBoundary?: number;
  readonly upperBoundary?: number;
  readonly begin?: string;
  readonly end?: string;
  readonly step?: string;
  readonly geometryName?: string;
  readonly extent?: readonly [number, number, number, number];
  readonly wkt_geometry?: string;
  readonly srsName?: string;
  readonly active?: boolean;
}

export const OGC_SELECTOR_PRESENTATIONS = [
  'pushButton',
  'checkbox',
  'radioButton',
  'select',
  'autocomplete'
] as const;
export type OgcFilterSelectorPresentation =
  (typeof OGC_SELECTOR_PRESENTATIONS)[number];

export interface OgcFilterSelectorItemConfig {
  readonly title: string;
  readonly tooltip?: string;
  readonly enabled?: boolean;
  readonly filters: OgcFilterJson;
}

/**
 * A group of predefined filters toggled from the UI. Unifies the five legacy
 * duplicated properties (`pushButtons`, `checkboxes`, `radioButtons`,
 * `select`, `autocomplete`) under a single model discriminated by
 * `presentation`.
 */
export interface OgcFilterSelectorConfig {
  readonly id: string;
  readonly title?: string;
  readonly presentation: OgcFilterSelectorPresentation;
  /** Logical operator combining enabled items within this selector. */
  readonly logical?: 'And' | 'Or';
  /** Whether several items may be enabled at once. */
  readonly multiple?: boolean;
  readonly items: readonly OgcFilterSelectorItemConfig[];
}

export type OgcFilterMode = 'advanced' | 'selector';

/** Field metadata offered to the UI, decoupled from datasource interfaces. */
export interface OgcFilterFieldOption {
  readonly name: string;
  readonly alias?: string;
  readonly type?: 'string' | 'number' | 'boolean' | 'Date';
}

export interface OgcFilterConfig {
  readonly enabled: boolean;
  readonly editable: boolean;
  readonly geometryName: string;
  /** Declarative filter tree (same JSON contract as contexts). */
  readonly filters?: OgcFilterJson;
  readonly selectors?: readonly OgcFilterSelectorConfig[];
  readonly fields?: readonly OgcFilterFieldOption[];
}
