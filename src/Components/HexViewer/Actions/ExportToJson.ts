import {IWorkerParsedResponse} from "../../../DataManipulation/ParsingModule/CodeExecution/Types";
import {IExportedValue} from "../../../DataManipulation/ExportedValueTypes";
import {ExportedValueMappers} from "../../../DataManipulation/ExportedValueMappers";
import {KaitaiCodeWorkerApi} from "../../../DataManipulation/ParsingModule/KaitaiCodeWorkerApi";

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
        const genericObject = ExportedValueMappers.toGenericObject(objectToExport);
        const hexReplacer = useHexForNumbers ? overrideDefaultNumbersWithHex : null;
        return JSON.stringify(genericObject, hexReplacer, 2);
    };

    return await KaitaiCodeWorkerApi.parseAction(true)
        .then(getResultOrThrowError)
        .then(mapResultToJson);
};
