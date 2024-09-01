import "bootswatch/darkly/bootstrap.min.css";
import "./../../css/contextmenu.css";
import "golden-layout/src/css/goldenlayout-base.css";
import "golden-layout/src/css/goldenlayout-dark-theme.css";
import "./../../css/app.css";
import "jstree/dist/themes/default/style.min.css";
import "jstree/dist/themes/default-dark/style.min.css";
import "font-awesome/css/font-awesome.min.css";

import "./ImportJQuery";
import "bootstrap";
import "jstree";

import {initFileDrop} from "./JQueryComponents/Files/FileDrop";
import {ErrorWindowHandler} from "./app.errors";
import {CompilerService} from "../DataManipulation/CompilationModule/CompilerService";
import {GoldenLayoutUI} from "./GoldenLayout/GoldenLayoutUI";
import {createApp} from "vue";
import App from "../App.vue";
import {createPinia} from "pinia";
import {processUploadedFiles} from "../GlobalActions/UploadFiles";

const vueApp = createApp(App);
vueApp.use(createPinia());
vueApp.mount("body");

const qs = {};
location.search.substr(1).split("&").map(x => x.split("=")).forEach(x => qs[x[0]] = x[1]);



class AppController {
    compilerService = new CompilerService();
    ui = new GoldenLayoutUI();
    errors: ErrorWindowHandler = null;

    init() {
        this.errors = new ErrorWindowHandler(this.ui.layoutManager.getLayoutNodeById("mainArea"));
    }
}

export const app = new AppController();

var kaitaiIde = window["kaitaiIde"] = <any>{};
kaitaiIde.version = "0.1";
kaitaiIde.commitId = "";
kaitaiIde.commitDate = "";

$(() => {
    app.init();
    initFileDrop("fileDrop", (files: any) => processUploadedFiles(files));
    kaitaiIde.app = app;
});
