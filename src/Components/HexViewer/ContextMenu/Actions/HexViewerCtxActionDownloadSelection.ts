import {MenuItem} from "@imengyu/vue3-context-menu/lib/ContextMenuDefine";
import {h} from "vue";
import {FileActionsWrapper} from "../../../../v1/utils/Files/FileActionsWrapper";
import {useCurrentBinaryFileStore} from "../../../../Stores/CurrentBinaryFileStore";

export const HexViewerCtxActionDownloadSelection = (): MenuItem => {
    const currentBinaryFileStore = useCurrentBinaryFileStore();

    const action = () => {
        FileActionsWrapper.downloadBinFromSelection();
    };

    return {
        label: "Download(selection)",
        onClick: action,
        customClass: "context-menu-item",
        disabled: currentBinaryFileStore.selectionStart === -1,
        icon: () => h("i", {class: "glyphicon glyphicon-cloud-download", style: {height: "16px"}})
    };
};