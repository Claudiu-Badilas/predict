export class MathUtil {
  static round(value: number, { digits = 2 } = {}): number {
    const factor = Math.pow(10, digits);
    return Math.round(value * factor) / factor;
  }

  static percent(target: number, total: number): number {
    if (total === 0) return 0;

    return (target / total) * 100;
  }
}
