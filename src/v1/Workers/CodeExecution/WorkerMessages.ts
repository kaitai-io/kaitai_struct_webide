import {IKsyTypes, INIT_WORKER_SCRIPTS, PARSE_SCRIPTS} from "./Types";

export interface IWorkerMessageInit {
    type: typeof INIT_WORKER_SCRIPTS;
    scripts: {
        kaitaiStream: string;
        zlib: string;
    }
}
export interface IWorkerMessageParse {
    type: typeof PARSE_SCRIPTS;
    sourceCode: string;
    mainClass: string;
    ksyTypes: IKsyTypes;
    inputBuffer: ArrayBuffer;

    eagerMode: boolean,
    msgId: number,
}

export type IWorkerMessage = IWorkerMessageInit | IWorkerMessageParse
