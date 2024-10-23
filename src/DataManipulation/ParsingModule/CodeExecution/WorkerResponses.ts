import {PARSE_SCRIPTS} from "./Types";
import {IDebugInfo} from "../../ExportedValueMappers/ObjectToIExportedValueMapper";


export interface DebugMap {
    [key: string]: IDebugInfo;
}

export interface ParseResultObject {
    _debug: DebugMap;
    _root: ParseResultObject;
    _parent?: ParseResultObject;
    _io: any;

    [name: string]: ParseResultType;
}

export type ParseResultType = ParseResultObject | ParseResultObject[] | Uint8Array | number | string | DebugMap;

export interface IWorkerResponseParse {
    type: typeof PARSE_SCRIPTS;

    resultObject: ParseResultType;
    enums: any;
    error: Error;

    eagerMode: boolean;
    msgId: number;
}

export type IWorkerResponse = IWorkerResponseParse;
