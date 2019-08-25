export function downloadFile(url: string) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.responseType = "arraybuffer";

    return new Promise<ArrayBuffer>((resolve, reject) => {
        xhr.onload = e => resolve(xhr.response);
        xhr.onerror = reject;
        xhr.send();
    });
}

export function saveFile(data: ArrayBuffer | Uint8Array | string, filename: string) {
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

export class Delayed {
    private timeout: number;

    constructor(public delay: number) { }

    public do(func: () => void) {
        if (this.timeout)
            clearTimeout(this.timeout);

        this.timeout = setTimeout(function () {
            this.timeout = null;
            func();
        }, this.delay);
    }
}

export class EventSilencer {
    silence = false;

    silenceThis(callback: () => void) {
        this.silence = true;
        callback();
        this.silence = false;
    }

    do(callback: () => void) {
        if (!this.silence)
            callback();
    }
}

export class Convert {
    static utf8StrToBytes(str: string): Uint8Array {
        return new TextEncoder().encode(str);
    }
}

export function asciiEncode(bytes: Uint8Array) {
    var len = bytes.byteLength;
    var binary = "";
    for (var i = 0; i < len; i++)
        binary += String.fromCharCode(bytes[i]);
    return binary;
}

function encodeHexNum(num: number) {
    return (num < 16 ? "0" : "") + num.toString(16);
}

export function hexEncode(bytes: Uint8Array) {
    var len = bytes.byteLength;
    var binary = "0x";
    for (var i = 0; i < len; i++)
        binary += encodeHexNum(bytes[i]);
    return binary;
}

export function uuidEncode(bytes: Uint8Array, isMs: boolean) {
    const byteOrder = isMs ? [3,2,1,0,"-",5,4,"-",7,6,"-",8,9,"-",10,11,12,13,14,15] : [0,1,2,3,"-",4,5,"-",6,7,"-",8,9,"-",10,11,12,13,14,15];
    var uuid = "";
    for (const desc of byteOrder)
        if (typeof desc === "number")
            uuid += encodeHexNum(bytes[desc]);
        else
            uuid += desc;
    return uuid;
}

export function arrayBufferToBase64(buffer: ArrayBuffer) {
    var bytes = new Uint8Array(buffer);
    var binary = asciiEncode(bytes);
    return window.btoa(binary);
}

export function readBlob(blob: Blob, mode: "arrayBuffer" | "text" | "dataUrl", ...args: any[]): Promise<string|ArrayBuffer> {
    return new Promise(function (resolve, reject) {
        var reader = new FileReader();
        reader.onload = function () { resolve(reader.result); };
        reader.onerror = function (e) { reject(e); };
        reader["readAs" + mode[0].toUpperCase() + mode.substr(1)](blob, ...args);
    });
}

export function htmlescape(str: string) {
    return $("<div/>").text(str).html();
}

export interface IFileReader {
    (mode: "arrayBuffer"): Promise<ArrayBuffer>;
    (mode: "text"): Promise<string>;
    (mode: "dataUrl"): Promise<string>;
}

export interface IFileProcessItem {
    file: File;
    read: IFileReader;
}

export interface IFileProcessCallback {
    (files: IFileProcessItem[]): void;
}

export function processFiles(files: FileList) {
    var resFiles = <IFileProcessItem[]>[];
    for (var i = 0; i < files.length; i++) {
        var file = files[i];
        resFiles.push({ file: file, read: function (mode: "arrayBuffer" | "text" | "dataUrl") { return <Promise<any>>readBlob(this.file, mode); } });
    }
    return resFiles;
}

export function openFilesWithDialog(callback: IFileProcessCallback) {
    $(`<input type="file" multiple />`).on("change", e => {
        var files = processFiles((<any>e.target).files);
        callback(files);
    }).click();
}

export function s(strings: TemplateStringsArray, ...values: any[]) {
    var result = strings[0];
    for (var i = 1; i < strings.length; i++)
        result += htmlescape(values[i - 1]) + strings[i];
    return result;
}

export function collectAllObjects(root: IExportedValue): IExportedValue[] {
    var objects: IExportedValue[] = [];

    function process(value: IExportedValue) {
        objects.push(value);
        if (value.type === ObjectType.Object)
            Object.keys(value.object.fields).forEach(fieldName => process(value.object.fields[fieldName]));
        else if (value.type === ObjectType.Array)
            value.arrayItems.forEach(arrItem => process(arrItem));
    }

    process(root);
    return objects;
}

export function precallHook(parent: any, name: string, callback: () => void) {
    var original = parent[name];
    parent[name] = function() {
        callback();
        original.apply(this, arguments);
    };
    parent[name].prototype = original.prototype;
}