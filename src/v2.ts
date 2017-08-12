
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
            this.setSelection(this.view.hexViewer.selectionStart, this.view.hexViewer.selectionEnd);
        };

        this.view.parsedTree.treeView.$on("selected", (node: ParsedTreeNode) => {
            this.setSelection(node.value.start, node.value.end - 1, "ParsedTree");
            this.view.infoPanel.parsedPath = node.value.path.join("/");
        });

        this.view.fileTree.$on("generate-parser", async (lang: string, aceLang: string, debug: boolean, ksyContent: string) => {
            const generatedFiles = await this.sandbox.kaitaiServices.generateParser(ksyContent, lang, debug);
            for (let fileName in generatedFiles)
                this.view.addFileView(fileName, generatedFiles[fileName], aceLang);
        });

        this.view.dragAndDrop.$on("files-uploaded", async (files: IDataFiles) => {
            const newFileUris = await this.view.fileTree.uploadFiles(files);
            if (newFileUris.length === 1)
                this.openFile(newFileUris[0]);
        });

        this.view.infoPanel.exportToJson = async hex => {
            const json = await this.sandbox.kaitaiServices.exportToJson(hex);
            this.view.addFileView("json export", json, "json");
        };

        this.view.infoPanel.selectionChanged = (start, end) => this.setSelection(start, end);
    }

    blockSelection = false;

    protected async setSelection(start: number, end: number, origin?: "ParsedTree") {
        if (this.blockSelection) return;
        this.blockSelection = true;

        try {
            this.view.hexViewer.setSelection(start, end);
            this.view.converterPanel.model.update(this.dataProvider, start);
            this.view.infoPanel.selectionStart = start;
            this.view.infoPanel.selectionEnd = end;

            let itemMatches = this.parsedMap.intervalHandler.searchRange(start, end).items;
            if (itemMatches.length > 0) {
                let itemPathToSelect = itemMatches[0].exp.path.join("/");
                this.view.infoPanel.parsedPath = itemPathToSelect;
                if (origin !== "ParsedTree") {
                    let node = await this.view.parsedTree.open(itemPathToSelect);
                    this.view.parsedTree.treeView.setSelected(node);
                }
            }

            localSettings.latestSelection = { start, end };
        } finally {
            this.blockSelection = false;
        }
    }

    protected async initWorker() {
        this.sandbox = await InitKaitaiWithoutSandbox();

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
            this.ksyChangeHandler.setContent(ksyContent);
        } else if (uri.endsWith(".kcy")) {
            localSettings.latestKcyUri = uri;
            const tplContent = Conversion.utf8BytesToStr(content);
            this.templateChangeHandler.setContent(tplContent);
        } else {
            localSettings.latestInputUri = uri;
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

    protected async recompile() {
        try {
            this.view.hideErrors();
            const ksyContent = this.ksyChangeHandler.getContent();
            const template = this.templateChangeHandler.getContent();
            var compilationResult = await this.sandbox.kaitaiServices.compile(ksyContent, template);
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

    protected async reparse() {
        try {
            await this.sandbox.kaitaiServices.parse();
        } finally {
            this.exported = await this.sandbox.kaitaiServices.export();
            console.log("exported", this.exported);

            this.parsedMap = new ParsedMap(this.exported);
            this.view.infoPanel.unparsed = this.parsedMap.unparsed;
            this.view.infoPanel.byteArrays = this.parsedMap.byteArrays;
            this.view.hexViewer.setIntervals(this.parsedMap.intervalHandler);
            this.view.parsedTree.rootNode = null;
            await this.view.nextTick(() =>
                this.view.parsedTree.rootNode = new ParsedTreeRootNode(new ParsedTreeNode("", this.exported)));
            this.setSelection(localSettings.latestSelection.start, localSettings.latestSelection.end);
        }
    }
}

var app = window["ide"] = new AppController();
app.start();
