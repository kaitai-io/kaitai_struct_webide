/// <reference path="../lib/ts-types/goldenlayout.d.ts" />

declare var YAML: any, io: any, jailed: any, IntervalTree: any, localforage: LocalForage;

var baseUrl = location.href.split('?')[0].split('/').slice(0, -1).join('/') + '/';

var dataProvider: IDataProvider;
var itree;

$(() => {
    ui.infoPanel.getElement().show();

    ui.hexViewer.onSelectionChanged = () => {
        ui.infoPanel.getElement().text(ui.hexViewer.selectionStart == -1 ? 'no selection' : `selection: 0x${ui.hexViewer.selectionStart.toString(16)} - 0x${ui.hexViewer.selectionEnd.toString(16)}`)
        if (itree && ui.hexViewer.selectionStart) {
            var intervals = itree.search(ui.hexViewer.selectionStart);
            console.log('intervals', intervals);
        }
    };

    ui.hexViewer.onSelectionChanged();

    ui.genCodeDebugViewer.commands.addCommand({
        name: "compile",
        bindKey: { win: "Ctrl-Enter", mac: "Command-Enter" },
        exec: function (editor) { reparse(); }
    });

    initFileDrop('fileDrop', (file, reader) => {
        var isKsy = file.name.toLowerCase().endsWith('.ksy');
        (isKsy ? reader('text') : reader('arrayBuffer')).then(content => {
            if (isKsy)
                setKsy(<any>content);
            else
                setInputBuffer(<any>content).then(reparse);

            localFs.put(file.name, content).then(refreshFsNodes);
        });
    });

    function loadFsItem(fsItem: IFsItem) {
        if (!fsItem || fsItem.type !== 'file') return;

        return fss[fsItem.fsType].get(fsItem.fn).then(content => {
            if (fsItem.fn.toLowerCase().endsWith('.ksy'))
                return setKsy(<string>content);
            else {
                localforage.setItem('inputFsItem', fsItem);
                return setInputBuffer(<ArrayBuffer>content, true);
            }
        });
    }

    ui.fileTreeCont.getElement().bind("dblclick.jstree", function (event) {
        console.log('dblclick', event);
        loadFsItem(<IFsItem>ui.fileTree.get_node(event.target).data);
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
            console.log(compileErr.s$1);
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

                itree = new IntervalTree(dataProvider.length / 2);

                handleError(error);

                var jsTree = <any>ui.parsedDataTreeCont.getElement();
                parsedToTree(jsTree, res, handleError).on('select_node.jstree', function (e, node) {
                    //console.log('select_node', node);
                    var debug = node.node.data.debug;
                    if (debug)
                        ui.hexViewer.setSelection(debug.start, debug.end);
                });

                //var parsedJsonRes = parsedToJson(res);
                //lineInfo = parsedJsonRes.lineInfo;
                //console.log(lineInfo);
                //ui.parsedDataViewer.setValue(parsedJsonRes.json);
                //ui.hexViewer.setIntervals(parsedJsonRes.intervals);
            });
        });
    }

    //var load = { input: 'grad8rgb.bmp', format: 'image/bmp.ksy' };
    var load = { input: 'sample1.zip', format: 'archive/zip.ksy' };

    function setInputBuffer(fileBuffer: ArrayBuffer, fromCache: boolean = false) {
        dataProvider = {
            length: fileBuffer.byteLength,
            get(offset, length) { return new Uint8Array(fileBuffer, offset, length) },
        };

        ui.hexViewer.setDataProvider(dataProvider);

        return jailrun('inputBuffer = args; void(0)', fileBuffer);
    }

    var inputReady = localforage.getItem('inputFsItem').then((fsItem: IFsItem) => {
        return loadFsItem(fsItem || <IFsItem>{ fsType: 'kaitai', fn: `samples/${load.input}`, type: 'file' });
    });

    var editDelay = new Delayed(500);
    ui.ksyEditor.on('change', () => editDelay.do(() => recompile()));

    function setKsy(ksyContent: string, fromCache: boolean = false) {
        if (!fromCache)
            localStorage.setItem('ksy', ksyContent);

        ui.ksyEditor.setValue(ksyContent, -1);
    }

    var cachedKsy = localStorage.getItem('ksy');
    var formatReady = Promise.resolve(cachedKsy ? cachedKsy : $.ajax({ url: `formats/${load.format}` })).then(ksy => setKsy(ksy, true));
})