import {defineStore} from "pinia";
import {IExportedValue} from "../entities";
import {LocalStorageApi} from "../v1/utils/LocalStorageApi";
import {flattenIExportedValueToFlatInfo} from "../v1/utils/ExportedValueMappers";
import {IExportedValueFlatInfo} from "../v1/utils/ExportedValueMappers/IExportedValueFlatInfoMapper";

export interface CurrentBinaryFile {
    fileContent: ArrayBuffer;
    fileName: string;
    parsedFile?: IExportedValue;
    parsedFileFlatInfo?: IExportedValueFlatInfo;
    selectionPivot: number;
    selectionStart: number;
    selectionEnd: number;
}

export const useCurrentBinaryFileStore = defineStore("SelectionStore", {
    state: (): CurrentBinaryFile => {
        const value = LocalStorageApi.getCurrentBinaryFileStoreState();
        return {
            fileContent: new ArrayBuffer(0),
            fileName: value?.fileName || "",
            selectionStart: value?.start || -1,
            selectionEnd: value?.end || -1,
            selectionPivot: value?.pivot || -1,
        };
    },
    actions: {
        updateSelectionPoint(point: number, source: string) {
            this.selectionStart = point;
            this.selectionEnd = point;
            this.selectionPivot = point;
            LocalStorageApi.storeCurrentBinaryFileStoreState(this);
        },
        updateSelectionRange(startNew: number, endNew: number, source: string) {
            const min = Math.min(startNew, endNew);
            const max = Math.max(startNew, endNew);

            this.selectionStart = min;
            this.selectionEnd = max;

            LocalStorageApi.storeCurrentBinaryFileStoreState(this);
        },
        updateSelectionPivot(point: number, source: string) {
            this.selectionPivot = point;
        },
        newBinaryFileSelected(filePath: string, fileContent: ArrayBuffer, source: string) {
            this.fileContent = fileContent;
            if (filePath === this.fileName) return;
            this.selectionStart = -1;
            this.selectionEnd = -1;
            this.selectionPivot = -1;
            this.fileName = filePath;
            LocalStorageApi.storeCurrentBinaryFileStoreState(this);
        },
        deselect() {
            this.selectionStart = -1;
            this.selectionEnd = -1;
            this.selectionPivot = -1;
            LocalStorageApi.storeCurrentBinaryFileStoreState(this);
        },
        updateParsedFile(parsedFile: IExportedValue) {
            this.parsedFile = parsedFile;
            this.parsedFileFlatInfo = flattenIExportedValueToFlatInfo(parsedFile);
        },
    }
});