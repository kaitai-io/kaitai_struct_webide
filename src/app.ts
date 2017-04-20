/// <reference path="../lib/ts-types/goldenlayout.d.ts" />

import { ui, addEditorTab, getLayoutNodeById } from "./app.layout";
import { showError, handleError } from "./app.errors";
import { IFsItem, fss, addKsyFile, staticFs, refreshFsNodes, localFs } from "./app.files";
import { refreshSelectionInput } from "./app.selectionInput";
import { ParsedTreeHandler, ParsedTreeNode } from "./parsedToTree";
import { workerCall, workerEval } from "./app.worker";
import { IDataProvider } from "./HexViewer";
import { refreshConverterPanel } from "./app.converterPanel";
import * as localforage from "localforage";
import { initFileDrop } from "./FileDrop";
import {performanceHelper} from "./utils/PerformanceHelper";
declare var YAML: any, io: any, IntervalTree: any, bigInt: any, kaitaiIde: any, ga: any;

export var baseUrl = location.href.split('?')[0].split('/').slice(0, -1).join('/') + '/';

$.jstree.defaults.core.force_text = true;


interface IInterval {
    start: number;
    end: number;
}

export class IntervalViewer {
    currentIdx: number;
    intervals: IInterval[];
    htmlCurr: JQuery;
    htmlTotal: JQuery;
    htmlPrev: JQuery;
    htmlNext: JQuery;

    constructor(public htmlIdPrefix: string) {
        ["Curr", "Total", "Prev", "Next"].forEach(control => (<any>this)[`html${control}`] = $(`#${htmlIdPrefix}${control}`));
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

export var dataProvider: IDataProvider;
var ksySchema: KsySchema.IKsyFile;
export var ksyTypes: IKsyTypes;

export interface IKsyTypes { [name: string]: KsySchema.IType };

class JsImporter {
    importYaml(name: string, mode: string){
        return new Promise(function (resolve, reject) {
            console.log(`import yaml: ${name}, mode: ${mode}`);

            return fss.kaitai.get(`formats/${name}.ksy`).then(ksyContent => {
                var ksyModel = <KsySchema.IKsyFile>YAML.parse(<string>ksyContent);
                return resolve(ksyModel);
            });
        });
    }
}

var jsImporter = new JsImporter();

export function compile(srcYaml: string, kslang: string, debug: true | false | 'both'): Promise<any> {
    var perfYamlParse = performanceHelper.measureAction("YAML parsing");

    var compilerSchema;
    try {
        kaitaiIde.ksySchema = ksySchema = <KsySchema.IKsyFile>YAML.parse(srcYaml);

        function collectKsyTypes(schema: KsySchema.IKsyFile): IKsyTypes {
            var types: IKsyTypes = {};

            function ksyNameToJsName(ksyName: string, isProp: boolean) { return ksyName.split('_').map((x,i) => i === 0 && isProp ? x : x.ucFirst()).join(''); }

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
        ga('compile', 'error', `yaml: ${parseErr}`);
        showError("YAML parsing error: ", parseErr);
        return;
    }

    perfYamlParse.done();

    //console.log('ksySchema', ksySchema);

    if (kslang === 'json')
        return Promise.resolve();
    else {
        var perfCompile = performanceHelper.measureAction("Compilation");

        var ks = io.kaitai.struct.MainJs();
        var rReleasePromise = (debug === false || debug === 'both') ? ks.compile(kslang, compilerSchema, jsImporter, false) : Promise.resolve(null);
        var rDebugPromise = (debug === true || debug === 'both') ? ks.compile(kslang, compilerSchema, jsImporter, true) : Promise.resolve(null);
        //console.log('rReleasePromise', rReleasePromise, 'rDebugPromise', rDebugPromise);
        return perfCompile.done(Promise.all([rReleasePromise, rDebugPromise]))
            .then(([rRelease, rDebug]) => {
                ga('compile', 'success');
                //console.log('rRelease', rRelease, 'rDebug', rDebug);
                return rRelease && rDebug ? { debug: rDebug, release: rRelease } : rRelease ? rRelease : rDebug;
            })
            .catch(compileErr => {
                ga('compile', 'error', `kaitai: ${compileErr}`);
                showError("KS compilation error: ", compileErr);
                return;
            });
    }
}

function isKsyFile(fn: string) { return fn.toLowerCase().endsWith('.ksy'); }

var ksyFsItemName = 'ksyFsItem';

function recompile() {
    return localforage.getItem<IFsItem>(ksyFsItemName).then(ksyFsItem => {
        var srcYaml = ui.ksyEditor.getValue();
        var changed = lastKsyContent !== srcYaml;

        var copyPromise = <Promise<any>>Promise.resolve();
        if (changed && (ksyFsItem.fsType === 'kaitai' || ksyFsItem.fsType === 'static'))
            copyPromise = addKsyFile('localStorage', ksyFsItem.fn.replace('.ksy', '_modified.ksy'), srcYaml).then(fsItem => localforage.setItem(ksyFsItemName, fsItem));

        return copyPromise.then(() => changed ? fss[ksyFsItem.fsType].put(ksyFsItem.fn, srcYaml) : Promise.resolve()).then(() => {
            return compile(srcYaml, 'javascript', 'both').then(compiled => {
                if (!compiled) return;
                var fileNames = Object.keys(compiled.release);

                console.log('ksyFsItem', ksyFsItem);
                ui.genCodeViewer.setValue(fileNames.map(x => compiled.release[x]).join(''), -1);
                ui.genCodeDebugViewer.setValue(fileNames.map(x => compiled.debug[x]).join(''), -1);
                return reparse();
            });
        });
    });
}

var selectedInTree = false, blockRecursive = false;
function reparse() {
    handleError(null);
    return performanceHelper.measureAction("Parse initialization", Promise.all([inputReady, formatReady]).then(() => {
        var debugCode = ui.genCodeDebugViewer.getValue();
        var jsClassName = kaitaiIde.ksySchema.meta.id.split('_').map((x: string) => x.ucFirst()).join('');
        return workerCall(<IWorkerMessage>{ type: 'eval', args: [`wi.ksyTypes = args.ksyTypes;\n${debugCode}\nwi.MainClass = ${jsClassName};void(0)`, { ksyTypes: ksyTypes }] });
    })).then(() => {
        //console.log('recompiled');
        performanceHelper.measureAction("Parsing", workerCall({ type: "reparse", args: [$("#disableLazyParsing").is(':checked')] })).then((exportedRoot: IExportedValue) => {
            //console.log('reparse exportedRoot', exportedRoot);
            kaitaiIde.root = exportedRoot;

            ui.parsedDataTreeHandler = new ParsedTreeHandler(<any>ui.parsedDataTreeCont.getElement(), exportedRoot, ksyTypes);
            performanceHelper.measureAction("Tree / interval handling", ui.parsedDataTreeHandler.initNodeReopenHandling()).then(() => ui.hexViewer.onSelectionChanged(), e => handleError(e));

            ui.parsedDataTreeHandler.jstree.on('select_node.jstree', function (e, selectNodeArgs) {
                var node = <ParsedTreeNode>selectNodeArgs.node;
                //console.log('node', node);
                var exp = ui.parsedDataTreeHandler.getNodeData(node).exported;

                if (exp && exp.path)
                    $("#parsedPath").text(exp.path.join('/'));

                if (!blockRecursive && exp && exp.start < exp.end) {
                    selectedInTree = true;
                    //console.log('setSelection', exp.ioOffset, exp.start);
                    ui.hexViewer.setSelection(exp.ioOffset + exp.start, exp.ioOffset + exp.end - 1);
                    selectedInTree = false;
                }
            });

        }, error => handleError(error));
    });
}

(<any>window).kt = { workerEval: workerEval };

var lastKsyContent: string, inputContent: ArrayBuffer, inputFsItem: IFsItem, lastKsyFsItem: IFsItem;
export function loadFsItem(fsItem: IFsItem, refreshGui: boolean = true): Promise<any> {
    if (!fsItem || fsItem.type !== 'file')
        return Promise.resolve();

    return fss[fsItem.fsType].get(fsItem.fn).then((content: any) => {
        if (isKsyFile(fsItem.fn)) {
            localforage.setItem(ksyFsItemName, fsItem);
            lastKsyFsItem = fsItem;
            lastKsyContent = content;
            if (ui.ksyEditor.getValue() !== content)
                ui.ksyEditor.setValue(content, -1);
            getLayoutNodeById("ksyEditor").container.setTitle(fsItem.fn);
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
            getLayoutNodeById("inputBinaryTab").setTitle(fsItem.fn);
            return workerCall({ type:'eval', args: ['wi.inputBuffer = args; void(0)', content] }).then(() => refreshGui ? reparse().then(() => ui.hexViewer.resize()) : Promise.resolve());
        }
    });
}

export function addNewFiles(files: IFileProcessItem[]) {
    return Promise.all(files.map(file => (isKsyFile(file.file.name) ? <Promise<any>>file.read('text') : file.read('arrayBuffer')).then(content => localFs.put(file.file.name, content))))
        .then(fsItems => {
            refreshFsNodes();
            return fsItems.length === 1 ? loadFsItem(fsItems[0]) : Promise.resolve(null);
        });
}

localStorage.setItem('lastVersion', kaitaiIde.version);

export var formatReady: Promise<any>, inputReady: Promise<any>;
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

        if (ui.parsedDataTreeHandler && hasSelection && !selectedInTree) {
            var intervals = ui.parsedDataTreeHandler.intervalHandler.searchRange(ui.hexViewer.mouseDownOffset || start);
            if (intervals.items.length > 0) {
                //console.log('selected node', intervals[0].id);
                blockRecursive = true;
                ui.parsedDataTreeHandler.activatePath(intervals.items[0].exp.path).then(() => blockRecursive = false);
            }
        }

        refreshConverterPanel(ui.converterPanel, dataProvider, start);
    };

    refreshSelectionInput();

    ui.genCodeDebugViewer.commands.addCommand({
        name: "compile",
        bindKey: { win: "Ctrl-Enter", mac: "Command-Enter" },
        exec: function (editor: any) { reparse(); }
    });

    initFileDrop('fileDrop', addNewFiles);

    function loadCachedFsItem(cacheKey: string, defFsType: string, defSample: string) {
        return localforage.getItem(cacheKey).then((fsItem: IFsItem) => loadFsItem(fsItem || <IFsItem>{ fsType: defFsType, fn: defSample, type: 'file' }, false));
    }

    inputReady = loadCachedFsItem('inputFsItem', 'kaitai', 'samples/sample1.zip');
    formatReady = loadCachedFsItem(ksyFsItemName, 'kaitai', 'formats/archive/zip.ksy');

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

    function ctxAction(obj: JQuery, callback: (e: JQueryEventObject) => void) {
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

    kaitaiIde.ui = ui;

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

        workerCall({ type: 'reparse', args: [true] }).then((exportedRoot: IExportedValue) => {
            console.log('exported', exportedRoot);
            expToNative(exportedRoot);
            addEditorTab('json export', result, 'json');
        }, error => handleError(error));
    };

    $("#exportToJson, #exportToJsonHex").on('click', e => kaitaiIde.exportToJson(e.target.id === "exportToJsonHex"));

    $("#disableLazyParsing").on('click', reparse);

    ui.unparsedIntSel = new IntervalViewer("unparsed");
    ui.bytesIntSel = new IntervalViewer("bytes");

    precallHook(kaitaiIde.ui.layout.constructor.__lm.controls, 'DragProxy', () => ga('layout', 'window_drag'));
    $('body').on('mousedown', '.lm_drag_handle', () => { ga('layout', 'splitter_drag'); });
});
