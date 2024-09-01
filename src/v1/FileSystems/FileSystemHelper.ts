import {FILE_SYSTEM_TYPE_LOCAL, IFsItem, IFsItemSummary, ITEM_MODE_DIRECTORY} from "./FileSystemsTypes";


export const findOrCreateFsPath = (root: IFsItem, filePath: string) => {
    var currNode = root;
    var fnParts = filePath.split("/");
    var currPath = "";
    for (var i = 0; i < fnParts.length; i++) {
        var fnPart = fnParts[i];
        currPath += (currPath ? "/" : "") + fnPart;

        if (!("children" in currNode)) {
            currNode.children = {};
            currNode.type = ITEM_MODE_DIRECTORY;
        }

        if (!(fnPart in currNode.children))
            currNode.children[fnPart] = {fsType: root.fsType, type: "file", fn: currPath};

        currNode = currNode.children[fnPart];
    }
    return currNode;
};

export const getSummaryIfPresent = (fsItem?: IFsItem): IFsItemSummary => {
    return fsItem
        ? getSummary(fsItem)
        : emptySummary();
};

const getSummary = (data: IFsItem): IFsItemSummary => {
    const isFolder = data.type === ITEM_MODE_DIRECTORY;
    return {
        isFolder: isFolder,
        isLocal: data.fsType === FILE_SYSTEM_TYPE_LOCAL,
        isKsy: !isFolder && data.fn && data.fn.endsWith(".ksy")
    };
};

const emptySummary = (): IFsItemSummary => {
    return {
        isFolder: false,
        isLocal: false,
        isKsy: false
    };
};

