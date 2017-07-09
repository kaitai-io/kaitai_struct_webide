import { Layout, LayoutHelper } from "./AppLayout";
import { FileTree, FsTreeNode, fss } from "./ui/Parts/FileTree";
import { InfoPanel } from "./ui/Parts/InfoPanel";
import { componentLoader } from "./ui/ComponentLoader";
import { Component } from "./LayoutManagerV2";
import { SandboxHandler } from "./SandboxHandler";
import { FsUri } from "./FileSystem/FsUri";
import { HexViewer, IDataProvider } from "./HexViewer";
import { ConverterPanel, ConverterPanelModel } from "./ui/Components/ConverterPanel";
import { AboutModal } from "./ui/Parts/AboutModal";
import { ParsedTree, ParsedTreeNode, ParsedTreeRootNode } from "./ui/Parts/ParsedTree";
import { ISandboxMethods } from "worker/WorkerShared";
import * as Vue from "vue";

window["layout"] = Layout;

var filetree = new FileTree();
filetree.init();
filetree.$mount(Layout.fileTree.element);

var ksyEditor = LayoutHelper.setupEditor(Layout.ksyEditor, "yaml");
var jsCode = LayoutHelper.setupEditor(Layout.jsCode, "javascript");
var jsCodeDebug = LayoutHelper.setupEditor(Layout.jsCodeDebug, "javascript");
var hexViewer = new HexViewer(Layout.inputBinary.element);

var aboutModal = new AboutModal();
var infoPanel = new InfoPanel();
var converterPanel = new ConverterPanel();

infoPanel.$mount(Layout.infoPanel.element);
converterPanel.$mount(Layout.converterPanel.element);
infoPanel.aboutModal = aboutModal;

filetree.$on("open-file", (treeNode: FsTreeNode) => {
    console.log(treeNode);
    openFile(treeNode.uri.uri);
});

var ksyContent: string;

async function openFile(uri: string) {
    let content = await fss.read(uri);
    if(uri.endsWith(".ksy")) {
        ksyContent = new TextDecoder().decode(new Uint8Array(content));
        ksyEditor.setValue(ksyContent, -1);
    }
}

var parsedTree = new ParsedTree();
parsedTree.$mount(Layout.objectTree.element);

(async function(){
    var sandbox = SandboxHandler.create<ISandboxMethods>("https://webide-usercontent.kaitai.io");
    await sandbox.loadScript(new URL("js/worker/worker/ImportLoader.js", location.href).href);
    await sandbox.loadScript(new URL("js/worker/worker/KaitaiWorkerV2.js", location.href).href);

    var compilerInfo = await sandbox.kaitaiServices.getCompilerInfo();
    aboutModal.compilerVersion = compilerInfo.version;
    aboutModal.compilerBuildDate = compilerInfo.buildDate;

    await openFile("https:///formats/archive/zip.ksy");
    var compilationResult = await sandbox.kaitaiServices.compile(ksyContent);
    console.log("compilationResult", compilationResult);
    jsCode.setValue(Object.values(compilationResult.releaseCode).join("\n"), -1);
    jsCodeDebug.setValue(compilationResult.debugCodeAll, -1);

    let input = await fss.read("https:///samples/sample1.zip");

    var dataProvider: IDataProvider = {
        length: input.byteLength,
        get(offset, length) { return new Uint8Array(input, offset, length); }
    };
    hexViewer.setDataProvider(dataProvider);
    converterPanel.model.update(dataProvider, 0);

    hexViewer.onSelectionChanged = () => {
        console.log("selectionChanged");
        converterPanel.model.update(dataProvider, hexViewer.selectionStart);
        infoPanel.selectionStart = hexViewer.selectionStart;
        infoPanel.selectionEnd = hexViewer.selectionEnd;
    };

    await sandbox.kaitaiServices.setInput(input);
    await sandbox.kaitaiServices.parse();
    let exported = await sandbox.kaitaiServices.export();
    console.log("exported", exported);

    parsedTree.rootNode = new ParsedTreeRootNode(new ParsedTreeNode("", exported));
})();
