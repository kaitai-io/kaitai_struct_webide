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
    editor.$blockScrolling = Infinity; // TODO: remove this line after they fix ACE not to throw warning to the console
    parent.container.on("resize", () => editor.resize());
    return editor;
}

var ksyEditor = setupEditor(Layout.ksyEditor, 'yaml');

filetree.$on("open-file", (treeNode: FsTreeNode, data: ArrayBuffer) => {
    if (treeNode.isKsy){
        var str = new TextDecoder().decode(new Uint8Array(data));
        ksyEditor.setValue(str, -1);
    }
    console.log(treeNode);
});

(async function(){
    interface ISandboxMethods {
        eval(code: string): Promise<any>;
        loadScript(src: string): Promise<void>;
        compile(code: string): Promise<void>;
    }

    var sandbox = SandboxHandler.create<ISandboxMethods>("https://webide-usercontent.kaitai.io");
    await sandbox.loadScript(new URL('js/KaitaiWorkerV2.js', location.href).href);
    await sandbox.compile('test');
})();
