import { Layout } from "./AppLayout";
import { FileTree, FsTreeNode } from "./ui/Parts/FileTree";
import { componentLoader } from "./ui/ComponentLoader";
import { Component } from "./LayoutManagerV2";
import * as ace from "ace/ace";
import { SandboxHandler } from "./SandboxHandler";

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
    parent.container.on("resize", () => editor.resize());
    return editor;
}

var ksyEditor = setupEditor(Layout.ksyEditor, 'yaml');

filetree.$on("open-file", (treeNode: FsTreeNode, data: ArrayBuffer) => { 
    var str = new TextDecoder().decode(new Uint8Array(data));
    ksyEditor.setValue(str);
});

(async function(){
    interface ISandboxMethods {
        eval(code: string): Promise<any>;
        loadScript(src: string): Promise<void>;
    }

    var sandbox = SandboxHandler.create<ISandboxMethods>(location.origin === "http://localhost:8000" ? "http://localhost:8001" : "https://webide-usercontent.kaitai.io");
    console.log('eval result', await sandbox.eval("5"));
})();
