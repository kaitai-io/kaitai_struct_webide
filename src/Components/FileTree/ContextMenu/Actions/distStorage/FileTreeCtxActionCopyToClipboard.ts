import {TreeNodeDisplay, TreeNodeDisplayType} from "../../../FileSystemVisitors/FileSystemFileTreeMapper";
import {MenuItem} from "@imengyu/vue3-context-menu/lib/ContextMenuDefine";
import {h} from "vue";
import {useFileSystems} from "../../../Store/FileSystemsStore";
import {DocumentDuplicateIcon} from "@heroicons/vue/16/solid";

export const FileTreeCtxActionCopyToClipboard = (item: TreeNodeDisplay): MenuItem => {
    const action = async () => {
        const fileSystemsStore = useFileSystems();
        const content = await fileSystemsStore.getFile(item.storeId, item.fullPath);
        const type = "text/plain";
        const clipboardItemData = {
            [type]: content as string,
        };
        const clipboardItem = new ClipboardItem(clipboardItemData);
        await navigator.clipboard.write([clipboardItem]);
    };

    return {
        label: "Copy to Clipboard",
        onClick: action,
        hidden: [TreeNodeDisplayType.KSY_FILE, TreeNodeDisplayType.BINARY_FILE].indexOf(item.type) === -1,
        customClass: "context-menu-item",
        icon: () => h(DocumentDuplicateIcon),
    };
};