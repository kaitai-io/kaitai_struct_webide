import {workerMethods} from "./app.worker";
import {mapToGenericObject} from "./utils/ExportedValueMappers";

export function exportToJson(useHex: boolean = false) {
    const overrideDefaultNumbersWithHex = (key: string, value: any) => {
        const isPropertyNumber = typeof value === 'number'
        return isPropertyNumber
            ? '0x' + value.toString(16)
            : value;
    }

    const getResultOrThrowError = (response: IWorkerResponse) => {
        if (response.error) throw response.error;
        return response.result;
    }

    const mapResultToJson = (objectToExport: IExportedValue) => {
        const genericObject = mapToGenericObject(objectToExport);
        const hexReplacer = useHex ? overrideDefaultNumbersWithHex : null;
        return JSON.stringify(genericObject, hexReplacer, 2);
    }

    return workerMethods.reparse(true)
        .then(getResultOrThrowError)
        .then(mapResultToJson);
}
