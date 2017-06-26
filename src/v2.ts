import { Layout } from "./AppLayout";
import { FileTree } from "./ui/Parts/FileTree";
import { componentLoader } from "./ui/ComponentLoader";
import { Component } from "./ui/LayoutManagerV2";
import * as ace from "ace/ace";

window["layout"] = Layout;

var filetree = new FileTree();
filetree.init();
filetree.$mount(Layout.fileTree.element);

function addEditor(parent: Component, lang: string){
    var editor = ace.edit(parent.element);
    editor.setTheme("ace/theme/monokai");
    editor.getSession().setMode(`ace/mode/${lang}`);
    if (lang === "yaml")
        editor.setOption("tabSize", 2);
    parent.container.on("resize", () => editor.resize());
}

addEditor(Layout.ksyEditor, 'yaml');