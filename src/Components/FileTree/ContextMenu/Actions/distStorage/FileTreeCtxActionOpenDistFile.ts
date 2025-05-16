import {TreeNodeDisplay, TreeNodeDisplayType} from "../../../FileSystemVisitors/FileSystemFileTreeMapper";
import {MenuItem} from "@imengyu/vue3-context-menu/lib/ContextMenuDefine";
import {h} from "vue";
import {DocumentTextIcon} from "@heroicons/vue/16/solid";
import {useFileSystems} from "../../../Store/FileSystemsStore";
import {useDockviewStore} from "../../../../Dockview/Store/DockviewStore";
import {ArrayUtils} from "../../../../../Utils/ArrayUtils";
import {KaitaiSupportedLanguages} from "../../../../../DataManipulation/KaitaiSupportedLanguages";

export const FileTreeCtxActionOpenDistFile = (item: TreeNodeDisplay): MenuItem => {
    const action = async () => {
        const content = await useFileSystems().getFile(item.storeId, item.fullPath) as string;
        const ext = ArrayUtils.last(item.fullPath.split(".")).toLowerCase();
        const lang = KaitaiSupportedLanguages.find(lang => lang.extension === ext);
        useDockviewStore().addTab({
            title: item.fullPath,
            content: content,
            language: lang?.monacoEditorLangCode || "text"
        });
    };

    return {
        label: "Open in Editor",
        onClick: action,
        hidden: [TreeNodeDisplayType.KSY_FILE, TreeNodeDisplayType.BINARY_FILE].indexOf(item.type) === -1,
        customClass: "context-menu-item",
        icon: () => h(DocumentTextIcon),
    };
};