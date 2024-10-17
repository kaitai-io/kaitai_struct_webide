import {TreeNodeDisplay, TreeNodeDisplayType} from "../../FileSystemVisitors/FileSystemFileTreeMapper";
import {MenuItem} from "@imengyu/vue3-context-menu/lib/ContextMenuDefine";
import {h} from "vue";
import {mapFileTreeDisplayNodeToYaml} from "./FileTreeCtxActionGenerateParser";
import {useAppStore} from "../../../../Stores/AppStore";
import {useFileSystems} from "../../Store/FileSystemsStore";
import {DocumentDuplicateIcon} from "@heroicons/vue/16/solid";

import {FILE_SYSTEM_TYPE_LOCAL} from "../../FileSystems/LocalStorageFileSystem";
import {FILE_SYSTEM_TYPE_KAITAI} from "../../FileSystems/KaitaiFileSystem";

export const FileTreeCtxActionClone = (item: TreeNodeDisplay): MenuItem => {
    const action = async () => {
        const appStore = useAppStore();
        const fileSystemsStore = useFileSystems();
        const yaml = await mapFileTreeDisplayNodeToYaml(item);
        yaml.filePath = yaml.filePath.replace(/\.ksy$/mi, "_modified.ksy");
        await fileSystemsStore.addFile(FILE_SYSTEM_TYPE_LOCAL, yaml.filePath, yaml.fileContent);
        appStore.updateSelectedKsyFile({
            storeId: FILE_SYSTEM_TYPE_LOCAL,
            filePath: yaml.filePath
        });
    };

    return {
        label: "Clone",
        onClick: action,
        hidden: [TreeNodeDisplayType.KSY_FILE].indexOf(item.type) === -1,
        customClass: "context-menu-item",
        disabled: item.storeId === FILE_SYSTEM_TYPE_KAITAI,
        icon: () => h(DocumentDuplicateIcon),
    };
};