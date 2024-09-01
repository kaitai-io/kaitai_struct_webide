import {defineStore} from "pinia";
import {LocalStorageApi} from "../../v1/utils/LocalStorageApi";

export interface WelcomeModalStore {
    shouldShowModal: boolean;
    doNotShowAgain: boolean;
}

const serializeConfigToLocalStorage = (store: WelcomeModalStore) => {
    LocalStorageApi.storeDoNotShowWelcomeFlag(store.doNotShowAgain);
};

export const useWelcomeModalStore = defineStore("WelcomeModalStore", {
    state: (): WelcomeModalStore => {
        const doNotShowAgain = LocalStorageApi.getDoNotShowWelcomeFlag();
        return {
            shouldShowModal: doNotShowAgain,
            doNotShowAgain: doNotShowAgain
        };
    },
    actions: {
        open() {
            this.shouldShowModal = true;
        },
        close() {
            this.shouldShowModal = false;
        },
        closeWithDoNotShow() {
            this.shouldShowModal = false;
            this.doNotShowAgain = true;
            serializeConfigToLocalStorage(this);
        },
    }
});
