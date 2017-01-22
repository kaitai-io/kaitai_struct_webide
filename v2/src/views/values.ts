import {inject} from "aurelia-framework";

export class Values {
    values: string[] = [];
 
    constructor() { }
 
    activate() {
        this.values = ["1","2"];
    }
}