import {
  EntityTableColumn,
  EntityTableColumnRenderer,
  getEntityProperty
} from '@igo2/common/entity';
import { MessageService } from '@igo2/core/message';
import { downloadContent } from '@igo2/utils';

import { ExportNothingToExportError } from './export.errors';

export function handleFileExportError(
  error: Error,
  messageService: MessageService
) {
  if (error instanceof ExportNothingToExportError) {
    handleNothingToExportError(messageService);
    return;
  }
  messageService.error(
    'igo.geo.export.failed.text',
    'igo.geo.export.failed.title'
  );
}

export function handleFileExportSuccess(messageService: MessageService) {
  messageService.success(
    'igo.geo.export.success.text',
    'igo.geo.export.success.title'
  );
}

export function handleNothingToExportError(messageService: MessageService) {
  messageService.error(
    'igo.geo.export.nothing.text',
    'igo.geo.export.nothing.title'
  );
}

/**
 * Export array to CSV
 *
 * @param rows Array of arrays to export as CSV
 * @param separator Cell separator
 */
export function exportToCSV(rows: any[][], fileName: string, separator = ';') {
  const lines = rows.map((row: any[][]) => row.join(separator));
  const csvContent = lines.join('\n');
  downloadContent(csvContent, 'text/csv;charset=utf-8', fileName);
}

/**
 * Return an array of values from an array of entities.
 *
 * @param entities Array of entities
 * @param scolumns Columns definition of the output data
 */
export function entitiesToRowData(
  entities: object[],
  columns: EntityTableColumn[]
) {
  return entities.map((entity: object) => {
    return columns.map((column: EntityTableColumn) => {
      let valueAccessor;
      if (
        column.renderer === undefined ||
        column.renderer === EntityTableColumnRenderer.Default
      ) {
        valueAccessor = column.valueAccessor;
      }
      valueAccessor = valueAccessor ? valueAccessor : getEntityProperty;
      return valueAccessor(entity, column.name);
    });
  });
}
