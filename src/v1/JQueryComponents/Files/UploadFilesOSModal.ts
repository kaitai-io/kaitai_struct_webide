import {FileActionsWrapper} from "../../utils/Files/FileActionsWrapper";
import {IFileProcessCallback} from "../../utils/Files/Types";

export const openUploadFilesOperatingSystemModal = (callback: IFileProcessCallback) => {
    const onChange = (event: Event) => FileActionsWrapper.processFilesFromInputOnChangeEvent(event, callback);

    $(`<input type="file" multiple />`)
        .on("change", onChange)
        .click();
};