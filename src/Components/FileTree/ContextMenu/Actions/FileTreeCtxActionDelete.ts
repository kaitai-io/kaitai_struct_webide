import {TreeNodeDisplay, TreeNodeDisplayType} from "../../FileSystemVisitors/FileSystemVisitor";
import {MenuItem} from "@imengyu/vue3-context-menu/lib/ContextMenuDefine";
import {h} from "vue";
import {mapFileTreeDisplayNodeToYaml} from "./FileTreeCtxActionGenerateParser";
import {useAppStore} from "../../../../Stores/AppStore";
import {useFileSystems} from "../../Store/FileSystemsStore";
import {FILE_SYSTEM_TYPE_KAITAI, FILE_SYSTEM_TYPE_LOCAL} from "../../../../v1/FileSystems/FileSystemsTypes";

export const FileTreeCtxActionDelete = (item: TreeNodeDisplay): MenuItem => {
    const action = async () => {
        alert("ACTION NOT IMPLEMENTED!");
    };

    return {
        label: "Delete",
        onClick: action,
        customClass: "context-menu-item",
        disabled: item.storeId === FILE_SYSTEM_TYPE_KAITAI,
        icon: () => h("i", {class: "glyphicon glyphicon-remove", style: {height: "16px"}})
    };
};