import {FileActionsWrapper} from "../Utils/Files/FileActionsWrapper";
import {LocalForageForLocalStorageWrapper} from "../Components/FileTree/Utils/LocalForageForLocalStorageWrapper";
import {FileSystemItem} from "../Components/FileTree/FileSystemsTypes";
import {FileSystemFilesCollector} from "../Components/FileTree/FileSystemVisitors/FileSystemFilesCollector";

/**
 * THIS ACTION CLEANS AND REPLACES THE WHOLE LOCAL STORE!
 * To create a backup check instructions in `src/Utils/GetBackupFromOfficialKaitaiIDE.js`
 *
 * This is debug Action, you can add your config(value of `fs_files` key from localForage) in `public/Backup/_backup.json` folder;
 * Then put all the files also in that location: `public/Backup/{FILE_NAME}`
 * It needs to be a FLAT structure - exactly how LocalStorage is working now!
 * Then just press the `Restore old config` button on Info Panel view to start a restore.
 * Once it's done just refresh the page to see the changes.
 *
 * Your `public/Backup` folder might look like this:
 * > _backup.json
 * > some_grammar_file.ksy
 * > some_other_grammar.ksy
 * > someBinaryFile.png
 * > ...
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
        const fileContent = await FileActionsWrapper.fetchFileFromServer(`Backup/${fileName}`);
        await LocalForageForLocalStorageWrapper.saveFile(`fs_file[${fileName}]`, fileContent);
        console.log(`[RestoreBackupConfigFromBackup]: File restored and saved: ${fileName}`);
    }
    console.log("[RestoreBackupConfigFromBackup]: Restore action completed");
};