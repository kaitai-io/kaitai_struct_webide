import { workerMethods } from "./app.worker";

export function exportToJson(useHex: boolean = false) {
    var indentLen = 2;
    var result = "";

    function expToNative(value: IExportedValue, padLvl: number = 0) {
        var pad = " ".repeat((padLvl + 0) * indentLen);
        var childPad = " ".repeat((padLvl + 1) * indentLen);

        var isArray = value.type === ObjectType.Array;

        if (value.type === ObjectType.Object || isArray) {
            result += isArray ? "[" : "{";

            var keys: any[] = isArray ? value.arrayItems : Object.keys(value.object.fields);
            if (keys.length > 0) {
                result += `\n${childPad}`;
                keys.forEach((arrItem, i) => {
                    result += (isArray ? "" : `"${arrItem}": `);
                    expToNative(isArray ? arrItem : value.object.fields[arrItem], padLvl + 1);
                    var lineCont = isArray && arrItem.type === ObjectType.Primitive && typeof arrItem.primitiveValue !== "string" && i % 16 !== 15;
                    var last = i === keys.length - 1;
                    result += last ? "\n" : "," + (lineCont ? " " : `\n${childPad}`);
                });
                result += `${pad}`;
            }
            result += isArray ? "]" : "}";
        } else if (value.type === ObjectType.TypedArray) {
            if (value.bytes.length <= 64)
                result += "[" + Array.from(value.bytes).join(", ") + "]";
            else
                result += `{ "$start": ${value.ioOffset + value.start}, "$end": ${value.ioOffset + value.end - 1} }`;
        } else if (value.type === ObjectType.Primitive) {
            if (value.enumStringValue)
                result += `{ "name": ${JSON.stringify(value.enumStringValue)}, "value": ${value.primitiveValue} }`;
            else if (typeof value.primitiveValue === "number")
                result += useHex ? `0x${value.primitiveValue.toString(16)}` : `${value.primitiveValue}`;
            else
                result += `${JSON.stringify(value.primitiveValue)}`;
        }
    }

    return workerMethods.reparse(true).then(exportedRoot => {
        console.log("exported", exportedRoot);
        expToNative(exportedRoot);
        return result;
    });
};