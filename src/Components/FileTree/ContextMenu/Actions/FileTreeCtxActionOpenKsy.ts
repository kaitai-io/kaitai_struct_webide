import {TreeNodeDisplay, TreeNodeDisplayType} from "../../FileSystemVisitors/FileSystemFileTreeMapper";
import {MenuItem} from "@imengyu/vue3-context-menu/lib/ContextMenuDefine";
import {h} from "vue";
import {useAppStore} from "../../../../Stores/AppStore";
import {DocumentTextIcon} from "@heroicons/vue/16/solid";
import {FileSystemPath} from "../../FileSystemsTypes";

export const FileTreeCtxActionOpenKsy = (item: TreeNodeDisplay): MenuItem => {
    const action = async () => {
        const appStore = useAppStore();
        appStore.updateSelectedKsyFile(FileSystemPath.fromFullPathWithStore(item.fullPathWithStore));
    };

    return {
        label: "Open in Editor",
        onClick: action,
        hidden: item.type !== TreeNodeDisplayType.KSY_FILE,
        customClass: "context-menu-item",
        icon: () => h(DocumentTextIcon),
    };
};