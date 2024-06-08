import * as GoldenLayout from "goldenlayout";

import {HexViewer} from "../HexViewer";
import {ParsedTreeHandler} from "./parsedToTree";
import {LayoutManager} from "./GoldenLayout/LayoutManager";

export class UI {
    layoutManager: LayoutManager<UI>;
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
        this.layoutManager = new LayoutManager(this, new GoldenLayout({
            settings: {showCloseIcon: false, showPopoutIcon: false},
            content: [
                {
                    type: "row", content: []
                        .concat({type: "component", componentName: "fileTreeCont", title: "files", isClosable: false, width: 12})
                        .concat(
                            {
                                type: "column", id: "mainArea", isClosable: false, content: [
                                    {
                                        type: "row", content: [
                                            {
                                                type: "column", content: [
                                                    {type: "component", componentName: "ksyEditor", title: ".ksy editor", isClosable: false},
                                                    {
                                                        type: "stack", activeItemIndex: 0, content: [
                                                            {type: "component", componentName: "parsedDataTree", title: "object tree", isClosable: false},
                                                        ]
                                                    },
                                                ]
                                            },
                                            {
                                                type: "stack", id: "codeTab", activeItemIndex: 2, content: [
                                                    {type: "component", componentName: "genCodeViewer", title: "JS code", isClosable: false},
                                                    {type: "component", componentName: "genCodeDebugViewer", title: "JS code (debug)", isClosable: false},
                                                    {
                                                        type: "column", isClosable: false, id: "inputBinaryTab", title: "input binary", content: [
                                                            {type: "component", componentName: "hexViewer", title: "hex viewer", isClosable: false},
                                                            {
                                                                type: "row", isClosable: false, height: 35, content: [
                                                                    {
                                                                        type: "component",
                                                                        componentName: "infoPanel",
                                                                        title: "info panel",
                                                                        isClosable: false,
                                                                        width: 40
                                                                    },
                                                                    {type: "component", componentName: "converterPanel", title: "converter", isClosable: false},
                                                                ]
                                                            }
                                                        ]
                                                    }
                                                ]
                                            }
                                        ]
                                    },
                                ]
                            })
                }
            ]
        }));

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
            cont.getElement().append($("<div />"));
        });
        this.layoutManager.addComponent("parsedDataTree");
        this.layoutManager.addComponent("fileTreeCont", cont => cont.getElement().append($("#fileTreeCont").children()));
        this.layoutManager.addExistingDiv("infoPanel");
        this.layoutManager.addExistingDiv("converterPanel");
    }

    init() {
        this.layoutManager.layout.init();
    }
}
