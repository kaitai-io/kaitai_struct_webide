import {FileActionsWrapper} from "../../utils/Files/FileActionsWrapper";
import {IFileProcessCallback} from "../../utils/Files/Types";

export const initFileDrop = (containerId: string, callback: IFileProcessCallback) => {
    let dragLeaveClear: number;
    const fileDropShadow = $("#" + containerId);

    const dragover = (event: Event): boolean => {
        event.preventDefault();
        event.stopPropagation();

        if (dragLeaveClear) {
            clearTimeout(dragLeaveClear);
            dragLeaveClear = null;
        }
        fileDropShadow.show();

        return false;
    };

    const dragleave = (event: Event) => {
        event.preventDefault();
        event.stopPropagation();

        if (dragLeaveClear)
            clearTimeout(dragLeaveClear);

        dragLeaveClear = setTimeout(function () {
            fileDropShadow.hide();
        }, 100);
    };

    const drop = (event: Event) => {
        event.preventDefault();
        event.stopPropagation();
        fileDropShadow.hide();

        FileActionsWrapper.processFilesFromDropEvent(event, callback);
    };

    const body = $("body");
    body.on("dragover", dragover);
    body.on("dragleave", dragleave);
    body.on("drop", drop);
};