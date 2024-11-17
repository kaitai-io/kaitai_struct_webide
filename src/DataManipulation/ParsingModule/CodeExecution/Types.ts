import {IExportedObject, IExportedValue} from "../../ExportedValueTypes";
import KaitaiStream from "kaitai-struct/KaitaiStream";
import {KsySchema} from "../../KsySchemaTypes";
import {IExportedValueFlatInfo} from "../../ExportedValueMappers/IExportedValueFlatInfoMapper";
import {CompilationTarget} from "../../CompilationModule/CompilerService";


export const PARSE_SCRIPTS = "PARSE_SCRIPTS";
export const GET_INSTANCE = "GET_INSTANCE";


export interface IWorkerParsedResponse {
    error?: Error;
    resultObject: IExportedValue;
    flatExported: IExportedValueFlatInfo;
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

    setCompilationTarget(compilationTarget: CompilationTarget): void;

    setInputAction(inputBuffer: ArrayBuffer): void;

    parseAction(eagerMode: boolean): Promise<IWorkerParsedResponse>;

    getPropertyByPathAction(path: string[]): Promise<IExportedValue>;
}
