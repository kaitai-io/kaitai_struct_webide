namespace KsySchema {
    interface IMeta {
        id: string;
        endian?: "le" | "be";
        application?: string;
        "file-extension"?: string;
    }

    interface ITypeSwitch {
        "switch-on": string;
        cases: { [value: string]: string };
    }

    interface IAttributeLike {
        contents?: string | (string | number)[];
        type?: string | ITypeSwitch;
        repeat?: "eos" | "expr" | "until";
        "repeat-expr"?: string | number;
        size?: string | number;
        "size-eos"?: boolean;
        encoding?: string;
        process?: string;
        enum?: string;
        if?: string;
        doc?: string;
        terminator?: number;
        consume?: boolean;
        include?: boolean;
        "eos-error"?: boolean;
    }

    interface IAttribute extends IAttributeLike {
        id: string;
    }

    interface IInstance extends IAttributeLike {
        io?: string;
        pos?: string | number;
        value?: string | number;
    }

    interface IType {
        seq: IAttribute[];
        types: { [name: string]: IType };
        enums: { [name: string]: { [intValue: string]: string } };
        instances: { [name: string]: IInstance };
    }

    export interface IKsyFile extends IType {
        meta: IMeta;
    }
}
