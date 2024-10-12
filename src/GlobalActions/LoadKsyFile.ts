import {FileLocationInfo} from "../Stores/AppStore";
import {YamlFileInfo} from "../DataManipulation/CompilationModule/JsImporter";
import {useAceEditorStore} from "../Stores/AceEditorStore";
import {compileGrammarAction} from "./CompileGrammar";
import {useFileSystems} from "../Components/FileTree/Store/FileSystemsStore";

export const loadKsyFileAction = async (ksyFileLocation: FileLocationInfo) => {

    const content = await useFileSystems().getFile(ksyFileLocation.storeId, ksyFileLocation.filePath) as string;
    const yamlInfo: YamlFileInfo = {
        storeId: ksyFileLocation.storeId,
        filePath: ksyFileLocation.filePath,
        fileContent: content
    };

    const aceEditorStore = useAceEditorStore();
    aceEditorStore?.mainKsyEditor.setValue(yamlInfo.fileContent, -1);
    await compileGrammarAction(yamlInfo);
};