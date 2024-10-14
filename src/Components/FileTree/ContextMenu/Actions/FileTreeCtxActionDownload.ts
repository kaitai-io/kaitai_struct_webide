import {TreeNodeDisplay, TreeNodeDisplayType} from "../../FileSystemVisitors/FileSystemVisitor";
import {MenuItem} from "@imengyu/vue3-context-menu/lib/ContextMenuDefine";
import {h} from "vue";

export const FileTreeCtxActionDownload = (item: TreeNodeDisplay): MenuItem => {
    const action = () => {
        alert("ACTION NOT IMPLEMENTED!");
    };

    return {
        label: "Download",
        onClick: action,
        customClass: "context-menu-item",
        disabled: [TreeNodeDisplayType.KSY_FILE, TreeNodeDisplayType.BINARY_FILE].indexOf(item.type) === -1,
        icon: () => h("i", {class: "glyphicon glyphicon-cloud-download", style: {height: "16px"}})
    };
};