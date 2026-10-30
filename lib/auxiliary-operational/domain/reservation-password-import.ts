import { parseVaultGrid } from "./vault-import";
import type { VaultData } from "./vault-crypto";
export async function readPasswordFileGrid(
  file: File,
  maxRows = 1000,
): Promise<unknown[][]> {
  if (!/\.xlsx$/i.test(file.name))
    throw Error("Selecciona un archivo Excel .xlsx.");
  if (file.size > 2 * 1024 * 1024)
    throw Error("El archivo debe pesar máximo 2 MB.");
  const bytes = await file.arrayBuffer();
  // Bound expanded ZIP data before ExcelJS reads it.
  const view = new DataView(bytes);
  let end = -1;
  for (
    let i = bytes.byteLength - 22;
    i >= Math.max(0, bytes.byteLength - 65557);
    i--
  )
    if (view.getUint32(i, true) === 0x06054b50) {
      end = i;
      break;
    }
  if (end < 0) throw Error("El archivo no es un Excel .xlsx válido.");
  const count = view.getUint16(end + 10, true),
    offset = view.getUint32(end + 16, true);
  let cursor = offset,
    total = 0;
  if (
    count > 300 ||
    view.getUint16(end + 4, true) !== 0 ||
    view.getUint16(end + 6, true) !== 0
  )
    throw Error("El Excel es demasiado grande o no es compatible.");
  for (let i = 0; i < count; i++) {
    if (
      cursor + 46 > bytes.byteLength ||
      view.getUint32(cursor, true) !== 0x02014b50
    )
      throw Error("El Excel está dañado.");
    total += view.getUint32(cursor + 24, true);
    if (total > 10 * 1024 * 1024)
      throw Error("El contenido del Excel es demasiado grande.");
    cursor +=
      46 +
      view.getUint16(cursor + 28, true) +
      view.getUint16(cursor + 30, true) +
      view.getUint16(cursor + 32, true);
  }
  const { default: Excel } = await import("exceljs");
  const workbook = new Excel.Workbook();
  await workbook.xlsx.load(bytes);
  const sheet = workbook.worksheets[0];
  if (!sheet) throw Error("El archivo no contiene una hoja de cálculo.");
  if (sheet.rowCount > maxRows || sheet.columnCount > 30)
    throw Error(
      "La hoja supera el límite de filas o las 30 columnas permitidas.",
    );
  const grid: unknown[][] = [];
  for (let row = 1; row <= sheet.rowCount; row++) {
    const cells: unknown[] = [];
    for (let column = 1; column <= sheet.columnCount; column++) {
      const cell = sheet.getRow(row).getCell(column);
      cells.push(cell.value ?? "");
    }
    grid.push(cells);
  }
  return grid;
}

export async function parseReservationPasswordFile(
  file: File,
): Promise<VaultData[]> {
  return parseVaultGrid(await readPasswordFileGrid(file));
}
