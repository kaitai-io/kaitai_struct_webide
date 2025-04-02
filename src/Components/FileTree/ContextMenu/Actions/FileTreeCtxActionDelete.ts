import {TreeNodeDisplay} from "../../FileSystemVisitors/FileSystemFileTreeMapper";
import {MenuItem} from "@imengyu/vue3-context-menu/lib/ContextMenuDefine";
import {h} from "vue";
import {useFileSystems} from "../../Store/FileSystemsStore";
import {FILE_SYSTEM_TYPE_KAITAI} from "../../FileSystems/KaitaiFileSystem";
import {TrashIcon} from "@heroicons/vue/16/solid";
import {FileSystemPath} from "../../FileSystemsTypes";
import {useAppStore} from "../../../../Stores/AppStore";
import {loadKsyFileAction} from "../../../../GlobalActions/LoadKsyFile";
import {loadBinaryFileAction} from "../../../../GlobalActions/LoadBinaryFile";

export const FileTreeCtxActionDelete = (item: TreeNodeDisplay): MenuItem => {
    const updateSelectedFileIfNeededAfterDelete = (pathToRemove: FileSystemPath) => {
        const appStore = useAppStore();
        if(pathToRemove.isTheSame(appStore.selectedKsyInfo)){
            appStore.updateSelectedKsyFile()
            loadKsyFileAction(appStore.selectedKsyInfo)
        } else if (pathToRemove.isTheSame(appStore.selectedBinaryInfo)) {
            appStore.updateSelectedBinaryFile()
            loadBinaryFileAction(appStore.selectedBinaryInfo)
        }
    }

    const action = async () => {
        const fileSystemStore = useFileSystems();
        const pathToRemove = FileSystemPath.fromFullPathWithStore(item.fullPathWithStore);
        fileSystemStore.deletePath(pathToRemove);
        updateSelectedFileIfNeededAfterDelete(pathToRemove)
    };

    return {
        label: "Delete",
        onClick: action,
        customClass: "context-menu-item",
        disabled: item.storeId === FILE_SYSTEM_TYPE_KAITAI,
        icon: () => h(TrashIcon),
    };
};