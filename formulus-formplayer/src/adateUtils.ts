/**
 * Utility functions for handling approximate dates (adate)
 *
 * Adate format: D:DD,M:MM,Y:YYYY (e.g., "D:15,M:06,Y:2024")
 * Storage format: YYYY-MM-DD with uncertainty markers (e.g., "2024-06-15", "2024-06-??")
 *
 * The storage format is year-first to ensure SQL sortability.
 */

const NA = 'NS'; // Value to use for N/A (Not Specified)

/**
 * Converts adate format (D:DD,M:MM,Y:YYYY) to year-first storage format (YYYY-MM-DD)
 * Handles uncertainty markers (NS) by converting them to ??
 *
 * @param adate - Adate string in format "D:DD,M:MM,Y:YYYY" or already in YYYY-MM-DD format
 * @returns Year-first format string (YYYY-MM-DD) with ?? for unknown parts, or null if invalid
 */
export function adateToStorageFormat(adate: string | null | undefined): string | null {
  if (!adate || typeof adate !== 'string') {
    return null;
  }

  // If already in YYYY-MM-DD format, return as-is (may contain ??)
  if (
    /^\d{4}-\d{2}-\d{2}$/.test(adate) ||
    /^\d{4}-\?\?-\d{2}$/.test(adate) ||
    /^\d{4}-\d{2}-\?\?$/.test(adate) ||
    /^\d{4}-\?\?-\?\?$/.test(adate) ||
    /^\?\?\?\?-\d{2}-\d{2}$/.test(adate)
  ) {
    return adate;
  }

  // Parse D:DD,M:MM,Y:YYYY format
  const upperAdate = adate.toUpperCase();

  // Extract day, month, year
  const dayMatch = upperAdate.match(/D:(\d+|NS)/);
  const monthMatch = upperAdate.match(/M:(\d+|NS)/);
  const yearMatch = upperAdate.match(/Y:(\d+|NS)/);

  if (!yearMatch) {
    console.warn('Unable to parse year from adate:', adate);
    return null;
  }

  const day = dayMatch && dayMatch[1] !== NA ? dayMatch[1].padStart(2, '0') : '??';
  const month = monthMatch && monthMatch[1] !== NA ? monthMatch[1].padStart(2, '0') : '??';
  const year = yearMatch[1] !== NA ? yearMatch[1] : '????';

  // Validate year is 4 digits if not unknown
  if (year !== '????' && year.length !== 4) {
    console.warn('Invalid year format in adate:', adate);
    return null;
  }

  return `${year}-${month}-${day}`;
}

/**
 * Converts year-first storage format (YYYY-MM-DD) back to adate format (D:DD,M:MM,Y:YYYY)
 *
 * @param storageFormat - Year-first format string (YYYY-MM-DD) with ?? for unknown parts
 * @returns Adate string in format "D:DD,M:MM,Y:YYYY" with NS for unknown parts
 */
export function storageFormatToAdate(storageFormat: string | null | undefined): string | null {
  if (!storageFormat || typeof storageFormat !== 'string') {
    return null;
  }

  // Parse YYYY-MM-DD format (may contain ??)
  const parts = storageFormat.split('-');
  if (parts.length !== 3) {
    console.warn('Invalid storage format:', storageFormat);
    return null;
  }

  const [year, month, day] = parts;

  const dayValue = day === '??' ? NA : parseInt(day, 10).toString();
  const monthValue = month === '??' ? NA : parseInt(month, 10).toString();
  const yearValue = year === '????' ? NA : year;

  return `D:${dayValue},M:${monthValue},Y:${yearValue}`;
}

/**
 * Checks if an adate has uncertainty (unknown parts)
 */
export function hasUncertainty(adate: string | null | undefined): boolean {
  if (!adate) return true;
  const upperAdate = typeof adate === 'string' ? adate.toUpperCase() : '';
  return upperAdate.indexOf(NA) > -1 || upperAdate.indexOf('??') > -1;
}

/**
 * Checks if year is unknown in an adate
 */
export function yearUnknown(adate: string | null | undefined): boolean {
  if (!adate) return true;
  const upperAdate = typeof adate === 'string' ? adate.toUpperCase() : '';
  return upperAdate.indexOf(`Y:${NA}`) > -1 || upperAdate.indexOf('????') > -1;
}

/**
 * Checks if month is unknown in an adate
 */
export function monthUnknown(adate: string | null | undefined): boolean {
  if (!adate) return true;
  const upperAdate = typeof adate === 'string' ? adate.toUpperCase() : '';
  return upperAdate.indexOf(`M:${NA}`) > -1 || upperAdate.split('-')[1] === '??';
}

/**
 * Checks if day is unknown in an adate
 */
export function dayUnknown(adate: string | null | undefined): boolean {
  if (!adate) return true;
  const upperAdate = typeof adate === 'string' ? adate.toUpperCase() : '';
  return upperAdate.indexOf(`D:${NA}`) > -1 || upperAdate.split('-')[2] === '??';
}

/**
 * Formats an adate for display
 * Shows ?? for unknown parts
 */
export function displayAdate(adate: string | null | undefined): string {
  if (!adate) return 'n/a';

  // Convert to storage format first if needed
  const storageFormat = adateToStorageFormat(adate);
  if (!storageFormat) return 'n/a';

  const [year, month, day] = storageFormat.split('-');

  // Format based on what's known
  if (day === '??' && month === '??') {
    return `??/??/${year}`;
  } else if (day === '??') {
    return `??/${month}/${year}`;
  } else if (month === '??') {
    return `${day}/??/${year}`;
  } else {
    return `${day}/${month}/${year}`;
  }
}

/**
 * Gets today's date in adate format
 */
export function todayAdate(): string {
  const today = new Date();
  const day = today.getDate();
  const month = today.getMonth() + 1;
  const year = today.getFullYear();
  return `D:${day},M:${month},Y:${year}`;
}

/**
 * Gets yesterday's date in adate format
 */
export function yesterdayAdate(): string {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const day = yesterday.getDate();
  const month = yesterday.getMonth() + 1;
  const year = yesterday.getFullYear();
  return `D:${day},M:${month},Y:${year}`;
}
