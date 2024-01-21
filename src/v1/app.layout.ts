import * as GoldenLayout from "goldenlayout";

import { HexViewer } from "../HexViewer";
import { ParsedTreeHandler } from "./parsedToTree";

export class LayoutManager<T> {
    dynCompId = 1;

    constructor(public ui: T, public layout: GoldenLayout) { }

    getLayoutNodeById(id: string): GoldenLayout.ContentItem {
        return (<any>this.layout)._getAllContentItems().filter((x: any) => x.config.id === id || x.componentName === id)[0];
    }

    addPanel() {
        let componentName = `dynComp${this.dynCompId++}`;
        return {
            componentName,
            donePromise: <Promise<GoldenLayout.Container>>new Promise((resolve, reject) => {
                this.layout.registerComponent(componentName, function (container: GoldenLayout.Container, componentState: any) {
                    resolve(container);
                });
            })
        };
    }

    addEditorTab(title: string, data: string, lang: string = null, parent: string = "codeTab") {
        var componentName = `dynComp${this.dynCompId++}`;
        this.addEditor(componentName, lang, true, (editor: any) => editor.setValue(data, -1));
        this.getLayoutNodeById(parent).addChild({ type: "component", componentName, title });
    }

    addComponent(name: string, generatorCallback?: (container: GoldenLayout.Container) => any) {
        var editor: any;
        var self = this;
        this.layout.registerComponent(name, function (container: GoldenLayout.Container, componentState: any) {
            //console.log("addComponent id", name, container.getElement());
            container.getElement().attr("id", name);
            if (generatorCallback) {
                container.on("resize", () => { if (editor && editor.resize) editor.resize(); });
                container.on("open", () => { self.ui[name] = editor = generatorCallback(container) || container; });
            } else
                self.ui[name + "Cont"] = container;
        });
    }

    addExistingDiv(name: string) {
        var self = this;
        this.layout.registerComponent(name, function (container: GoldenLayout.Container, componentState: any) {
            self.ui[name + "Cont"] = container;
            self.ui[name] = $(`#${name}`).appendTo(container.getElement());
            $(() => self.ui[name].show());
        });
    }

    addEditor(name: string, lang: string, isReadOnly: boolean = false, callback: ((editor: AceAjax.Editor) => void) = null) {
        this.addComponent(name, container => {
            var editor = ace.edit(container.getElement().get(0));
            editor.setTheme("ace/theme/monokai");
            editor.getSession().setMode(`ace/mode/${lang}`);
            if (lang === "yaml")
                editor.setOption("tabSize", 2);
            editor.$blockScrolling = Infinity; // TODO: remove this line after they fix ACE not to throw warning to the console
            editor.setReadOnly(isReadOnly);
            if (callback)
                callback(editor);
            return editor;
        });
    }
}

export class UI {
    layout: LayoutManager<UI>;
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
        this.layout = new LayoutManager(this, new GoldenLayout({
            settings: { showCloseIcon: false, showPopoutIcon: false },
            content: [
                { type: "row", content: []
                    .concat({ type: "component", componentName: "fileTreeCont", title: "files", isClosable: false, width:12 })
                    .concat(
                        { type: "column", id: "mainArea", isClosable: false, content: [
                            { type: "row", content: [
                                { type: "column", content: [
                                    { type: "component", componentName: "ksyEditor", title: ".ksy editor", isClosable: false },
                                    { type: "stack", activeItemIndex: 0, content: [
                                        { type: "component", componentName: "parsedDataTree", title: "object tree", isClosable: false },
                                    ]},
                                ]},
                                { type: "stack", id: "codeTab", activeItemIndex: 2, content: [
                                    { type: "component", componentName: "genCodeViewer", title: "JS code", isClosable: false },
                                    { type: "component", componentName: "genCodeDebugViewer", title: "JS code (debug)", isClosable: false },
                                    { type: "column", isClosable: false, id: "inputBinaryTab", title: "input binary", content: [
                                        { type: "component", componentName: "hexViewer", title: "hex viewer", isClosable: false },
                                        { type: "row", isClosable: false, height: 35, content: [
                                            { type: "component", componentName: "infoPanel", title: "info panel", isClosable: false, width: 40 },
                                            { type: "component", componentName: "converterPanel", title: "converter", isClosable: false },
                                        ]}
                                    ]}
                                ]}
                            ]},
                    ]
                    })
                }
            ]
        }));

        this.layout.addEditor("ksyEditor", "yaml");
        this.layout.addEditor("genCodeViewer", "javascript", true);
        this.layout.addEditor("genCodeDebugViewer", "javascript", false);
        this.layout.addComponent("hexViewer", () => {
            var hexViewer = new HexViewer("#hexViewer");
            const stored = localStorage.getItem("HexViewer.bytesPerLine");
            hexViewer.bytesPerLine = (stored !== null && parseInt(stored, 10)) || 16;
            return hexViewer;
        });
        this.layout.addComponent("errorWindow", cont => { cont.getElement().append($("<div />")); });
        this.layout.addComponent("parsedDataTree");
        this.layout.addComponent("fileTreeCont", cont => cont.getElement().append($("#fileTreeCont").children()));
        this.layout.addExistingDiv("infoPanel");
        this.layout.addExistingDiv("converterPanel");
    }

    init() { this.layout.layout.init(); }
}
