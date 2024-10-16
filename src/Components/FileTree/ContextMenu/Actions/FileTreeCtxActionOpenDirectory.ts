import {TreeNodeDisplay, TreeNodeDisplayType} from "../../FileSystemVisitors/FileSystemFileTreeMapper";
import {MenuItem} from "@imengyu/vue3-context-menu/lib/ContextMenuDefine";
import {h} from "vue";
import {useFileSystems} from "../../Store/FileSystemsStore";

export const FileTreeCtxActionOpenDirectory = (item: TreeNodeDisplay): MenuItem => {
    const action = () => {
        const fileSystemsStore = useFileSystems();
        fileSystemsStore.openPath(item.fullPathWithStore);
    };

    return {
        label: "Open",
        onClick: action,
        hidden: item.type !== TreeNodeDisplayType.CLOSED_FOLDER,
        customClass: "context-menu-item",
        icon: () => h("i", {class: "glyphicon  glyphicon glyphicon-pencil", style: {height: "16px"}})
    };
};