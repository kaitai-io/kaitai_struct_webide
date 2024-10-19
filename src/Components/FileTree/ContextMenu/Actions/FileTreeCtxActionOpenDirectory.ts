import {TreeNodeDisplay, TreeNodeDisplayType} from "../../FileSystemVisitors/FileSystemFileTreeMapper";
import {MenuItem} from "@imengyu/vue3-context-menu/lib/ContextMenuDefine";
import {h} from "vue";
import {useFileSystems} from "../../Store/FileSystemsStore";
import {FolderIcon} from "@heroicons/vue/16/solid";
import {FileSystemPath} from "../../FileSystemsTypes";

export const FileTreeCtxActionOpenDirectory = (item: TreeNodeDisplay): MenuItem => {
    const action = () => {
        const fileSystemsStore = useFileSystems();
        fileSystemsStore.openPath(FileSystemPath.fromFullPathWithStore(item.fullPathWithStore));
    };

    return {
        label: "Open",
        onClick: action,
        hidden: item.type !== TreeNodeDisplayType.CLOSED_FOLDER,
        customClass: "context-menu-item",
        icon: () => h(FolderIcon),
    };
};