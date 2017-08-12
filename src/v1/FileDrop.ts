import { processFiles, IFileProcessCallback } from "../utils";

export function initFileDrop(containerId: string, callback: IFileProcessCallback) {
    var dragLeaveClear: number;
    var body = $("body");
    var fileDropShadow = $("#" + containerId);
    body.on("dragover", function (event) {
        event.preventDefault();
        event.stopPropagation();

        if (dragLeaveClear) { clearTimeout(dragLeaveClear); dragLeaveClear = null; }

        fileDropShadow.show();
    });

    body.on("dragleave", function (event) {
        event.preventDefault();
        event.stopPropagation();

        if (dragLeaveClear)
            clearTimeout(dragLeaveClear);

        dragLeaveClear = setTimeout(function () { fileDropShadow.hide(); }, 100);
    });

    body.on("drop", function (event) {
        event.preventDefault();
        event.stopPropagation();
        fileDropShadow.hide();
        var files = (<DragEvent>event.originalEvent).dataTransfer.files;
        var resFiles = processFiles(files);
        callback(resFiles);
    });
}