import * as $ from "jquery";

export class FileUtils { 
    static readBlob(blob: Blob) {
        return new Promise<ArrayBuffer>(function (resolve, reject) {
            const reader = new FileReader();
            reader.onload = function () { resolve(reader.result); };
            reader.onerror = function (e) { reject(e); };
            reader.readAsArrayBuffer(blob);
        });
    }

    static openFilesWithDialog(): Promise<{ [fileName: string]: ArrayBuffer }> {
        return new Promise((resolve, reject) => {
            const input = $(`<input type="file" multiple />`);
            input.on("change", async e => {
                const fileList: FileList = (<any>e.target).files;

                const result = { };
                for(let file of Array.from(fileList))
                    result[file.name] = await FileUtils.readBlob(file);

                input.remove();
                resolve(result);
            }).click();
        });
    }

    static saveFile(filename: string, data: ArrayBufferLike) {
        var a = document.createElement("a");
        document.body.appendChild(a);
        a.style.display = "none";
        var blob = new Blob([data], { type: "octet/stream" });
        var url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    }
}