import {TreeNodeDisplay, TreeNodeDisplayType} from "../../../FileSystemVisitors/FileSystemFileTreeMapper";
import {MenuItem} from "@imengyu/vue3-context-menu/lib/ContextMenuDefine";
import {h} from "vue";
import {useFileSystems} from "../../../Store/FileSystemsStore";
import {FolderIcon} from "@heroicons/vue/16/solid";
import {FileSystemPath} from "../../../FileSystemsTypes";

export const FileTreeCtxActionCloseDirectory = (item: TreeNodeDisplay): MenuItem => {
    const action = () => {
        const fileSystemsStore = useFileSystems();
        fileSystemsStore.closePath(FileSystemPath.fromFullPathWithStore(item.fullPathWithStore));
    };

    return {
        label: "Close",
        onClick: action,
        hidden: item.type !== TreeNodeDisplayType.OPEN_FOLDER,
        customClass: "context-menu-item",
        icon: () => h(FolderIcon),
    };
};