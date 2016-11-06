;
;
function initFileDrop(containerId, callback) {
    var dragLeaveClear;
    var body = $("body");
    var fileDropShadow = $("#" + containerId);
    body.on("dragover", function (event) {
        event.preventDefault();
        event.stopPropagation();
        if (dragLeaveClear) {
            clearTimeout(dragLeaveClear);
            dragLeaveClear = null;
        }
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
        var file = event.originalEvent.dataTransfer.files[0];
        callback(file, mode => readBlob(file, mode));
    });
}
//# sourceMappingURL=FileDrop.js.map