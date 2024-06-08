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