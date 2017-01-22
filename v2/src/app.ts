/// <reference path="../typings/modules/requirejs/index.d.ts"/>
import { bindable } from 'aurelia-framework';
import { ConverterPanel } from "./components/ConverterPanel/ConverterPanel";

export class App {
    public static instance: App;
    public list1: string[];
    public list2: string[];
    @bindable public selItem: string;
    private converterPanelData: Uint8Array;
    private converterPanel: ConverterPanel;

    constructor() {
        App.instance = this;
        this.list1 = ["a", "<b>b</b>", "c"];
        this.list2 = ["d", "e"];
        this.selItem = "hello";
        this.converterPanelData = new Uint8Array([65,66,67,68,69,70,71,72]);
    }

    start() {
        setTimeout(() => {
            this.converterPanelData = new Uint8Array([66, 67, 68, 69, 70, 71, 72, 73]);
        }, 1000);
        console.log(this.converterPanel);
    }

    selitemChanged() {
        console.log('selitemChanged');
    }
}