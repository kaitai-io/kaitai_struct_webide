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