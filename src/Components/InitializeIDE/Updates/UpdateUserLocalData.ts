import {UpgradeToV1} from "./V1/UpgradeToV1";
import {useInitializeIDEStore} from "../Store/InitializeIDEStore";
import {SleepFor} from "../../../Utils/SleepFor";

const schemaVersions = [
    {version: 1, upgradeScript: UpgradeToV1},
];
const LATEST_SCHEMA_VERSION = 1;

export const UpdateUserLocalData = async () => {
    let savedVersion: number = JSON.parse(localStorage.getItem("userLocalDataVersion")) || 0;
    if (savedVersion === LATEST_SCHEMA_VERSION) return;

    const store = useInitializeIDEStore();
    store.setMessage("STARTED SCHEMA UPGRADE");
    await SleepFor(100);

    for (const schema of schemaVersions) {
        if (savedVersion < schema.version) {
            store.setMessage(`UPGRADING SCHEMA FROM VERSION ${savedVersion} TO ${schema.version}`);
            await SleepFor(200);
            await schema.upgradeScript();
            localStorage.setItem("userLocalDataVersion", JSON.stringify(schema.version));
            savedVersion = schema.version;
        }
    }
    store.setMessage("SCHEMA UPGRADE DONE");
    await SleepFor(100);
};