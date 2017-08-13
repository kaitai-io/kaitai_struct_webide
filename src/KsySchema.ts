namespace KsySchema {
    interface IMeta {
        id: string;
        endian?: "le" | "be";
        application?: string;
        "file-extension"?: string;
        imports?: string[];
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

    interface IYamlFieldMeta {
        lineIdx: number;
    }

    interface IYamlMeta {
        lineIdx: number;
        fields: { [name: string]: IYamlFieldMeta };
    }

    export interface IInstance extends IAttributeLike {
        io?: string;
        pos?: string | number;
        value?: string | number;
        "-webide-parse-mode"?: "eager" | "lazy";
    }

    export interface IType {
        seq: IAttribute[];
        types: { [name: string]: IType };
        enums: { [name: string]: { [intValue: string]: string } };
        instances: { [name: string]: IInstance };
        "-webide-representation"?: string;

        typesByJsName: { [name: string]: IType };
        instancesByJsName: { [name: string]: IInstance };
        $meta: IYamlMeta;
    }

    export interface IKsyFile extends IType {
        meta: IMeta;
    }
}
