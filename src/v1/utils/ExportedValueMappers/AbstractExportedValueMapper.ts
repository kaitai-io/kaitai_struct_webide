import {IExportedValueMapper} from "./IExportedValueMapper";

export class AbstractExportedValueMapper<T> implements IExportedValueMapper<T> {
    public map(value: IExportedValue): T {
        switch (value.type) {
            case ObjectType.Primitive:
                const isEnumValue = !!value.enumStringValue;
                return isEnumValue
                    ? this.visitEnum(value)
                    : this.visitPrimitive(value)
            case ObjectType.Array:
                return this.visitArray(value);
            case ObjectType.TypedArray:
                return this.visitTypedArray(value);
            case ObjectType.Object:
                return this.visitObject(value);
            case ObjectType.Undefined:
                return this.visitUndefined(value);
        }
    }

    protected visitPrimitive(value: IExportedValue): T {
        return null;
    }

    protected visitArray(value: IExportedValue): T {
        return null;
    }

    protected visitTypedArray(value: IExportedValue): T {
        return null;
    }

    protected visitObject(value: IExportedValue): T {
        return null;
    }

    protected visitEnum(value: IExportedValue): T {
        return null;
    }

    protected visitUndefined(value: IExportedValue): T {
        return null;
    }

}