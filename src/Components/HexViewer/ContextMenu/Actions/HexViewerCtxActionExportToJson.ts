import {MenuItem} from "@imengyu/vue3-context-menu/lib/ContextMenuDefine";
import {useCurrentBinaryFileStore} from "../../../../Stores/CurrentBinaryFileStore";
import {exportToJson} from "../../Actions/ExportToJson";
import {h} from "vue";
import {CodeBracketIcon} from "@heroicons/vue/16/solid";
import {useDockviewStore} from "../../../Dockview/Store/DockviewStore";

export const HexViewerCtxActionExportToJson = (useHex: boolean): MenuItem => {
    const currentBinaryFileStore = useCurrentBinaryFileStore();

    const action = async () => {
        const json = await exportToJson(useHex);
        const title = useHex ? "json export(hex)" : "json export";
        useDockviewStore().addTab({
            title: title,
            content: json,
            language: "json"
        })
    };
    const label = useHex ? "Export to JSON(HEX)" : "Export to JSON";

    return {
        label: label,
        onClick: action,
        customClass: "context-menu-item",
        disabled: Object.values(currentBinaryFileStore.parsedFile?.object?.fields)[0]?.incomplete,
        icon: () => h(CodeBracketIcon),
    };
};