import {findOrCreateFsPath, mapToJSTreeNodes} from "./FileSystemHelper";
import {FILE_SYSTEM_TYPE_KAITAI, IFileSystem, IFsItem, IJSTreeNodeHelper} from "./FileSystemsTypes";
import {FileActionsWrapper} from "../utils/FileActionsWrapper";

declare var kaitaiFsFiles: string[];

export class KaitaiFileSystem implements IFileSystem {
    constructor(public files: IFsItem) {
    }

    getRootNode() {
        return Promise.resolve(this.files);
    }

    setRootNode(newRoot: IFsItem): Promise<IFsItem> {
        throw "KaitaiFileSystem.setRootNode is not implemented";
    }
    get(fn: string): Promise<string | ArrayBuffer> {
        if (fn.toLowerCase().endsWith(".ksy"))
            return fetch(fn)
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
                    return response.text();
                }, err => {
                    if (err instanceof TypeError) {
                        throw new Error(`cannot reach the server (message: ${err.message}), check your internet connection`);
                    }
                    throw err;
                });
        else
            return FileActionsWrapper.downloadFile(fn);
    }

    put(fn: string, data: any) {
        return Promise.reject("KaitaiFileSystem.put is not implemented!");
    }
}

export const initKaitaiFsTreeData = (kaitaiFs: KaitaiFileSystem): IJSTreeNodeHelper => {
    const root = kaitaiFs.files;

    if (!root.children["formats"]) {
        console.error("'formats' node is missing from js/kaitaiFsFiles.js, are you sure 'formats' git submodule is initialized? Try run 'git submodule init; git submodule update --recursive; ./genKaitaiFsFiles.py'!");
        (<any>root.children["formats"]) = {};
    }


    return {
        text: "kaitai.io",
        icon: "glyphicon glyphicon-cloud",
        state: {opened: true},
        children: [
            {
                text: "formats",
                icon: "glyphicon glyphicon-book",
                children: mapToJSTreeNodes(root.children["formats"]),
                state: {opened: true}
            },
            {
                text: "samples",
                icon: "glyphicon glyphicon-cd",
                children: mapToJSTreeNodes(root.children["samples"]),
                state: {opened: true}
            },
        ]
    };
};

export const initKaitaiFs = () => {
    const kaitaiRoot = <IFsItem>{fsType: FILE_SYSTEM_TYPE_KAITAI};
    kaitaiFsFiles.forEach(fn => findOrCreateFsPath(kaitaiRoot, fn));
    return new KaitaiFileSystem(kaitaiRoot);
};

