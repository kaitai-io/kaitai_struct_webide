import {prepareFilePathFromNode, TreeNodeDisplay, TreeNodeDisplayType} from "../../FileSystemVisitors/FileSystemVisitor";
import {MenuItem} from "@imengyu/vue3-context-menu/lib/ContextMenuDefine";
import {h} from "vue";
import {useAppStore} from "../../../../Stores/AppStore";

export const FileTreeCtxActionOpenKsy = (item: TreeNodeDisplay): MenuItem => {
    const action = async () => () => {
        const appStore = useAppStore();
        appStore.updateSelectedKsyFile({
            storeId: item.storeId,
            filePath: prepareFilePathFromNode(item)
        });
    };

    return {
        label: "Open in Editor",
        onClick: action,
        hidden: item.type !== TreeNodeDisplayType.KSY_FILE,
        customClass: "context-menu-item",
        icon: () => h("i", {class: "glyphicon  glyphicon glyphicon-pencil", style: {height: "16px"}})
    };
};