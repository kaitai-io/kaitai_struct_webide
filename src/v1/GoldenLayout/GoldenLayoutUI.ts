import {GoldenLayoutUIConfig} from "./GoldenLayoutUIConfig";

import {Ace} from "ace-builds";
import GoldenLayout from "golden-layout";
import {AceEditorComponent, IAceEditorComponentOptions} from "./AceEditorComponent";
import {DelayAction} from "../utils/DelayAction";
import {mainEditorOnChange, mainEditorRecompile} from "../../GlobalActions/KsyEditorActions";
import {parseAction} from "../../GlobalActions/ParseAction";

export class GoldenLayoutUI {
    dynCompId = 1;

    goldenLayout: GoldenLayout;
    ksyEditor: Ace.Editor;
    ksyEditorContainer: GoldenLayout.Container;
    genCodeViewer: Ace.Editor;
    genCodeDebugViewer: Ace.Editor;
    errorWindow: GoldenLayout.Container;

    public init() {
        this.goldenLayout = new GoldenLayout(GoldenLayoutUIConfig);

        this.addAceCodeEditorTab("ksyEditor", {lang: "yaml"});
        this.addAceCodeEditorTab("genCodeViewer", {lang: "javascript", isReadOnly: true});
        this.addAceCodeEditorTab("genCodeDebugViewer", {lang: "javascript", isReadOnly: true});

        this.addExistingDiv("hex-viewer");
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

    addExistingDiv(name: string) {
        this.goldenLayout.registerComponent(name, function (container: GoldenLayout.Container, componentState: any) {
            const cont = $(`#${name}`).appendTo(container.getElement());
            $(() => cont.show());
        });
    }

    addAceCodeEditorTab(name: string, options: IAceEditorComponentOptions) {
        this.addComponent(name, container => {
            const newEditor = AceEditorComponent(container, options);
            switch (name) {
                case "ksyEditor":
                    const editDelay = new DelayAction(500);
                    newEditor.on("change", (change) => {
                        editDelay.do(() => mainEditorOnChange(change, newEditor.getValue()));
                    });
                    newEditor.commands.addCommand({
                        name: "compile", bindKey: {win: "Ctrl-Enter", mac: "Command-Enter"},
                        exec: (editor: Ace.Editor) => {
                            mainEditorRecompile(editor);
                        }
                    });
                    this.ksyEditor = newEditor;
                    this.ksyEditorContainer = container;
                    break;
                case "genCodeViewer":
                    this.genCodeViewer = newEditor;
                    break;
                case "genCodeDebugViewer": {
                    this.genCodeDebugViewer = newEditor;
                    newEditor.commands.addCommand({
                        name: "compile", bindKey: {win: "Ctrl-Enter", mac: "Command-Enter"},
                        exec: (editor: Ace.Editor) => {
                            parseAction();
                        }
                    });
                }
            }
            return newEditor;
        });
    }

    updateKsyEditor(title: string, content: string) {
        this.ksyEditorContainer.setTitle(title);
        this.ksyEditor.setValue(content, -1);
    }

    updateReleaseAndDebugCodeTabs(debugCode: string, releaseCode: string) {
        this.genCodeViewer.setValue(releaseCode, -1);
        this.genCodeDebugViewer.setValue(debugCode, -1);
    }

    addExportedToJsonTab(title: string, json: string) {
        const options: IAceEditorComponentOptions = {
            lang: "json",
            isReadOnly: true,
            data: json
        };
        const componentName = `dynComp${this.dynCompId++}`;
        this.addAceCodeEditorTab(componentName, options);
        this.getLayoutNodeById("codeTab").addChild({type: "component", componentName, title});
    }
}

export const CurrentGoldenLayout = new GoldenLayoutUI();