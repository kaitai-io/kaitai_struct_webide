import {GoldenLayoutWrapper} from "./GoldenLayoutWrapper";
import {GoldenLayoutUIConfig} from "./GoldenLayoutUIConfig";

// GoldenLayout imports, one is a types import, the second is a module!
import GoldenLayout, * as GoldenLayoutModule from "golden-layout";
import {Ace} from "ace-builds";

export class GoldenLayoutUI {
    layoutManager: GoldenLayoutWrapper<GoldenLayoutUI>;
    ksyEditor: Ace.Editor;
    genCodeViewer: Ace.Editor;
    genCodeDebugViewer: Ace.Editor;
    errorWindow: GoldenLayout.Container;

    constructor() {
        const goldenLayout = new GoldenLayoutModule(GoldenLayoutUIConfig);
        this.layoutManager = new GoldenLayoutWrapper(this, goldenLayout);
        this.layoutManager.addAceCodeEditorTab("ksyEditor", {lang: "yaml"});
        this.layoutManager.addAceCodeEditorTab("genCodeViewer", {lang: "javascript", isReadOnly: true});
        this.layoutManager.addAceCodeEditorTab("genCodeDebugViewer", {lang: "javascript", isReadOnly: true});

        this.layoutManager.addExistingDiv("hex-viewer");
        this.layoutManager.addExistingDiv("parsedDataTree");
        this.layoutManager.addExistingDiv("fileTreeNew");

        this.layoutManager.addComponent("errorWindow", cont => {
            cont.getElement().append($("<div></div>"));
        });

        this.layoutManager.addExistingDiv("infoPanel");
        this.layoutManager.addComponent("converterPanel", cont => cont.getElement().append($("#converter-panel")));

        this.layoutManager.goldenLayout.init();
    }
}