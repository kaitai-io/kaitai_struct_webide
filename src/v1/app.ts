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
import "bootstrap";
import "jstree";

import {addKsyFile, initFileTree, refreshFsNodes} from "./app.files";
import {IParsedTreeNode, ParsedTreeHandler} from "./parsedToTree";
import {codeExecutionWorkerApi} from "./Workers/WorkerApi";
import {initFileDrop} from "./JQueryComponents/Files/FileDrop";
import {Delayed} from "../utils";
import {exportToJson} from "./utils/ExportToJson";
import {ErrorWindowHandler} from "./app.errors";
import {fileSystemsManager} from "./FileSystems/FileSystemManager";
import {FILE_SYSTEM_TYPE_KAITAI, IFsItem} from "./FileSystems/FileSystemsTypes";
import {StringUtils} from "./utils/Misc/StringUtils";
import {CompilerService} from "./utils/Compilation/CompilerService";
import {CompilationError} from "./utils/Compilation/CompilationError";
import {IFileProcessItem} from "./utils/Files/Types";
import "../extensions";
import {GoldenLayoutUI} from "./GoldenLayout/GoldenLayoutUI";
import {LocalForageWrapper} from "./utils/LocalForageWrapper";
import {createApp} from "vue";
import App from "../App.vue";
import {IAceEditorComponentOptions} from "./GoldenLayout/AceEditorComponent";
import {createPinia} from "pinia";
import {useCurrentBinaryFileStore} from "../Stores/CurrentBinaryFileStore";
import {HEX_VIEWER_GO_TO_INDEX, MittEmitter} from "./utils/MittEmitter";

const vueApp = createApp(App);
vueApp.use(createPinia());
vueApp.mount("body");

$.jstree.defaults.core.force_text = true;

const qs = {};
location.search.substr(1).split("&").map(x => x.split("=")).forEach(x => qs[x[0]] = x[1]);

interface IInterval {
    start: number;
    end: number;
}

class AppVM {
    ui: GoldenLayoutUI;

    unparsed: IInterval[] = [];
    byteArrays: IInterval[] = [];

    disableLazyParsing: boolean = false;


    public exportToJson(hex: boolean) {
        exportToJson(hex)
            .then((json: string) => {
                const options: IAceEditorComponentOptions = {
                    lang: "json",
                    isReadOnly: true,
                    data: json
                };
                this.ui.layoutManager.addDynamicAceCodeEditorTab("json export", options);
            });
    }


}

class AppController {
    compilerService = new CompilerService();
    ui = new GoldenLayoutUI();
    vm = new AppVM();
    errors: ErrorWindowHandler = null;

    init() {
        this.vm.ui = this.ui;
        this.errors = new ErrorWindowHandler(this.ui.layoutManager.getLayoutNodeById("mainArea"));
        initFileTree();
    }

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

            const {resultObject: exportedRoot, error: parseError} = await codeExecutionWorkerApi.reparseAction(this.vm.disableLazyParsing);
            kaitaiIde.root = exportedRoot;
            const store = useCurrentBinaryFileStore();
            store.updateParsedFile(exportedRoot);
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

                        const start = exp.ioOffset + exp.start;
                        const end = exp.ioOffset + exp.end - 1;
                        const currentFileStore = useCurrentBinaryFileStore();
                        currentFileStore.updateSelectionRange(start, end);
                        MittEmitter.emit(HEX_VIEWER_GO_TO_INDEX, start);

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
            const currentBinaryFileStore = useCurrentBinaryFileStore();
            currentBinaryFileStore.newBinaryFileSelected(fsItem.fn || "", content);

            await LocalForageWrapper.saveFsItem("inputFsItem", fsItem);

            this.ui.layoutManager.getLayoutNodeById("inputBinaryTab").setTitle(fsItem.fn);
            await codeExecutionWorkerApi.setInputAction(content);

            if (refreshGui) {
                await this.reparse();
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
    app.init();

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

    var editDelay = new Delayed(500);
    if (!("noAutoCompile" in qs))
        app.ui.ksyEditor.on("change", () => editDelay.do(() => app.recompile()));

    $(document).on("mousedown", e => {
        if ($(e.target).parents(".dropdown-menu").length === 0)
            $(".dropdown").hide();
    });


    kaitaiIde.app = app;
});
