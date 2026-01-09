export namespace JsDateUtils {
  export function isValidDate(d: any): boolean {
    return d instanceof Date && !isNaN(d.getTime());
  }

  export function isBefore(d1: Date, d2: Date): boolean {
    if (!isValidDate(d1) || !isValidDate(d2)) return false;
    return d1.getTime() < d2.getTime();
  }

  export function isAfter(d1: Date, d2: Date): boolean {
    if (!isValidDate(d1) || !isValidDate(d2)) return false;
    return d1.getTime() > d2.getTime();
  }

  export function isSame(d1: Date, d2: Date): boolean {
    if (!isValidDate(d1) || !isValidDate(d2)) return false;
    return d1.getTime() === d2.getTime();
  }

  export function isSameOrBefore(d1: Date, d2: Date): boolean {
    return isSame(d1, d2) || isBefore(d1, d2);
  }

  export function isSameOrAfter(d1: Date, d2: Date): boolean {
    return isSame(d1, d2) || isAfter(d1, d2);
  }

  export function isBetween(from: Date, target: Date, to: Date): boolean {
    return isSameOrAfter(from, target) && isSameOrBefore(target, to);
  }

  export function addMonths(date: Date, months: number): Date {
    const result = new Date(date);

    const day = result.getDate();
    result.setMonth(result.getMonth() + months);

    if (result.getDate() < day) result.setDate(0);

    return result;
  }
}
