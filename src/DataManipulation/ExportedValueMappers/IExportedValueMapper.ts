import {IExportedValue} from "../ExportedValueTypes";

export interface IExportedValueMapper<T> {
    map(value: IExportedValue): T;
}