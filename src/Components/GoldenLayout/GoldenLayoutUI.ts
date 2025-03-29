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
import {CreateMonacoEditorComponent, MonacoEditorOptions} from "./CreateMonacoEditorComponent";
import {editor} from "monaco-editor";
import {CreateMonacoEditorComponentKsyEditor} from "../KsyEditor/CreateMonacoEditorComponentKsyEditor";
import {ErrorPanelManager} from "./ErrorPanelManager";
import IStandaloneCodeEditor = editor.IStandaloneCodeEditor;

export class GoldenLayoutUI {
    dynCompId = 1;

    goldenLayout: GoldenLayout;
    ksyEditor: IStandaloneCodeEditor;
    ksyEditorContainer: GoldenLayout.Container;

    genCodeViewer: IStandaloneCodeEditor;
    genCodeDebugViewer: IStandaloneCodeEditor;
    errorPanelManager: ErrorPanelManager;

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
        this.errorPanelManager = new ErrorPanelManager(this);

        this.goldenLayout.init();
    }

    getLayoutNodeById(id: string): GoldenLayout.ContentItem {
        return (<any>this.goldenLayout)._getAllContentItems().filter((x: any) => x.config.id === id || x.componentName === id)[0];
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
                    self.ksyEditor = CreateMonacoEditorComponentKsyEditor(container, options);
                    self.ksyEditorContainer = container;
                    break;
                case GL_GEN_CODE_VIEWER_ID:
                    self.genCodeViewer = CreateMonacoEditorComponent(container, options);
                    break;
                case GL_GEN_CODE_VIEWER_DEBUG_ID: {
                    self.genCodeDebugViewer = CreateMonacoEditorComponent(container, options);
                    break;
                }
                default:
                    CreateMonacoEditorComponent(container, options);
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

    handleErrorMessage(errorMessage?: string) {
        if (!errorMessage) {
            this.errorPanelManager.close();
            return;
        }
        this.errorPanelManager.setMessage(errorMessage);
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