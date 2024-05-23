import {ExportedValueToGenericObjectMapper} from "./ExportedValueMappers/ExportedValueToGenericObjectMapper";

export const mapToGenericObject = (objectToMap: IExportedValue): any => {
    return new ExportedValueToGenericObjectMapper().map(objectToMap);
}