/// <reference path="../lib/ts-types/goldenlayout.d.ts" />
declare var YAML: any, io: any, jailed: any;

var baseUrl = location.href.split('?')[0].split('/').slice(0, -1).join('/') + '/';

var myLayout = new GoldenLayout({
    settings: { showCloseIcon: false, showPopoutIcon: false },
    content: [
        { type: 'column', isClosable: false, content: [
            { type: 'row', content: [
                { type: 'column', content: [
                    { type: 'component', componentName: 'ksyEditor', title: '.ksy editor', isClosable: false },
                    { type: 'component', componentName: 'parsedDataViewer', title: 'parsed data', isClosable: false },
                ] },
                { type: 'stack', activeItemIndex: 2, content: [
                    { type: 'component', componentName: 'genCodeViewer', title: 'JS code', isClosable: false },
                    { type: 'component', componentName: 'genCodeDebugViewer', title: 'JS code (debug)', isClosable: false },
                    { type: 'column', isClosable: false, title: 'input binary', content: [
                        { type: 'component', componentName: 'hexViewer', title: 'hex viewer', isClosable: false },
                        { type: 'component', componentName: 'infoPanel', title: 'info panel', isClosable: false, height:30 },
                    ]}
                ] }
            ] },
        ] }
    ]
});

var ui = {
    ksyEditor: <AceAjax.Editor> null,
    genCodeViewer: <AceAjax.Editor> null,
    genCodeDebugViewer: <AceAjax.Editor> null,
    parsedDataViewer: <AceAjax.Editor> null,
    hexViewer: <HexViewer> null,
    errorWindow: <GoldenLayout.Container> null,
    infoPanel: <GoldenLayout.Container> null,
};

function addComponent(name: string, generatorCallback?) {
    var editor;

    myLayout.registerComponent(name, function (container: GoldenLayout.Container, componentState) {
        container.getElement().attr('id', name);
        if (generatorCallback) {
            container.on('resize', () => { if (editor && editor.resize) editor.resize(); });
            container.on('open', () => { ui[name] = editor = generatorCallback(container); });
        } else
            ui[name] = container;
    });
}

function addEditor(name: string, lang: string, isReadOnly: boolean = false) {
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
addEditor('genCodeDebugViewer', 'javascript', false);
addEditor('parsedDataViewer', 'javascript', true);
addComponent('hexViewer', () => new HexViewer("hexViewer"));
addComponent('errorWindow', cont => { cont.getElement().append($("<div />")); return cont; });
addComponent('infoPanel', cont => { cont.getElement().append($("#infoPanel")); return cont; });

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

var lastErrWndSize = 100; // 34
function showError(...args) {
    console.log.apply(window, args);
    var errMsg = args.filter(x => x.toString() !== {}.toString()).join(' ');
    var container = myLayout.root.contentItems[0];
    if (!ui.errorWindow) {
        container.addChild({ type: 'component', componentName: 'errorWindow', title: 'Errors' });
        ui.errorWindow.setSize(0, lastErrWndSize);
    }
    ui.errorWindow.on('resize', () => lastErrWndSize = ui.errorWindow.getElement().outerHeight());
    ui.errorWindow.on('close', () => ui.errorWindow = null);
    ui.errorWindow.getElement().children().text(errMsg);
}

function hideErrors() {
    if (ui.errorWindow) {
        ui.errorWindow.close();
        ui.errorWindow = null;
    }
}

$(() => {
    ui.hexViewer.onSelectionChanged = () => {
        ui.infoPanel.getElement().text(ui.hexViewer.selectionStart == -1 ? 'no selection' : `selection: ${ui.hexViewer.selectionStart}-${ui.hexViewer.selectionEnd}`)
    };

    ui.hexViewer.onSelectionChanged();

    ui.genCodeDebugViewer.commands.addCommand({
        name: "compile",
        bindKey: { win: "Ctrl-Enter", mac: "Command-Enter" },
        exec: function (editor) { reparse(); }
    });

    var lineInfo = null;
    ui.parsedDataViewer.getSession().selection.on('changeCursor', (e1, e2) => {
        var lineIdx = e2.selectionLead.row;
        var debug = lineInfo ? lineInfo.lines[lineIdx] : null;
        if (debug && debug.start <= debug.end)
            ui.hexViewer.setSelection(debug.start, debug.end);
        else
            ui.hexViewer.deselect();
    });

    function recompile() {
        var srcYaml = ui.ksyEditor.getValue();

        var src;
        try {
            src = YAML.parse(srcYaml);
        } catch (parseErr) {
            showError("YAML parsing error: ", parseErr);
            return;
        }

        try {
            var ks = io.kaitai.struct.MainJs();
            var r = ks.compile('javascript', src, false);
            var rDebug = ks.compile('javascript', src, true);
        } catch (compileErr) {
            showError("KS compilation error: ", compileErr);
            return;
        }

        ui.genCodeViewer.setValue(r[0], -1);
        ui.genCodeDebugViewer.setValue(rDebug[0], -1);
        reparse();
    }

    function reparse() {
        return Promise.all([jailReady, inputReady, formatReady]).then(() => {
            var debugCode = ui.genCodeDebugViewer.getValue();
            return jailrun(`module = { exports: true }; \n ${debugCode} \n`);
        }).then(() => {
            console.log('recompiled');

            jail.remote.reparse((res, error) => {
                window['parseRes'] = res;
                console.log('reparse res', res);

                if (error)
                    showError(`Parse error (${error.name}): ${error.message}\nCall stack: ${error.stack}`, error);
                else
                    hideErrors();

                var intervals = [];
                var padLen = 2;
                var commentOffset = 60;

                function commentPad(str) { return str.length < commentOffset ? str + ' '.repeat(commentOffset - str.length) : str; }

                lineInfo = { currLine: 0, lineStart: 0, lines: {} };
                var json = "";

                function nl() {
                    json += "\n";
                    lineInfo.currLine++;
                    lineInfo.lineStart = json.length;
                }

                function comment(str) {
                    var padLen = commentOffset - (json.length - lineInfo.lineStart);
                    if (padLen > 0)
                        json += ' '.repeat(padLen);
                    json += ` // ${str}`;
                }

                function getLenComment(debug, addInterval = false) {
                    if (debug) {
                        var len = debug.end - debug.start + 1;
                        if (len > 0)
                            intervals.push(debug);
                        lineInfo.lines[lineInfo.currLine] = debug;
                        return `${debug.start}-${debug.end} (l:${len})`;
                    }

                    return null;
                }

                function toJson(obj, debug = null, pad = 0) {
                    //debug = debug || obj._debug;
                    if (typeof obj === "object") {
                        var objPad = " ".repeat((pad + 0) * padLen);
                        var childPad = " ".repeat((pad + 1) * padLen);
                        if (obj instanceof Uint8Array) {
                            json += "[";
                            for (var i = 0; i < obj.length; i++) {
                                json += i == 0 ? "" : ", ";
                                if (i != 0 && (i % 8 == 0)) {
                                    nl();
                                    json += childPad;
                                }
                                json += obj[i];
                            }
                            json += "]";
                        } else {
                            var keys = Object.keys(obj).filter(x => x[0] != "_");
                            var isArray = Array.isArray(obj);
                            json += isArray ? `[` : `{`;
                            if (!isArray) {
                                if (obj._debug)
                                    json += ` // ${obj._debug.class}`;
                                if (debug)
                                    comment(getLenComment(debug));
                            }

                            for (var i = 0; i < keys.length; i++) {
                                var key = keys[i];

                                nl();
                                json += childPad + (isArray ? "" : `"${key}": `);

                                var childDebug = isArray ? debug.arr[key] : obj._debug ? obj._debug[key] : null;
                                var isObject = toJson(obj[key], childDebug, pad + 1);

                                json += (i == keys.length - 1 ? "" : ",");

                                if (!isObject)
                                    comment(' ' + getLenComment(childDebug, true));
                            }

                            nl();
                            json += objPad + (isArray ? `]` : `}`);
                            return true;
                        }
                    }
                    else if (typeof obj === "number")
                        json += `${obj}`;
                    else
                        json += `"${obj}"`;

                    return false;
                }

                toJson(res);
                console.log(lineInfo);
                ui.parsedDataViewer.setValue(json);
                ui.hexViewer.setIntervals(intervals);
            });
        });
    }

    jail = new jailed.Plugin(baseUrl + 'js/kaitaiJail.js');
    jailReady = new Promise((resolve, reject) => {
        jail.whenConnected(() => resolve());
        jail.whenFailed(() => reject());
    }).then(() => new Promise((resolve, reject) => jail._connection.importScript(baseUrl + 'lib/kaitai_js_runtime/KaitaiStream.js', resolve, reject)));
    jailReady.then(() => console.log('jail started'), () => console.log('jail fail'));

    var inputReady = downloadFile('samples/grad8rgb.bmp').then(fileBuffer => {
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

        ui.hexViewer.setDataProvider(dataProvider);

        return jailrun('inputBuffer = args; void(0)', fileBuffer);
    });

    var formatReady = Promise.resolve($.ajax({ url: 'formats/image/bmp.ksy' })).then(ksyContent => {
        ui.ksyEditor.setValue(ksyContent, -1);
        var editDelay = new Delayed(500);
        ui.ksyEditor.on('change', () => editDelay.do(() => recompile()));
        recompile();
    });
})