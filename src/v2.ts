
import { AppView } from "./AppView";
import { ISandboxMethods } from "./worker/WorkerShared";
import { IDataProvider } from "./HexViewer";
import { localSettings } from "./LocalSettings";
import { FsTreeNode, fss } from "./ui/Parts/FileTree";
import { Delayed } from "./utils";
import { SandboxHandler } from "./SandboxHandler";
import { ParsedTreeNode, ParsedTreeRootNode } from "./ui/Parts/ParsedTree";
import { IExportedValue } from "worker/WorkerShared";
import { ParsedMap } from "./ParsedMap";
import { InitKaitaiSandbox, ParseError } from "./KaitaiSandbox";
import { Conversion } from "./utils/Conversion";

class AppController {
    view: AppView;
    sandbox: ISandboxMethods;
    dataProvider: IDataProvider;
    exported: IExportedValue;
    parsedMap: ParsedMap;

    async start() {
        this.initView();
        await this.initWorker();
        await this.openFile(localSettings.latestKsyUri);
        await this.openFile(localSettings.latestInputUri);
    }

    protected initView() {
        this.view = new AppView();
        
        this.view.fileTree.$on("open-file", (treeNode: FsTreeNode) => {
            console.log('treeView openFile', treeNode);
            this.openFile(treeNode.uri.uri);
        });

        var editDelay = new Delayed(500);
        this.view.ksyEditor.on("change", () => editDelay.do(() => 
            this.compile(this.view.ksyEditor.getValue())));

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
                let itemPathToSelect = itemMatches[0].exp.path.join('/');
                this.view.infoPanel.parsedPath = itemPathToSelect;
                if (origin !== "ParsedTree") {
                    let node = await this.openNode(itemPathToSelect);
                    this.view.parsedTree.treeView.setSelected(node);
                }
            }

            localSettings.latestSelection = { start, end };
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
        let content = await fss.read(uri);
        if (uri.endsWith(".ksy")) {
            localSettings.latestKsyUri = uri;
            const ksyContent = Conversion.utf8BytesToStr(content);
            this.compile(ksyContent);
        } else {
            localSettings.latestInputUri = uri;
            this.setInput(content);
        }
    }

    protected async compile(ksyContent: string) {
        if (this.view.ksyEditor.getValue() !== ksyContent)
            this.view.ksyEditor.setValue(ksyContent, -1);

        try {
            this.view.hideErrors();
            var compilationResult = await this.sandbox.kaitaiServices.compile(ksyContent);
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

    protected async setInput(input: ArrayBufferLike) {
        this.dataProvider = {
            length: input.byteLength,
            get(offset, length) { return new Uint8Array(input, offset, length); }
        };

        this.view.hexViewer.setDataProvider(this.dataProvider);
        this.view.converterPanel.model.update(this.dataProvider, 0);
        await this.sandbox.kaitaiServices.setInput(input);
        await this.reparse();
    }

    protected async reparse() {
        await this.sandbox.kaitaiServices.parse();
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

    async openNode(path: string) {
        let pathParts = path.split("/");
        var currNode = this.view.parsedTree.treeView.children[0];

        for (let pathPart of pathParts) {
            await currNode.openNode();
            currNode = currNode.children.find(x => (<ParsedTreeNode>x.model).value.path.last() === pathPart);
            if (!currNode) {
                console.error(`openNode: next node not found: ${pathPart} (${path})`);
                return;
            }
        }

        await currNode.openNode();
        return currNode;
    }
}

var app = window["ide"] = new AppController();
app.start();
