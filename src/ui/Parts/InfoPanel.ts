import * as Vue from "vue";
import Component from "../Component";
import { IInterval } from "../../utils/IntervalHelper";
import { AboutModal } from "./AboutModal";
import "../Components/Stepper";
import "../Components/SelectionInput";

@Component
export class InfoPanel extends Vue {
    selectionStart: number = -1;
    selectionEnd: number = -1;

    unparsed: IInterval[] = [];
    byteArrays: IInterval[] = [];

    disableLazyParsing: boolean = false;
    aboutModal: AboutModal;
    parsedPath = "";

    public selectInterval(interval: IInterval) { this.selectionChanged(interval.start, interval.end); }
    public selectionChanged(start: number, end: number) { /* TODO */ }
    public exportToJson(hex: boolean) { /* TODO */ }
    public about() { this.aboutModal.show(); }
}