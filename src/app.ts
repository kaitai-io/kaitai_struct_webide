/// <reference path="../lib/ts-types/goldenlayout.d.ts" />

declare var YAML: any, io: any, jailed: any, IntervalTree: any, LargeLocalStorage: any;

var baseUrl = location.href.split('?')[0].split('/').slice(0, -1).join('/') + '/';

var dataProvider: IDataProvider;
var itree;

$(() => {
    ui.hexViewer.onSelectionChanged = () => {
        ui.infoPanel.getElement().text(ui.hexViewer.selectionStart == -1 ? 'no selection' : `selection: ${ui.hexViewer.selectionStart}-${ui.hexViewer.selectionEnd}`)
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
        if (file.name.toLowerCase().endsWith('.ksy'))
            reader('text').then(setKsy);
        else
            reader('arrayBuffer').then(setInputBuffer).then(reparse);
    });

    ui.fileTree.getElement().bind("dblclick.jstree", function (event) {
        var fn: string = (<any>$(this)).jstree().get_node(event.target).data;
        if (!fn) return;

        if(fn.toLowerCase().endsWith('.ksy'))
            Promise.resolve($.ajax({ url: fn })).then(ksy => setKsy(ksy));
        else
            downloadFile(fn).then(b => setInputBuffer(b)).then(reparse);
    });

    var storage = new LargeLocalStorage({ size: 5 * 1024 * 1024, name: 'fsDb' });

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

                itree = new IntervalTree(dataProvider.length / 2);

                handleError(error);

                var jsTree = <any>ui.parsedDataTree.getElement();
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
    var load = { input: 'sample1.wad', format: 'game/doom_wad.ksy' };

    function setInputBuffer(fileBuffer: ArrayBuffer, fromCache: boolean = false) {
        if (!fromCache)
            storage.setAttachment('files', 'last', fileBuffer);

        dataProvider = {
            length: fileBuffer.byteLength,
            get(offset, length) { return new Uint8Array(fileBuffer, offset, length) },
        };

        ui.hexViewer.setDataProvider(dataProvider);

        return jailrun('inputBuffer = args; void(0)', fileBuffer);
    }

    var inputReady = storage.initialized.then(() => storage.getAttachment('files', 'last'))
        .then(file => readBlob(file, 'arrayBuffer'), () => downloadFile(`samples/${load.input}`))
        .then(b => setInputBuffer(b, true));

    var editDelay = new Delayed(500);
    ui.ksyEditor.on('change', () => editDelay.do(() => recompile()));

    function setKsy(ksyContent: string, fromCache: boolean = false) {
        if (!fromCache)
            localStorage.setItem('ksy', ksyContent);
        //console.log('setKsy', ksyContent);
        ui.ksyEditor.setValue(ksyContent, -1);
    }

    var cachedKsy = localStorage.getItem('ksy');
    var formatReady = Promise.resolve(cachedKsy ? cachedKsy : $.ajax({ url: `formats/${load.format}` })).then(ksy => setKsy(ksy, true));
})