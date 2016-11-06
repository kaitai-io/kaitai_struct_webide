interface IFileDropReader {
    (mode: "arrayBuffer"): Promise<ArrayBuffer>;
    (mode: "text"): Promise<string>;
    (mode: "dataUrl"): Promise<string>;
};

interface IFileDropCallback {
    (file: File, read: IFileDropReader);
};

function initFileDrop(containerId, callback: IFileDropCallback) {
    var dragLeaveClear;
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
        var file = (<DragEvent>event.originalEvent).dataTransfer.files[0];
        callback(file, mode => readBlob(file, mode));
    });
}