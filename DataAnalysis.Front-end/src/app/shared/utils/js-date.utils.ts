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
}
