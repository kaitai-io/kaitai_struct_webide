import {GoldenLayoutWrapper} from "./GoldenLayoutWrapper";
import {ParsedTreeHandler} from "../parsedToTree";
import {HexViewer} from "../../HexViewer";
import {GoldenLayoutUIConfig} from "./GoldenLayoutUIConfig";

// GoldenLayout imports, one is a types import, the second is a module!
import GoldenLayout from "golden-layout";
import * as GoldenLayoutModule from "golden-layout";

export class GoldenLayoutUI {
    layoutManager: GoldenLayoutWrapper<GoldenLayoutUI>;
    ksyEditor: AceAjax.Editor;
    genCodeViewer: AceAjax.Editor;
    genCodeDebugViewer: AceAjax.Editor;
    parsedDataTreeCont: GoldenLayout.Container;
    parsedDataTreeHandler: ParsedTreeHandler;
    hexViewer: HexViewer;
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
        this.layoutManager.addComponent("hexViewer", () => {
            var hexViewer = new HexViewer("#hexViewer");
            const stored = localStorage.getItem("HexViewer.bytesPerLine");
            hexViewer.bytesPerLine = (stored !== null && parseInt(stored, 10)) || 16;
            return hexViewer;
        });
        this.layoutManager.addComponent("errorWindow", cont => {
            cont.getElement().append($("<div></div>"));
        });
        this.layoutManager.addComponent("parsedDataTree");
        this.layoutManager.addComponent("fileTreeCont", cont => cont.getElement().append($("#fileTreeCont").children()));
        this.layoutManager.addExistingDiv("infoPanel");
        this.layoutManager.addExistingDiv("converterPanel");
    }

    init() {
        this.layoutManager.goldenLayout.init();
    }
}