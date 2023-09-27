export class NumberUtils {
  static roundToNDecimal(num: number, decimal: number = 3): number {
    const roundFactor = Math.pow(10, decimal);
    return Math.round(num * roundFactor) / roundFactor;
  }
}
