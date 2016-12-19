class ObjectType {
    public static Primitive = "Primitive";
    public static Array = "Array";
    public static TypedArray = "TypedArray";
    public static Object = "Object";
    public static Undefined = "Undefined";
}

interface IExportedObject {
    class?: string;
    ksyType?: KsySchema.IType;
    fields?: { [name: string]: IExportedValue; };
    propPaths?: { [name: string]: string[]; };
}

interface IExportedValue {
    type: ObjectType;
    path: string[];
    start: number;
    end: number;

    primitiveValue?: any;
    arrayItems?: IExportedValue[];
    bytes?: Uint8Array;
    object?: IExportedObject;

    enumName?: string;
    enumStringValue?: string;
}