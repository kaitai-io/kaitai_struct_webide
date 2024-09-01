import {codeExecutionWorkerApi} from "../DataManipulation/ParsingModule/ParseWorkerApi";
import {mapToGenericObject} from "../v1/utils/ExportedValueMappers";
import {IExportedValue} from "../entities";
import {IWorkerParsedResponse} from "../DataManipulation/ParsingModule/CodeExecution/Types";

export const exportToJson = async (useHexForNumbers: boolean = false): Promise<string> => {
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
        const hexReplacer = useHexForNumbers ? overrideDefaultNumbersWithHex : null;
        return JSON.stringify(genericObject, hexReplacer, 2);
    };

    return await codeExecutionWorkerApi.parseAction(true)
        .then(getResultOrThrowError)
        .then(mapResultToJson);
};
