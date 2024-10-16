import {TreeNodeDisplay} from "../../FileSystemVisitors/FileSystemFileTreeMapper";
import {MenuItem} from "@imengyu/vue3-context-menu/lib/ContextMenuDefine";
import {h} from "vue";
import {useFileSystems} from "../../Store/FileSystemsStore";
import {FILE_SYSTEM_TYPE_KAITAI} from "../../FileSystems/KaitaiFileSystem";

export const FileTreeCtxActionDelete = (item: TreeNodeDisplay): MenuItem => {
    const action = async () => {
        const fileSystemStore = useFileSystems();
        fileSystemStore.deletePath(item.storeId, item.fullPath);
    };

    return {
        label: "Delete",
        onClick: action,
        customClass: "context-menu-item",
        disabled: item.storeId === FILE_SYSTEM_TYPE_KAITAI,
        icon: () => h("i", {class: "glyphicon glyphicon-remove", style: {height: "16px"}})
    };
};