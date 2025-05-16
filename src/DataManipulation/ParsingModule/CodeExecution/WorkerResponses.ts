import {GET_INSTANCE, PARSE_SCRIPTS} from "./Types";
import {IExportedValue} from "../../ExportedValueTypes";
import {IExportedValueFlatInfo} from "../../ExportedValueMappers/IExportedValueFlatInfoMapper";

export interface IWorkerResponseParse {
    type: typeof PARSE_SCRIPTS;
    msgId: number;

    resultObject: IExportedValue;
    flatExported: IExportedValueFlatInfo;
    error: Error;
}

export interface IWorkerResponseGetInstance {
    type: typeof GET_INSTANCE;
    msgId: number;
    instance: IExportedValue;
}


export type IWorkerResponse = IWorkerResponseParse | IWorkerResponseGetInstance;
