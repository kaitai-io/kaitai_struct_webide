import {useCurrentBinaryFileStore} from "../Stores/CurrentBinaryFileStore";
import {useIdeSettingsStore} from "../Stores/IdeSettingsStore";
import {KaitaiCodeWorkerApi} from "../DataManipulation/ParsingModule/KaitaiCodeWorkerApi";

export const parseAction = async () => {
    const store = useCurrentBinaryFileStore();
    const ideSettingsStore = useIdeSettingsStore();
    const {resultObject: exportedRoot, error: parseError} = await KaitaiCodeWorkerApi.parseAction(ideSettingsStore.eagerMode);
    store.updateParsedFile(exportedRoot);
};