import {IFileProcessItem} from "./Types";
import {useCurrentBinaryFileStore} from "../../../Stores/CurrentBinaryFileStore";
import {ArrayUtils} from "../Misc/ArrayUtils";
import {useAppStore} from "../../../Stores/AppStore";

export class FileActionsWrapper {
    public static getFileFromServer(url: string) {
        return fetch(url)
            .then(response => {
                if (!response.ok) {
                    let msg;
                    if (response.status === 404) {
                        msg = "file not found";
                    } else {
                        const textAppendix = response.statusText ? ` (${response.statusText})` : "";
                        msg = `server responded with HTTP status ${response.status}${textAppendix}`;
                    }
                    throw new Error(msg);
                }
                return response;
            }, err => {
                if (err instanceof TypeError) {
                    throw new Error(`cannot reach the server (message: ${err.message}), check your internet connection`);
                }
                throw err;
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

    public static downloadBinFromSelection(): void {
        const store = useCurrentBinaryFileStore();
        const appStore = useAppStore();

        const start = store.selectionStart;
        const end = store.selectionEnd;
        const fileDataLength = end - start + 1;
        const noContentToDownload = start === -1 || end === -1;
        if (noContentToDownload) return;

        const filePath = appStore.selectedBinaryInfo.filePath;
        const fileName = ArrayUtils.last(filePath.split("/"));
        const hexRange = `0x${start.toString(16)}-0x${end.toString(16)}`;
        const downloadedFileName = `${fileName}_${hexRange}.bin`;

        FileActionsWrapper.saveFile(new Uint8Array(store.fileContent, start, fileDataLength), downloadedFileName);
    }

    public static mapToProcessItems(files: FileList): IFileProcessItem[] {
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


        const mapSingleFileToProcessItem = (file: File): IFileProcessItem => ({
            file: file,
            read: function (mode: "arrayBuffer" | "text" | "dataUrl") {
                return <Promise<any>>readBlobPromise(this.file, mode);
            }
        });

        return Array.from(files).map(mapSingleFileToProcessItem);
    }

}