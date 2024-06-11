import "bootswatch/darkly/bootstrap.min.css";
import "./../../css/contextmenu.css";
import "golden-layout/src/css/goldenlayout-base.css";
import "golden-layout/src/css/goldenlayout-dark-theme.css";
import "./../../css/HexViewer.css";
import "./../../css/app.css";
import "jstree/dist/themes/default/style.min.css";
import "jstree/dist/themes/default-dark/style.min.css";
import "font-awesome/css/font-awesome.min.css";

import "./ImportJQuery";
import "./app.unsupportedBrowser";
import "bootstrap";
import "jstree";



import Vue from "vue";


import {addKsyFile, initFileTree, refreshFsNodes} from "./app.files";
import {IParsedTreeNode, ParsedTreeHandler} from "./parsedToTree";
import {codeExecutionWorkerApi} from "./Workers/WorkerApi";
import {IDataProvider} from "../HexViewer";
import {initFileDrop} from "./JQueryComponents/Files/FileDrop";
import {Delayed} from "../utils";
import {componentLoader} from "../ui/ComponentLoader";
import {ConverterPanelModel} from "../ui/Components/ConverterPanel";
import {exportToJson} from "./utils/ExportToJson";
import Component from "../ui/Component";
import {ErrorWindowHandler} from "./app.errors";
import {fileSystemsManager} from "./FileSystems/FileSystemManager";
import {FILE_SYSTEM_TYPE_KAITAI, IFsItem} from "./FileSystems/FileSystemsTypes";
import KaitaiStructCompiler from "kaitai-struct-compiler";
import {ArrayUtils} from "./utils/Misc/ArrayUtils";
import {StringUtils} from "./utils/Misc/StringUtils";
import {CompilerService} from "./utils/Compilation/CompilerService";
import {CompilationError} from "./utils/Compilation/CompilationError";
import {FileActionsWrapper} from "./utils/Files/FileActionsWrapper";
import {IFileProcessItem} from "./utils/Files/Types";
import "../extensions";
import {GoldenLayoutUI} from "./GoldenLayout/GoldenLayoutUI";
import {LocalForageWrapper} from "./utils/LocalForageWrapper";

$.jstree.defaults.core.force_text = true;

const qs = {};
location.search.substr(1).split("&").map(x => x.split("=")).forEach(x => qs[x[0]] = x[1]);

interface IInterval {
    start: number;
    end: number;
}

@Component
class AppVM extends Vue {
    ui: GoldenLayoutUI;
    converterPanelModel = new ConverterPanelModel();

    selectionStart: number = -1;
    selectionEnd: number = -1;

    unparsed: IInterval[] = [];
    byteArrays: IInterval[] = [];

    disableLazyParsing: boolean = false;

    public selectInterval(interval: IInterval) {
        this.selectionChanged(interval.start, interval.end);
    }

    public selectionChanged(start: number, end: number) {
        this.ui.hexViewer.setSelection(start, end);
    }

    public exportToJson(hex: boolean) {
        exportToJson(hex)
            .then(json => {
                const options = {
                    lang: "json",
                    isReadOnly: true,
                    data: json
                };
                this.ui.layoutManager.addDynamicAceCodeEditorTab("json export", options);
            });
    }

    public about() {
        (<any>$("#welcomeModal")).modal();
    }
}

class AppController {
    compilerService = new CompilerService();
    ui = new GoldenLayoutUI();
    vm = new AppVM();
    errors: ErrorWindowHandler = null;

    init() {
        this.vm.ui = this.ui;
        this.ui.init();
        this.errors = new ErrorWindowHandler(this.ui.layoutManager.getLayoutNodeById("mainArea"));
        initFileTree();
    }

    dataProvider: IDataProvider;
    ksyFsItemName = "ksyFsItem";
    lastKsyContent: string = null;

    isKsyFile(fn: string) {
        return fn.toLowerCase().endsWith(".ksy");
    }

    compile(srcYamlFsItem: IFsItem, srcYaml: string, kslang: string, debug: true | false | "both"): Promise<any> {
        return this.compilerService.compile(srcYamlFsItem, srcYaml, kslang, debug).then(result => {
            return result;
        }, (error: CompilationError) => {
            this.errors.handle(error.error);
            return Promise.reject(error);
        });
    }

    async recompile() {
        let ksyFsItem = await LocalForageWrapper.getFsItem(this.ksyFsItemName);
        const srcYaml = this.ui.ksyEditor.getValue();
        const changed = this.lastKsyContent !== srcYaml;

        if (changed && ksyFsItem.fsType === FILE_SYSTEM_TYPE_KAITAI) {
            let fsItem = await addKsyFile("localStorage", ksyFsItem.fn.replace(".ksy", "_modified.ksy"), srcYaml);
            await LocalForageWrapper.saveFsItem(this.ksyFsItemName, fsItem);
        }

        if (changed)
            await fileSystemsManager[ksyFsItem.fsType].put(ksyFsItem.fn, srcYaml);

        let compiled = await this.compile(ksyFsItem, srcYaml, "javascript", "both");
        if (!compiled) return;

        var fileNames = Object.keys(compiled.release);
        let debugUserTypes = localStorage.getItem("userTypes") || "";
        if (debugUserTypes) debugUserTypes += "\n\n";
        this.ui.genCodeViewer.setValue(debugUserTypes + fileNames.map(x => compiled.release[x]).join(""), -1);
        this.ui.genCodeDebugViewer.setValue(debugUserTypes + fileNames.map(x => compiled.debug[x]).join(""), -1);
        await this.reparse();
    }

    blockRecursive = false;
    selectedInTree = false;
    formatReady: Promise<any> = null;
    inputReady: Promise<any> = null;

    async reparse() {
        try {
            await Promise.all([this.inputReady, this.formatReady]);

            let debugCode = this.ui.genCodeDebugViewer.getValue();
            let jsClassName = this.compilerService.ksySchema.meta.id.split("_").map((x: string) => StringUtils.ucFirst(x)).join("");
            await codeExecutionWorkerApi.initCodeAction(debugCode, jsClassName, this.compilerService.ksyTypes);

            const {result: exportedRoot, error: parseError} = await codeExecutionWorkerApi.reparseAction(this.vm.disableLazyParsing);
            kaitaiIde.root = exportedRoot;
            //console.log("reparse exportedRoot", exportedRoot);

            this.ui.parsedDataTreeHandler = new ParsedTreeHandler(this.ui.parsedDataTreeCont.getElement(), exportedRoot, this.compilerService.ksyTypes);

            this.ui.parsedDataTreeHandler.jstree.on("state_ready.jstree", () => {
                this.ui.parsedDataTreeHandler.jstree.on("select_node.jstree", (e, selectNodeArgs) => {
                    const node = <IParsedTreeNode>selectNodeArgs.node;
                    //console.log("node", node);
                    const exp = this.ui.parsedDataTreeHandler.getNodeData(node).exported;

                    if (exp && exp.path)
                        $("#parsedPath").text(exp.path.join("/"));

                    if (exp) {
                        if (exp.instanceError !== undefined) {
                            app.errors.handle(exp.instanceError);
                        } else if (exp.validationError !== undefined) {
                            app.errors.handle(exp.validationError);
                        }
                    }

                    if (!this.blockRecursive && exp && exp.start < exp.end) {
                        this.selectedInTree = true;
                        //console.log("setSelection", exp.ioOffset, exp.start);
                        this.ui.hexViewer.setSelection(exp.ioOffset + exp.start, exp.ioOffset + exp.end - 1);
                        this.selectedInTree = false;
                    }
                });
            });

            this.errors.handle(parseError);
        } catch (error) {
            this.errors.handle(error);
        }
    }

    inputContent: ArrayBuffer;
    inputFsItem: IFsItem;
    lastKsyFsItem: IFsItem;

    async loadFsItem(fsItem: IFsItem, refreshGui: boolean = true): Promise<any> {
        if (!fsItem || fsItem.type !== "file")
            return;

        var contentRaw = await fileSystemsManager[fsItem.fsType].get(fsItem.fn);
        if (this.isKsyFile(fsItem.fn)) {
            let content = <string>contentRaw;
            await LocalForageWrapper.saveFsItem(this.ksyFsItemName, fsItem);
            this.lastKsyFsItem = fsItem;
            this.lastKsyContent = <string>content;
            if (this.ui.ksyEditor.getValue() !== content)
                this.ui.ksyEditor.setValue(content, -1);
            var ksyEditor = this.ui.layoutManager.getLayoutNodeById("ksyEditor");
            (<any>ksyEditor).container.setTitle(fsItem.fn);
        } else {
            let content = <ArrayBuffer>contentRaw;
            this.inputFsItem = fsItem;
            this.inputContent = content;

            await LocalForageWrapper.saveFsItem("inputFsItem", fsItem);

            this.dataProvider = {
                length: content.byteLength,
                get(offset, length) {
                    return new Uint8Array(content, offset, length);
                }
            };

            this.ui.hexViewer.setDataProvider(this.dataProvider);
            this.ui.layoutManager.getLayoutNodeById("inputBinaryTab").setTitle(fsItem.fn);
            await codeExecutionWorkerApi.setInputAction(content);

            if (refreshGui) {
                await this.reparse();
                this.ui.hexViewer.resize();
            }
        }
    }

    addNewFiles(files: IFileProcessItem[]) {
        return Promise.all(files.map(file => (this.isKsyFile(file.file.name) ? <Promise<any>>file.read("text") : file.read("arrayBuffer"))
            .then(content => fileSystemsManager.local.put(file.file.name, content))))
            .then(fsItems => {
                refreshFsNodes();
                return fsItems.length === 1 ? this.loadFsItem(fsItems[0]) : Promise.resolve(null);
            });
    }

    refreshSelectionInput() {
        this.vm.selectionStart = this.ui.hexViewer.selectionStart;
        this.vm.selectionEnd = this.ui.hexViewer.selectionEnd;
    }

    onHexViewerSelectionChanged() {
        //console.log("setSelection", ui.hexViewer.selectionStart, ui.hexViewer.selectionEnd);
        localStorage.setItem("selection", JSON.stringify({start: this.ui.hexViewer.selectionStart, end: this.ui.hexViewer.selectionEnd}));

        var start = this.ui.hexViewer.selectionStart;
        var hasSelection = start !== -1;

        this.refreshSelectionInput();

        if (this.ui.parsedDataTreeHandler && hasSelection && !this.selectedInTree) {
            var intervals = this.ui.parsedDataTreeHandler.intervalHandler.searchRange(this.ui.hexViewer.mouseDownOffset || start);
            if (intervals.items.length > 0) {
                //console.log("selected node", intervals[0].id);
                this.blockRecursive = true;
                this.ui.parsedDataTreeHandler.activatePath(intervals.items[0].exp.path).then(() => this.blockRecursive = false);
            }
        }

        this.vm.converterPanelModel.update(this.dataProvider, start);
    }
}

export var app = new AppController();

var kaitaiIde = window["kaitaiIde"] = <any>{};
kaitaiIde.version = "0.1";
kaitaiIde.commitId = "";
kaitaiIde.commitDate = "";

//localStorage.setItem("lastVersion", kaitaiIde.version);

interface IInterval {
    start: number;
    end: number;
}

$(() => {
    $("#webIdeVersion").text(kaitaiIde.version);
    $("#webideCommitId")
        .attr("href", `https://github.com/kaitai-io/kaitai_struct_webide/commit/${kaitaiIde.commitId}`)
        .text(kaitaiIde.commitId.substr(0, 7));
    $("#webideCommitDate").text(kaitaiIde.commitDate);
    $("#compilerVersion").text(KaitaiStructCompiler.version + " (" + KaitaiStructCompiler.buildDate + ")");

    $("#welcomeDoNotShowAgain").click(() => localStorage.setItem("doNotShowWelcome", "true"));
    if (localStorage.getItem("doNotShowWelcome") !== "true")
        (<any>$("#welcomeModal")).modal();

    app.init();
    componentLoader.load(["Components/ConverterPanel", "Components/Stepper", "Components/SelectionInput"]).then(() => {
        // new Vue({data: {model: app.vm.converterPanelModel}}).$mount("#converterPanel");
        // app.vm.$mount("#infoPanel");
        app.vm.$watch("disableLazyParsing", () => app.reparse());
    });

    app.ui.hexViewer.onSelectionChanged = () => app.onHexViewerSelectionChanged();

    app.refreshSelectionInput();

    app.ui.genCodeDebugViewer.commands.addCommand({
        name: "compile", bindKey: {win: "Ctrl-Enter", mac: "Command-Enter"},
        exec: function (editor: any) {
            app.reparse();
        }
    });
    app.ui.ksyEditor.commands.addCommand({
        name: "compile", bindKey: {win: "Ctrl-Enter", mac: "Command-Enter"},
        exec: function (editor: any) {
            app.recompile();
        }
    });

    initFileDrop("fileDrop", (files: any) => app.addNewFiles(files));

    async function loadCachedFsItem(cacheKey: string, defFsType: string, defSample: string) {
        let fsItem = await LocalForageWrapper.getFsItem(cacheKey);
        await app.loadFsItem(fsItem || <IFsItem>{fsType: defFsType, fn: defSample, type: "file"}, false);
    }

    app.inputReady = loadCachedFsItem("inputFsItem", "kaitai", "samples/sample1.zip");
    app.formatReady = loadCachedFsItem(app.ksyFsItemName, "kaitai", "formats/archive/zip.ksy");

    app.inputReady.then(() => {
        const value = localStorage.getItem("selection");
        const storedSelection = value !== null ? JSON.parse(value) : null;
        if (storedSelection)
            app.ui.hexViewer.setSelection(storedSelection.start, storedSelection.end);
    });

    var editDelay = new Delayed(500);
    if (!("noAutoCompile" in qs))
        app.ui.ksyEditor.on("change", () => editDelay.do(() => app.recompile()));

    var inputContextMenu = $("#inputContextMenu");
    var downloadInput = $("#inputContextMenu .downloadItem");
    $("#hexViewer").on("contextmenu", e => {
        downloadInput.toggleClass("disabled", app.ui.hexViewer.selectionStart === -1);

        inputContextMenu.css({display: "block"});
        var x = Math.min(e.pageX, $(window).width() - inputContextMenu.width());
        var h = inputContextMenu.height();
        var y = e.pageY > ($(window).height() - h) ? e.pageY - h : e.pageY;
        inputContextMenu.css({left: x, top: y});
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

    $(document).on("mousedown", e => {
        if ($(e.target).parents(".dropdown-menu").length === 0)
            $(".dropdown").hide();
    });

    ctxAction(downloadInput, e => {
        var start = app.ui.hexViewer.selectionStart, end = app.ui.hexViewer.selectionEnd;
        var newFn = `${ArrayUtils.last(app.inputFsItem.fn.split("/"))}_0x${start.toString(16)}-0x${end.toString(16)}.bin`;
        FileActionsWrapper.saveFile(new Uint8Array(app.inputContent, start, end - start + 1), newFn);
    });

    kaitaiIde.app = app;
});
