import {TreeNodeDisplay, TreeNodeDisplayType} from "../../../FileSystemVisitors/FileSystemFileTreeMapper";
import {MenuItem} from "@imengyu/vue3-context-menu/lib/ContextMenuDefine";
import {h} from "vue";
import {FileActionsWrapper} from "../../../../../Utils/Files/FileActionsWrapper";
import {useFileSystems} from "../../../Store/FileSystemsStore";
import {CloudArrowDownIcon} from "@heroicons/vue/16/solid";
import {FILE_SYSTEM_TYPE_KAITAI} from "../../../FileSystems/KaitaiFileSystem";
import {FileSystemPath} from "../../../FileSystemsTypes";
import {FileToPack, ZipUtil} from "../../../../../Utils/Files/ZipUtil";

const mapFilesForPacking = async (getFile: (filePath: string) => Promise<string | ArrayBuffer>, rootPath: string, filePathsInNode: string[]): Promise<FileToPack[]> => {
    const itemPathParts = rootPath.split("/");
    const relativePath = itemPathParts[itemPathParts.length - 1];

    const data: FileToPack[] = [];
    for (const filePath of filePathsInNode) {
        try {
            const fullFilePath = `${relativePath}/${filePath}`;
            const fileContent = await getFile(fullFilePath);
            data.push({
                path: fullFilePath,
                data: fileContent
            });
        } catch (e) {
            console.error(e);
        }
    }
    return data;
};

export const FileTreeCtxActionDownload = (item: TreeNodeDisplay): MenuItem => {
    const isFile = [TreeNodeDisplayType.KSY_FILE, TreeNodeDisplayType.BINARY_FILE].indexOf(item.type) !== -1;

    const downloadSingleFile = async () => {
        const store = useFileSystems();
        const fileContent = await store.getFile(item.storeId, item.fullPath);
        FileActionsWrapper.downloadFile(fileContent, item.fileName);
    };

    const packAndDownloadDirectory = async () => {
        const store = useFileSystems();
        const filePathsInNode = await store.listAllItemsInPath(FileSystemPath.of(item.storeId, item.fullPath));
        const getFileFn = (filePath: string) => store.getFile(item.storeId, filePath);

        const filesToPack = await mapFilesForPacking(getFileFn, item.fullPath, filePathsInNode);
        FileActionsWrapper.downloadBlob(await ZipUtil.packZip(filesToPack), `kaitai-${Date.now()}.zip`);
    };

    const action = async () => {
        isFile
            ? await downloadSingleFile()
            : await packAndDownloadDirectory();
    };

    return {
        label: "Download",
        onClick: action,
        customClass: "context-menu-item",
        disabled: item.storeId === FILE_SYSTEM_TYPE_KAITAI && !isFile,
        icon: () => h(CloudArrowDownIcon),
    };
};