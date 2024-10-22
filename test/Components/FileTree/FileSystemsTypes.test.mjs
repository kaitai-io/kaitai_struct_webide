import {FileSystemPath} from "../../../src/Components/FileTree/FileSystemsTypes";
import {expect} from "chai";

const TEST_STORE_1 = "TEST";
const TEST_STORE_2 = "TEST_2";
describe("Testing behaviour of nesting paths", () => {
    it("Path A/B/C is nested in A/B/C/D/E", () => {
        const pathABC = FileSystemPath.of(TEST_STORE_1, "A/B/C");
        const pathABCDE = FileSystemPath.of(TEST_STORE_1, "A/B/C/D/E");
        const result = pathABC.isNestedIn(pathABCDE);
        expect(result).to.be.true;
    });

    it("Path A/B/C is nested in A/B/C", () => {
        const pathABC = FileSystemPath.of(TEST_STORE_1, "A/B/C");
        const result = pathABC.isNestedIn(pathABC);
        expect(result).to.be.true;
    });

    it("Path A/B/C is nested in A/B/C even when paths are different objects", () => {
        const pathABC_1 = FileSystemPath.of(TEST_STORE_1, "A/B/C");
        const pathABC_2 = FileSystemPath.of(TEST_STORE_1, "A/B/C");
        const result = pathABC_1.isNestedIn(pathABC_2);
        expect(result).to.be.true;
    });

    it("Path A/B/C is nested in A/B/C even when paths are different objects, and usage is switched", () => {
        const pathABC_1 = FileSystemPath.of(TEST_STORE_1, "A/B/C");
        const pathABC_2 = FileSystemPath.of(TEST_STORE_1, "A/B/C");
        const result1 = pathABC_1.isNestedIn(pathABC_2);
        const result2 = pathABC_2.isNestedIn(pathABC_1);
        expect(result1).to.be.true;
        expect(result2).to.be.true;
    });

    it("Path A/B/C is not nested in A/B", () => {
        const pathABC = FileSystemPath.of(TEST_STORE_1, "A/B/C");
        const pathAB = FileSystemPath.of(TEST_STORE_1, "A/B");
        const result = pathABC.isNestedIn(pathAB);
        expect(result).to.be.false;
    });

    it("Path A/B/C/D/E is not nested in A/B/C", () => {
        const pathABC = FileSystemPath.of(TEST_STORE_1, "A/B/C");
        const pathABCDE = FileSystemPath.of(TEST_STORE_1, "A/B/C/D/E");
        const result = pathABCDE.isNestedIn(pathABC);
        expect(result).to.be.false;
    });

    it("Path A/B/C is not nested in path from different store", () => {
        const path1 = FileSystemPath.of(TEST_STORE_1, "A/B/C");
        const path2 = FileSystemPath.of(TEST_STORE_2, "A/B/C");
        const result = path1.isNestedIn(path2);
        expect(result).to.be.false;
    });
});