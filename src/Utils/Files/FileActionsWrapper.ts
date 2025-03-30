import {IFileProcessItem} from "./Types";

export class FileActionsWrapper {
    public static async fetchFileFromServer(url: string) {
        const resp = await fetch(url)
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
        return url.toLowerCase().endsWith(".ksy")
            ? resp.text()
            : resp.arrayBuffer();
    }

    public static downloadFile(data: ArrayBuffer | Uint8Array | string, filename: string) {
        const blob = new Blob([data], {type: "octet/stream"});
        this.downloadBlob(blob, filename);
    }

    public static downloadBlob(blob: Blob, filename: string) {
        const a = document.createElement("a");
        const url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
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
                    reader["readAs" + mode[0].toUpperCase() + mode.substring(1)](blob, ...args);
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