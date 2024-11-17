import fs from "node:fs";
import {EvaluatedCodeScope} from "../../../../src/DataManipulation/ParsingModule/CodeExecution/EvaluatedCodeScope.js";
import {
    mapObjectToExportedValue
} from "../../../../src/DataManipulation/ExportedValueMappers/ObjectToIExportedValueMapper.js";
import {CompilerService} from "../../../../src/DataManipulation/CompilationModule/CompilerService.js";
import {expect} from "chai";
import {ObjectType} from "../../../../src/DataManipulation/ExportedValueTypes.js";

const SimpleObjectBinary = fs.readFileSync("test/DataManipulation/ParsingModule/SimpleObjectInstance/simple_object.bin");
const SimpleObjectKsy = fs.readFileSync("test/DataManipulation/ParsingModule/SimpleObjectInstance/simple_object_instance.ksy").toString();
const prepareSimpleObjectScope = async () => {
    const compilerTarget = await CompilerService.compileSingleTarget({
        filePath: "",
        storeId: "",
        fileContent: SimpleObjectKsy
    }, "javascript", true)

    const scope = new EvaluatedCodeScope();
    scope.evaluateCode(compilerTarget)
    return scope;
}
const prepareParsedObject = async (eagerMode) => {
    const scope = await prepareSimpleObjectScope();
    const fileBuffer = new Uint8Array(SimpleObjectBinary).buffer;
    const {parsed, error} = scope.parseBuffer(fileBuffer);
    return mapObjectToExportedValue(parsed, {
        scope: scope,
        eagerMode: eagerMode,
        streamLength: fileBuffer.byteLength,
        incomplete: !!error,
    })
}
const validateRootObject = (exportedValue) => {
    expect(exportedValue.start).to.be.eq(0);
    expect(exportedValue.end).to.be.eq(10);
    expect(exportedValue.ioOffset).to.be.eq(0);
    expect(exportedValue.incomplete).to.be.false;
    expect(!!exportedValue.validationError).to.be.false;
    expect(exportedValue.type).to.be.eq(ObjectType.Object);
    expect(exportedValue.object.class).to.be.eq("SimpleObjectInstance");
}


const validateField1 = (field1Key, field1) => {
    expect(field1Key).to.be.eq("value1");
    expect(field1.start).to.be.eq(0);
    expect(field1.end).to.be.eq(4);
    expect(field1.ioOffset).to.be.eq(0);
    expect(field1.incomplete).to.be.false;
    expect(!!field1.validationError).to.be.false;
    expect(field1.type).to.be.eq(ObjectType.Primitive);
    expect(field1.primitiveValue).to.be.eq(32);
}


const validateInstanceEagerModeOff = (instanceKey, instance) => {
    expect(instanceKey).to.be.eq("someinstance");
    expect(instance.start).to.be.eq(undefined);
    expect(instance.end).to.be.eq(undefined);
    expect(instance.ioOffset).to.be.eq(undefined);
    expect(instance.incomplete).to.be.false;
    expect(instance.type).to.be.eq(ObjectType.LazyInstance);
}

const validateInstanceEagerModeOn = (instanceKey, instance) => {
    expect(instanceKey).to.be.eq("someinstance");
    expect(instance.start).to.be.eq(6);
    expect(instance.end).to.be.eq(10);
    expect(instance.ioOffset).to.be.eq(0);
    expect(instance.incomplete).to.be.false;
    expect(!!instance.validationError).to.be.false;
    expect(instance.type).to.be.eq(ObjectType.Primitive);
    expect(instance.primitiveValue).to.be.eq(64);
}


describe("Testing Instance parsing", () => {
    it("SimpleObjectInstance parsing is Successful with Eager mode off", async () => {
        const exportedValue = await prepareParsedObject(false);
        expect(!!exportedValue).to.be.true;
    });

    it("SimpleObjectInstance parsing is Successful with Eager mode on", async () => {
        const exportedValue = await prepareParsedObject(true);
        expect(!!exportedValue).to.be.true;
    });

    it("SimpleObjectInstance parsing with Eager mode off has instance field", async () => {
        const exportedValue = await prepareParsedObject(false);
        const fields = Object.entries(exportedValue.object.fields);
        validateRootObject(exportedValue);
        expect(fields.length).to.be.eq(2)
        const [fieldKey, field] = fields[0];
        validateField1(fieldKey, field)
        const [instanceKey, instance] = fields[1];
        validateInstanceEagerModeOff(instanceKey, instance);

    });

    it("SimpleObjectInstance parsing with Eager mode on has instance with other fields", async () => {
        const exportedValue = await prepareParsedObject(true);
        const fields = Object.entries(exportedValue.object.fields);
        validateRootObject(exportedValue);

        expect(fields.length).to.be.eq(2)
        const [fieldKey, field] = fields[0];
        validateField1(fieldKey, field);
        const [instanceKey, instance] = fields[1];
        validateInstanceEagerModeOn(instanceKey, instance);
    });
});