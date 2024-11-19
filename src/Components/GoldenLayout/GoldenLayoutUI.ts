import {
    GL_BINARY_FILE_TAB_ID,
    GL_CODE_STACK_ID,
    GL_CONVERTER_PANEL_ID,
    GL_FILE_TREE_ID,
    GL_GEN_CODE_VIEWER_DEBUG_ID,
    GL_GEN_CODE_VIEWER_ID,
    GL_HEX_VIEWER_ID,
    GL_INFO_PANEL_ID,
    GL_KSY_EDITOR_ID,
    GL_PARSED_DATA_TREE_ID,
    GoldenLayoutUIConfig
} from "./GoldenLayoutUIConfig";

import GoldenLayout from "golden-layout";
import {MonacoEditorComponent, MonacoEditorOptions} from "./MonacoEditorComponent";
import {editor} from "monaco-editor";
import IStandaloneCodeEditor = editor.IStandaloneCodeEditor;
import {MonacoEditorComponentKsyEditor} from "../KsyEditor/MonacoEditorComponentKsyEditor";

export class GoldenLayoutUI {
    dynCompId = 1;

    goldenLayout: GoldenLayout;
    ksyEditor: IStandaloneCodeEditor;
    ksyEditorContainer: GoldenLayout.Container;

    genCodeViewer: IStandaloneCodeEditor;
    genCodeDebugViewer: IStandaloneCodeEditor;
    errorPanel: GoldenLayout.Container;

    public init() {
        this.goldenLayout = new GoldenLayout(GoldenLayoutUIConfig);

        this.addMonacoCodeEditorTab(GL_KSY_EDITOR_ID, {lang: "yaml"});
        this.addMonacoCodeEditorTab(GL_GEN_CODE_VIEWER_ID, {lang: "javascript", isReadOnly: true});
        this.addMonacoCodeEditorTab(GL_GEN_CODE_VIEWER_DEBUG_ID, {lang: "javascript"});

        this.addExistingDiv(GL_HEX_VIEWER_ID);
        this.addExistingDiv(GL_PARSED_DATA_TREE_ID);
        this.addExistingDiv(GL_FILE_TREE_ID);
        this.addExistingDiv(GL_CONVERTER_PANEL_ID);
        this.addExistingDiv(GL_INFO_PANEL_ID);

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

    addExistingDiv(name: string) {
        this.goldenLayout.registerComponent(name, function (container: GoldenLayout.Container, componentState: any) {
            const cont = $(`#${name}`).appendTo(container.getElement());
            $(() => cont.show());
        });
    }

    addMonacoCodeEditorTab(name: string, options: MonacoEditorOptions) {
        const self = this;
        this.goldenLayout.registerComponent(name, function (container: GoldenLayout.Container, componentState: any) {
            container.getElement().attr("id", name);
            switch (name) {
                case GL_KSY_EDITOR_ID:
                    self.ksyEditor = MonacoEditorComponentKsyEditor(container, options);
                    self.ksyEditorContainer = container;
                    break;
                case GL_GEN_CODE_VIEWER_ID:
                    self.genCodeViewer = MonacoEditorComponent(container, options);
                    break;
                case GL_GEN_CODE_VIEWER_DEBUG_ID: {
                    self.genCodeDebugViewer = MonacoEditorComponent(container, options);
                }
            }
        });
    }

    updateKsyEditor(title: string, content: string) {
        this.ksyEditorContainer.setTitle(title);
        this.ksyEditor.setValue(content);
    }

    updateHexViewerTitle(title: string) {
        this.getLayoutNodeById(GL_BINARY_FILE_TAB_ID).setTitle(title);
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
        this.getLayoutNodeById(GL_CODE_STACK_ID).addChild({type: "component", componentName, title});
    }
}

export const CurrentGoldenLayout = new GoldenLayoutUI();