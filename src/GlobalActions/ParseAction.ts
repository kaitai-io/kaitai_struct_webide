import {useCurrentBinaryFileStore} from "../Stores/CurrentBinaryFileStore";
import {useIdeSettingsStore} from "../Stores/IdeSettingsStore";
import {codeExecutionWorkerApi} from "../DataManipulation/ParsingModule/ParseWorkerApi";

export const parseAction = async () => {
    const store = useCurrentBinaryFileStore();
    const ideSettingsStore = useIdeSettingsStore();
    const {resultObject: exportedRoot, error: parseError} = await codeExecutionWorkerApi.parseAction(ideSettingsStore.eagerMode);
    store.updateParsedFile(exportedRoot);
};