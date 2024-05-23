export interface IExportedValueMapper<T> {
    map(value: IExportedValue): T;
}