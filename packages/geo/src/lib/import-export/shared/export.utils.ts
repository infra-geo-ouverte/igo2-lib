import {
  getEntityProperty,
  EntityTableColumn,
  EntityTableColumnRenderer
} from '@igo2/common';
import { MessageService, LanguageService } from '@igo2/core';
import { downloadContent } from '@igo2/utils';

import { ExportNothingToExportError } from './export.errors';

export function handleFileExportError(
  error: Error,
  messageService: MessageService,
  languageService: LanguageService
) {
  if (error instanceof ExportNothingToExportError) {
    handleNothingToExportError(messageService, languageService);
    return;
  }
  const translate = languageService.translate;
  const title = translate.instant('igo.geo.export.failed.title');
  const message = translate.instant('igo.geo.export.failed.text');
  messageService.error(message, title);
}

export function handleNothingToExportError(
  messageService: MessageService,
  languageService: LanguageService
) {
  const translate = languageService.translate;
  const title = translate.instant('igo.geo.export.nothing.title');
  const message = translate.instant('igo.geo.export.nothing.text');
  messageService.error(message, title);
}

/**
 * Export array to CSV
 *
 * @param rows Array of arrays to export as CSV
 * @param separator Cell separator
 */
export function exportToCSV(rows: any[][], fileName: string, separator: string = ';') {
  const lines = rows.map((row: any[][], index: number) => row.join(separator));
  const csvContent = lines.join('\n');
  downloadContent(csvContent, 'text/csv;charset=utf-8', fileName);
}

/**
 * Return an array of values from an array of entities.
 *
 * @param entities Array of entities
 * @param scolumns Columns definition of the output data
 */
export function entitiesToRowData(entities: object[], columns: EntityTableColumn[]) {
  return entities.map((entity: object) => {
    return columns.map((column: EntityTableColumn) => {
      let valueAccessor;
      if (column.renderer === undefined || column.renderer === EntityTableColumnRenderer.Default) {
        valueAccessor = column.valueAccessor;
      }
      valueAccessor = valueAccessor ? valueAccessor : getEntityProperty;
      return valueAccessor(entity, column.name);
    });
  });
}
