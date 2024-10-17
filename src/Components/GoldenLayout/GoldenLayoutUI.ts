import {GoldenLayoutUIConfig} from "./GoldenLayoutUIConfig";

import GoldenLayout from "golden-layout";
import {MonacoEditorComponent, MonacoEditorOptions} from "./MonacoEditorComponent";
import {mainEditorOnChange, mainEditorRecompile} from "../../GlobalActions/KsyEditorActions";
import {DelayAction} from "../../Utils/DelayAction";
import {editor, KeyCode, KeyMod} from "monaco-editor";
import IStandaloneCodeEditor = editor.IStandaloneCodeEditor;
import {parseAction} from "../../GlobalActions/ParseAction";

export class GoldenLayoutUI {
    dynCompId = 1;

    goldenLayout: GoldenLayout;
    ksyEditor: IStandaloneCodeEditor;
    ksyEditorContainer: GoldenLayout.Container;

    genCodeViewer: IStandaloneCodeEditor;
    genCodeDebugViewer: IStandaloneCodeEditor;
    errorWindow: GoldenLayout.Container;
    hexViewerContainer: GoldenLayout.Container;

    public init() {
        this.goldenLayout = new GoldenLayout(GoldenLayoutUIConfig);

        this.addMonacoCodeEditorTab("ksyEditor", {lang: "yaml"});
        this.addMonacoCodeEditorTab("genCodeViewer", {lang: "javascript", isReadOnly: true});
        this.addMonacoCodeEditorTab("genCodeDebugViewer", {lang: "javascript", isReadOnly: true});

        this.addHexViewer("hex-viewer");
        this.addExistingDiv("parsedDataTree");
        this.addExistingDiv("fileTreeNew");
        this.addExistingDiv("converter-panel");

        this.addComponent("errorWindow", cont => {
            cont.getElement().append($("<div></div>"));
        });

        this.addExistingDiv("infoPanel");

        this.goldenLayout.init();
    }

    getLayoutNodeById(id: string): GoldenLayout.ContentItem {
        return (<any>this.goldenLayout)._getAllContentItems().filter((x: any) => x.config.id === id || x.componentName === id)[0];
    }

    addPanel() {
        let componentName = `dynComp${this.dynCompId++}`;
        return {
            componentName,
            donePromise: <Promise<GoldenLayout.Container>>new Promise((resolve, reject) => {
                this.goldenLayout.registerComponent(componentName, function (container: GoldenLayout.Container, componentState: any) {
                    resolve(container);
                });
            })
        };
    }

    addComponent(name: string, generatorCallback?: (container: GoldenLayout.Container) => any) {
        var editor: any;
        this.goldenLayout.registerComponent(name, function (container: GoldenLayout.Container, componentState: any) {
            container.getElement().attr("id", name);
            if (generatorCallback) {
                container.on("resize", () => {
                    if (editor && editor.resize) editor.resize();
                });
                container.on("open", () => {
                    generatorCallback(container);
                });
            }
        });
    }

    addHexViewer(name: string) {
        const self = this;
        this.goldenLayout.registerComponent(name, function (container: GoldenLayout.Container, componentState: any) {
            self.hexViewerContainer = container;
            const cont = $(`#${name}`).appendTo(container.getElement());
            $(() => cont.show());
        });
    }

    addExistingDiv(name: string) {
        this.goldenLayout.registerComponent(name, function (container: GoldenLayout.Container, componentState: any) {
            const cont = $(`#${name}`).appendTo(container.getElement());
            $(() => cont.show());
        });
    }

    addMonacoCodeEditorTab(name: string, options: MonacoEditorOptions) {
        this.addComponent(name, container => {
            const newEditor = MonacoEditorComponent(container, options);
            switch (name) {
                case "ksyEditor":
                    const editDelay = new DelayAction(500);
                    newEditor.onDidChangeModelContent((event) => {
                        editDelay.do(() => mainEditorOnChange(event, newEditor.getValue()));
                    });
                    newEditor.addCommand(KeyMod.CtrlCmd | KeyCode.Enter, (args) => {
                        mainEditorRecompile(newEditor);
                    }, "compile");
                    this.ksyEditor = newEditor;
                    this.ksyEditorContainer = container;
                    break;
                case "genCodeViewer":
                    this.genCodeViewer = newEditor;
                    break;
                case "genCodeDebugViewer": {
                    this.genCodeDebugViewer = newEditor;
                    newEditor.addCommand(KeyMod.CtrlCmd | KeyCode.Enter, (args) => {
                        parseAction();
                    }, "compile");
                }
            }
            return newEditor;
        });
    }

    updateKsyEditor(title: string, content: string) {
        this.ksyEditorContainer.setTitle(title);
        this.ksyEditor.setValue(content);
    }

    updateHexViewerTitle(title: string) {
        this.getLayoutNodeById("inputBinaryTab").setTitle(title);
    }


    updateReleaseAndDebugCodeTabs(debugCode: string, releaseCode: string) {
        this.genCodeViewer.setValue(releaseCode);
        this.genCodeDebugViewer.setValue(debugCode);
    }

    addDynamicCodeTab(title: string, content: string, lang: string) {
        const options: MonacoEditorOptions = {
            lang: lang,
            isReadOnly: true,
            data: content
        };
        const componentName = `dynComp${this.dynCompId++}`;
        this.addMonacoCodeEditorTab(componentName, options);
        this.getLayoutNodeById("codeTab").addChild({type: "component", componentName, title});
    }

    addExportedToJsonTab(title: string, json: string) {
        const options: MonacoEditorOptions = {
            lang: "json",
            isReadOnly: true,
            data: json
        };
        const componentName = `dynComp${this.dynCompId++}`;
        this.addMonacoCodeEditorTab(componentName, options);
        this.getLayoutNodeById("codeTab").addChild({type: "component", componentName, title});
    }
}

export const CurrentGoldenLayout = new GoldenLayoutUI();