import {INIT_WORKER_SCRIPTS, PARSE_SCRIPTS} from "./Types";

export interface IWorkerResponseInit {
    type: typeof INIT_WORKER_SCRIPTS;

    resultObject: any;
    enums: any;
    error: Error;

    eagerMode: boolean;
    msgId: number;
}

export interface IWorkerResponseParse {
    type: typeof PARSE_SCRIPTS;

    resultObject: any;
    enums: any;
    error: Error;

    eagerMode: boolean;
    msgId: number;
}

export type IWorkerResponse = IWorkerResponseInit | IWorkerResponseParse;
