export class ArrayUtils {
    public static last<T>(array: Array<T>): T {
        return array[array.length - 1];
    }
}