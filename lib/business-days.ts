function easterSunday(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function nextMonday(date: Date): Date {
  const day = date.getDay();
  if (day === 1) return date;
  const diff = (8 - day) % 7 || 7;
  return addDays(date, diff);
}

function key(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function colombianHolidays(year: number): Set<string> {
  const fixed: Array<[number, number]> = [
    [1, 1],
    [5, 1],
    [7, 20],
    [8, 7],
    [12, 8],
    [12, 25],
  ];
  const emilianiFixed: Array<[number, number]> = [
    [1, 6],
    [3, 19],
    [6, 29],
    [8, 15],
    [10, 12],
    [11, 1],
    [11, 11],
  ];
  const holidays = new Set<string>();
  for (const [m, d] of fixed) holidays.add(key(new Date(year, m - 1, d)));
  for (const [m, d] of emilianiFixed)
    holidays.add(key(nextMonday(new Date(year, m - 1, d))));
  const easter = easterSunday(year);
  holidays.add(key(addDays(easter, -3)));
  holidays.add(key(addDays(easter, -2)));
  holidays.add(key(nextMonday(addDays(easter, 43))));
  holidays.add(key(nextMonday(addDays(easter, 64))));
  holidays.add(key(nextMonday(addDays(easter, 71))));
  return holidays;
}

export function countBusinessDays(start: Date, end: Date): number {
  const s = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const e = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  if (e < s) return 0;

  const cache = new Map<number, Set<string>>();
  const getH = (y: number) => {
    if (!cache.has(y)) cache.set(y, colombianHolidays(y));
    return cache.get(y)!;
  };

  let count = 0;
  const cursor = new Date(s);
  while (cursor <= e) {
    const day = cursor.getDay();
    const weekend = day === 0 || day === 6;
    const holiday = getH(cursor.getFullYear()).has(key(cursor));
    if (!weekend && !holiday) count++;
    cursor.setDate(cursor.getDate() + 1);
  }
  return count;
}

export function isHoliday(date: Date): boolean {
  return colombianHolidays(date.getFullYear()).has(key(date));
}
