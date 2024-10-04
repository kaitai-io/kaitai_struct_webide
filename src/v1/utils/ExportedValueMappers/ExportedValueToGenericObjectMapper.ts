import {AbstractExportedValueMapper} from "./AbstractExportedValueMapper";

export class ExportedValueToGenericObjectMapper extends AbstractExportedValueMapper<any> {

    protected visitPrimitive(value: IExportedValue) {
        super.visitPrimitive(value);
        return value.primitiveValue;
    }

    protected visitArray(value: IExportedValue) {
        super.visitArray(value);
        return ([...value.arrayItems] || []).map((item) => this.map(item));
    }

    protected visitTypedArray(value: IExportedValue) {
        super.visitTypedArray(value);
        return [...value.bytes] || [];
    }

    protected visitObject(value: IExportedValue) {
        super.visitObject(value);
        const newObject = {};
        Object.keys(value.object.fields || {}).forEach(key => {
            newObject[key] = this.map(value.object.fields[key])
        })
        return newObject;
    }

    protected visitEnum(value: IExportedValue) {
        super.visitEnum(value);
        return {
            name: value.enumStringValue,
            value: value.primitiveValue
        }
    }

    protected visitUndefined(value: IExportedValue): any {
        return undefined;
    }

}