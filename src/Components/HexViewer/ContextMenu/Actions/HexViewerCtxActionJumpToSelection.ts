import {MenuItem} from "@imengyu/vue3-context-menu/lib/ContextMenuDefine";
import {h} from "vue";
import {useCurrentBinaryFileStore} from "../../../../Stores/CurrentBinaryFileStore";
import {BarsArrowDownIcon, BarsArrowUpIcon} from "@heroicons/vue/16/solid";
import {useHexViewerConfigStore} from "../../Store/HexViewerConfigStore";

export const HexViewerCtxActionJumpToSelection = (jumpToEnd: boolean = false): MenuItem => {
    const currentBinaryFileStore = useCurrentBinaryFileStore();

    const action = () => {
        const hexViewerStore = useHexViewerConfigStore();
        const jumpIndex = jumpToEnd
            ? currentBinaryFileStore.selectionEnd
            : currentBinaryFileStore.selectionStart;
        hexViewerStore.jumpToAddress(jumpIndex);
    };

    return {
        label: jumpToEnd ? "Jump to selection end" :  "Jump to selection start",
        onClick: action,
        customClass: "context-menu-item",
        disabled: currentBinaryFileStore.selectionStart === -1 || currentBinaryFileStore.selectionEnd === -1,
        icon: () => h(jumpToEnd ? BarsArrowDownIcon : BarsArrowUpIcon)
    };
};