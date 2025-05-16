import {defineStore} from "pinia";
import {IExportedValue} from "../DataManipulation/ExportedValueTypes";
import {LocalStorageApi} from "../Utils/LocalStorageApi";
import {IExportedValueFlatInfo} from "../DataManipulation/ExportedValueMappers/IExportedValueFlatInfoMapper";

export interface CurrentBinaryFile {
    fileContent: ArrayBuffer;
    filePath: string;
    range?: IExportedValue;
    parsedFile?: IExportedValue;
    parsedFileFlatInfo?: IExportedValueFlatInfo;
    selectionPivot: number;
    selectionStart: number;
    selectionEnd: number;
}

export interface UpdateSelectionEvent {
    startNew: number;
    endNew: number;
    pivot?: number;
    range?: IExportedValue;
    source: string;
}

export const useCurrentBinaryFileStore = defineStore("SelectionStore", {
    state: (): CurrentBinaryFile => {
        const value = LocalStorageApi.getCurrentBinaryFileStoreState();
        return {
            fileContent: new ArrayBuffer(0),
            filePath: value?.filePath || "",
            selectionStart: value?.start || -1,
            selectionEnd: value?.end || -1,
            selectionPivot: value?.pivot || -1,
        };
    },
    actions: {
        updateSelectionEvent(event: UpdateSelectionEvent) {
            const min = Math.min(event.startNew, event.endNew);
            const max = Math.max(event.startNew, event.endNew);

            this.selectionStart = min;
            this.selectionEnd = max;
            this.range = event.range;
            this.selectionPivot = event.pivot;

            LocalStorageApi.storeCurrentBinaryFileStoreState(this);
        },
        newBinaryFileSelected(filePath: string, fileContent: ArrayBuffer, source: string) {
            this.fileContent = fileContent;
            if (filePath === this.filePath) return;
            this.selectionStart = -1;
            this.selectionEnd = -1;
            this.selectionPivot = -1;
            this.filePath = filePath;
            LocalStorageApi.storeCurrentBinaryFileStoreState(this);
        },
        deselect() {
            this.selectionStart = -1;
            this.selectionEnd = -1;
            this.selectionPivot = -1;
            this.range = undefined;
            LocalStorageApi.storeCurrentBinaryFileStoreState(this);
        },
        updateParsedFile(parsedFile: IExportedValue, flatInfo: IExportedValueFlatInfo) {
            this.parsedFile = parsedFile;
            this.parsedFileFlatInfo = flatInfo;
        },
    }
});