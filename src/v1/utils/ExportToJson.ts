import {codeExecutionWorkerApi} from "../Workers/WorkerApi";
import {mapToGenericObject} from "./ExportedValueMappers";
import {IExportedValue} from "../../entities";
import {IWorkerParsedResponse} from "../Workers/CodeExecution/Types";

export async function exportToJson(useHex: boolean = false): Promise<string> {
    const overrideDefaultNumbersWithHex = (key: string, value: any) => {
        const isPropertyNumber = typeof value === "number";
        return isPropertyNumber
            ? "0x" + value.toString(16)
            : value;
    };

    const getResultOrThrowError = (response: IWorkerParsedResponse) => {
        if (response.error) throw response.error;
        return response.resultObject;
    };

    const mapResultToJson = (objectToExport: IExportedValue) => {
        const genericObject = mapToGenericObject(objectToExport);
        const hexReplacer = useHex ? overrideDefaultNumbersWithHex : null;
        return JSON.stringify(genericObject, hexReplacer, 2);
    };

    let response = await codeExecutionWorkerApi.reparseAction(true);
    let objectToExport: any = await getResultOrThrowError(response);
    return mapResultToJson(objectToExport);
}
