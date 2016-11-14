/// <reference path="../lib/ts-types/goldenlayout.d.ts" />
/// <reference path="../node_modules/typescript/lib/lib.es6.d.ts" />

declare var YAML: any, io: any, jailed: any, IntervalTree: any, localforage: LocalForage;

var baseUrl = location.href.split('?')[0].split('/').slice(0, -1).join('/') + '/';

var dataProvider: IDataProvider;
var itree;

function compile(srcYaml: string, kslang: string, debug: true|false|'both') {
    var src;
    try {
        src = YAML.parse(srcYaml);
    } catch (parseErr) {
        showError("YAML parsing error: ", parseErr);
        return;
    }

    try {
        var ks = io.kaitai.struct.MainJs();
        var rRelease = (debug === false || debug === 'both') ? ks.compile(kslang, src, false) : null;
        var rDebug = (debug === true || debug === 'both') ? ks.compile(kslang, src, true) : null;
        return rRelease && rDebug ? { debug: rDebug, release: rRelease } : rRelease ? rRelease : rDebug;
    } catch (compileErr) {
        console.log(compileErr.s$1);
        showError("KS compilation error: ", compileErr);
        return;
    }
}

function isKsyFile(fn) { return fn.toLowerCase().endsWith('.ksy'); }

function recompile() {
    return localforage.getItem<IFsItem>('ksyFsItem').then(ksyFsItem => {
        var srcYaml = ui.ksyEditor.getValue();
        var changed = lastKsyContent !== srcYaml;

        var copyPromise = Promise.resolve();
        if (changed && ksyFsItem.fsType === 'kaitai') {
            var newFn = ksyFsItem.fn.split('/').last().replace('.ksy', '_modified.ksy');
            copyPromise = fss.local.put(newFn, srcYaml).then(fsItem => {
                ksyFsItem = fsItem;
                return localforage.setItem('ksyFsItem', fsItem);
            }).then(() => addKsyFile('localStorage', newFn, ksyFsItem));
        }

        return copyPromise.then(() => changed ? fss[ksyFsItem.fsType].put(ksyFsItem.fn, srcYaml) : Promise.resolve()).then(() => {
            var compiled = compile(srcYaml, 'javascript', 'both');

            ui.genCodeViewer.setValue(compiled.release[0], -1);
            ui.genCodeDebugViewer.setValue(compiled.debug[0], -1);
            return reparse();
        })
    });
}

var formatReady, selectedInTree;
function reparse() {
    var jsTree = <any>ui.parsedDataTreeCont.getElement();
    jsTree.jstree("destroy");

    return Promise.all([jailReady, inputReady, formatReady]).then(() => {
        var debugCode = ui.genCodeDebugViewer.getValue();
        return jailrun(`module = { exports: true }; \n ${debugCode} \n`);
    }).then(() => {
        console.log('recompiled');

        jail.remote.reparse((exportedRoot: IExportedValue, error) => {
            //console.log('reparse exportedRoot', exportedRoot);

            itree = new IntervalTree(dataProvider.length / 2);

            handleError(error);

            parsedToTree(jsTree, exportedRoot, handleError).on('select_node.jstree', function (e, selectNodeArgs) {
                var node = <JSTreeNode>selectNodeArgs.node;
                //console.log('node', node);
                var exp = node.data.exported;
                if (exp && !autoExpandNodes && exp.start < exp.end) {
                    selectedInTree = true;
                    ui.hexViewer.setSelection(exp.start, exp.end - 1);
                    selectedInTree = false;
                }
            });
        });
    });
}

var lastKsyContent;
function loadFsItem(fsItem: IFsItem, refreshGui: boolean = true) {
    if (!fsItem || fsItem.type !== 'file')
        return Promise.resolve();

    return fss[fsItem.fsType].get(fsItem.fn).then(content => {
        if (isKsyFile(fsItem.fn)) {
            localforage.setItem('ksyFsItem', fsItem);
            lastKsyContent = content;
            ui.ksyEditor.setValue(content, -1);
            return Promise.resolve();
        }
        else {
            localforage.setItem('inputFsItem', fsItem);

            dataProvider = {
                length: content.byteLength,
                get(offset, length) { return new Uint8Array(content, offset, length) },
            };

            ui.hexViewer.setDataProvider(dataProvider);
            return jailrun('inputBuffer = args; void(0)', content).then(() => refreshGui ? reparse() : Promise.resolve());
        }
    });
}

function openNodesIfCan() {
    if (!autoExpandNodes) return;
    var jsTree = (<JQuery>ui.parsedDataTreeCont.getElement()).jstree(true);
    autoExpandNodes.forEach((pathStr, i) => {
        var node = jsTree.get_node(pathStr);
        if (!node) return false;

        if (i === autoExpandNodes.length - 1) {
            jsTree.activate_node(node, null);
            $(`#${node.id}`).get(0).scrollIntoView();
            autoExpandNodes = null;
        }
        else
            jsTree.open_node(node);
    });
}

$(() => {
    ui.infoPanel.getElement().show();

    ui.hexViewer.onSelectionChanged = () => {
        var hasSelection = ui.hexViewer.selectionStart !== -1;
        ui.infoPanel.getElement().text(hasSelection ? `selection: 0x${ui.hexViewer.selectionStart.toString(16)} - 0x${ui.hexViewer.selectionEnd.toString(16)}` : 'no selection')
        if (itree && hasSelection && !selectedInTree) {
            var intervals = itree.search(ui.hexViewer.mouseDownOffset);
            if (intervals.length > 0) {
                console.log('selected node', intervals[0].id);

                var path = intervals[0].id.split('/');
                var pathStr = 'inputField';
                autoExpandNodes = [];
                for (var i = 0; i < path.length; i++) {
                    pathStr += '_' + path[i];
                    autoExpandNodes.push(pathStr);
                }

                openNodesIfCan();
            }
        }
    };

    ui.hexViewer.onSelectionChanged();

    ui.genCodeDebugViewer.commands.addCommand({
        name: "compile",
        bindKey: { win: "Ctrl-Enter", mac: "Command-Enter" },
        exec: function (editor) { reparse(); }
    });

    initFileDrop('fileDrop', files => {
        Promise.all(files.map((file, i) => {
            return (isKsyFile(file.file.name) ? file.read('text') : file.read('arrayBuffer')).then(content => {
                return localFs.put(file.file.name, content).then(fsItem => {
                    return files.length == 1 ? loadFsItem(fsItem) : Promise.resolve();
                });
            });
        })).then(refreshFsNodes);
    });

    fileTreeCont.bind("dblclick.jstree", function (event) {
        loadFsItem(<IFsItem>ui.fileTree.get_node(event.target).data);
    });

    function loadCachedFsItem(cacheKey: string, defSample: string) {
        return localforage.getItem(cacheKey).then((fsItem: IFsItem) => loadFsItem(fsItem || <IFsItem>{ fsType: 'kaitai', fn: `${defSample}`, type: 'file' }, false));
    }

    var inputReady = loadCachedFsItem('inputFsItem', 'samples/sample1.zip');
    var formatReady = loadCachedFsItem('ksyFsItem', 'formats/archive/zip.ksy');

    var editDelay = new Delayed(500);
    ui.ksyEditor.on('change', () => editDelay.do(() => recompile()));
})