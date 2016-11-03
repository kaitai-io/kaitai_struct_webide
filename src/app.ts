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
                    { type: 'stack', activeItemIndex: 1, content: [
                        { type: 'component', componentName: 'parsedDataViewer', title: 'parsed as JSON', isClosable: false },
                        { type: 'component', componentName: 'parsedDataTree', title: 'parsed as tree', isClosable: false },
                    ] },
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
    parsedDataViewer: <AceAjax.Editor>null,
    parsedDataTree: <GoldenLayout.Container> null,
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
            container.on('open', () => { ui[name] = editor = generatorCallback(container) || container; });
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
addComponent('errorWindow', cont => { cont.getElement().append($("<div />")); });
addComponent('infoPanel', cont => { cont.getElement().append($("#infoPanel")); });
addComponent('parsedDataTree');

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

                function getNodeItem(prop, value, debug) {
                    var isByteArray = value._debug && value._debug.class === "Uint8Array";
                    var isObject = typeof value === "object" && !isByteArray;

                    var text;
                    if (isObject)
                        text = prop;
                    else if (isByteArray) {
                        text = `${prop} = [`;
                        for (var i = 0; value[i]; i++) {
                            text += (i == 0 ? '' : ', ') + value[i];
                            if (i == 7) {
                                text += ", ...";
                                break;
                            }
                        }
                        text += ']';
                    } else
                        text = `${prop} = ${value}`;

                    return { text: text, children: isObject, data: <any>{ obj: value, debug: debug }, icon: false };
                }

                function getNode(node, cb) {
                    var obj = node.id === '#' ? res : node.data.obj;
                    if (!obj) {
                        if (node.data.getPath)
                            jail.remote.get(node.data.getPath, (res, error) => {
                                console.log('remote.get', res, error);
                                cb([getNodeItem('value', res, res._debug)]);
                            });
                        else
                            cb([]);
                    }
                    else {
                        console.log('getNode', obj);
                        var childNodes = Object.keys(obj).filter(x => x[0] != '_').map(prop => getNodeItem(prop, obj[prop], obj._debug[prop]));

                        if (obj._props) {
                            childNodes = childNodes.concat(Object.keys(obj._props).map(key => {
                                return { text: key, children: true, data: <any>{ getPath: obj._props[key] }, icon: false };
                            }));
                        }

                        cb(childNodes);
                    }
                }

                var jsTree = <any>ui.parsedDataTree.getElement();
                jsTree.jstree({ core: { data: (node, cb) => getNode(node, cb) } })
                    .on('keyup.jstree', function (e) { jsTree.jstree(true).activate_node(e.target.id) })
                    .on('select_node.jstree', function (e, node) {
                        //console.log('select_node', node);
                        var debug = node.node.data.debug;
                        if (debug)
                            ui.hexViewer.setSelection(debug.start, debug.end);
                    });

                var parsedJsonRes = parsedToJson(res);
                lineInfo = parsedJsonRes.lineInfo;
                console.log(lineInfo);
                ui.parsedDataViewer.setValue(parsedJsonRes.json);
                ui.hexViewer.setIntervals(parsedJsonRes.intervals);
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