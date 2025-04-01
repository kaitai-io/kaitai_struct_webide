import {YamlFileInfo} from "../DataManipulation/CompilationModule/JsImporter";
import {useFileSystems} from "../Components/FileTree/Store/FileSystemsStore";
import {useCurrentBinaryFileStore} from "../Stores/CurrentBinaryFileStore";
import {FileSystemPath} from "../Components/FileTree/FileSystemsTypes";
import {useKsyEditorStore} from "../Components/KsyEditor/Store/KsyEditorStore";
import {GL_KSY_EDITOR_ID} from "../Components/Dockview/DockviewerConfig";
import {useDockviewStore} from "../Components/Dockview/Store/DockviewStore";
import {KaitaiCodeWorkerApi} from "../DataManipulation/ParsingModule/KaitaiCodeWorkerApi";

export const loadKsyFileAction = async (ksyFileLocation: FileSystemPath) => {
    const content = await useFileSystems().getFile(ksyFileLocation.storeId, ksyFileLocation.path) as string;
    const yamlInfo: YamlFileInfo = {
        storeId: ksyFileLocation.storeId,
        filePath: ksyFileLocation.path,
        fileContent: content
    };

    useDockviewStore().setTitle(GL_KSY_EDITOR_ID, yamlInfo.filePath);
    useKsyEditorStore().setValue(GL_KSY_EDITOR_ID, yamlInfo.fileContent);
    const store = useCurrentBinaryFileStore();
    store.updateParsedFile(undefined, undefined);

    KaitaiCodeWorkerApi.setKsyYamlInfo(yamlInfo);

};