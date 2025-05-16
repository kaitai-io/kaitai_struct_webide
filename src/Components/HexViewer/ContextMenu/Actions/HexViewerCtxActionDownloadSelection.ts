import {MenuItem} from "@imengyu/vue3-context-menu/lib/ContextMenuDefine";
import {h} from "vue";
import {useCurrentBinaryFileStore} from "../../../../Stores/CurrentBinaryFileStore";
import {downloadBinaryDataFromSelection} from "../../Actions/DownloadBinaryDataFromSelection";
import {CloudArrowDownIcon} from "@heroicons/vue/16/solid";

export const HexViewerCtxActionDownloadSelection = (): MenuItem => {
    const currentBinaryFileStore = useCurrentBinaryFileStore();

    const action = () => {
        downloadBinaryDataFromSelection();
    };

    return {
        label: "Download(selection)",
        onClick: action,
        customClass: "context-menu-item",
        disabled: currentBinaryFileStore.selectionStart === -1,
        icon: () => h(CloudArrowDownIcon)
    };
};