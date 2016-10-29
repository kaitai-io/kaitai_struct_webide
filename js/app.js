$(() => {
    var ksyEditor = ace.edit("ksyEditor");
    ksyEditor.setTheme("ace/theme/monokai");
    ksyEditor.getSession().setMode("ace/mode/yaml");
    $.ajax({ url: '/formats/image/png.ksy' }).done(ksyContent => {
        ksyEditor.setValue(ksyContent);
        ksyEditor.gotoLine(0);
        console.log('ajax done, len: ', ksyContent.length);
    });
    function downloadFile(url) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';
        return new Promise((resolve, reject) => {
            xhr.onload = function (e) {
                resolve(new Uint8Array(this.response));
            };
            xhr.send();
        });
    }
    downloadFile('/samples/pnggrad8rgb.png').then(pngContent => {
        var dataProvider = {
            length: pngContent.length,
            get(offset, length) {
                var res = [];
                for (var i = 0; i < length; i++)
                    res.push(pngContent[offset + i]); // TODO: use ArrayBuffer
                return res;
            }
        };
        var hexViewer = new HexViewer("hexViewer", dataProvider);
        hexViewer.setIntervals([
            { start: 0, end: 2 },
            { start: 1, end: 2 },
            { start: 2, end: 2 },
            { start: 3, end: 6 },
            { start: 7, end: 10 },
            { start: 16 + 0, end: 16 + 8 },
            { start: 16 + 1, end: 16 + 8 },
            { start: 16 + 2, end: 16 + 8 },
            { start: 32, end: 95 },
        ]);
    });
});
//# sourceMappingURL=app.js.map