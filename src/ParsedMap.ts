import { IntervalHandler, IInterval } from "./utils/IntervalHelper";
import { IExportedValue, ObjectType, IExportedObject } from "worker/WorkerShared";

interface IParsedTreeInterval extends IInterval {
    exp: IExportedValue;
}

export class ParsedMap {
    intervalHandler = new IntervalHandler<IParsedTreeInterval>();
    unparsed: IInterval[] = [];
    byteArrays: IInterval[] = [];

    private static collectAllObjects(root: IExportedValue): IExportedValue[] {
        var objects: IExportedValue[] = [];

        function process(value: IExportedValue) {
            objects.push(value);
            if (value.type === ObjectType.Object)
                Object.keys(value.object.fields).forEach(fieldName => process(value.object.fields[fieldName]));
            else if (value.type === ObjectType.Array && !value.isLazyArray)
                value.arrayItems.forEach(arrItem => process(arrItem));
        }

        process(root);
        return objects;
    }

    protected recalculateUnusedParts() {
        // TODO: optimize this, not to recalculate all the parts
        let lastEnd = -1;
        const unparsed: IInterval[] = [];
        for (var i of this.intervalHandler.sortedItems){
            if (i.start !== lastEnd + 1)
                unparsed.push({ start: lastEnd + 1, end: i.start - 1 });

            lastEnd = i.end;
        }
        this.unparsed = unparsed;
    }

    public addObjects(objects: IExportedValue[]) {
        var allObjects = <IExportedValue[]>[].concat.apply([], objects.map(x => ParsedMap.collectAllObjects(x)));

        const newIntervals = [];
        var lastEnd = -1;
        for (let exp of allObjects) {
            if (!(exp.type === ObjectType.Primitive || exp.type === ObjectType.TypedArray)) continue;

            var start = exp.ioOffset + exp.start;
            var end = exp.ioOffset + exp.end - 1;
            if (start <= lastEnd || start > end) continue;
            lastEnd = end;

            newIntervals.push(<IParsedTreeInterval>{ start: start, end: end, exp: exp });
        }

        if (this.intervalHandler.sortedItems.length + newIntervals.length > 400000) {
            console.warn("Too many items for interval tree: " + this.intervalHandler.sortedItems.length);
            return;
        }
        else
            this.intervalHandler.addSorted(newIntervals);

        this.byteArrays.push(...allObjects.filter(exp => exp.type === ObjectType.TypedArray && exp.bytes.length > 64).
            map(exp => ({ start: exp.ioOffset + exp.start, end: exp.ioOffset + exp.end - 1 })));

        this.recalculateUnusedParts();
    }
}
