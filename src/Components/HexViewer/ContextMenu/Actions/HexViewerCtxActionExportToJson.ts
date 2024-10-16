import {MenuItem} from "@imengyu/vue3-context-menu/lib/ContextMenuDefine";
import {useCurrentBinaryFileStore} from "../../../../Stores/CurrentBinaryFileStore";
import {CurrentGoldenLayout} from "../../../GoldenLayout/GoldenLayoutUI";
import {exportToJson} from "../../Actions/ExportToJson";

export const HexViewerCtxActionExportToJson = (useHex: boolean): MenuItem => {
    const currentBinaryFileStore = useCurrentBinaryFileStore();

    const action = async () => {
        const json = await exportToJson(useHex);
        CurrentGoldenLayout.addExportedToJsonTab("json export", json);
    };
    const label = useHex ? "Export to JSON(HEX)" : "Export to JSON";

    return {
        label: label,
        onClick: action,
        customClass: "context-menu-item",
        disabled: Object.values(currentBinaryFileStore.parsedFile?.object?.fields)[0]?.incomplete
    };
};