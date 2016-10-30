/// <reference path="../lib/ts-types/goldenlayout.d.ts" />
declare var YAML: any, io: any, jailed: any;

var myLayout = new GoldenLayout({
    settings: { showCloseIcon: false, showPopoutIcon: false },
    content: [{ type: 'row', content: [
        { type: 'column', content: [
            { type: 'component', componentName: 'ksyEditor', title: '.ksy editor', isClosable: false },
            { type: 'component', componentName: 'parsedDataViewer', title: 'parsed data', isClosable: false },
        ]},
        { type: 'stack', activeItemIndex: 1, content: [
            { type: 'component', componentName: 'genCodeViewer', title: 'generated JS code', isClosable: false },
            { type: 'component', componentName: 'hex viewer', isClosable: false },
        ]}
    ]}]
});

var editors: { [s: string]: AceAjax.Editor; } = {};

function addEditor(name: string, lang: string, isReadOnly: boolean = false) {
    var editor;

    myLayout.registerComponent(name, function (container, componentState) {
        container.getElement().append($(`<div id="${name}"></div>`));
        container.on('resize', () => { if (editor) editor.resize(); });
        container.on('open', () => {
            editors[name] = editor = ace.edit(name);
            editor.setTheme("ace/theme/monokai");
            editor.getSession().setMode(`ace/mode/${lang}`);
            editor.$blockScrolling = Infinity; // TODO: remove this line after they fix ACE not to throw warning to the console
            editor.setReadOnly(isReadOnly);
        });
    });
}

addEditor('ksyEditor', 'yaml');
addEditor('genCodeViewer', 'javascript', true);
addEditor('parsedDataViewer', 'json', true);

var hexViewer: HexViewer;
myLayout.registerComponent('hex viewer', function(container, componentState) {
    container.getElement().append($('<div id="hexViewer"></div>'));
    container.on('resize', () => { if (hexViewer) hexViewer.resize(); });
});

myLayout.init();

var jail: any;
var jailReady, inputReady;
function jailrun(code, args?, cb = null) {
    return jailReady.then(() => {
        jail.remote.run(code, args, result => {
            if (cb)
                cb(result);
            else if (result.error)
                console.log(`Error: ${result.error}`);
            else if (result.output)
                console.log("Result =", JSON.parse(result.output));
        });
    });
}

$(() => {
    var ksyEditor = editors['ksyEditor'];
    var genCodeViewer = editors['genCodeViewer'];
    var parsedDataViewer = editors['parsedDataViewer'];

    $(window).on('resize', () => myLayout.updateSize());

    function recompile() {
        var srcYaml = ksyEditor.getValue();

        var src;
        try {
            src = YAML.parse(srcYaml);
        } catch (parseErr) {
            console.log("YAML parsing error: ", parseErr);
            return;
        }

        try {
            var ks = io.kaitai.struct.MainJs();
            var r = ks.compile('javascript', src);
        } catch (compileErr) {
            console.log("KS compilation error: ", compileErr);
            return;
        }

        genCodeViewer.setValue(r[0], -1);
        jailrun(`module = { exports: true }; \r\n ${r[0]} \r\n`).then(reparse);
        console.log('recompiled');        
    }

    function reparse() {
        return Promise.all([inputReady, formatReady]).then(() => jail.remote.reparse(res => parsedDataViewer.setValue(JSON.stringify(res, null, 2))));
    }

    jail = new jailed.Plugin(location.origin + '/js/kaitaiJail.js');
    jailReady = new Promise((resolve, reject) => {
        jail.whenConnected(() => resolve());
        jail.whenFailed(() => reject());
    });
    jailReady.then(() => console.log('jail started'), () => console.log('jail fail'));
    jailReady.then(() => jail._connection.importScript(location.origin + '/lib/kaitai_js_runtime/KaitaiStream.js'));

    var inputReady = downloadFile('/samples/sample1.zip').then(fileBuffer => {
        var fileContent = new Uint8Array(fileBuffer);
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

        return jailrun('inputBuffer = args; void(0)', fileBuffer);
    });

    var formatReady = Promise.resolve($.ajax({ url: '/formats/archive/zip.ksy' })).then(ksyContent => {
        ksyEditor.setValue(ksyContent, -1);
        var editDelay = new Delayed(500);
        ksyEditor.on('change', () => editDelay.do(() => recompile()));
        recompile();
    });
})

