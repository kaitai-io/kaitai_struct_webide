/**
 * DEV SCRIPT, for backing up files you already have on: https://ide.kaitai.io
 * Run this script in the dev console of `https:/ide.kaitai.io` it will download for you all the files.
 * Remember to check file names in case you were downloading the file that already exist in your `Downloads` directory.
 * Then you can put them under path: `public/Backup/{YOUR FILES GO HERE} of this project.
 * That will allow you to use `Restore old config` button in development mode to reset LocalStorage to that backup.
 * More info in file `src/GlobalActions/RestoreBackupConfigFromBackup.ts`
 *
 * */

(async () => {
    const downloadFile = (data, filename) => {
        const a = document.createElement("a");
        document.body.appendChild(a);
        a.style.display = "none";
        const blob = new Blob([data], {type: "octet/stream"});
        const url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    }

    const collectFileNames = (root) => {
        const collectedFiles = [];
        const visitNode = (node) => {
            switch (node.type) {
                case "file": {
                    collectedFiles.push(node.fn);
                    break;
                }
                case "folder": {
                    Object.entries(node.children || {})
                        .forEach(([key, child]) => visitNode(child));
                    break;
                }
            }
        }
        visitNode(root);
        return collectedFiles;
    }

    const localforage = require("localforage");
    const filesRoot = await localforage.getItem("fs_files")

    const collectedFileNames = collectFileNames(filesRoot)

    console.log(filesRoot)
    console.log(collectedFileNames)

    downloadFile(filesRoot, "_backup.json")
    for (const fileName of collectedFileNames) {
        const fileContent = await localforage.getItem(`fs_file[${fileName}]`)
        downloadFile(fileContent, fileName)
    }
})()