import {useAppStore} from "../Stores/AppStore";
import {Ace} from "ace-builds";
import {YamlFileInfo} from "../DataManipulation/CompilationModule/JsImporter";
import {compileGrammarAction} from "./CompileGrammar";
import {parseAction} from "./ParseAction";
import {fileSystemsManager} from "../v1/FileSystems/FileSystemManager";
import {FILE_SYSTEM_TYPE_KAITAI} from "../v1/FileSystems/FileSystemsTypes";

export const mainEditorOnChange = async (change: Ace.Delta, editorContent: string) => {
    const contentDidNotChange = change.lines.join("\n") === editorContent;
    if (contentDidNotChange) return;

    const appStore = useAppStore();
    const yamlInfo: YamlFileInfo = {
        storeId: appStore.selectedKsyInfo.storeId,
        filePath: appStore.selectedKsyInfo.filePath,
        fileContent: editorContent
    };
    if (appStore.selectedKsyInfo.storeId === FILE_SYSTEM_TYPE_KAITAI) {
        // appStore.updateSelectedKsyFile();
    }
    await fileSystemsManager.local.put(yamlInfo.filePath, editorContent);
    await compileGrammarAction(yamlInfo);
    await parseAction();
};

export const mainEditorRecompile = async (editor: Ace.Editor) => {
    const appStore = useAppStore();
    const editorValue = editor.getValue();

    const yamlInfo: YamlFileInfo = {
        storeId: appStore.selectedKsyInfo.storeId,
        filePath: appStore.selectedKsyInfo.filePath,
        fileContent: editorValue
    };
    compileGrammarAction(yamlInfo);
};