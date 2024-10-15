import {FileLocationInfo} from "../Stores/AppStore";
import {YamlFileInfo} from "../DataManipulation/CompilationModule/JsImporter";
import {compileInternalDebugAndRelease} from "./CompileGrammar";
import {useFileSystems} from "../Components/FileTree/Store/FileSystemsStore";
import {CurrentGoldenLayout} from "../v1/GoldenLayout/GoldenLayoutUI";
import {useCurrentBinaryFileStore} from "../Stores/CurrentBinaryFileStore";

export const loadKsyFileAction = async (ksyFileLocation: FileLocationInfo) => {
    const content = await useFileSystems().getFile(ksyFileLocation.storeId, ksyFileLocation.filePath) as string;
    const yamlInfo: YamlFileInfo = {
        storeId: ksyFileLocation.storeId,
        filePath: ksyFileLocation.filePath,
        fileContent: content
    };

    CurrentGoldenLayout.updateKsyEditor(yamlInfo.filePath, yamlInfo.fileContent);
    const store = useCurrentBinaryFileStore();
    store.updateParsedFile(undefined);
    await compileInternalDebugAndRelease(yamlInfo);
};