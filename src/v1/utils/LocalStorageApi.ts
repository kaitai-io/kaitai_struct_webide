import {CurrentBinaryFile} from "../../Stores/CurrentBinaryFileStore";
import {IdeSettings} from "../../Stores/IdeSettingsStore";
interface LocalStorageSelection {
    fileName: string;
    start: number;
    end: number;
    pivot: number;
}

export class LocalStorageApi {
    public static getCurrentBinaryFileStoreState = (): LocalStorageSelection | undefined => {
        const value = localStorage.getItem("selection");
        return value !== null ? JSON.parse(value) : null;
    }

    public static storeCurrentBinaryFileStoreState = (store: CurrentBinaryFile): void => {
        const state: LocalStorageSelection = {
            fileName: store.fileName,
            start: store.selectionStart,
            end: store.selectionEnd,
            pivot: store.selectionPivot,
        };
        localStorage.setItem("selection", JSON.stringify(state));
    }

    public static getIdeSettings = (): IdeSettings | undefined => {
        const value = localStorage.getItem("ideSettings");
        return value !== null ? JSON.parse(value) : null;
    }

    public static storeIdeSettings = (store: IdeSettings): void => {
        localStorage.setItem("ideSettings", JSON.stringify(store));
    }

    public static getDoNotShowWelcomeFlag = (): boolean => {
        return localStorage.getItem("doNotShowWelcome") !== "true";
    }

    public static storeDoNotShowWelcomeFlag = (newValue: boolean): void => {
        localStorage.setItem("doNotShowWelcome", newValue ? "true" : "false");
    }

}
