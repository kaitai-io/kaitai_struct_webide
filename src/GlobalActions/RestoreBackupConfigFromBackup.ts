import {FileActionsWrapper} from "../Utils/Files/FileActionsWrapper";
import {LocalForageForLocalStorageWrapper} from "../Components/FileTree/Utils/LocalForageForLocalStorageWrapper";
import {FileSystemItem} from "../Components/FileTree/FileSystemsTypes";
import {FileSystemFilesCollector} from "../Components/FileTree/FileSystemVisitors/FileSystemFilesCollector";

/**
 * This is debug Action, you can add your config(value of `fs_files` key from localForage) in `public/Backup/backup.json` folder;
 * Then put all the files also in that location: `public/Backup/{FILE_NAME}`
 * Then just press the `Restore old config` button on Info Panel view to start a restore.
 * THIS ACTION CLEARS THE WHOLE LOCAL STORE!
 */
export const RestoreBackupConfigFromBackup = async () => {
    console.log("[RestoreBackupConfigFromBackup]: Restore action started.");
    const backupConfig: FileSystemItem = await fetch("Backup/_backup.json").then(resp => resp.json());
    if (!backupConfig) {
        console.log("[RestoreBackupConfigFromBackup]: Backup config not found, restore action stopped");
        return;
    }
    const filesToRestore = FileSystemFilesCollector.collectFileNames(backupConfig);

    console.log("[RestoreBackupConfigFromBackup]: Config found.", backupConfig);
    console.log(`[RestoreBackupConfigFromBackup]: Found ${filesToRestore.length} files to restore.`);
    await LocalForageForLocalStorageWrapper.clear();
    console.log("[RestoreBackupConfigFromBackup]: Old config erased.");
    await LocalForageForLocalStorageWrapper.saveFsItem("fs_files", backupConfig);
    console.log("[RestoreBackupConfigFromBackup]: Backup file tree saved under fs_files");

    for (const fileName of filesToRestore) {
        const fileContent = await FileActionsWrapper.fetchFileFromServer(`OldFiles/${fileName}`);
        await LocalForageForLocalStorageWrapper.saveFile(`fs_file[${fileName}]`, fileContent);
        console.log(`[RestoreBackupConfigFromBackup]: File restored and saved: ${fileName}`);
    }
    console.log("[RestoreBackupConfigFromBackup]: Restore action completed");
};