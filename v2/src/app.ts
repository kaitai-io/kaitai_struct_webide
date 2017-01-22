import { bindable } from 'aurelia-framework';

export class App {
    public list1: string[];
    public list2: string[];
    @bindable public selItem: string;

    constructor() {
        this.list1 = ["a", "b", "c"];
        this.list2 = ["d", "e"];
        this.selItem = "hello";
    }

    selitemChanged() {
        console.log('selitemChanged');
    }
}