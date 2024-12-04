import type { ColInfo, WorkBook, WritingOptions } from 'xlsx';

export async function createBook(): Promise<WorkBook> {
  const { utils } = await import('xlsx');

  return utils.book_new();
}

export async function addExcelSheet(
  title: string,
  rows: Record<string, any>[],
  workBook: WorkBook
): Promise<void> {
  const { utils } = await import('xlsx');

  const worksheet = utils.json_to_sheet(rows);

  /* calculate column width */
  if (rows?.length) {
    worksheet['!cols'] = getColumnsInfo(rows);
  }

  const SHEET_NAME_MAX_LENGTH = 31;
  let sheetName =
    title.length >= SHEET_NAME_MAX_LENGTH
      ? title.substring(0, SHEET_NAME_MAX_LENGTH)
      : title;

  if (workBook.SheetNames.includes(sheetName)) {
    sheetName = `${sheetName.substring(0, SHEET_NAME_MAX_LENGTH - 3)}_${workBook.SheetNames.length}`;
  }

  utils.book_append_sheet(workBook, worksheet, sheetName);
}

/**
 *
 * @param workBook
 * @param filename Name of the file
 * @param opts Refer to https://docs.sheetjs.com/docs/api/write-options#writing-options
 */

export async function writeExcelFile(
  workBook: WorkBook,
  filename: string,
  opts?: WritingOptions
) {
  const cleanedFileName = filename.toLowerCase().endsWith('.xlsx')
    ? filename.slice(0, -5)
    : filename;
  const { writeFile } = await import('xlsx');
  writeFile(workBook, `${cleanedFileName}.xlsx`, opts);
}

function getColumnsInfo(rows: Record<string, any>[]): ColInfo[] {
  const columns = Object.keys(rows[0]);
  return columns.map((column) => ({
    wch: getColumnMaxWidth(column, rows)
  }));
}

function getColumnMaxWidth(
  column: string,
  rows: Record<string, any>[]
): number {
  return rows.reduce(
    (width, row) => Math.max(width, row[column]?.length ?? 0),
    column.length
  );
}
