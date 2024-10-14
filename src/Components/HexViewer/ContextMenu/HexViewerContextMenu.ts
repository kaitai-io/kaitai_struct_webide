import {MenuOptions} from "@imengyu/vue3-context-menu";
import {HexViewerCtxActionDownloadSelection} from "./Actions/HexViewerCtxActionDownloadSelection";
import {HexViewerCtxActionExportToJson} from "./Actions/HexViewerCtxActionExportToJson";

export const prepareContextMenuOptions = (e: MouseEvent): MenuOptions => {
    return {
        x: e.x,
        y: e.y,
        customClass: "menu-trick",
        theme: "flat dark",
        clickCloseOnOutside: true,
        items: [
            HexViewerCtxActionDownloadSelection(),
            HexViewerCtxActionExportToJson(false),
            HexViewerCtxActionExportToJson(true)
        ]
    };
};