import {expect} from "chai";
import {LocalStorageFileSystem} from "../../../../src/Components/FileTree/FileSystems/LocalStorageFileSystem.js";
import {FileSystemInMemoryDAO} from "../../../../src/Components/FileTree/Database/FileSystemInMemoryDAO.js";
import {
    FileSystemCommandLineTreeMapper
} from "../../../../src/Components/FileTree/FileSystemVisitors/FileSystemCommandLineTreeMapper.js";

const createEmptyFileSystem = () => {
    const root = {
        name: "TEST_DB",
        type: "root",
        children: {},
        storeId: "TEST_DB"
    }
    const dao = new FileSystemInMemoryDAO({"TEST_DB": root});
    const fileSystem = new LocalStorageFileSystem(dao, root, "TEST_DB");
    return {root, dao, fileSystem}
}

const createFileSystem = async (pathInfos) => {
    const fileSystem = createEmptyFileSystem();
    await Promise.all(pathInfos.map(pathInfo => {
        if (pathInfo.hasOwnProperty("content")) {
            return fileSystem.fileSystem.put(pathInfo.path, pathInfo.content)
        } else {
            return fileSystem.fileSystem.createDirectory(pathInfo.path)

        }
    }))
    return fileSystem
}

const logFileSystem = (tag, fileSystem) => {
    console.log(`[${tag.toUpperCase()}]:`)
    console.log(FileSystemCommandLineTreeMapper.mapToCommandLineView(fileSystem))
}

const verifyFileContents = async (fileSystem, fileKey, expectedContent) => {
    const fileContent = await fileSystem.get(fileKey);
    console.log(`Verifying file content: '${fileKey}', to be: '${expectedContent}'...`)
    expect(fileContent).to.be.eq(expectedContent);
}


const verifyFileDoesNotExist = async (fileSystem, fileKey) => {
    try {
        await fileSystem.get(fileKey);
    } catch (error) {
        expect(error).to.be.an('error');
        expect(error.name).to.be.equal('Error');
        expect(error.message).to.be.equal(`File not found: ${fileKey}`);
    }
}

describe("Testing creating files.", () => {
    it("File can be added to empty store", async () => {
        const {fileSystem, dao} = createEmptyFileSystem();
        logFileSystem("BEFORE", fileSystem)

        await fileSystem.put("TEST.KSY", "TEST_CONTENT");

        logFileSystem("AFTER", fileSystem)
        await verifyFileContents(fileSystem, "TEST.KSY", "TEST_CONTENT");
    });

    it("File can be added to existing directory", async () => {
        const {fileSystem, dao} = createEmptyFileSystem();
        await fileSystem.createDirectory("A");

        logFileSystem("BEFORE", fileSystem)

        await fileSystem.put("A/TEST.KSY", "TEST_CONTENT");

        logFileSystem("AFTER", fileSystem)
        await verifyFileContents(fileSystem, "A/TEST.KSY", "TEST_CONTENT");
    });

    it("File can be added using longer non existing path", async () => {
        const {fileSystem, dao} = createEmptyFileSystem();
        logFileSystem("BEFORE", fileSystem)

        await fileSystem.put("A/B/C/D/E/TEST.KSY", "TEST_CONTENT");

        logFileSystem("AFTER", fileSystem)
        await verifyFileContents(fileSystem, "A/B/C/D/E/TEST.KSY", "TEST_CONTENT");
    });

    it("Creating same file twice overwrites contents of previous one", async () => {
        const {fileSystem, dao} = createEmptyFileSystem();
        await fileSystem.put("TEST.KSY", "TEST_CONTENT");
        logFileSystem("BEFORE", fileSystem)

        await verifyFileContents(fileSystem, "TEST.KSY", "TEST_CONTENT");
        await fileSystem.put("TEST.KSY", "OVERWRITTEN");
        logFileSystem("AFTER", fileSystem)
        await verifyFileContents(fileSystem, "TEST.KSY", "OVERWRITTEN");
    });
});

describe("Test getting files.", () => {
    it("Can get files", async () => {
        const pathInfos = [
            {path: "TEST.KSY", content: "TEST_CONTENT"},
            {path: "A/TEST1.KSY", content: "TEST_CONTENT_1"},
            {path: "D/E/F/TEST2.KSY", content: "TEST_CONTENT_2"},
            {path: "A/B/E/TEST3.KSY", content: "TEST_CONTENT_3"},
        ]
        const {fileSystem} = await createFileSystem(pathInfos)

        logFileSystem("BEFORE", fileSystem)

        await Promise.all(pathInfos.map(pathInfo => {
            return verifyFileContents(fileSystem, pathInfo.path, pathInfo.content);
        }))
    });

    it("Two files with same name in different location can have different content", async () => {
        const pathInfos = [
            {path: "TEST.KSY", content: "TEST_CONTENT"},
            {path: "A/TEST.KSY", content: "TEST_CONTENT_1"}
        ]
        const {fileSystem} = await createFileSystem(pathInfos)

        logFileSystem("BEFORE", fileSystem)

        await Promise.all(pathInfos.map(pathInfo => {
            return verifyFileContents(fileSystem, pathInfo.path, pathInfo.content);
        }))
    });

    it("Non existing file throws error", async () => {
        const {fileSystem} = createEmptyFileSystem();
        await verifyFileDoesNotExist(fileSystem, "TEST.KSY")
    });
});


describe("Test moving files around", () => {
    it("Move file from one catalogue to other", async () => {
        const {fileSystem, dao} = createEmptyFileSystem();
        await fileSystem.put("A/TEST.KSY", "TEST_CONTENT");
        await fileSystem.createDirectory("B");
        logFileSystem("BEFORE", fileSystem)

        await fileSystem.move("A/TEST.KSY", "B/TEST.KSY");
        logFileSystem("AFTER", fileSystem)

        await verifyFileContents(fileSystem, "B/TEST.KSY", "TEST_CONTENT");
    });

    it("Moving file to non existing catalogue will create it", async () => {
        const {fileSystem, dao} = createEmptyFileSystem();
        await fileSystem.put("A/TEST.KSY", "TEST_CONTENT");
        logFileSystem("BEFORE", fileSystem)

        await fileSystem.move("A/TEST.KSY", "B/TEST.KSY");
        logFileSystem("AFTER", fileSystem)

        await verifyFileContents(fileSystem, "B/TEST.KSY", "TEST_CONTENT");
    });

    it("Move file from catalogue to root", async () => {
        const {fileSystem, dao} = createEmptyFileSystem();
        await fileSystem.put("A/TEST.KSY", "TEST_CONTENT");
        logFileSystem("BEFORE", fileSystem)

        await fileSystem.move("A/TEST.KSY", "TEST.KSY");
        logFileSystem("AFTER", fileSystem)

        await verifyFileContents(fileSystem, "TEST.KSY", "TEST_CONTENT");
    });

    it("Move file from root to catalogue", async () => {
        const {fileSystem, dao} = createEmptyFileSystem();
        await fileSystem.put("TEST.KSY", "TEST_CONTENT");
        logFileSystem("BEFORE", fileSystem)

        await fileSystem.move("TEST.KSY", "A/TEST.KSY");
        logFileSystem("AFTER", fileSystem)

        await verifyFileContents(fileSystem, "A/TEST.KSY", "TEST_CONTENT");
        expect(dao.getFileNames().length).to.be.eq(1);
        expect(dao.getFileNames()).to.contain("TEST_DB:A/TEST.KSY");
    });


    it("Moving file over another one will overwrite it", async () => {
        const {fileSystem, dao} = createEmptyFileSystem();
        await fileSystem.put("A/TEST.KSY", "TEST_CONTENT_A");
        await fileSystem.put("B/TEST.KSY", "TEST_CONTENT_B");

        logFileSystem("BEFORE", fileSystem)
        await verifyFileContents(fileSystem, "A/TEST.KSY", "TEST_CONTENT_A");
        await verifyFileContents(fileSystem, "B/TEST.KSY", "TEST_CONTENT_B");

        await fileSystem.move("A/TEST.KSY", "B/TEST.KSY");
        logFileSystem("AFTER", fileSystem)

        await verifyFileContents(fileSystem, "B/TEST.KSY", "TEST_CONTENT_A");
        expect(dao.getFileNames().length).to.be.eq(1);
        expect(dao.getFileNames()).to.contain("TEST_DB:B/TEST.KSY");
    });
});

describe("Test deleting files", () => {
    it("File in root gets deleted", async () => {
        const {fileSystem, dao} = createEmptyFileSystem();
        await fileSystem.put("TEST.KSY", "TEST_CONTENT");
        logFileSystem("BEFORE", fileSystem)

        await fileSystem.delete("TEST.KSY");
        logFileSystem("AFTER", fileSystem)

        await verifyFileDoesNotExist(fileSystem, "TEST.KSY")
        expect(dao.getFileNames().length).to.be.eq(0);
    });

    it("Delete directory removes that directory and files in DB", async () => {
        const {fileSystem, dao} = createEmptyFileSystem();
        await fileSystem.put("A/B/CTEST.KSY", "TEST_CONTENT");
        await fileSystem.put("A/TEST.KSY", "TEST_CONTENT");
        await fileSystem.put("TEST2.KSY", "TEST_CONTENT");
        await fileSystem.put("A/B/TEST.KSY", "TEST_CONTENT");
        await fileSystem.put("D/E/FTEST.KSY", "TEST_CONTENT");
        await fileSystem.put("TEST.KSY", "TEST_CONTENT");
        logFileSystem("BEFORE", fileSystem)
        expect(dao.getFileNames().length).to.be.eq(6);

        await fileSystem.delete("A");
        logFileSystem("AFTER", fileSystem)

        await verifyFileDoesNotExist(fileSystem, "A/B/CTEST.KSY")
        await verifyFileDoesNotExist(fileSystem, "A/TEST.KSY")
        await verifyFileDoesNotExist(fileSystem, "A/B/TEST.KSY")
        await verifyFileContents(fileSystem, "TEST2.KSY", "TEST_CONTENT")
        await verifyFileContents(fileSystem, "D/E/FTEST.KSY", "TEST_CONTENT")
        await verifyFileContents(fileSystem, "TEST.KSY", "TEST_CONTENT")
        expect(dao.getFileNames().length).to.be.eq(3);
    });

    it("Delete on Root node removes all files and clears up children", async () => {
        const {fileSystem, dao} = createEmptyFileSystem();
        await fileSystem.put("A/B/CTEST.KSY", "TEST_CONTENT");
        await fileSystem.put("A/TEST.KSY", "TEST_CONTENT");
        await fileSystem.put("TEST2.KSY", "TEST_CONTENT");
        await fileSystem.put("A/B/TEST.KSY", "TEST_CONTENT");
        await fileSystem.put("D/E/FTEST.KSY", "TEST_CONTENT");
        await fileSystem.put("TEST.KSY", "TEST_CONTENT");
        logFileSystem("BEFORE", fileSystem)

        await fileSystem.delete("");
        logFileSystem("AFTER", fileSystem)

        await verifyFileDoesNotExist(fileSystem, "TEST.KSY")
        expect(dao.getFileNames().length).to.be.eq(0);
    });
});