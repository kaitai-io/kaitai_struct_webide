import {GoldenLayoutWrapper} from "./GoldenLayoutWrapper";
import {ParsedTreeHandler} from "../parsedToTree";
import {GoldenLayoutUIConfig} from "./GoldenLayoutUIConfig";

// GoldenLayout imports, one is a types import, the second is a module!
import GoldenLayout from "golden-layout";
import * as GoldenLayoutModule from "golden-layout";
import {Ace} from "ace-builds";

export class GoldenLayoutUI {
    layoutManager: GoldenLayoutWrapper<GoldenLayoutUI>;
    ksyEditor: Ace.Editor;
    genCodeViewer: Ace.Editor;
    genCodeDebugViewer: Ace.Editor;
    parsedDataTreeCont: GoldenLayout.Container;
    parsedDataTreeHandler: ParsedTreeHandler;
    errorWindow: GoldenLayout.Container;
    infoPanel: GoldenLayout.Container;
    fileTreeCont: JQuery;
    fileTree: JSTree;
    converterPanel: JQuery;

    constructor() {
        const goldenLayout = new GoldenLayoutModule(GoldenLayoutUIConfig);
        this.layoutManager = new GoldenLayoutWrapper(this, goldenLayout);
        this.layoutManager.addAceCodeEditorTab("ksyEditor", {lang: "yaml"});
        this.layoutManager.addAceCodeEditorTab("genCodeViewer", {lang: "javascript", isReadOnly: true});
        this.layoutManager.addAceCodeEditorTab("genCodeDebugViewer", {lang: "javascript", isReadOnly: true});

        this.layoutManager.addExistingDiv("hex-viewer");

        this.layoutManager.addComponent("errorWindow", cont => {
            cont.getElement().append($("<div></div>"));
        });

        this.layoutManager.addComponent("parsedDataTree");
        this.layoutManager.addComponent("fileTreeCont", cont => cont.getElement().append($("#fileTreeCont")));
        this.layoutManager.addExistingDiv("infoPanel");
        this.layoutManager.addComponent("converterPanel", cont => cont.getElement().append($("#converter-panel")));

        this.layoutManager.goldenLayout.init();
    }
}