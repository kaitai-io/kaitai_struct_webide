/// <reference path="../lib/ts-types/goldenlayout.d.ts" />
declare var YAML: any, io: any;

var myLayout = new GoldenLayout({
    content: [{ type: 'row', content: [
        { type: 'component', componentName: '.ksy editor' },
        { type: 'column', content: [
            { type: 'component', componentName: 'hex viewer' },
            //{ type: 'component', componentName: 'ksyEditor' }
        ]}
    ]}]
});

myLayout.registerComponent('.ksy editor', function(container, componentState) {
    container.getElement().append($('<div id="ksyEditor"></div>'));
});

var hexViewer: HexViewer;
myLayout.registerComponent('hex viewer', function(container, componentState) {
    container.getElement().append($('<div id="hexViewer"></div>'));
    container.on('resize', () => {
        console.log('hex viewer resize');
        if (hexViewer) hexViewer.resize();
    });
});

myLayout.init();

$(() => {
    var ksyEditor = ace.edit('ksyEditor');
    ksyEditor.setTheme("ace/theme/monokai");
    ksyEditor.getSession().setMode("ace/mode/yaml");
    ksyEditor.$blockScrolling = Infinity; // TODO: remove this line after they fix ACE not to throw warning to the console
    $.ajax({ url: '/formats/archive/zip.ksy' }).done(ksyContent => {
        ksyEditor.setValue(ksyContent);
        ksyEditor.gotoLine(0);
        recompile();
    });

    myLayout.eventHub.on('resize', () => console.log('state changed'));

    $(window).on('resize', () => {
        myLayout.updateSize();
        //ksyEditor.resize();
        console.log('resize');
    });

    function recompile() {
        var srcYaml = ksyEditor.getValue();

        var src;
        try {
            src = YAML.parse(srcYaml);
        } catch (parseErr) {
            console.log("YAML parsing error: ", parseErr);
            return;
        }

        console.log(src);

        try {
            var ks = io.kaitai.struct.MainJs();
            var r = ks.compile('javascript', src);
        } catch (compileErr) {
            console.log("KS compilation error: ", compileErr);
            return;
        }

        console.log(r);
    }

    downloadFile('/samples/sample1.zip').then(fileContent => {
        var dataProvider = {
            length: fileContent.length,
            get(offset, length) {
                var res = [];
                for (var i = 0; i < length; i++)
                    res.push(fileContent[offset + i]); // TODO: use ArrayBuffer
                return res;
            }
        }

        hexViewer = new HexViewer("hexViewer", dataProvider);
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
})

