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
import {ErrorWindowHandler} from "./app.errors";
import {GoldenLayoutUI} from "./GoldenLayout/GoldenLayoutUI";
import {createApp} from "vue";
import App from "../App.vue";
import {createPinia} from "pinia";

const vueApp = createApp(App);
vueApp.use(createPinia());
vueApp.mount("body");

class AppController {
    ui = new GoldenLayoutUI();
    errors: ErrorWindowHandler = null;

    init() {
        this.errors = new ErrorWindowHandler(this.ui.layoutManager.getLayoutNodeById("mainArea"));
    }
}

export const app = new AppController();

$(() => {
    app.init();
});
