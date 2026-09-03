export const COMPANY_TIME_ZONE = "Africa/Johannesburg";

function dateTimeParts(date: Date): Record<string, string> {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: COMPANY_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date).reduce<Record<string, string>>((parts, part) => {
    if (part.type !== "literal") parts[part.type] = part.value;
    return parts;
  }, {});
}

/** A lexical YYYY-MM-DD HH:mm key for the company's Johannesburg clock. */
export function companyNowBookingKey(now = new Date()): string {
  const parts = dateTimeParts(now);
  return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}`;
}

/** Converts accepted stored time values such as 9:5 to HH:mm for key comparison. */
export function normalizeBookingTime(time: string): string {
  const match = time.trim().match(/^(\d{1,2}):(\d{1,2})/);
  if (!match) return "00:00";
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour > 23 || minute > 59) return "00:00";
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

export function bookingDateTimeKey(date: string, time: string): string {
  return `${date.trim()} ${normalizeBookingTime(time)}`;
}

function parseBookingDate(date: string): Date | null {
  const match = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  return new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
}

/** Formats the stored calendar date without parsing a date-only string in a local timezone. */
export function formatBookingDate(date: string, options?: Intl.DateTimeFormatOptions): string {
  const parsed = parseBookingDate(date);
  if (!parsed) return date;
  return new Intl.DateTimeFormat(undefined, { timeZone: "UTC", ...options }).format(parsed);
}

export function bookingDay(date: string): string {
  return formatBookingDate(date, { day: "numeric" });
}

export function bookingMonthShort(date: string): string {
  return formatBookingDate(date, { month: "short" });
}

export function isBookingToday(date: string, now = new Date()): boolean {
  return date === companyNowBookingKey(now).slice(0, 10);
}