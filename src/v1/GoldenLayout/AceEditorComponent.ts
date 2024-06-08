import * as GoldenLayout from "goldenlayout";

export interface IAceEditorComponentOptions {
    lang: string;
    isReadOnly?: boolean;
    data?: string;
}

export const AceEditorComponent = (container: GoldenLayout.Container, {isReadOnly, lang, data}: IAceEditorComponentOptions) => {
    const editor = ace.edit(container.getElement().get(0));

    editor.setTheme("ace/theme/monokai");
    editor.getSession().setMode(`ace/mode/${lang}`);

    if (lang === "yaml") editor.setOption("tabSize", 2);

    editor.$blockScrolling = Infinity; // TODO: remove this line after they fix ACE not to throw warning to the console
    editor.setReadOnly(isReadOnly);

    if (data) editor.setValue(data, -1);
    return editor;
};