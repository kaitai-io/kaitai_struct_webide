import {FileLocationInfo} from "../Stores/AppStore";
import {YamlFileInfo} from "../DataManipulation/CompilationModule/JsImporter";
import {compileGrammarAction} from "./CompileGrammar";
import {useFileSystems} from "../Components/FileTree/Store/FileSystemsStore";
import {CurrentGoldenLayout} from "../v1/GoldenLayout/GoldenLayoutUI";

export const loadKsyFileAction = async (ksyFileLocation: FileLocationInfo) => {

    const content = await useFileSystems().getFile(ksyFileLocation.storeId, ksyFileLocation.filePath) as string;
    const yamlInfo: YamlFileInfo = {
        storeId: ksyFileLocation.storeId,
        filePath: ksyFileLocation.filePath,
        fileContent: content
    };

    CurrentGoldenLayout.updateKsyEditor(yamlInfo.filePath, yamlInfo.fileContent);
    await compileGrammarAction(yamlInfo);
};