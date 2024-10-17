import {useAppStore} from "../Stores/AppStore";
import {YamlFileInfo} from "../DataManipulation/CompilationModule/JsImporter";
import {compileInternalDebugAndRelease} from "./CompileGrammar";
import {parseAction} from "./ParseAction";
import {useFileSystems} from "../Components/FileTree/Store/FileSystemsStore";

import {FILE_SYSTEM_TYPE_LOCAL} from "../Components/FileTree/FileSystems/LocalStorageFileSystem";
import {FILE_SYSTEM_TYPE_KAITAI} from "../Components/FileTree/FileSystems/KaitaiFileSystem";
import {editor} from "monaco-editor";

export const mainEditorOnChange = async (change: editor.IModelContentChangedEvent, editorContent: string) => {
    const contentDidNotChange = change.changes.join("\n") === editorContent;
    if (contentDidNotChange) return;

    const yamlInfo = yamlInfoWithCurrentStoreStateAndNewContent(editorContent);
    switchStoreIfChangeAppearedInKaitaiStore(yamlInfo);

    await useFileSystems().addFile(FILE_SYSTEM_TYPE_LOCAL, yamlInfo.filePath, editorContent);
    await compileInternalDebugAndRelease(yamlInfo);
    await parseAction();
};

export const mainEditorRecompile = async (editorr: editor.IStandaloneCodeEditor) => {
    const yamlInfo = yamlInfoWithCurrentStoreStateAndNewContent(editorr.getValue());
    await compileInternalDebugAndRelease(yamlInfo);
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
