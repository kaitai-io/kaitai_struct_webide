import {TreeNodeDisplay, TreeNodeDisplayType} from "../../FileSystemVisitors/FileSystemVisitor";
import {MenuItem} from "@imengyu/vue3-context-menu/lib/ContextMenuDefine";
import {h} from "vue";
import {FILE_SYSTEM_TYPE_KAITAI} from "../../../../v1/FileSystems/FileSystemsTypes";

export const FileTreeCtxActionCreateDirectory = (item: TreeNodeDisplay): MenuItem => {
    const action = () => {
        alert("ACTION NOT IMPLEMENTED!");
    };

    return {
        label: "New Folder...",
        onClick: action,
        hidden: [TreeNodeDisplayType.OPEN_FOLDER, TreeNodeDisplayType.CLOSED_FOLDER, TreeNodeDisplayType.EMPTY_FOLDER].indexOf(item.type) === -1,
        customClass: "context-menu-item",
        disabled: item.storeId === FILE_SYSTEM_TYPE_KAITAI,
        icon: () => h("i", {class: "glyphicon glyphicon-folder-open", style: {height: "16px"}})
    };
};