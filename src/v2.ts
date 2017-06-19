import { Layout } from "./AppLayout";
import { FileTree } from "./ui/Parts/FileTree";
import { componentLoader } from "./ui/ComponentLoader";
window["layout"] = Layout;

// <file-tree ref="fileTree" @open-file="openFile" @generate-parser="generateParser"></file-tree>
// "Components/TreeView", "Components/ContextMenu", "Components/InputModal", "Parts/FileTree"

console.log('load done?', Object.keys(componentLoader.templatePromises));

var filetree = new FileTree();
filetree.init();
filetree.$mount(Layout.fileTree.element);


//componentLoader.load([]).then(() => {
//    var filetree = new FileTree();
//    filetree.init();
//    filetree.$mount(Layout.fileTree.element);
//});

console.log('fileTree container', Layout.fileTree.element);