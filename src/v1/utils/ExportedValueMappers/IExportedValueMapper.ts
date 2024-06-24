import {IExportedValue} from "../../../entities";

export interface IExportedValueMapper<T> {
    map(value: IExportedValue): T;
}