/// <reference path="../lib/ts-types/goldenlayout.d.ts" />
var baseUrl = location.href.split('?')[0].split('/').slice(0, -1).join('/') + '/';
var myLayout = new GoldenLayout({
    settings: { showCloseIcon: false, showPopoutIcon: false },
    content: [{ type: 'row', content: [
                { type: 'column', content: [
                        { type: 'component', componentName: 'ksyEditor', title: '.ksy editor', isClosable: false },
                        { type: 'component', componentName: 'parsedDataViewer', title: 'parsed data', isClosable: false },
                    ] },
                { type: 'stack', activeItemIndex: 1, content: [
                        { type: 'component', componentName: 'genCodeViewer', title: 'generated JS code', isClosable: false },
                        { type: 'component', componentName: 'hexViewer', title: 'input binary', isClosable: false },
                    ] }
            ] }]
});
var ui = {
    ksyEditor: null,
    genCodeViewer: null,
    parsedDataViewer: null,
    hexViewer: null
};
function addComponent(name, generatorCallback) {
    var editor;
    myLayout.registerComponent(name, function (container, componentState) {
        container.getElement().attr('id', name);
        container.on('resize', () => { if (editor)
            editor.resize(); });
        container.on('open', () => { ui[name] = editor = generatorCallback(); });
    });
}
function addEditor(name, lang, isReadOnly = false) {
    addComponent(name, () => {
        var editor = ace.edit(name);
        editor.setTheme("ace/theme/monokai");
        editor.getSession().setMode(`ace/mode/${lang}`);
        editor.$blockScrolling = Infinity; // TODO: remove this line after they fix ACE not to throw warning to the console
        editor.setReadOnly(isReadOnly);
        return editor;
    });
}
addEditor('ksyEditor', 'yaml');
addEditor('genCodeViewer', 'javascript', true);
addEditor('parsedDataViewer', 'javascript', true);
addComponent('hexViewer', () => new HexViewer("hexViewer"));
myLayout.init();
var jail;
var jailReady, inputReady;
function jailrun(code, args, cb = null) {
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
    function recompile() {
        var srcYaml = ui.ksyEditor.getValue();
        var src;
        try {
            src = YAML.parse(srcYaml);
        }
        catch (parseErr) {
            console.log("YAML parsing error: ", parseErr);
            return;
        }
        try {
            var ks = io.kaitai.struct.MainJs();
            var r = ks.compile('javascript', src, true);
        }
        catch (compileErr) {
            console.log("KS compilation error: ", compileErr);
            return;
        }
        ui.genCodeViewer.setValue(r[0], -1);
        jailrun(`module = { exports: true }; \n ${r[0]} \n`).then(reparse);
        console.log('recompiled');
    }
    function reparse() {
        return Promise.all([jailReady, inputReady, formatReady]).then(() => jail.remote.reparse(res => {
            var intervals = [];
            var padLen = 2;
            var commentOffset = 60;
            function toJson(obj, pad = 0) {
                if (typeof obj === "object") {
                    var objPad = " ".repeat((pad + 0) * padLen);
                    var childPad = " ".repeat((pad + 1) * padLen);
                    if (obj instanceof Uint8Array) {
                        var result = "";
                        for (var i = 0; i < obj.length; i++)
                            result += (i == 0 ? "" : ", ") + (i != 0 && (i % 8 == 0) ? "\n" + childPad : "") + obj[i];
                        return `[${result}]`;
                    }
                    else {
                        var keys = Object.keys(obj).filter(x => x != "_debug");
                        var isArray = Array.isArray(obj);
                        var body = `\n` + keys.map((key, i) => {
                            var lastKey = i == keys.length - 1;
                            var line = childPad + (isArray ? "" : `"${key}": `) + toJson(obj[key], pad + 1) + (lastKey ? "" : ",");
                            var lineParts = line.split('\n');
                            var lastLine = lineParts.pop();
                            if (lastLine.length < commentOffset)
                                lastLine = lastLine + ' '.repeat(commentOffset - lastLine.length);
                            lineParts.push(lastLine);
                            line = lineParts.join('\n');
                            if (obj._debug) {
                                var debug = obj._debug[key];
                                var len = debug.end - debug.start + 1;
                                if (len > 0) {
                                    intervals.push(debug);
                                    line += ` // ${debug.start}-${debug.end} (l:${debug.end - debug.start + 1})`;
                                }
                            }
                            return line;
                        }).join('\n') + `\n${objPad}`;
                        return isArray ? `[${body}]` : `{${body}}`;
                    }
                }
                else if (typeof obj === "number")
                    return `${obj}`;
                else
                    return `"${obj}"`;
            }
            var json = toJson(res);
            ui.parsedDataViewer.setValue(json);
            ui.hexViewer.setIntervals(intervals);
        }));
    }
    jail = new jailed.Plugin(baseUrl + 'js/kaitaiJail.js');
    jailReady = new Promise((resolve, reject) => {
        jail.whenConnected(() => resolve());
        jail.whenFailed(() => reject());
    }).then(() => new Promise((resolve, reject) => jail._connection.importScript(baseUrl + 'lib/kaitai_js_runtime/KaitaiStream.js', resolve, reject)));
    jailReady.then(() => console.log('jail started'), () => console.log('jail fail'));
    var inputReady = downloadFile('samples/sample1.zip').then(fileBuffer => {
        var fileContent = new Uint8Array(fileBuffer);
        var dataProvider = {
            length: fileContent.length,
            get(offset, length) {
                var res = [];
                for (var i = 0; i < length; i++)
                    res.push(fileContent[offset + i]); // TODO: use ArrayBuffer
                return res;
            }
        };
        ui.hexViewer.setDataProvider(dataProvider);
        ui.hexViewer.setIntervals([
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
    var formatReady = Promise.resolve($.ajax({ url: 'formats/archive/zip.ksy' })).then(ksyContent => {
        ui.ksyEditor.setValue(ksyContent, -1);
        var editDelay = new Delayed(500);
        ui.ksyEditor.on('change', () => editDelay.do(() => recompile()));
        recompile();
    });
});
//# sourceMappingURL=app.js.map