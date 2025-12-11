export class CalculatorUtil {
  static sum(numbers: number[]): number {
    return numbers.reduce((total, num) => total + num, 0);
  }
}
