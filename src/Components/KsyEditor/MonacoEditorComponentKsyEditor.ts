import GoldenLayout from "golden-layout";
import {editor, KeyCode, KeyMod} from "monaco-editor";
import IStandaloneCodeEditor = editor.IStandaloneCodeEditor;
import {DelayAction} from "../../Utils/DelayAction";
import {MonacoEditorComponent, MonacoEditorOptions} from "../GoldenLayout/MonacoEditorComponent";
import {mainEditorOnChange, mainEditorRecompile} from "./KsyEditorActions";


export const MonacoEditorComponentKsyEditor = (container: GoldenLayout.Container, options: MonacoEditorOptions): IStandaloneCodeEditor => {
    const newEditor = MonacoEditorComponent(container, options)

    const editDelay = new DelayAction(500);
    newEditor.onDidChangeModelContent((event) => {
        editDelay.do(() => mainEditorOnChange(event, newEditor.getValue()));
    });

    newEditor.addCommand(KeyMod.CtrlCmd | KeyCode.Enter, (args) => {
        mainEditorRecompile(newEditor);
    });

    return newEditor;
};