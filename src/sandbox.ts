import * as Vue from "vue";
import { componentLoader } from "./ui/ComponentLoader";
import Component from "./ui/Component";
import { FileTree, FsTreeNode } from "./ui/Parts/FileTree";
import * as $ from "jquery";

@Component
class App extends Vue {
    selectedUri: string = null;
    get fileTree() { return <FileTree>this.$refs["fileTree"]; }

    public openFile(fsItem: FsTreeNode, data: ArrayBuffer) {
        console.log("openFile", fsItem, data);
        this.selectedUri = fsItem.uri.uri;
    }

    public generateParser() {
        console.log("generateParser", arguments);
    }
}

componentLoader.load(["Components/TreeView", "Components/ContextMenu", "Components/InputModal", "Parts/FileTree"]).then(() => {
    var app = new App({ el: "#app" });
    app.fileTree.init();
    window["app"] = app;
    $('body').tooltip({ selector: '[data-toggle="tooltip"]', container: 'body', trigger: "click hover" });
});