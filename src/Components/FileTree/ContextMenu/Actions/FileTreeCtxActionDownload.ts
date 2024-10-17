import {TreeNodeDisplay, TreeNodeDisplayType} from "../../FileSystemVisitors/FileSystemFileTreeMapper";
import {MenuItem} from "@imengyu/vue3-context-menu/lib/ContextMenuDefine";
import {h} from "vue";
import {FileActionsWrapper} from "../../../../Utils/Files/FileActionsWrapper";
import {useFileSystems} from "../../Store/FileSystemsStore";
import {BoltIcon, CloudArrowDownIcon} from "@heroicons/vue/16/solid";

export const FileTreeCtxActionDownload = (item: TreeNodeDisplay): MenuItem => {
    const action = async () => {
        const store = useFileSystems();
        const fileContent = await store.getFile(item.storeId, item.fullPath);
        FileActionsWrapper.downloadFile(fileContent, item.fileName);
    };

    return {
        label: "Download",
        onClick: action,
        customClass: "context-menu-item",
        disabled: [TreeNodeDisplayType.KSY_FILE, TreeNodeDisplayType.BINARY_FILE].indexOf(item.type) === -1,
        icon: () => h(CloudArrowDownIcon),
    };
};