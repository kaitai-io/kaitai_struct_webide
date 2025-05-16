import {editor} from "monaco-editor";
import {useFileSystems} from "../FileTree/Store/FileSystemsStore";
import {FILE_SYSTEM_TYPE_LOCAL} from "../FileTree/FileSystems/LocalStorageFileSystem";
import {YamlFileInfo} from "../../DataManipulation/CompilationModule/JsImporter";
import {FILE_SYSTEM_TYPE_KAITAI} from "../FileTree/FileSystems/KaitaiFileSystem";
import {useAppStore} from "../../Stores/AppStore";
import {KaitaiCodeWorkerApi} from "../../DataManipulation/ParsingModule/KaitaiCodeWorkerApi";

export const mainEditorOnChange = async (changedEvent: editor.IModelContentChangedEvent, editorContent: string) => {
    const contentDidNotChange = changedEvent.changes.map(change => change.text).join("\n") === editorContent;
    if (contentDidNotChange) return;

    const yamlInfo = yamlInfoWithCurrentStoreStateAndNewContent(editorContent);
    switchStoreIfChangeAppearedInKaitaiStore(yamlInfo);

    await useFileSystems().addFile(yamlInfo.storeId, yamlInfo.filePath, editorContent);
    KaitaiCodeWorkerApi.setKsyYamlInfo(yamlInfo);
};

const switchStoreIfChangeAppearedInKaitaiStore = (yamlInfo: YamlFileInfo) => {
    if (yamlInfo.storeId !== FILE_SYSTEM_TYPE_KAITAI) return;
    yamlInfo.storeId = FILE_SYSTEM_TYPE_LOCAL;
};

const yamlInfoWithCurrentStoreStateAndNewContent = (content: string): YamlFileInfo => {
    const appStore = useAppStore();

    return {
        storeId: appStore.selectedKsyInfo.storeId,
        filePath: appStore.selectedKsyInfo.path,
        fileContent: content
    };
};
