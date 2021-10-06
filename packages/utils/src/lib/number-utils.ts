export class NumberUtils {
    static roundToNDecimal(number: number, decimal: number = 3): number {
        const roundFactor = Math.pow(10, decimal);
        return Math.round((number) * roundFactor) / roundFactor;
    }
}
