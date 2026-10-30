export async function readPasswordFileGrid(
  file: File,
  maxRows = 2000,
): Promise<unknown[][]> {
  if (file.size > 5000000) throw Error("Usa un archivo Excel de hasta 5 MB.");
  const ExcelJS = await import("exceljs");
  const book = new ExcelJS.Workbook();
  await book.xlsx.load(await file.arrayBuffer());
  const sheet = book.worksheets[0];
  if (!sheet || sheet.rowCount > maxRows || sheet.columnCount > 50)
    throw Error("Revisa el tamaño y la estructura del archivo.");
  const grid: unknown[][] = [];
  sheet.eachRow({ includeEmpty: true }, (row) => {
    const values = row.values as unknown[];
    grid.push(values.slice(1));
  });
  return grid;
}