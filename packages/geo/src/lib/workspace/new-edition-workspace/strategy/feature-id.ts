/**
 *
 * @param options
 * @param columns
 * @throws
 */
export function resolveFeatureIdField(
  options: { featureIdField?: string },
  columns: { primary?: boolean; name: string }[]
): string {
  // return explicit options.featureIdField if set,
  // else the primary column name (stripped of 'properties.'),
  // else throw — single id source for URL + body (Q6)
  if (options.featureIdField) return options.featureIdField;

  const primaryColumn = columns.find((c) => c.primary);
  if (!primaryColumn)
    throw Error(
      'No featureIdField option provided and no primary column found in table template'
    );

  return primaryColumn.name.replace(/^properties\./, '');
}
