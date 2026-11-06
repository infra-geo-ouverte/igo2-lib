import { SourceFieldsOptionsParams } from '../../datasource/shared/datasources/datasource.interface';
import {
  IgoOgcSelector,
  OgcFiltersOptions,
  OgcSelectorFields
} from '../../filter/shared/ogc-filter.interface';
import {
  OgcFilterConfig,
  OgcFilterFieldOption,
  OgcFilterJson,
  OgcFilterSelectorConfig,
  OgcFilterSelectorItemConfig,
  OgcFilterSelectorPresentation
} from '../model';

const SELECTOR_PRESENTATIONS: Record<
  (typeof OgcSelectorFields)[number],
  OgcFilterSelectorPresentation
> = {
  pushButtons: 'pushButton',
  checkboxes: 'checkbox',
  radioButtons: 'radioButton',
  select: 'select',
  autocomplete: 'autocomplete'
};

/**
 * Builds an immutable `OgcFilterConfig` from the legacy `ogcFilters` options
 * found in contexts. The JSON `filters` contract is identical, so contexts
 * keep working unchanged; the five legacy selector properties are unified
 * into `selectors`.
 */
export function fromLegacyOgcFiltersOptions(
  options: OgcFiltersOptions | undefined,
  geometryName = 'geometry',
  sourceFields?: readonly SourceFieldsOptionsParams[]
): OgcFilterConfig {
  const selectors: OgcFilterSelectorConfig[] = [];
  for (const field of OgcSelectorFields) {
    const selector = options?.[field];
    if (selector) {
      selectors.push(
        ...fromLegacySelector(selector, SELECTOR_PRESENTATIONS[field])
      );
    }
  }

  return {
    enabled: options?.enabled ?? true,
    editable: options?.editable ?? false,
    geometryName: options?.geometryName ?? geometryName,
    filters: options?.filters as OgcFilterJson | undefined,
    selectors: selectors.length > 0 ? selectors : undefined,
    fields: sourceFields?.map(toFieldOption)
  };
}

function fromLegacySelector(
  selector: IgoOgcSelector,
  presentation: OgcFilterSelectorPresentation
): OgcFilterSelectorConfig[] {
  const enabledGroup =
    selector.groups?.find((group) => group.enabled) ?? selector.groups?.[0];
  const bundles = (selector.bundles ?? []).filter(
    (bundle) => !enabledGroup?.ids || enabledGroup.ids.includes(bundle.id)
  );
  return bundles.map((bundle) => ({
    id: bundle.id,
    title: bundle.title,
    presentation,
    logical: bundle.logical === 'And' ? 'And' : 'Or',
    multiple: bundle.multiple ?? presentation === 'checkbox',
    items: (bundle.selectors ?? []).map(
      (item): OgcFilterSelectorItemConfig => ({
        title: item.title,
        tooltip: item.tooltip,
        enabled: item.enabled,
        filters: item.filters as OgcFilterJson
      })
    )
  }));
}

function toFieldOption(field: SourceFieldsOptionsParams): OgcFilterFieldOption {
  const type =
    field.type === 'string' ||
    field.type === 'number' ||
    field.type === 'boolean' ||
    field.type === 'Date'
      ? field.type
      : undefined;
  return {
    name: String(field.name),
    alias: field.alias ? String(field.alias) : undefined,
    type
  };
}
