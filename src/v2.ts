
import { AppView } from "./AppView";
import { ISandboxMethods } from "./worker/WorkerShared";
import { IDataProvider } from "./HexViewer";
import { localSettings } from "./LocalSettings";
import { FsTreeNode, fss } from "./ui/Parts/FileTree";
import { Delayed, EventSilencer } from "./utils";
import { SandboxHandler } from "./SandboxHandler";
import { ParsedTreeNode, ParsedTreeRootNode } from "./ui/Parts/ParsedTree";
import { IExportedValue } from "worker/WorkerShared";
import { ParsedMap } from "./ParsedMap";
import { InitKaitaiSandbox, ParseError, InitKaitaiWithoutSandbox } from "./KaitaiSandbox";
import { Conversion } from "./utils/Conversion";
import { IDataFiles } from "./utils/FileUtils";
import { FsUri } from "./FileSystem/FsUri";
import { EditorChangeHandler } from "./ui/UIHelper";

class AppController {
    view: AppView;
    sandbox: ISandboxMethods;
    dataProvider: IDataProvider;
    exported: IExportedValue;
    parsedMap: ParsedMap;
    ksyChangeHandler: EditorChangeHandler;
    templateChangeHandler: EditorChangeHandler;

    async start() {
        this.initView();
        await this.initWorker();
        await this.openFile(localSettings.latestKsyUri);
        await this.openFile(localSettings.latestKcyUri);
        await this.openFile(localSettings.latestInputUri);
    }

    protected initView() {
        this.view = new AppView();

        this.view.fileTree.$on("open-file", (treeNode: FsTreeNode) => {
            console.log("treeView openFile", treeNode);
            this.openFile(treeNode.uri.uri);
        });

        this.ksyChangeHandler = new EditorChangeHandler(this.view.ksyEditor, 500,
            (newContent, userChange) => this.inputFileChanged("Ksy", newContent, userChange));

        this.templateChangeHandler = new EditorChangeHandler(this.view.templateEditor, 500,
            (newContent, userChange) => this.inputFileChanged("Kcy", newContent, userChange));

        this.view.hexViewer.onSelectionChanged = () => {
            this.setSelection(this.view.hexViewer.selectionStart, this.view.hexViewer.selectionEnd, "HexViewer");
        };

        this.view.parsedTree.treeView.$on("selected", (node: ParsedTreeNode) => {
            if (!node.value) return; // instance-only
            this.setSelection(node.value.start, node.value.end - 1, "ParsedTree");
            this.view.infoPanel.parsedPath = node.value.path.join("/");
        });

        this.view.fileTree.$on("generate-parser", async (lang: string, aceLang: string, debug: boolean, ksyContent: string) => {
            const generatedFiles = await this.sandbox.kaitaiServices.generateParser(ksyContent, lang, debug);
            for (let fileName in generatedFiles)
                this.view.addFileView(fileName, generatedFiles[fileName], aceLang);
        });

        this.view.dragAndDrop.$on("files-uploaded", async (files: IDataFiles) => {
            await this.view.fileTree.uploadFiles(files);
        });

        this.view.infoPanel.exportToJson = async hex => {
            const json = await this.sandbox.kaitaiServices.exportToJson(hex);
            this.view.addFileView("json export", json, "json");
        };

        this.view.infoPanel.selectionChanged = (start, end) => this.setSelection(start, end, "InfoPanel");
        this.view.infoPanel.$watch("disableLazyParsing", () => this.reparse());
    }

    blockSelection = false;

    protected async setSelection(start: number, end: number, origin?: "ParsedTree"|"HexViewer"|"InfoPanel"|"Reparse") {
        if (this.blockSelection || end < start) return;
        this.blockSelection = true;

        try {
            this.view.hexViewer.setSelection(start, end);
            this.view.converterPanel.model.update(this.dataProvider, start);
            this.view.infoPanel.selectionStart = start;
            this.view.infoPanel.selectionEnd = end;

            const itemMatches = this.parsedMap.intervalHandler.searchRange(start, end).items;
            const itemPathToSelect = itemMatches.length > 0 ? itemMatches[0].exp.path.join("/") : localSettings.latestPath;
            this.view.infoPanel.parsedPath = itemPathToSelect;
            if (origin !== "ParsedTree") {
                const node = await this.view.parsedTree.open(itemPathToSelect);
                this.view.parsedTree.treeView.setSelected(node);
            }

            localSettings.latestSelection = { start, end };
            localSettings.latestPath = itemPathToSelect;
        } finally {
            this.blockSelection = false;
        }
    }

    protected async initWorker() {
        this.sandbox = await InitKaitaiSandbox();

        var compilerInfo = await this.sandbox.kaitaiServices.getCompilerInfo();
        this.view.aboutModal.compilerVersion = compilerInfo.version;
        this.view.aboutModal.compilerBuildDate = compilerInfo.buildDate;
    }

    async openFile(uri: string) {
        if (uri === null) return;

        let content = await fss.read(uri);
        if (uri.endsWith(".ksy")) {
            localSettings.latestKsyUri = uri;
            const ksyContent = Conversion.utf8BytesToStr(content);
            this.view.layout.ksyEditor.title = new FsUri(uri).name;
            this.ksyChangeHandler.setContent(ksyContent);
        } else if (uri.endsWith(".kcy")) {
            localSettings.latestKcyUri = uri;
            const tplContent = Conversion.utf8BytesToStr(content);
            this.templateChangeHandler.setContent(tplContent);
        } else {
            localSettings.latestInputUri = uri;
            this.view.layout.inputBinary.title = new FsUri(uri).name;
            this.setInput(content, uri);
        }
    }

    async inputFileChanged(type: "Ksy" | "Kcy", newContent: string, userChange: boolean) {
        const settingKey = `latest${type}Uri`;
        if (userChange)
            localSettings[settingKey] = await this.view.fileTree.writeFile(
                localSettings[settingKey], Conversion.strToUtf8Bytes(newContent), false);

        await this.recompile();
    }

    protected async setupImports(mainKsyUri: string, ksyContent: string) {
        let currImports = { [mainKsyUri]: ksyContent };

        while (true) {
            const newImports = await this.sandbox.kaitaiServices.setKsys(currImports);
            console.log("newImports", newImports);
            if(newImports.length === 0) break;

            currImports = {};
            for (const importUri of newImports) {
                const importStr = Conversion.utf8BytesToStr(await fss.read(importUri));
                if (!importStr)
                    throw new Error(`File not found: ${importUri}`);
                currImports[importUri] = importStr;
            }
        }
    }

    protected async recompile() {
        try {
            this.view.hideErrors();
            const ksyContent = this.ksyChangeHandler.getContent();
            const template = this.templateChangeHandler.getContent();

            const mainKsyUri = localSettings.latestKsyUri;
            await this.setupImports(mainKsyUri, ksyContent);

            const compilationResult = await this.sandbox.kaitaiServices.compile(mainKsyUri, template);
            console.log("compilationResult", compilationResult);
            this.view.jsCode.setValue(Object.values(compilationResult.releaseCode).join("\n"), -1);
            this.view.jsCodeDebug.setValue(compilationResult.debugCodeAll, -1);
            await this.reparse();
        } catch (e) {
            if (e instanceof ParseError) {
                //e.value.parsedLine
            }

            if (e instanceof Error)
                this.view.showError(e.message);

            console.log("compile error", typeof e, e);
        }
    }

    protected async setInput(input: ArrayBufferLike, uri: string = null) {
        this.dataProvider = {
            length: input.byteLength,
            get(offset, length) { return new Uint8Array(input, offset, length); }
        };

        this.view.binaryPanel.setInput(this.dataProvider, uri);
        this.view.converterPanel.model.update(this.dataProvider, 0);
        await this.sandbox.kaitaiServices.setInput(input);
        await this.reparse();
    }

    protected onNewObjectsExported(objs: IExportedValue[]) {
        this.parsedMap.addObjects(objs);
        this.view.infoPanel.unparsed = this.parsedMap.unparsed;
        this.view.infoPanel.byteArrays = this.parsedMap.byteArrays;
        this.view.hexViewer.setIntervals(this.parsedMap.intervalHandler);
    }

    protected async reparse() {
        const arrayLenLimit = 100;
        try {
            await this.sandbox.kaitaiServices.parse();
        } finally {
            const exportStartTime = performance.now();
            this.exported = await this.sandbox.kaitaiServices.export({ noLazy: this.view.infoPanel.disableLazyParsing, arrayLenLimit });
            console.log("exported", this.exported, `${performance.now() - exportStartTime}ms`);
            if (!this.exported) return;
            Object.freeze(this.exported); // prevent Vue from converting this object to an observable one

            const parseMapStartTime = performance.now();
            this.parsedMap = new ParsedMap();
            this.onNewObjectsExported([this.exported]);
            console.log("parsed", `${performance.now() - parseMapStartTime}ms`);

            this.view.parsedTree.rootNode = null;
            await this.view.nextTick(() => {
                var rootNode = this.view.parsedTree.rootNode = new ParsedTreeRootNode(new ParsedTreeNode(null, "", this.exported));

                rootNode.loadInstance = async (path) => {
                    const instanceExport = await this.sandbox.kaitaiServices.export({ path, arrayLenLimit });
                    this.onNewObjectsExported([instanceExport]);
                    return instanceExport;
                };

                rootNode.loadLazyArray = async (arrayPath, from, to) => {
                    const array = await this.sandbox.kaitaiServices.export({ path: arrayPath, arrayRange: { from, to } });
                    this.onNewObjectsExported(array);
                    return array;
                };
            });
            this.setSelection(localSettings.latestSelection.start, localSettings.latestSelection.end, "Reparse");
        }
    }
}

var app = window["ide"] = new AppController();
app.start();
