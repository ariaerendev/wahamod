export function isToday(
  input: Date | null | undefined,
  reference: Date = new Date(),
): boolean {
  if (!input || !(input instanceof Date) || Number.isNaN(input.getTime())) {
    return false;
  }
  return (
    input.getFullYear() === reference.getFullYear() &&
    input.getMonth() === reference.getMonth() &&
    input.getDate() === reference.getDate()
  );
}

export function isYesterday(
  input: Date | null | undefined,
  reference: Date = new Date(),
): boolean {
  if (!input || !(input instanceof Date) || Number.isNaN(input.getTime())) {
    return false;
  }
  const yesterday = new Date(reference);
  yesterday.setHours(0, 0, 0, 0);
  yesterday.setDate(yesterday.getDate() - 1);

  const candidate = new Date(input);
  candidate.setHours(0, 0, 0, 0);

  return candidate.getTime() === yesterday.getTime();
}

export function isSameYear(
  input: Date | null | undefined,
  reference: Date = new Date(),
): boolean {
  if (!input || !(input instanceof Date) || Number.isNaN(input.getTime())) {
    return false;
  }
  return input.getFullYear() === reference.getFullYear();
}
