import {defineStore} from "pinia";
import {IExportedValue} from "../entities";
import {getStoredSelection, storeSelection} from "../v1/utils/LocalStorageCookiesAPI";
import {flattenIExportedValueToLeafsOnly} from "../v1/utils/ExportedValueMappers";

export interface CurrentBinaryFile {
    fileContent: ArrayBuffer;
    parsedFile?: IExportedValue;
    parsedFileFlattened?: IExportedValue[];
    selectionStart: number;
    selectionEnd: number;
}

export const useCurrentBinaryFileStore = defineStore("SelectionStore", {
    state: (): CurrentBinaryFile => {
        const value = getStoredSelection();
        return {
            fileContent: new ArrayBuffer(0),
            selectionStart: value.start || -1,
            selectionEnd: value.end || -1,
            parsedFileFlattened: null
        };
    },
    actions: {
        updateSelectionPoint(point: number) {
            this.selectionStart = point;
            this.selectionEnd = point;
            storeSelection(this.selectionStart, this.selectionEnd);
        },
        updateSelectionRange(startNew: number, endNew: number) {
            this.selectionStart = Math.min(startNew, endNew);
            this.selectionEnd = Math.max(startNew, endNew);
            storeSelection(this.selectionStart, this.selectionEnd);
        },
        newBinaryFileSelected(filePath: string, fileContent: ArrayBuffer) {
            this.fileContent = fileContent;
            this.selectionStart = -1;
            this.selectionEnd = -1;
            this.fileName = filePath;
        },
        deselect() {
            this.selectionStart = -1;
            this.selectionEnd = -1;
            storeSelection(this.selectionStart, this.selectionEnd);
        },
        updateParsedFile(parsedFile: IExportedValue) {
            this.parsedFile = parsedFile;
            this.parsedFileFlattened = flattenIExportedValueToLeafsOnly(parsedFile);
        }
    }
});