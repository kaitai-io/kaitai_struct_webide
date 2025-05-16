import JSZip from "jszip";

export interface FileToPack {
    path: string;
    data: string | ArrayBuffer;
}

export class ZipUtil {
    public static async packZip(filesToPack: FileToPack[]): Promise<Blob> {
        const zip = new JSZip();
        filesToPack.forEach(item => zip.file(item.path, item.data));
        return zip.generateAsync({type: "blob"});
    }
}