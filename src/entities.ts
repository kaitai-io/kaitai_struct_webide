class ObjectType {
    public static Primitive = "Primitive";
    public static Array = "Array";
    public static TypedArray = "TypedArray";
    public static Object = "Object";
    public static Undefined = "Undefined";
}

/* tslint:disable */
interface IWorkerMessage {
    type: "initCode" | "setInput" | "reparse" | "get";
    msgId?: number;
    args?: any[];
    result?: any;
    error?: any;
}
/* tslint:enable */

interface IWorkerResponse {
    result: any;
    error: any;
}

interface IInstance {
    path: string[];
    offset: number;
}

interface IExportedObject {
    class?: string;
    ksyType?: KsySchema.IType;
    fields?: { [name: string]: IExportedValue; };
    instances?: { [name: string]: IInstance; };
}

interface IExportedValue {
    type: ObjectType;
    path: string[];
    ioOffset: number;
    start: number;
    end: number;
    incomplete: boolean;
    validationError?: Error;
    instanceError?: Error;

    primitiveValue?: any;
    arrayItems?: IExportedValue[];
    bytes?: Uint8Array;
    object?: IExportedObject;

    enumName?: string;
    enumStringValue?: string;
    //isInstance?: boolean;

    parent?: IExportedValue;
}

interface IKsyTypes { [name: string]: KsySchema.IType; }
