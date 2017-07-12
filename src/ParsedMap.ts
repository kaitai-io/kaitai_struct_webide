import { IntervalHandler, IInterval } from "./utils/IntervalHelper";
import { IExportedValue, ObjectType, IExportedObject } from "worker/WorkerShared";

interface IParsedTreeInterval extends IInterval {
    exp: IExportedValue;
}

export class ParsedMap {
    intervalHandler = new IntervalHandler<IParsedTreeInterval>();
    intervals: IParsedTreeInterval[] = [];
    unparsed: IInterval[];
    byteArrays: IInterval[];

    constructor(public root: IExportedValue) { 
        this.fillIntervals(root);
    }

    private static collectAllObjects(root: IExportedValue): IExportedValue[] {
        var objects: IExportedValue[] = [];

        function process(value: IExportedValue) {
            objects.push(value);
            if (value.type === ObjectType.Object)
                Object.keys(value.object.fields).forEach(fieldName => process(value.object.fields[fieldName]));
            else if (value.type === ObjectType.Array)
                value.arrayItems.forEach(arrItem => process(arrItem));
        }

        process(root);
        return objects;
    }    

    fillIntervals(value: IExportedValue) {
        var isInstance = false; // TODO
        var objects = ParsedMap.collectAllObjects(value);

        var lastEnd = -1;
        for (let exp of objects) {
            if (!(exp.type === ObjectType.Primitive || exp.type === ObjectType.TypedArray)) continue;

            var start = exp.ioOffset + exp.start;
            var end = exp.ioOffset + exp.end - 1;
            if (start <= lastEnd || start > end) continue;
            lastEnd = end;

            this.intervals.push(<IParsedTreeInterval>{ start: start, end: end, exp: exp });
        }

        if (!isInstance) {
            var unparsed: IInterval[] = [];

            lastEnd = -1;
            for (var i of this.intervals){
                if (i.start !== lastEnd + 1)
                    unparsed.push({ start: lastEnd + 1, end: i.start - 1 });

                lastEnd = i.end;
            }

            this.unparsed = unparsed;
            this.byteArrays = objects.filter(exp => exp.type === ObjectType.TypedArray && exp.bytes.length > 64).
                map(exp => ({ start: exp.ioOffset + exp.start, end: exp.ioOffset + exp.end - 1 }));
        }

        if (this.intervals.length > 400000)
            console.warn("Too many items for interval tree: " + this.intervals.length);
        else
            this.intervalHandler.addSorted(this.intervals);
    }
}
