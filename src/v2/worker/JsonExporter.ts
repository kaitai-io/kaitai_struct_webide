import { IExportedValue, ObjectType } from "./WorkerShared";

export class JsonExporter {
    result = "";

    constructor(public useHex = false, public indentLen = 2) { }

    exportValue(value: IExportedValue, padLvl: number = 0) {
        var pad = " ".repeat((padLvl + 0) * this.indentLen);
        var childPad = " ".repeat((padLvl + 1) * this.indentLen);

        var isArray = value.type === ObjectType.Array;

        if (value.type === ObjectType.Object || isArray) {
            this.result += isArray ? "[" : "{";

            var keys: any[] = isArray ? value.arrayItems : Object.keys(value.object.fields);
            if (keys.length > 0) {
                this.result += `\n${childPad}`;
                keys.forEach((arrItem, i) => {
                    this.result += (isArray ? "" : `"${arrItem}": `);
                    this.exportValue(isArray ? arrItem : value.object.fields[arrItem], padLvl + 1);
                    var lineCont = isArray && arrItem.type === ObjectType.Primitive && typeof arrItem.primitiveValue !== "string" && i % 16 !== 15;
                    var last = i === keys.length - 1;
                    this.result += last ? "\n" : "," + (lineCont ? " " : `\n${childPad}`);
                });
                this.result += `${pad}`;
            }
            this.result += isArray ? "]" : "}";
        } else if (value.type === ObjectType.TypedArray) {
            if (value.bytes.length <= 64)
                this.result += "[" + Array.from(value.bytes).join(", ") + "]";
            else
                this.result += `{ "$start": ${value.ioOffset + value.start}, "$end": ${value.ioOffset + value.end - 1} }`;
        } else if (value.type === ObjectType.Primitive) {
            if (value.enumStringValue)
                this.result += `{ "name": ${JSON.stringify(value.enumStringValue)}, "value": ${value.primitiveValue} }`;
            else if (typeof value.primitiveValue === "number")
                this.result += this.useHex ? `0x${value.primitiveValue.toString(16)}` : `${value.primitiveValue}`;
            else
                this.result += `${JSON.stringify(value.primitiveValue)}`;
        }
    }

    export(value: IExportedValue) {
        this.result = "";
        this.exportValue(value);
        return this.result;
    }
}