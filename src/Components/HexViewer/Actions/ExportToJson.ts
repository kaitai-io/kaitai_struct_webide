import {IExportedValue} from "../../../DataManipulation/ExportedValueTypes";
import {ExportedValueMappers} from "../../../DataManipulation/ExportedValueMappers";
import {useCurrentBinaryFileStore} from "../../../Stores/CurrentBinaryFileStore";

export const exportToJson = async (useHexForNumbers: boolean = false): Promise<string> => {
    const overrideDefaultNumbersWithHex = (key: string, value: any) => {
        const isPropertyNumber = typeof value === "number";
        return isPropertyNumber
            ? "0x" + value.toString(16)
            : value;
    };

    const mapResultToJson = (objectToExport: IExportedValue) => {
        const genericObject = ExportedValueMappers.toGenericObject(objectToExport);
        const hexReplacer = useHexForNumbers ? overrideDefaultNumbersWithHex : null;
        return JSON.stringify(genericObject, hexReplacer, 2);
    };

    const store = useCurrentBinaryFileStore();
    if (!store.parsedFile) return;
    return mapResultToJson(store.parsedFile);
};
