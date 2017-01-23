/// <reference path="../lib/ts-types/goldenlayout.d.ts" />
// /// <reference path="../node_modules/typescript/lib/lib.es6.d.ts" />

import ConverterPanel from "./components/ConverterPanel";
declare var YAML: any, io: any, jailed: any, IntervalTree: any, localforage: LocalForage, bigInt: any, kaitaiIde: any;

var baseUrl = location.href.split('?')[0].split('/').slice(0, -1).join('/') + '/';

$.jstree.defaults.core.force_text = true;

var dataProvider: IDataProvider;
var itree;
var ksySchema: KsySchema.IKsyFile;
var ksyTypes: IKsyTypes;

interface IKsyTypes { [name: string]: KsySchema.IType };

function compile(srcYaml: string, kslang: string, debug: true | false | 'both') {
    var compilerSchema;
    try {
        kaitaiIde.ksySchema = ksySchema = <KsySchema.IKsyFile>YAML.parse(srcYaml);

        function collectKsyTypes(schema: KsySchema.IKsyFile): IKsyTypes {
            var types: IKsyTypes = {};

            function ksyNameToJsName(ksyName, isProp) { return ksyName.split('_').map((x,i) => i == 0 && isProp ? x : x.ucFirst()).join(''); }

            function collectTypes(parent: KsySchema.IType) {
                if (parent.types) {
                    parent.typesByJsName = {};
                    Object.keys(parent.types).forEach(name => {
                        var jsName = ksyNameToJsName(name, false);
                        parent.typesByJsName[jsName] = types[jsName] = parent.types[name];
                        collectTypes(parent.types[name]);
                    });
                }

                if (parent.instances) {
                    parent.instancesByJsName = {};
                    Object.keys(parent.instances).forEach(name => {
                        var jsName = ksyNameToJsName(name, true);
                        parent.instancesByJsName[jsName] = parent.instances[name];
                    });
                }
            }

            collectTypes(schema);
            types[ksyNameToJsName(schema.meta.id, false)] = schema;

            return types;
        }

        kaitaiIde.ksyTypes = ksyTypes = collectKsyTypes(ksySchema);

        compilerSchema = <KsySchema.IKsyFile>YAML.parse(srcYaml); // we have to modify before sending into the compiler so we need a copy

        function removeWebIdeKeys(obj: any) {
            Object.keys(obj).filter(x => x.startsWith("-webide-")).forEach(keyName => delete obj[keyName]);
        }

        function filterOutExtensions(type: KsySchema.IType) {
            removeWebIdeKeys(type);

            if (type.types)
                Object.keys(type.types).forEach(typeName => filterOutExtensions(type.types[typeName]));

            if (type.instances)
                Object.keys(type.instances).forEach(instanceName => removeWebIdeKeys(type.instances[instanceName]));
        }

        filterOutExtensions(compilerSchema);
    } catch (parseErr) {
        showError("YAML parsing error: ", parseErr);
        return;
    }

    //console.log('ksySchema', ksySchema);

    try {
        if (kslang === 'json')
            return [JSON.stringify(ksySchema, null, 4)];
        else {
            var ks = io.kaitai.struct.MainJs();
            var rRelease = (debug === false || debug === 'both') ? ks.compile(kslang, compilerSchema, false) : null;
            var rDebug = (debug === true || debug === 'both') ? ks.compile(kslang, compilerSchema, true) : null;
            return rRelease && rDebug ? { debug: rDebug, release: rRelease } : rRelease ? rRelease : rDebug;
        }
    } catch (compileErr) {
        console.log(compileErr.s$1);
        showError("KS compilation error: ", compileErr);
        return;
    }
}

var ksyFsItemName = isPracticeMode ? `ksyFsItem_practice_${practiceChallName}` : 'ksyFsItem';

function recompile() {
    return localforage.getItem<IFsItem>(ksyFsItemName).then(ksyFsItem => {
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
            if (!compiled) return;
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
        return jailrun(`module = { exports: true }; ksyTypes = args.ksyTypes; \n ${debugCode} \n`, { ksyTypes });
    }).then(() => {
        //console.log('recompiled');

        jail.remote.reparse((exportedRoot: IExportedValue, error) => {
            //console.log('reparse exportedRoot', exportedRoot);

            itree = new IntervalTree(dataProvider.length / 2);

            handleError(error);

            kaitaiIde.root = exportedRoot;

            ui.parsedDataTree = parsedToTree(jsTree, exportedRoot, ksyTypes, e => handleError(error || e), () => ui.hexViewer.onSelectionChanged());
            ui.parsedDataTree.on('select_node.jstree', function (e, selectNodeArgs) {
                var node = <ParsedTreeNode>selectNodeArgs.node;
                //console.log('node', node);
                var exp = ui.parsedDataTree.getNodeData(node).exported;

                if (exp && exp.path)
                    $("#parsedPath").text(exp.path.join('/'));

                if (!blockRecursive && exp && exp.start < exp.end) {
                    selectedInTree = true;
                    //console.log('setSelection', exp.ioOffset, exp.start);
                    ui.hexViewer.setSelection(exp.ioOffset + exp.start, exp.ioOffset + exp.end - 1);
                    selectedInTree = false;
                }
            });

            if (isPracticeMode)
                practiceExportedChanged(exportedRoot);
        }, isPracticeMode || $("#disableLazyParsing").is(':checked'));
    });
}

var lastKsyContent, inputContent: ArrayBuffer, inputFsItem: IFsItem;
function loadFsItem(fsItem: IFsItem, refreshGui: boolean = true): Promise<any> {
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
                get(offset, length) { return new Uint8Array(content, offset, length) },
            };

            ui.hexViewer.setDataProvider(dataProvider);
            return jailrun('inputBuffer = args; void(0)', content).then(() => refreshGui ? reparse().then(() => ui.hexViewer.resize()) : Promise.resolve());
        }
    });
}

localStorage.setItem('lastVersion', kaitaiIde.version);

if (isPracticeMode)
    $.getScript('js/app.practiceMode.js');

$(() => {
    $('#webIdeVersion').text(kaitaiIde.version);
    $('#compilerVersion').text(io.kaitai.struct.MainJs().version + " (" + io.kaitai.struct.MainJs().buildDate + ")");

    $('#welcomeDoNotShowAgain').click(() => localStorage.setItem('doNotShowWelcome', 'true'));
    if (localStorage.getItem('doNotShowWelcome') !== 'true')
        (<any>$('#welcomeModal')).modal();
    $('#aboutWebIde').on('click', () => (<any>$('#welcomeModal')).modal());

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
                ui.parsedDataTree.activatePath(JSON.parse(intervals[0].id).path, () => blockRecursive = false);
            }
        }

        new ConverterPanel(ui.converterPanel).refresh(dataProvider, start);
    };

    refreshSelectionInput();

    ui.genCodeDebugViewer.commands.addCommand({
        name: "compile",
        bindKey: { win: "Ctrl-Enter", mac: "Command-Enter" },
        exec: function (editor) { reparse(); }
    });

    if (!isPracticeMode)
        initFileDrop('fileDrop', addNewFiles);

    function loadCachedFsItem(cacheKey: string, defFsType: string, defSample: string) {
        return localforage.getItem(cacheKey).then((fsItem: IFsItem) => loadFsItem(fsItem || <IFsItem>{ fsType: defFsType, fn: defSample, type: 'file' }, false));
    }

    var formatReady, inputReady;
    if (isPracticeMode) {
        inputReady = loadFsItem(<IFsItem>{ fsType: 'kaitai', fn: practiceChall.inputFn, type: 'file' });
        var startKsyFn = `practice_${practiceChallName}.ksy`;
        staticFs.put(startKsyFn, practiceChall.starterKsy.trim());
        formatReady = loadCachedFsItem(ksyFsItemName, 'static', startKsyFn);
    } else {
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

    kaitaiIde.exportToJson = (useHex: boolean = false) => {
        var indentLen = 2;
        var result = "";

        function expToNative(value: IExportedValue, padLvl: number = 0) {
            var pad = " ".repeat((padLvl + 0) * indentLen);
            var childPad = " ".repeat((padLvl + 1) * indentLen);

            var isArray = value.type === ObjectType.Array;

            if (value.type === ObjectType.Object || isArray) {
                result += isArray ? "[" : "{";

                var keys: any[] = isArray ? value.arrayItems : Object.keys(value.object.fields);
                if (keys.length > 0) {
                    result += `\n${childPad}`;
                    keys.forEach((arrItem, i) => {
                        result += (isArray ? "" : `"${arrItem}": `);
                        expToNative(isArray ? arrItem : value.object.fields[arrItem], padLvl + 1);
                        var lineCont = isArray && arrItem.type === ObjectType.Primitive && typeof arrItem.primitiveValue !== "string" && i % 16 !== 15;
                        var last = i === keys.length - 1;
                        result += last ? "\n" : "," + (lineCont ? " " : `\n${childPad}`);
                    });
                    result += `${pad}`;
                }
                result += isArray ? "]" : "}";
            } else if (value.type === ObjectType.TypedArray) {
                if (value.bytes.length <= 64)
                    result += "[" + Array.from(value.bytes).join(', ') + "]";
                else {
                    result += `{ "$start": ${value.ioOffset + value.start}, "$end": ${value.ioOffset + value.end - 1} }`;
                }
            } else if (value.type === ObjectType.Primitive) {
                if (value.enumStringValue)
                    result += `{ "name": ${JSON.stringify(value.enumStringValue)}, "value": ${value.primitiveValue} }`;
                else if (typeof value.primitiveValue === "number")
                    result += useHex ? `0x${value.primitiveValue.toString(16)}` : `${value.primitiveValue}`;
                else
                    result += `${JSON.stringify(value.primitiveValue)}`;
            }
        }

        function getParsedIntervals(root: IExportedValue) {
            var objects = collectAllObjects(root).slice(1);
            //console.log('objects', objects);

            var allInts = objects.map(x => ({ start: x.ioOffset + x.start, end: x.ioOffset + x.end - 1 })).filter(x => !isNaN(x.start) && !isNaN(x.end)).sort((a, b) => a.start - b.start);
            //console.log('allInts', allInts);

            var intervals = [];
            intervals.push(allInts[0]);

            for (var i = 1; i < allInts.length; i++) {
                if (intervals.last().end < allInts[i].start)
                    intervals.push(allInts[i]);
                else
                    intervals.last().end = Math.max(intervals.last().end, allInts[i].end);
            }

            return intervals;
        }

        jail.remote.reparse((exportedRoot: IExportedValue, error) => {
            console.log('exported', exportedRoot);
            expToNative(exportedRoot);
            addEditorTab('json export', result, 'json');
            //console.log('parsed intervals', getParsedIntervals(exportedRoot));
        }, true);
    };

    $("#exportToJson, #exportToJsonHex").on('click', e => kaitaiIde.exportToJson(e.target.id === "exportToJsonHex"));

    $("#disableLazyParsing").on('click', reparse);

    interface IInterval {
        start: number;
        end: number;
    }

    class IntervalViewer {
        currentIdx: number;
        intervals: IInterval[];
        htmlCurr: JQuery;
        htmlTotal: JQuery;
        htmlPrev: JQuery;
        htmlNext: JQuery;

        constructor(public htmlIdPrefix: string) {
            ["Curr", "Total", "Prev", "Next"].forEach(control => this[`html${control}`] = $(`#${htmlIdPrefix}${control}`));
            this.htmlNext.on('click', () => this.move(+1));
            this.htmlPrev.on('click', () => this.move(-1));
        }

        move(direction: number) {
            if (this.intervals.length === 0) return;
            this.currentIdx = (this.intervals.length + this.currentIdx + direction) % this.intervals.length;
            var curr = this.intervals[this.currentIdx];
            ui.hexViewer.setSelection(curr.start, curr.end);
            this.htmlCurr.text(this.currentIdx + 1);
        }

        setIntervals(intervals: IInterval[]) {
            this.intervals = intervals;
            this.currentIdx = -1;

            this.htmlCurr.text("-");
            this.htmlTotal.text(this.intervals.length);
        }
    }

    ui.unparsedIntSel = new IntervalViewer("unparsed");
    ui.bytesIntSel = new IntervalViewer("bytes");
});