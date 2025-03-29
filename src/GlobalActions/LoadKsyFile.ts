import {YamlFileInfo} from "../DataManipulation/CompilationModule/JsImporter";
import {compileInternalDebugAndRelease} from "./CompileGrammar";
import {useFileSystems} from "../Components/FileTree/Store/FileSystemsStore";
import {CurrentGoldenLayout} from "../Components/GoldenLayout/GoldenLayoutUI";
import {useCurrentBinaryFileStore} from "../Stores/CurrentBinaryFileStore";
import {FileSystemPath} from "../Components/FileTree/FileSystemsTypes";

export const loadKsyFileAction = async (ksyFileLocation: FileSystemPath) => {
    const content = await useFileSystems().getFile(ksyFileLocation.storeId, ksyFileLocation.path) as string;
    const yamlInfo: YamlFileInfo = {
        storeId: ksyFileLocation.storeId,
        filePath: ksyFileLocation.path,
        fileContent: content
    };

    CurrentGoldenLayout.updateKsyEditor(yamlInfo.filePath, yamlInfo.fileContent);
    const store = useCurrentBinaryFileStore();
    store.updateParsedFile(undefined, undefined);
    return await compileInternalDebugAndRelease(yamlInfo);
};