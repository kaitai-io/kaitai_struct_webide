import {useIdeSettingsStore} from "../Stores/IdeSettingsStore";
import {KaitaiCodeWorkerApi} from "../DataManipulation/ParsingModule/KaitaiCodeWorkerApi";

export const parseAction = () => {
    const ideSettingsStore = useIdeSettingsStore();
    KaitaiCodeWorkerApi.parseAction(ideSettingsStore.eagerMode);
};