import {IExportedObject, IExportedValue} from "../../ExportedValueTypes";
import KaitaiStream from "kaitai-struct/KaitaiStream";


export const PARSE_SCRIPTS = "PARSE_SCRIPTS";


export interface IWorkerParsedResponse {
    error?: Error;
    resultObject: any;
}

export interface IKsyTypes {
    [name: string]: KsySchema.IType;
}

export class EvaluatedClass {

    constructor(public kaitaiStream: KaitaiStream) {
    }

    _read(): IExportedObject {
        return {};
    }

    name: string;
}

export interface IWorkerApiMethods {
    setOnlyCodeAction(sourceCode: string): void;

    setCodeAction(sourceCode: string, mainClassName: string, ksyTypes: IKsyTypes): void;

    setInputAction(inputBuffer: ArrayBuffer): void;

    parseAction(eagerMode: boolean): Promise<IWorkerParsedResponse>;

    getPropertyByPathAction(path: string[]): Promise<IExportedValue>;
}
