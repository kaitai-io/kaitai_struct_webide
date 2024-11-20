import fs from "node:fs";
import {EvaluatedCodeScope} from "../../../../src/DataManipulation/ParsingModule/CodeExecution/EvaluatedCodeScope.js";
import {
    mapObjectToExportedValue
} from "../../../../src/DataManipulation/ExportedValueMappers/ObjectToIExportedValueMapper.js";
import {CompilerService} from "../../../../src/DataManipulation/CompilationModule/CompilerService.js";
import {expect} from "chai";
import {ObjectType} from "../../../../src/DataManipulation/ExportedValueTypes.js";

const SimpleObjectBinary = fs.readFileSync("test/DataManipulation/ParsingModule/SimpleObject/simple_object.bin");
const SimpleObjectKsy = fs.readFileSync("test/DataManipulation/ParsingModule/SimpleObject/simple_object.ksy").toString();
const prepareSimpleObjectScope = async () => {
    const compilationResult = await CompilerService.compileSingleTarget({
        filePath: "",
        storeId: "",
        fileContent: SimpleObjectKsy
    }, "javascript", true)

    const scope =  new EvaluatedCodeScope();
    scope.evaluateCode(compilationResult.result)
    return scope;
}
const prepareParsedObject = async (options) => {
    const scope = await prepareSimpleObjectScope();
    const fileBuffer = new Uint8Array(SimpleObjectBinary).buffer;
    const {parsed, error} = scope.parseBuffer(fileBuffer);
    return mapObjectToExportedValue(parsed, options || {
        scope: scope,
        eagerMode: true,
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
    expect(exportedValue.object.class).to.be.eq("SimpleObject");
}

const validateHeader_field1 = (field1Key, field1) => {
    expect(field1Key).to.be.eq("headerFieldX");
    expect(field1.start).to.be.eq(0);
    expect(field1.end).to.be.eq(4);
    expect(field1.ioOffset).to.be.eq(0);
    expect(field1.type).to.be.eq(ObjectType.Primitive);
    expect(field1.primitiveValue).to.be.eq(32);
}

const validateHeader_field2 = (field2Key, field2) => {
    expect(field2Key).to.be.eq("headerFieldA");
    expect(field2.start).to.be.eq(4);
    expect(field2.end).to.be.eq(6);
    expect(field2.ioOffset).to.be.eq(0);
    expect(field2.type).to.be.eq(ObjectType.Primitive);
    expect(field2.primitiveValue).to.be.eq(48);
}

const validateHeader = (headerKey, header) => {
    expect(headerKey).to.be.eq("header");

    expect(header.start).to.be.eq(0);
    expect(header.end).to.be.eq(6);
    expect(header.ioOffset).to.be.eq(0);
    expect(header.incomplete).to.be.false;
    expect(!!header.validationError).to.be.false;
    expect(header.type).to.be.eq(ObjectType.Object);
    expect(header.object.class).to.be.eq("THeader");

    const headerFields = Object.entries(header.object.fields)
    expect(headerFields.length).to.be.eq(2);

    const [field1Key, field1] = headerFields[0];
    validateHeader_field1(field1Key, field1);
    const [field2Key, field2] = headerFields[1];
    validateHeader_field2(field2Key, field2);
}
const validateField1 = (field1Key, field1) => {
    expect(field1Key).to.be.eq("value1");
    expect(field1.start).to.be.eq(6);
    expect(field1.end).to.be.eq(10);
    expect(field1.ioOffset).to.be.eq(0);
    expect(field1.incomplete).to.be.false;
    expect(!!field1.validationError).to.be.false;
    expect(field1.type).to.be.eq(ObjectType.Primitive);
    expect(field1.primitiveValue).to.be.eq(64);

}

const validateInstance = (instanceKey, instance) => {
    expect(instanceKey).to.be.eq("someinstance");
    expect(instance.start).to.be.eq(undefined);
    expect(instance.end).to.be.eq(undefined);
    expect(instance.ioOffset).to.be.eq(undefined);
    expect(instance.incomplete).to.be.false;
    expect(!!instance.validationError).to.be.false;
    expect(instance.type).to.be.eq(ObjectType.Primitive);
    expect(instance.primitiveValue).to.be.eq(80);
}

const validateFields = (exportedValue) => {
    const rootFields = Object.entries(exportedValue.object.fields)
    expect(rootFields.length).to.be.eq(3);
    const [headerKey, header] = rootFields[0];
    validateHeader(headerKey, header)
    const [field1Key, field1] = rootFields[1];
    validateField1(field1Key, field1)
    const [instanceKey, instance] = rootFields[2];
    validateInstance(instanceKey, instance);
}

describe("Testing SimpleObject", () => {
    it("SimpleObject parsing is Successful", async () => {
        const scope = await prepareSimpleObjectScope();
        const {error} = scope.parseBuffer(SimpleObjectBinary);
        expect(!!error).to.be.false;
    });

    it("SimpleObject has all the fields with correct values", async () => {
        const exportedValue = await prepareParsedObject();
        validateRootObject(exportedValue);
        validateFields(exportedValue);
    });
});