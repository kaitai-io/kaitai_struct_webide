interface IFileDropReader {
    (mode: "arrayBuffer"): Promise<ArrayBuffer>;
    (mode: "text"): Promise<string>;
    (mode: "dataUrl"): Promise<string>;
};

interface IFileDropCallback {
    (files: ({ file: File, read: IFileDropReader })[]);
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
        var files = (<DragEvent>event.originalEvent).dataTransfer.files;
        var resFiles = [];
        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            resFiles.push({ file: file, read: mode => readBlob(file, mode) })
        }
            
        callback(resFiles);
    });
}