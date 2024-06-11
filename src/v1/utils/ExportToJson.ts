import {codeExecutionWorkerApi} from "../Workers/WorkerApi";
import {mapToGenericObject} from "./ExportedValueMappers";

export function exportToJson(useHex: boolean = false) {
    const overrideDefaultNumbersWithHex = (key: string, value: any) => {
        const isPropertyNumber = typeof value === "number"
        return isPropertyNumber
            ? "0x" + value.toString(16)
            : value;
    };

    const getResultOrThrowError = (response: IWorkerResponse) => {
        if (response.error) throw response.error;
        return response.result;
    };

    const mapResultToJson = (objectToExport: IExportedValue) => {
        const genericObject = mapToGenericObject(objectToExport);
        const hexReplacer = useHex ? overrideDefaultNumbersWithHex : null;
        return JSON.stringify(genericObject, hexReplacer, 2);
    };

    return codeExecutionWorkerApi.reparseAction(true)
        .then(getResultOrThrowError)
        .then(mapResultToJson);
}
