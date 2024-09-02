import {useAppStore} from "../Stores/AppStore";
import {Ace} from "ace-builds";
import {YamlFileInfo} from "../DataManipulation/CompilationModule/JsImporter";
import {compileGrammarAction} from "./CompileGrammar";
import {parseAction} from "./ParseAction";
import {fileSystemsManager} from "../v1/FileSystems/FileSystemManager";
import {FILE_SYSTEM_TYPE_KAITAI, FILE_SYSTEM_TYPE_LOCAL} from "../v1/FileSystems/FileSystemsTypes";

export const mainEditorOnChange = async (change: Ace.Delta, editorContent: string) => {
    const contentDidNotChange = change.lines.join("\n") === editorContent;
    if (contentDidNotChange) return;

    const yamlInfo = yamlInfoWithCurrentStoreStateAndNewContent(editorContent);
    switchStoreIfChangeAppearedInKaitaiStore(yamlInfo);

    await fileSystemsManager.local.put(yamlInfo.filePath, editorContent);
    await compileGrammarAction(yamlInfo);
    await parseAction();
};

export const mainEditorRecompile = async (editor: Ace.Editor) => {
    const yamlInfo = yamlInfoWithCurrentStoreStateAndNewContent(editor.getValue());
    await compileGrammarAction(yamlInfo);
    await parseAction();
};

const switchStoreIfChangeAppearedInKaitaiStore = (yamlInfo: YamlFileInfo) => {
    if (yamlInfo.storeId !== FILE_SYSTEM_TYPE_KAITAI) return;
    yamlInfo.storeId = FILE_SYSTEM_TYPE_LOCAL;
};

const yamlInfoWithCurrentStoreStateAndNewContent = (content: string): YamlFileInfo => {
    const appStore = useAppStore();

    return {
        storeId: appStore.selectedKsyInfo.storeId,
        filePath: appStore.selectedKsyInfo.filePath,
        fileContent: content
    };
};
