/// <reference path="../lib/ts-types/goldenlayout.d.ts" />
/// <reference path="../node_modules/typescript/lib/lib.es6.d.ts" />

declare var YAML: any, io: any, jailed: any, IntervalTree: any, localforage: LocalForage, bigInt: any;

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
        });
    });
}

var formatReady, selectedInTree = false, blockRecursive = false;
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
            if (error) return;

            ui.parsedDataTree = parsedToTree(jsTree, exportedRoot, handleError, () => {
                ui.hexViewer.onSelectionChanged();
            });
            ui.parsedDataTree.on('select_node.jstree', function (e, selectNodeArgs) {
                var node = <ParsedTreeNode>selectNodeArgs.node;
                //console.log('node', node);
                var exp = node.data.exported;
                if (!blockRecursive && exp && exp.start < exp.end) {
                    selectedInTree = true;
                    ui.hexViewer.setSelection(exp.start, exp.end - 1);
                    selectedInTree = false;
                }
            });
        });
    });
}

var lastKsyContent, inputContent: ArrayBuffer, inputFsItem: IFsItem;
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
            inputFsItem = fsItem;
            inputContent = content;

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

function addNewFiles(files: IFileProcessItem[]) {
    return Promise.all(files.map(file => {
        return (isKsyFile(file.file.name) ? file.read('text') : file.read('arrayBuffer')).then(content => {
            return localFs.put(file.file.name, content).then(fsItem => {
                return files.length == 1 ? loadFsItem(fsItem) : Promise.resolve();
            });
        });
    })).then(refreshFsNodes);
}

$(() => {
    ui.hexViewer.onSelectionChanged = () => {
        console.log('setSelection', ui.hexViewer.selectionStart, ui.hexViewer.selectionEnd);
        localStorage.setItem('selection', JSON.stringify({ start: ui.hexViewer.selectionStart, end: ui.hexViewer.selectionEnd }));

        var start = ui.hexViewer.selectionStart, end = ui.hexViewer.selectionEnd;
        var hasSelection = start !== -1;
        $('#infoPanel .selectionText').text(hasSelection ? `selection:` : 'no selection');

        refreshSelectionInput();

        if (itree && hasSelection && !selectedInTree) {
            var intervals = itree.search(ui.hexViewer.mouseDownOffset || start);
            if (intervals.length > 0) {
                console.log('selected node', intervals[0].id);
                blockRecursive = true;
                ui.parsedDataTree.activatePath(intervals[0].id, () => blockRecursive = false);
            }
        }

        if (dataProvider && hasSelection) {
            var data = dataProvider.get(start, Math.min(dataProvider.length - start, 64)).slice(0);

            function numConv(len, signed, bigEndian) {
                if (len > data.length) return '';

                var arr = data.subarray(0, len);

                var num = bigInt(0);
                if (bigEndian)
                    for (var i = 0; i < arr.length; i++)
                        num = num.multiply(256).add(arr[i]);
                else
                    for (var i = arr.length - 1; i >= 0; i--)
                        num = num.multiply(256).add(arr[i]);

                if (signed) {
                    var maxVal = bigInt(256).pow(len);
                    if (num.greaterOrEquals(maxVal.divide(2)))
                        num = maxVal.minus(num).negate();
                }

                //console.log('numConv', arr, len, signed ? 'signed' : 'unsigned', bigEndian ? 'big-endian' : 'little-endian', num, typeof num);
                return num;
            }

            [1, 2, 4, 8].forEach(len => [false, true].forEach(signed => [false, true].forEach(bigEndian =>
                $(`.i${len * 8}${len == 1 ? '' : bigEndian ? 'be' : 'le'} .${signed ? 'signed' : 'unsigned'}`).text(numConv(len, signed, bigEndian).toString()))));

            var u32le = numConv(4, false, false);
            var unixtsDate = new Date(u32le * 1000);

            $(`.float .val`).text(data.length >= 4 ? new Float32Array(data.buffer.slice(0, 4))[0] : '');
            $(`.double .val`).text(data.length >= 8 ? new Float64Array(data.buffer.slice(0, 8))[0] : '');
            $(`.unixts .val`).text(unixtsDate.format('Y-m-d H:i:s'));

            function strDecode(enc) {
                var str = new TextDecoder(enc).decode(data);
                for (var i = 0; i < str.length; i++)
                    if (str[i] === '\0')
                        return str.substring(0, i);
                return str + "...";
            }

            try {
                $(`.ascii   .val div`).text(strDecode('ascii'));
                $(`.utf8    .val div`).text(strDecode('utf-8'));
                $(`.utf16le .val div`).text(strDecode('utf-16le'));
                $(`.utf16be .val div`).text(strDecode('utf-16be'));
            } catch (e) { }
        }
        else
            $('#converterPanel .val').text('');
    };

    refreshSelectionInput();

    ui.genCodeDebugViewer.commands.addCommand({
        name: "compile",
        bindKey: { win: "Ctrl-Enter", mac: "Command-Enter" },
        exec: function (editor) { reparse(); }
    });

    initFileDrop('fileDrop', addNewFiles);

    fileTreeCont.bind("dblclick.jstree", function (event) {
        loadFsItem(<IFsItem>ui.fileTree.get_node(event.target).data);
    });

    function loadCachedFsItem(cacheKey: string, defSample: string) {
        return localforage.getItem(cacheKey).then((fsItem: IFsItem) => loadFsItem(fsItem || <IFsItem>{ fsType: 'kaitai', fn: `${defSample}`, type: 'file' }, false));
    }

    var inputReady = loadCachedFsItem('inputFsItem', 'samples/sample1.zip');
    var formatReady = loadCachedFsItem('ksyFsItem', 'formats/archive/zip.ksy');

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
})