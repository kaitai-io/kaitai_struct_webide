import {TreeNodeDisplay} from "../../../FileSystemVisitors/FileSystemFileTreeMapper";
import {MenuItem} from "@imengyu/vue3-context-menu/lib/ContextMenuDefine";
import {h} from "vue";
import {PencilIcon} from "@heroicons/vue/16/solid";
import {useTextModalInputStore} from "../../../../Modals/TextInputModal/TextInputModalStore";
import {FileSystemPath} from "../../../FileSystemsTypes";
import {FILE_SYSTEM_TYPE_KAITAI} from "../../../FileSystems/KaitaiFileSystem";
import {FileTreeRenameAction} from "../../../Actions/FileTreeRenameAction";

export const FileTreeCtxActionRename = (item: TreeNodeDisplay): MenuItem => {


    const action = async () => {
        const modalInputStore = useTextModalInputStore();
        modalInputStore.open({
            title: "Rename",
            initValue: item.fileName,
            onAccept: async (newName) => {
                const oldPathParts = item.fullPath.split("/");
                oldPathParts[oldPathParts.length - 1] = newName;
                const newFullPathString = oldPathParts.join("/");
                const oldPath = FileSystemPath.fromFullPathWithStore(item.fullPathWithStore);
                const newPath = FileSystemPath.of(item.storeId, newFullPathString);

                FileTreeRenameAction(oldPath, newPath);
            },
        });
    };

    return {
        label: "Rename",
        onClick: action,
        customClass: "context-menu-item",
        disabled: item.storeId === FILE_SYSTEM_TYPE_KAITAI || item.fullPath === "",
        icon: () => h(PencilIcon),
    };
};