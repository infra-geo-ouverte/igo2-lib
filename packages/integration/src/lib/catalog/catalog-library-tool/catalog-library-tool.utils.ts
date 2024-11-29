import type { ColInfo, WorkBook } from 'xlsx';

import { ListExport } from './catalog-library-tool.interface';

export function getColumnsInfo(rows: ListExport[]): ColInfo[] {
  const columns = Object.keys(rows[0]);
  return columns.map((column) => ({
    wch: getColumnMaxWidth(column, rows)
  }));
}

export function getColumnMaxWidth(column: string, rows: ListExport[]): number {
  return rows.reduce(
    (width, row) => Math.max(width, row[column]?.length ?? 0),
    column.length
  );
}

export async function addExcelSheet(
  title: string,
  rows: ListExport[],
  workbook: WorkBook,
  skipHeader = true
): Promise<void> {
  const { utils } = await import('xlsx');

  const worksheet = utils.json_to_sheet(rows, { skipHeader: skipHeader });

  /* calculate column width */
  if (rows?.length) {
    worksheet['!cols'] = getColumnsInfo(rows);
  }

  const SHEET_NAME_MAX_LENGTH = 31;
  let sheetName =
    title.length >= SHEET_NAME_MAX_LENGTH
      ? title.substring(0, SHEET_NAME_MAX_LENGTH)
      : title;

  if (workbook.SheetNames.includes(sheetName)) {
    sheetName = `${sheetName.substring(0, SHEET_NAME_MAX_LENGTH - 3)}_${workbook.SheetNames.length}`;
  }

  utils.book_append_sheet(workbook, worksheet, sheetName);
}
