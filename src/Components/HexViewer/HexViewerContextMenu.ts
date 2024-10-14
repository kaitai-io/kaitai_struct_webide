import {FileActionsWrapper} from "../../v1/utils/Files/FileActionsWrapper";
import {h} from "vue";
import {exportToJson} from "../../GlobalActions/ExportToJson";
import {CurrentGoldenLayout} from "../../v1/GoldenLayout/GoldenLayoutUI";
import {useCurrentBinaryFileStore} from "../../Stores/CurrentBinaryFileStore";
import {MenuOptions} from "@imengyu/vue3-context-menu";

export const prepareContextMenuOptions = (e: MouseEvent): MenuOptions => {
    const currentBinaryFileStore = useCurrentBinaryFileStore();
    return {
        x: e.x,
        y: e.y,
        customClass: "menu-trick",
        theme: "flat dark",
        clickCloseOnOutside: true,
        items: [
            {
                label: "Download(selection)",
                onClick: () => {
                    FileActionsWrapper.downloadBinFromSelection();
                },
                customClass: "context-menu-item",
                disabled: currentBinaryFileStore.selectionStart === -1,
                icon: () => h("i", {class: "glyphicon glyphicon-cloud-download", style: {height: "16px"}})
            },
            {
                label: "Export to JSON",
                onClick: async () => {
                    const json = await exportToJson();
                    CurrentGoldenLayout.addExportedToJsonTab("json export", json);
                },
                customClass: "context-menu-item",
                disabled: Object.values(currentBinaryFileStore.parsedFile?.object?.fields)[0]?.incomplete
            },
            {
                label: "Export to JSON(HEX)",
                onClick: async () => {
                    const json = await exportToJson(true);
                    CurrentGoldenLayout.addExportedToJsonTab("json export(HEX)", json);
                },
                customClass: "context-menu-item",
                disabled: Object.values(currentBinaryFileStore.parsedFile?.object?.fields)[0]?.incomplete
            }
        ]
    };
};