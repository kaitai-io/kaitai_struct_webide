import {ExportedValueToGenericObjectMapper} from "./ExportedValueMappers/ExportedValueToGenericObjectMapper";
import {IExportedValue} from "../../entities";
import {IExportedValueFlatInfo, IExportedValueFlatInfoMapper} from "./ExportedValueMappers/IExportedValueFlatInfoMapper";

export const mapToGenericObject = (objectToMap: IExportedValue): any => {
    return new ExportedValueToGenericObjectMapper().map(objectToMap);
};
export const flattenIExportedValueToFlatInfo = (objectToMap: IExportedValue): IExportedValueFlatInfo => {
    if (!objectToMap) return null;
    return new IExportedValueFlatInfoMapper().map(objectToMap);
};
