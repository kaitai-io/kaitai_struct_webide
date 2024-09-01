import {FileLocationInfo} from "../Stores/AppStore";
import {fileSystemsManager} from "../v1/FileSystems/FileSystemManager";
import {YamlFileInfo} from "../DataManipulation/CompilationModule/JsImporter";
import {useAceEditorStore} from "../Stores/AceEditorStore";
import {compileGrammarAction} from "./CompileGrammar";

export const loadKsyFileAction = async (ksyFileLocation: FileLocationInfo) => {
    const content = await fileSystemsManager[ksyFileLocation.storeId].get(ksyFileLocation.filePath) as string;
    const yamlInfo: YamlFileInfo = {
        storeId: ksyFileLocation.storeId,
        filePath: ksyFileLocation.filePath,
        fileContent: content
    };

    const aceEditorStore = useAceEditorStore();
    aceEditorStore?.mainKsyEditor.setValue(yamlInfo.fileContent, -1);
    await compileGrammarAction(yamlInfo);
};