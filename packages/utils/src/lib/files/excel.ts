import type {
  ColInfo,
  JSON2SheetOpts,
  WorkBook,
  WorkSheet,
  WritingOptions
} from 'xlsx';

export async function createExcelWorkBook(
  workSheet?: WorkSheet,
  workSheetName?: string
): Promise<WorkBook> {
  const { utils } = await import('xlsx');

  return utils.book_new(workSheet, workSheetName);
}
export async function addExcelSheetToWorkBook<T = Record<string, unknown>>(
  title: string,
  rows: T[] | string,
  workBook: WorkBook,
  opts?: {
    json2SheetOpts?: JSON2SheetOpts;
    bookAppendSheetOpts?: { roll?: boolean };
  }
): Promise<void> {
  const { utils } = await import('xlsx');

  const values = typeof rows === 'string' ? JSON.parse(rows) : rows;

  const worksheet = utils.json_to_sheet(values, opts?.json2SheetOpts);

  /* calculate column width */
  if (rows?.length) {
    worksheet['!cols'] = getColumnsInfo(values);
  }

  const SHEET_NAME_MAX_LENGTH = 31;
  let sheetName =
    title.length >= SHEET_NAME_MAX_LENGTH
      ? title.substring(0, SHEET_NAME_MAX_LENGTH)
      : title;

  if (workBook.SheetNames.includes(sheetName)) {
    sheetName = `${sheetName.substring(0, SHEET_NAME_MAX_LENGTH - 3)}_${workBook.SheetNames.length}`;
  }

  utils.book_append_sheet(
    workBook,
    worksheet,
    sheetName,
    opts?.bookAppendSheetOpts?.roll
  );
}

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

function getColumnsInfo<T extends Record<string, unknown>>(
  rows: T[]
): ColInfo[] {
  const columns = Object.keys(rows[0]);
  return columns.map((column) => ({
    wch: getColumnMaxWidth(column, rows)
  }));
}

function getColumnMaxWidth<T extends Record<string, unknown>>(
  column: string,
  rows: T[]
): number {
  return rows.reduce(
    (width, row) => Math.max(width, row[column]?.toString().length ?? 0),
    column.length
  );
}
