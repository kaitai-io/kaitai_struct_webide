import {ExportedValueToGenericObjectMapper} from "./ExportedValueMappers/ExportedValueToGenericObjectMapper";
import {IExportedValue} from "./ExportedValueTypes";
import {IExportedValueFlatInfo, IExportedValueFlatInfoMapper} from "./ExportedValueMappers/IExportedValueFlatInfoMapper";
import {IExportedValueParsedTreeLeafMapper, ParsedTreeLeaf} from "./ExportedValueMappers/IExportedValueParsedTreeLeafMapper";

export class ExportedValueMappers {
    public static toGenericObject = (objectToMap: IExportedValue): any => {
        return new ExportedValueToGenericObjectMapper().map(objectToMap);
    };

    public static flatten = (objectToMap: IExportedValue): IExportedValueFlatInfo => {
        if (!objectToMap) return null;
        return new IExportedValueFlatInfoMapper().map(objectToMap);
    };

    public static collectParsedTreeLeafs = (objectToMap: IExportedValue, openPaths: string []): ParsedTreeLeaf[] => {
        if (!objectToMap) return [];
        return new IExportedValueParsedTreeLeafMapper().collect(objectToMap, openPaths);
    };
}
