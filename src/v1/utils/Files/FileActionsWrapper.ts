import {IFileProcessCallback, IFileProcessItem} from "./Types";
import {useCurrentBinaryFileStore} from "../../../Stores/CurrentBinaryFileStore";
import {ArrayUtils} from "../Misc/ArrayUtils";
import {app} from "../../app";

export class FileActionsWrapper {

    public static downloadFile(url: string) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        xhr.responseType = "arraybuffer";

        return new Promise<ArrayBuffer>((resolve, reject) => {
            xhr.onload = e => resolve(xhr.response);
            xhr.onerror = reject;
            xhr.send();
        });
    }

    public static saveFile(data: ArrayBuffer | Uint8Array | string, filename: string) {
        const a = document.createElement("a");
        document.body.appendChild(a);
        a.style.display = "none";
        const blob = new Blob([data], {type: "octet/stream"});
        const url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    }

    public static processFilesFromInputOnChangeEvent(event: Event, callback: IFileProcessCallback): void {
        const target = event.target as HTMLInputElement;
        FileActionsWrapper.processUploadedFilesWithCallback(target.files, callback);
    }

    public static processFilesFromDropEvent(event: Event, callback: IFileProcessCallback): void {
        // @ts-ignore - Property 'originalEvent' does not exist on type 'Event'.
        const dragEvent = event.originalEvent as DragEvent;
        const files = dragEvent.dataTransfer.files;
        FileActionsWrapper.processUploadedFilesWithCallback(files, callback);
    }

    public static downloadBinFromSelection(): void {
        const store = useCurrentBinaryFileStore();

        const start = store.selectionStart;
        const end = store.selectionEnd;
        const fileDataLength = end - start + 1;

        const fileName = ArrayUtils.last(app.inputFsItem.fn.split("/"));
        const hexRange = `0x${start.toString(16)}-0x${end.toString(16)}`;
        const downloadedFileName = `${fileName}_${hexRange}.bin`;

        FileActionsWrapper.saveFile(new Uint8Array(app.inputContent, start, fileDataLength), downloadedFileName);
    }

    private static processUploadedFiles(files: FileList): IFileProcessItem[] {
        const readBlobPromise = (blob: Blob, mode: "arrayBuffer" | "text" | "dataUrl", ...args: any[]): Promise<string | ArrayBuffer> => {
            return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = function () {
                        resolve(reader.result);
                    };
                    reader.onerror = function (e) {
                        reject(e);
                    };
                    reader["readAs" + mode[0].toUpperCase() + mode.substr(1)](blob, ...args);
                }
            );
        };


        const processSingleFile = (file: File): IFileProcessItem => ({
            file: file,
            read: function (mode: "arrayBuffer" | "text" | "dataUrl") {
                return <Promise<any>>readBlobPromise(this.file, mode);
            }
        });

        return Array.from(files).map(processSingleFile);
    }

    private static processUploadedFilesWithCallback(files: FileList, callback: IFileProcessCallback): void {
        const processedFiles = FileActionsWrapper.processUploadedFiles(files);
        callback(processedFiles);
    }

}