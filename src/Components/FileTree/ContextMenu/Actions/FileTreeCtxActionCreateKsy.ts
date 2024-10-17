import {TreeNodeDisplay, TreeNodeDisplayType} from "../../FileSystemVisitors/FileSystemFileTreeMapper";
import {MenuItem} from "@imengyu/vue3-context-menu/lib/ContextMenuDefine";
import {h} from "vue";

import {FILE_SYSTEM_TYPE_KAITAI} from "../../FileSystems/KaitaiFileSystem";
import {createNewKsyAction} from "../../../../GlobalActions/CreateNewKsyAction";
import {useTextModalInputStore} from "../../../Modals/TextInputModal/TextInputModalStore";
import {BoltIcon, DocumentPlusIcon} from "@heroicons/vue/16/solid";

export const FileTreeCtxActionCreateKsy = (item: TreeNodeDisplay): MenuItem => {
    const action = () => {
        const store = useTextModalInputStore();
        const isRoot = item.fullPath.length === 0;
        store.open({
            title: "Add new KSY",
            onAccept: (fileName) => {
                const newPath = isRoot
                    ? fileName
                    : `${item.fullPath}/${fileName}`;
                createNewKsyAction(item.storeId, newPath);
            },
        });
    };

    return {
        label: "New KSY file...",
        onClick: action,
        hidden: [TreeNodeDisplayType.OPEN_FOLDER, TreeNodeDisplayType.CLOSED_FOLDER, TreeNodeDisplayType.EMPTY_FOLDER].indexOf(item.type) === -1,
        customClass: "context-menu-item",
        disabled: item.storeId === FILE_SYSTEM_TYPE_KAITAI,
        icon: () => h(DocumentPlusIcon),
    };
};