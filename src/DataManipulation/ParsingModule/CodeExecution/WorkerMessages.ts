import {CompilationTarget} from "../../CompilationModule/CompilerService";
import {GET_INSTANCE, PARSE_SCRIPTS} from "./Types";

export interface IWorkerMessageParse {
    type: typeof PARSE_SCRIPTS;
    msgId: number;

    compilationTarget: CompilationTarget;
    inputBuffer: ArrayBuffer;
    eagerMode: boolean;
}


export interface IWorkerMessageGetInstance {
    type: typeof GET_INSTANCE;
    msgId: number;

    path: string[];
}

export type IWorkerMessage = IWorkerMessageParse | IWorkerMessageGetInstance;
