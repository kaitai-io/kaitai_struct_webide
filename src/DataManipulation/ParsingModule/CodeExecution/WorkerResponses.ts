import {INIT_WORKER_SCRIPTS, PARSE_SCRIPTS} from "./Types";
import {IDebugInfo} from "../../../v1/utils/ExportedValueMappers/ObjectToIExportedValueMapper";

export interface IWorkerResponseInit {
    type: typeof INIT_WORKER_SCRIPTS;

    resultObject: any;
    enums: any;
    error: Error;

    eagerMode: boolean;
    msgId: number;
}

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

export type IWorkerResponse = IWorkerResponseInit | IWorkerResponseParse;
