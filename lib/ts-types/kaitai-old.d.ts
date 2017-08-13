declare class YAML {
    static parse(yaml: string, exceptionOnInvalidType?: boolean, objectDecoder?: any, saveMeta?: boolean): any;
}

interface IYamlImporter {
    importYaml(name: string, mode: string): Promise<any>;
}

declare class KaitaiStructCompiler {
    version: string;
    buildDate: string;
    compile(kslang: string, compilerSchema: any, jsImporter: IYamlImporter, isDebug: boolean): Promise<{ [filename: string]: string }>;
}

declare class KaitaiStream {
    constructor(inputBuffer: ArrayBuffer, offset: number);
}
