import * as localforage from "localforage";
import * as Vue from "vue";

import { ui, addEditorTab, getLayoutNodeById } from "./app.layout";
import { showError, handleError } from "./app.errors";
import { IFsItem, fss, addKsyFile, refreshFsNodes } from "./app.files";
import { ParsedTreeHandler, IParsedTreeNode } from "./parsedToTree";
import { workerMethods } from "./app.worker";
import { IDataProvider } from "./HexViewer";
import { initFileDrop } from "./FileDrop";
import { performanceHelper } from "./utils/PerformanceHelper";
import { IFileProcessItem, saveFile, precallHook } from "./utils";
import { Delayed } from "./utils";
import { componentLoader } from "./ui/ComponentLoader";
import { ConverterPanelModel, ConverterPanel } from "./ui/Components/ConverterPanel";
import { exportToJson } from "./ExportToJson";
import { Stepper } from "./ui/Components/Stepper";
import Component from "./ui/Component";
$.jstree.defaults.core.force_text = true;

export function ga(category: string, action: string, label?: string, value?: number) {
    console.log(`[GA Event] cat:${category} act:${action} lab:${label || ""}`);
    if (typeof window["_ga"] !== "undefined")
        window["_ga"]("send", "event", category, action, label, value);
}

interface IInterval {
    start: number;
    end: number;
}

export var dataProvider: IDataProvider;
var ksySchema: KsySchema.IKsyFile;
var ksyTypes: IKsyTypes;

class JsImporter implements io.kaitai.struct.IYamlImporter {
    importYaml(name: string, mode: string) {
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

export function compile(srcYaml: string, kslang: string, debug: true | false | "both"): Promise<any> {
    var perfYamlParse = performanceHelper.measureAction("YAML parsing");

    var compilerSchema;
    try {
        kaitaiIde.ksySchema = ksySchema = <KsySchema.IKsyFile>YAML.parse(srcYaml);

        function collectKsyTypes(schema: KsySchema.IKsyFile): IKsyTypes {
            var types: IKsyTypes = {};

            function ksyNameToJsName(ksyName: string, isProp: boolean) { return ksyName.split("_").map((x,i) => i === 0 && isProp ? x : x.ucFirst()).join(""); }

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
        ga("compile", "error", `yaml: ${parseErr}`);
        showError("YAML parsing error: ", parseErr);
        return;
    }

    perfYamlParse.done();

    //console.log("ksySchema", ksySchema);

    if (kslang === "json")
        return Promise.resolve();
    else {
        var perfCompile = performanceHelper.measureAction("Compilation");

        var ks = new io.kaitai.struct.MainJs();
        var rReleasePromise = (debug === false || debug === "both") ? ks.compile(kslang, compilerSchema, jsImporter, false) : Promise.resolve(null);
        var rDebugPromise = (debug === true || debug === "both") ? ks.compile(kslang, compilerSchema, jsImporter, true) : Promise.resolve(null);
        //console.log("rReleasePromise", rReleasePromise, "rDebugPromise", rDebugPromise);
        return perfCompile.done(Promise.all([rReleasePromise, rDebugPromise]))
            .then(([rRelease, rDebug]) => {
                ga("compile", "success");
                //console.log("rRelease", rRelease, "rDebug", rDebug);
                return rRelease && rDebug ? { debug: rDebug, release: rRelease } : rRelease ? rRelease : rDebug;
            })
            .catch(compileErr => {
                ga("compile", "error", `kaitai: ${compileErr}`);
                showError("KS compilation error: ", compileErr);
                return;
            });
    }
}

function isKsyFile(fn: string) { return fn.toLowerCase().endsWith(".ksy"); }

var ksyFsItemName = "ksyFsItem";

var lastKsyContent: string = null;
function recompile() {
    return localforage.getItem<IFsItem>(ksyFsItemName).then(ksyFsItem => {
        var srcYaml = ui.ksyEditor.getValue();
        var changed = lastKsyContent !== srcYaml;

        var copyPromise = <Promise<any>>Promise.resolve();
        if (changed && (ksyFsItem.fsType === "kaitai" || ksyFsItem.fsType === "static"))
            copyPromise = addKsyFile("localStorage", ksyFsItem.fn.replace(".ksy", "_modified.ksy"), srcYaml)
                .then(fsItem => localforage.setItem(ksyFsItemName, fsItem));

        return copyPromise.then(() => changed ? fss[ksyFsItem.fsType].put(ksyFsItem.fn, srcYaml) : Promise.resolve()).then(() => {
            return compile(srcYaml, "javascript", "both").then(compiled => {
                if (!compiled) return;
                var fileNames = Object.keys(compiled.release);

                console.log("ksyFsItem", ksyFsItem);
                ui.genCodeViewer.setValue(fileNames.map(x => compiled.release[x]).join(""), -1);
                ui.genCodeDebugViewer.setValue(fileNames.map(x => compiled.debug[x]).join(""), -1);
                return reparse();
            });
        });
    });
}

var formatReady: Promise<any> = null;
var inputReady: Promise<any> = null;
var selectedInTree = false;
var blockRecursive = false;
function reparse() {
    handleError(null);
    return performanceHelper.measureAction("Parse initialization", Promise.all([inputReady, formatReady]).then(() => {
        var debugCode = ui.genCodeDebugViewer.getValue();
        var jsClassName = kaitaiIde.ksySchema.meta.id.split("_").map((x: string) => x.ucFirst()).join("");
        return workerMethods.initCode(debugCode, jsClassName, ksyTypes);
    })).then(() => {
        //console.log("recompiled");
        performanceHelper.measureAction("Parsing", workerMethods.reparse(app.disableLazyParsing).then(exportedRoot => {
            //console.log("reparse exportedRoot", exportedRoot);
            kaitaiIde.root = exportedRoot;

            ui.parsedDataTreeHandler = new ParsedTreeHandler(ui.parsedDataTreeCont.getElement(), exportedRoot, ksyTypes);
            performanceHelper.measureAction("Tree / interval handling", ui.parsedDataTreeHandler.initNodeReopenHandling())
                .then(() => ui.hexViewer.onSelectionChanged(), e => handleError(e));

            ui.parsedDataTreeHandler.jstree.on("select_node.jstree", function (e, selectNodeArgs) {
                var node = <IParsedTreeNode>selectNodeArgs.node;
                //console.log("node", node);
                var exp = ui.parsedDataTreeHandler.getNodeData(node).exported;

                if (exp && exp.path)
                    $("#parsedPath").text(exp.path.join("/"));

                if (!blockRecursive && exp && exp.start < exp.end) {
                    selectedInTree = true;
                    //console.log("setSelection", exp.ioOffset, exp.start);
                    ui.hexViewer.setSelection(exp.ioOffset + exp.start, exp.ioOffset + exp.end - 1);
                    selectedInTree = false;
                }
            });

        }, error => handleError(error)));
    });
}

var inputContent: ArrayBuffer, inputFsItem: IFsItem, lastKsyFsItem: IFsItem;
export function loadFsItem(fsItem: IFsItem, refreshGui: boolean = true): Promise<any> {
    if (!fsItem || fsItem.type !== "file")
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
        } else {
            inputFsItem = fsItem;
            inputContent = content;

            localforage.setItem("inputFsItem", fsItem);

            dataProvider = {
                length: content.byteLength,
                get(offset, length) {
                    return new Uint8Array(content, offset, length);
                }
            };

            ui.hexViewer.setDataProvider(dataProvider);
            getLayoutNodeById("inputBinaryTab").setTitle(fsItem.fn);
            return workerMethods.setInput(content).then(() => refreshGui ? reparse().then(() => ui.hexViewer.resize()) : Promise.resolve());
        }
    });
}

export function addNewFiles(files: IFileProcessItem[]) {
    return Promise.all(files.map(file => (isKsyFile(file.file.name) ? <Promise<any>>file.read("text") : file.read("arrayBuffer"))
        .then(content => fss.local.put(file.file.name, content))))
        .then(fsItems => {
            refreshFsNodes();
            return fsItems.length === 1 ? loadFsItem(fsItems[0]) : Promise.resolve(null);
        });
}

localStorage.setItem("lastVersion", kaitaiIde.version);

var converterPanelModel = new ConverterPanelModel();

interface IInterval {
    start: number;
    end: number;
}

@Component
class App extends Vue {
    selectionStart: number = -1;
    selectionEnd: number = -1;

    unparsed: IInterval[] = [];
    byteArrays: IInterval[] = [];

    disableLazyParsing: boolean = false;

    public selectInterval(interval: IInterval) { this.selectionChanged(interval.start, interval.end); }
    public selectionChanged(start: number, end: number) { ui.hexViewer.setSelection(start, end); }
    public exportToJson(hex: boolean) { exportToJson(hex); }
    public about() { (<any>$("#welcomeModal")).modal(); }
}

export var app = new App();

$(() => {
    $("#webIdeVersion").text(kaitaiIde.version);
    $("#compilerVersion").text(new io.kaitai.struct.MainJs().version + " (" + new io.kaitai.struct.MainJs().buildDate + ")");

    $("#welcomeDoNotShowAgain").click(() => localStorage.setItem("doNotShowWelcome", "true"));
    if (localStorage.getItem("doNotShowWelcome") !== "true")
        (<any>$("#welcomeModal")).modal();

    componentLoader.load(["ConverterPanel", "Stepper", "SelectionInput"]).then(() => {
        new Vue({ el: "#converterPanel", data: { model: converterPanelModel } });
        app.$mount("#infoPanel");
        app.$watch("disableLazyParsing", () => reparse());
    });

    function refreshSelectionInput() {
        app.selectionStart = ui.hexViewer.selectionStart;
        app.selectionEnd = ui.hexViewer.selectionEnd;
    }

    ui.hexViewer.onSelectionChanged = () => {
        //console.log("setSelection", ui.hexViewer.selectionStart, ui.hexViewer.selectionEnd);
        localStorage.setItem("selection", JSON.stringify({ start: ui.hexViewer.selectionStart, end: ui.hexViewer.selectionEnd }));

        var start = ui.hexViewer.selectionStart;
        var hasSelection = start !== -1;

        refreshSelectionInput();

        if (ui.parsedDataTreeHandler && hasSelection && !selectedInTree) {
            var intervals = ui.parsedDataTreeHandler.intervalHandler.searchRange(ui.hexViewer.mouseDownOffset || start);
            if (intervals.items.length > 0) {
                //console.log("selected node", intervals[0].id);
                blockRecursive = true;
                ui.parsedDataTreeHandler.activatePath(intervals.items[0].exp.path).then(() => blockRecursive = false);
            }
        }

        converterPanelModel.update(dataProvider, start);
    };

    refreshSelectionInput();

    ui.genCodeDebugViewer.commands.addCommand({
        name: "compile",
        bindKey: { win: "Ctrl-Enter", mac: "Command-Enter" },
        exec: function (editor: any) { reparse(); }
    });

    initFileDrop("fileDrop", addNewFiles);

    function loadCachedFsItem(cacheKey: string, defFsType: string, defSample: string) {
        return localforage.getItem(cacheKey).then((fsItem: IFsItem) =>
            loadFsItem(fsItem || <IFsItem>{ fsType: defFsType, fn: defSample, type: "file" }, false));
    }

    inputReady = loadCachedFsItem("inputFsItem", "kaitai", "samples/sample1.zip");
    formatReady = loadCachedFsItem(ksyFsItemName, "kaitai", "formats/archive/zip.ksy");

    inputReady.then(() => {
        var storedSelection = JSON.parse(localStorage.getItem("selection"));
        if (storedSelection)
            ui.hexViewer.setSelection(storedSelection.start, storedSelection.end);
    });

    var editDelay = new Delayed(500);
    ui.ksyEditor.on("change", () => editDelay.do(() => recompile()));

    var inputContextMenu = $("#inputContextMenu");
    var downloadInput = $("#inputContextMenu .downloadItem");
    $("#hexViewer").on("contextmenu", e => {
        downloadInput.toggleClass("disabled", ui.hexViewer.selectionStart === -1);
        inputContextMenu.css({ display: "block", left: e.pageX, top: e.pageY });
        return false;
    });

    function ctxAction(obj: JQuery, callback: (e: JQueryEventObject) => void) {
        obj.find("a").on("click", e => {
            if (!obj.hasClass("disabled")) {
                inputContextMenu.hide();
                callback(e);
            }
        });
    }

    $(document).on("mouseup", e => {
        if ($(e.target).parents(".dropdown-menu").length === 0)
            $(".dropdown").hide();
    });

    ctxAction(downloadInput, e => {
        var start = ui.hexViewer.selectionStart, end = ui.hexViewer.selectionEnd;
        //var fnParts = /^(.*?)(\.[^.]+)?$/.exec(inputFsItem.fn.split("/").last());
        //var newFn = `${fnParts[1]}_0x${start.toString(16)}-0x${end.toString(16)}${fnParts[2] || ""}`;
        var newFn = `${inputFsItem.fn.split("/").last()}_0x${start.toString(16)}-0x${end.toString(16)}.bin`;
        saveFile(new Uint8Array(inputContent, start, end - start + 1), newFn);
    });

    kaitaiIde.ui = ui;

    precallHook(kaitaiIde.ui.layout.constructor.__lm.controls, "DragProxy", () => ga("layout", "window_drag"));
    $("body").on("mousedown", ".lm_drag_handle", () => { ga("layout", "splitter_drag"); });
});
