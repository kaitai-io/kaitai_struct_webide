import GoldenLayout from "golden-layout";
import {editor, KeyCode, KeyMod} from "monaco-editor";
import IStandaloneCodeEditor = editor.IStandaloneCodeEditor;
import {DelayAction} from "../../Utils/DelayAction";
import {CreateMonacoEditorComponent, MonacoEditorOptions} from "../GoldenLayout/CreateMonacoEditorComponent";
import {mainEditorOnChange, mainEditorRecompile} from "./KsyEditorActions";


export const CreateMonacoEditorComponentKsyEditor = (container: GoldenLayout.Container, options: MonacoEditorOptions): IStandaloneCodeEditor => {
    const newEditor = CreateMonacoEditorComponent(container, options)

    const editDelay = new DelayAction(500);
    newEditor.onDidChangeModelContent((event) => {
        editDelay.do(() => mainEditorOnChange(event, newEditor.getValue()));
    });

    newEditor.addCommand(KeyMod.CtrlCmd | KeyCode.Enter, (args) => {
        mainEditorRecompile(newEditor);
    });

    return newEditor;
};