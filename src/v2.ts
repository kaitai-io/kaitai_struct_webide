import { Layout } from "./AppLayout";
import { FileTree, FsTreeNode, fss } from "./ui/Parts/FileTree";
import { componentLoader } from "./ui/ComponentLoader";
import { Component } from "./LayoutManagerV2";
import * as ace from "ace/ace";
import { SandboxHandler } from "./SandboxHandler";
import { FsUri } from "./FileSystem/FsUri";
import { HexViewer } from "./HexViewer";
//import { IKsyTypes, ObjectType, IExportedValue, IInstance } from "../worker/WorkerShared";

window["layout"] = Layout;

var filetree = new FileTree();
filetree.init();
filetree.$mount(Layout.fileTree.element);

function setupEditor(parent: Component, lang: string) {
    var editor = ace.edit(parent.element);
    editor.setTheme("ace/theme/monokai");
    editor.getSession().setMode(`ace/mode/${lang}`);
    if (lang === "yaml")
        editor.setOption("tabSize", 2);
    editor.$blockScrolling = Infinity; // TODO: remove this line after they fix ACE not to throw warning to the console
    parent.container.on("resize", () => editor.resize());
    return editor;
}

var ksyEditor = setupEditor(Layout.ksyEditor, "yaml");
var jsCode = setupEditor(Layout.jsCode, "javascript");
var jsCodeDebug = setupEditor(Layout.jsCodeDebug, "javascript");
var hexViewer = new HexViewer(Layout.inputBinary.element);

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

(async function(){
    interface ISandboxMethods {
        eval(code: string): Promise<any>;
        loadScript(src: string): Promise<void>;
        kaitaiServices: IKaitaiServices;
    }

    interface IKaitaiServices {
        compile(code: string): Promise<{
            releaseCode: { [fileName:string]: string },
            debugCode: { [fileName:string]: string },
            debugCodeAll: string,
        }>;
        setInput(input: ArrayBuffer): Promise<void>;
        parse(): Promise<void>;
        export(): Promise<IExportedValue>;
    }

    var sandbox = SandboxHandler.create<ISandboxMethods>("https://webide-usercontent.kaitai.io");
    await sandbox.loadScript(new URL("js/worker/ImportLoader.js", location.href).href);
    await sandbox.loadScript(new URL("js/worker/KaitaiWorkerV2.js", location.href).href);
    await openFile("https:///formats/archive/zip.ksy");
    var compilationResult = await sandbox.kaitaiServices.compile(ksyContent);
    console.log("compilationResult", compilationResult);
    jsCode.setValue(Object.values(compilationResult.releaseCode).join("\n"), -1);
    jsCodeDebug.setValue(compilationResult.debugCodeAll, -1);

    let input = await fss.read("https:///samples/sample1.zip");
    hexViewer.setDataProvider({
        length: input.byteLength,
        get(offset, length) { return new Uint8Array(input, offset, length); }
    });
    await sandbox.kaitaiServices.setInput(input);
    await sandbox.kaitaiServices.parse();
    let exported = await sandbox.kaitaiServices.export();
    console.log("exported", exported);
})();
