import GoldenLayout from "golden-layout";
import {editor} from "monaco-editor";
import IStandaloneCodeEditor = editor.IStandaloneCodeEditor;

export interface MonacoEditorOptions {
    lang: string;
    isReadOnly?: boolean;
    data?: string;
}

self.MonacoEnvironment = {
    getWorkerUrl: function (moduleId, label) {
        if (label === "json") {
            return "./json.worker.js";
        }
        if (label === "css" || label === "scss" || label === "less") {
            return "./css.worker.js";
        }
        if (label === "html" || label === "handlebars" || label === "razor") {
            return "./html.worker.js";
        }
        if (label === "typescript" || label === "javascript") {
            return "./ts.worker.js";
        }
        if (label === "yaml") {
            return "./yaml.worker.js";
        }
        return "./editor.worker.js";
    }
};

export const CreateMonacoEditorComponent = (container: GoldenLayout.Container, {isReadOnly, lang, data}: MonacoEditorOptions): IStandaloneCodeEditor => {
    return editor.create(container.getElement().get(0), {
        value: data,
        theme: "vs-dark",
        language: lang,
        tabSize: 2,
        automaticLayout: true,
        readOnly: isReadOnly
    });
};