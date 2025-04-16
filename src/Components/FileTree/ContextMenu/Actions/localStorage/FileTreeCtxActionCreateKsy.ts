import {TreeNodeDisplay, TreeNodeDisplayType} from "../../../FileSystemVisitors/FileSystemFileTreeMapper";
import {MenuItem} from "@imengyu/vue3-context-menu/lib/ContextMenuDefine";
import {h} from "vue";

import {FILE_SYSTEM_TYPE_KAITAI} from "../../../FileSystems/KaitaiFileSystem";
import {createNewKsyAction} from "../../../../../GlobalActions/CreateNewKsyAction";
import {useTextModalInputStore} from "../../../../Modals/TextInputModal/TextInputModalStore";
import {DocumentPlusIcon} from "@heroicons/vue/16/solid";
import {FileSystemPath} from "../../../FileSystemsTypes";

export const FileTreeCtxActionCreateKsy = (item: TreeNodeDisplay): MenuItem => {
    const action = () => {
        const store = useTextModalInputStore();
        store.open({
            title: "Add new KSY",
            onAccept: (fileName) => {
                createNewKsyAction(FileSystemPath.fromFullPathWithStore(item.fullPathWithStore), fileName);
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