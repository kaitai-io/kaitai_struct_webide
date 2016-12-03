/// <reference path="../lib/ts-types/goldenlayout.d.ts" />
/// <reference path="../node_modules/typescript/lib/lib.es6.d.ts" />
var baseUrl = location.href.split('?')[0].split('/').slice(0, -1).join('/') + '/';
var dataProvider;
var itree;
function compile(srcYaml, kslang, debug) {
    var src;
    try {
        src = YAML.parse(srcYaml);
    }
    catch (parseErr) {
        showError("YAML parsing error: ", parseErr);
        return;
    }
    try {
        var ks = io.kaitai.struct.MainJs();
        var rRelease = (debug === false || debug === 'both') ? ks.compile(kslang, src, false) : null;
        var rDebug = (debug === true || debug === 'both') ? ks.compile(kslang, src, true) : null;
        return rRelease && rDebug ? { debug: rDebug, release: rRelease } : rRelease ? rRelease : rDebug;
    }
    catch (compileErr) {
        console.log(compileErr.s$1);
        showError("KS compilation error: ", compileErr);
        return;
    }
}
function isKsyFile(fn) { return fn.toLowerCase().endsWith('.ksy'); }
var ksyFsItemName = isPracticeMode ? `ksyFsItem_practice_${practiceChallName}` : 'ksyFsItem';
function recompile() {
    return localforage.getItem(ksyFsItemName).then(ksyFsItem => {
        var srcYaml = ui.ksyEditor.getValue();
        var changed = lastKsyContent !== srcYaml;
        var copyPromise = Promise.resolve();
        if (changed && (ksyFsItem.fsType === 'kaitai' || ksyFsItem.fsType === 'static')) {
            var newFn = ksyFsItem.fn.split('/').last().replace('.ksy', '_modified.ksy');
            copyPromise = fss.local.put(newFn, srcYaml).then(fsItem => {
                ksyFsItem = fsItem;
                return localforage.setItem(ksyFsItemName, fsItem);
            }).then(() => addKsyFile('localStorage', newFn, ksyFsItem));
        }
        return copyPromise.then(() => changed ? fss[ksyFsItem.fsType].put(ksyFsItem.fn, srcYaml) : Promise.resolve()).then(() => {
            var compiled = compile(srcYaml, 'javascript', 'both');
            ui.genCodeViewer.setValue(compiled.release[0], -1);
            ui.genCodeDebugViewer.setValue(compiled.debug[0], -1);
            return reparse();
        });
    });
}
var formatReady, selectedInTree = false, blockRecursive = false;
function reparse() {
    var jsTree = ui.parsedDataTreeCont.getElement();
    jsTree.jstree("destroy");
    return Promise.all([jailReady, inputReady, formatReady]).then(() => {
        var debugCode = ui.genCodeDebugViewer.getValue();
        return jailrun(`module = { exports: true }; \n ${debugCode} \n`);
    }).then(() => {
        //console.log('recompiled');
        jail.remote.reparse((exportedRoot, error) => {
            //console.log('reparse exportedRoot', exportedRoot);
            itree = new IntervalTree(dataProvider.length / 2);
            handleError(error);
            ui.parsedDataTree = parsedToTree(jsTree, exportedRoot, e => handleError(error || e), () => ui.hexViewer.onSelectionChanged());
            ui.parsedDataTree.on('select_node.jstree', function (e, selectNodeArgs) {
                var node = selectNodeArgs.node;
                //console.log('node', node);
                var exp = node.data.exported;
                if (!blockRecursive && exp && exp.start < exp.end) {
                    selectedInTree = true;
                    ui.hexViewer.setSelection(exp.start, exp.end - 1);
                    selectedInTree = false;
                }
            });
            if (isPracticeMode)
                practiceExportedChanged(exportedRoot);
        }, isPracticeMode);
    });
}
var lastKsyContent, inputContent, inputFsItem;
function loadFsItem(fsItem, refreshGui = true) {
    if (!fsItem || fsItem.type !== 'file')
        return Promise.resolve();
    return fss[fsItem.fsType].get(fsItem.fn).then(content => {
        if (isKsyFile(fsItem.fn)) {
            localforage.setItem(ksyFsItemName, fsItem);
            lastKsyContent = content;
            ui.ksyEditor.setValue(content, -1);
            return Promise.resolve();
        }
        else {
            inputFsItem = fsItem;
            inputContent = content;
            if (!isPracticeMode)
                localforage.setItem('inputFsItem', fsItem);
            dataProvider = {
                length: content.byteLength,
                get(offset, length) { return new Uint8Array(content, offset, length); },
            };
            ui.hexViewer.setDataProvider(dataProvider);
            return jailrun('inputBuffer = args; void(0)', content).then(() => refreshGui ? reparse() : Promise.resolve());
        }
    });
}
function addNewFiles(files) {
    return Promise.all(files.map(file => {
        return (isKsyFile(file.file.name) ? file.read('text') : file.read('arrayBuffer')).then(content => {
            return localFs.put(file.file.name, content).then(fsItem => {
                return files.length == 1 ? loadFsItem(fsItem) : Promise.resolve();
            });
        });
    })).then(refreshFsNodes);
}
localStorage.setItem('lastVersion', kaitaiIde.version);
if (isPracticeMode)
    $.getScript('js/app.practiceMode.js');
$(() => {
    $('#welcomeDoNotShowAgain').click(() => localStorage.setItem('doNotShowWelcome', 'true'));
    if (localStorage.getItem('doNotShowWelcome') !== 'true')
        $('#welcomeModal').modal();
    $('#aboutWebIde').on('click', () => $('#welcomeModal').modal());
    ui.hexViewer.onSelectionChanged = () => {
        //console.log('setSelection', ui.hexViewer.selectionStart, ui.hexViewer.selectionEnd);
        localStorage.setItem('selection', JSON.stringify({ start: ui.hexViewer.selectionStart, end: ui.hexViewer.selectionEnd }));
        var start = ui.hexViewer.selectionStart, end = ui.hexViewer.selectionEnd;
        var hasSelection = start !== -1;
        $('#infoPanel .selectionText').text(hasSelection ? `selection:` : 'no selection');
        refreshSelectionInput();
        if (itree && hasSelection && !selectedInTree) {
            var intervals = itree.search(ui.hexViewer.mouseDownOffset || start);
            if (intervals.length > 0) {
                //console.log('selected node', intervals[0].id);
                blockRecursive = true;
                ui.parsedDataTree.activatePath(intervals[0].id, () => blockRecursive = false);
            }
        }
        refreshConverterPanel(ui.converterPanel, dataProvider, start);
    };
    refreshSelectionInput();
    ui.genCodeDebugViewer.commands.addCommand({
        name: "compile",
        bindKey: { win: "Ctrl-Enter", mac: "Command-Enter" },
        exec: function (editor) { reparse(); }
    });
    if (!isPracticeMode)
        initFileDrop('fileDrop', addNewFiles);
    function loadCachedFsItem(cacheKey, defFsType, defSample) {
        return localforage.getItem(cacheKey).then((fsItem) => loadFsItem(fsItem || { fsType: defFsType, fn: defSample, type: 'file' }, false));
    }
    var formatReady, inputReady;
    if (isPracticeMode) {
        inputReady = loadFsItem({ fsType: 'kaitai', fn: practiceChall.inputFn, type: 'file' });
        var startKsyFn = `practice_${practiceChallName}.ksy`;
        staticFs.put(startKsyFn, practiceChall.starterKsy.trim());
        formatReady = loadCachedFsItem(ksyFsItemName, 'static', startKsyFn);
    }
    else {
        inputReady = loadCachedFsItem('inputFsItem', 'kaitai', 'samples/sample1.zip');
        formatReady = loadCachedFsItem(ksyFsItemName, 'kaitai', 'formats/archive/zip.ksy');
    }
    inputReady.then(() => {
        var storedSelection = JSON.parse(localStorage.getItem('selection'));
        if (storedSelection)
            ui.hexViewer.setSelection(storedSelection.start, storedSelection.end);
    });
    var editDelay = new Delayed(500);
    ui.ksyEditor.on('change', () => editDelay.do(() => recompile()));
    var inputContextMenu = $('#inputContextMenu');
    var downloadInput = $('#inputContextMenu .downloadItem');
    $("#hexViewer").on('contextmenu', e => {
        downloadInput.toggleClass('disabled', ui.hexViewer.selectionStart === -1);
        inputContextMenu.css({ display: "block", left: e.pageX, top: e.pageY });
        return false;
    });
    function ctxAction(obj, callback) {
        obj.find('a').on('click', e => {
            if (!obj.hasClass('disabled')) {
                inputContextMenu.hide();
                callback(e);
            }
        });
    }
    $(document).on('mouseup', e => {
        if ($(e.target).parents('.dropdown-menu').length === 0)
            $('.dropdown').hide();
    });
    ctxAction(downloadInput, e => {
        var start = ui.hexViewer.selectionStart, end = ui.hexViewer.selectionEnd;
        //var fnParts = /^(.*?)(\.[^.]+)?$/.exec(inputFsItem.fn.split('/').last());
        //var newFn = `${fnParts[1]}_0x${start.toString(16)}-0x${end.toString(16)}${fnParts[2] || ""}`;
        var newFn = `${inputFsItem.fn.split('/').last()}_0x${start.toString(16)}-0x${end.toString(16)}.bin`;
        saveFile(new Uint8Array(inputContent, start, end - start + 1), newFn);
    });
});
//# sourceMappingURL=app.js.map