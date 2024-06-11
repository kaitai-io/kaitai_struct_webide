import {ExportedValueToGenericObjectMapper} from "./ExportedValueMappers/ExportedValueToGenericObjectMapper";
import {FlattenExportedValueMapper} from "./ExportedValueMappers/FlattenExportedValueMapper";
import {IExportedValue} from "../../entities";

export const mapToGenericObject = (objectToMap: IExportedValue): any => {
    return new ExportedValueToGenericObjectMapper().map(objectToMap);
};
export const flattenIExportedValue = (objectToMap: IExportedValue): IExportedValue[] => {
    return new FlattenExportedValueMapper().map(objectToMap);
};
