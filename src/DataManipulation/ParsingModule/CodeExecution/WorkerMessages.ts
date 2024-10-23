import {IKsyTypes} from "./Types";

const PARSE_SCRIPTS = "PARSE_SCRIPTS";

export interface IWorkerMessageParse {
    type: typeof PARSE_SCRIPTS;
    sourceCode: any;
    mainClass: string;
    ksyTypes: IKsyTypes;
    inputBuffer: ArrayBuffer;

    eagerMode: boolean;
    msgId: number;
}

export type IWorkerMessage = IWorkerMessageParse;
