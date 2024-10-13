import {GoldenLayoutWrapper} from "./GoldenLayoutWrapper";
import {GoldenLayoutUIConfig} from "./GoldenLayoutUIConfig";

import {Ace} from "ace-builds";
import GoldenLayout from "golden-layout";

export class GoldenLayoutUI {
    layoutManager: GoldenLayoutWrapper<GoldenLayoutUI>;
    ksyEditor: Ace.Editor;
    genCodeViewer: Ace.Editor;
    genCodeDebugViewer: Ace.Editor;
    errorWindow: GoldenLayout.Container;

    constructor() {
        const goldenLayout = new GoldenLayout(GoldenLayoutUIConfig);
        this.layoutManager = new GoldenLayoutWrapper(this, goldenLayout);
        this.layoutManager.addAceCodeEditorTab("ksyEditor", {lang: "yaml"});
        this.layoutManager.addAceCodeEditorTab("genCodeViewer", {lang: "javascript", isReadOnly: true});
        this.layoutManager.addAceCodeEditorTab("genCodeDebugViewer", {lang: "javascript", isReadOnly: true});

        this.layoutManager.addExistingDiv("hex-viewer");
        this.layoutManager.addExistingDiv("parsedDataTree");
        this.layoutManager.addExistingDiv("fileTreeNew");
        this.layoutManager.addExistingDiv("converter-panel");

        this.layoutManager.addComponent("errorWindow", cont => {
            cont.getElement().append($("<div></div>"));
        });

        this.layoutManager.addExistingDiv("infoPanel");

        this.layoutManager.goldenLayout.init();
    }
}