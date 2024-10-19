import {TreeNodeDisplay, TreeNodeDisplayType} from "../../FileSystemVisitors/FileSystemFileTreeMapper";
import {MenuItem} from "@imengyu/vue3-context-menu/lib/ContextMenuDefine";
import {h} from "vue";
import {useAppStore} from "../../../../Stores/AppStore";
import {DocumentIcon} from "@heroicons/vue/16/solid";
import {FileSystemPath} from "../../FileSystemsTypes";

export const FileTreeCtxActionOpenBinFile = (item: TreeNodeDisplay): MenuItem => {
    const action = () => {
        const appStore = useAppStore();
        appStore.updateSelectedBinaryFile(FileSystemPath.fromFullPathWithStore(item.fullPathWithStore));
    };

    return {
        label: "Open in HexEditor",
        onClick: action,
        hidden: item.type !== TreeNodeDisplayType.BINARY_FILE,
        customClass: "context-menu-item",
        icon: () => h(DocumentIcon),
    };
};