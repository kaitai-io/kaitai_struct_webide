import {prepareFilePathFromNode, TreeNodeDisplay, TreeNodeDisplayType} from "../../FileSystemVisitors/FileSystemVisitor";
import {MenuItem} from "@imengyu/vue3-context-menu/lib/ContextMenuDefine";
import {h} from "vue";
import {useAppStore} from "../../../../Stores/AppStore";
import {useFileSystems} from "../../Store/FileSystemsStore";

export const FileTreeCtxActionCloseDirectory = (item: TreeNodeDisplay): MenuItem => {
    const action = () => {
        const fileSystemsStore = useFileSystems();
        fileSystemsStore.closePath(item.fullPath);
    };

    return {
        label: "Close",
        onClick: action,
        hidden: item.type !== TreeNodeDisplayType.OPEN_FOLDER,
        customClass: "context-menu-item",
        icon: () => h("i", {class: "glyphicon  glyphicon glyphicon-pencil", style: {height: "16px"}})
    };
};