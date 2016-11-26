var practiceDiff: AceAjax.Editor, Range: any, markers = [];

interface ILine { start: number; end: number; idx: number; match: string; }

function practiceExportedChanged(exportedRoot: IExportedValue) {
    function numConv(num: number) {
        return num % 1 > 10e-9 ? Math.round(num * 1000000) / 1000000 : num;
    }

    function isUndef(obj) { return typeof obj === "undefined"; }

    function getObjectType(obj) {
        if (obj instanceof Uint8Array)
            return ObjectType.TypedArray;
        else if (typeof obj !== "object")
            return isUndef(obj) ? ObjectType.Undefined : ObjectType.Primitive;
        else if (Array.isArray(obj))
            return ObjectType.Array;
        else
            return ObjectType.Object;
    }

    var padLen = 2;
    var json = "";
    var lines = <ILine[]>[];
    var currLine = <ILine>{ start: 0 };

    function nl() {
        currLine.idx = lines.length;
        currLine.end = json.length;
        lines.push(currLine);
        currLine = <ILine>{ start: json.length + 1 };
        return '\n';
    }

    function reprPrimitive(obj): any {
        var type = getObjectType(obj);
        if (type === ObjectType.TypedArray) {
            var result = "[";
            for (var i = 0; i < obj.byteLength; i++)
                result += (i == 0 ? "" : ", ") + obj[i];
            return result + "],";
        } else if (type === ObjectType.Primitive)
            return typeof obj === "number" ? numConv(obj) : `"${obj}"`;
        else if (type === ObjectType.Undefined)
            return null;
    }

    function union(a, b) { return [...new Set([...a, ...b])]; }

    function toJson(obj, solObj, fieldName = null, pad = 0) {
        var objPad = " ".repeat((pad + 0) * padLen);
        var childPad = " ".repeat((pad + 1) * padLen);
        var objType = getObjectType(obj);
        var solType = getObjectType(solObj);
        var type = objType || solType;

        var prefix = objPad + (fieldName ? `"${fieldName}": ` : '');

        var isArray = type === ObjectType.Array;

        if (type === ObjectType.Object || isArray) {
            currLine.match = 'match';
            json += prefix + (isArray ? '[' : '{');
            json += nl();

            var keys = union(Object.keys(solObj), Object.keys(obj));
            keys.forEach((fieldName, i) => {
                toJson(obj[fieldName], solObj[fieldName], isArray ? null : fieldName, pad + 1);
                json += (i == keys.length - 1 ? "" : ",");
                json += nl();
            });

            currLine.match = 'match';
            json += objPad + (isArray ? ']' : '}');
            return true;
        }
        else {
            var objRepr = reprPrimitive(obj);
            var solRepr = reprPrimitive(solObj);

            if (objRepr === solRepr) {
                currLine.match = 'match';
                json += prefix + objRepr;
            }
            else
            {
                if (objRepr !== null) {
                    currLine.match = 'user';
                    json += prefix + objRepr;
                }

                if (objRepr !== null && solRepr !== null)
                    json += nl();

                if (solRepr !== null) {
                    currLine.match = 'solution';
                    json += prefix + solRepr;
                }
            }
        }

        return false;
    }

    function exportedToNative(exp: IExportedValue) {
        if (exp.type === ObjectType.Primitive)
            return exp.primitiveValue;
        else if (exp.type === ObjectType.TypedArray)
            return exp.bytes;
        else if (exp.type === ObjectType.Array)
            return exp.arrayItems.map(x => exportedToNative(x));
        else if (exp.type === ObjectType.Object) {
            var result = {};
            Object.keys(exp.object.fields).forEach(fieldName => { result[fieldName] = exportedToNative(exp.object.fields[fieldName]); });
            return result;
        } else
            console.log(`Unknown object type: ${exp.type}`);
    }

    var native = exportedToNative(exportedRoot);
    toJson(native, practiceChall.solution);
    nl();

    practiceDiff.setValue(json, -1);
    console.log(markers, lines);
    markers.forEach(marker => practiceDiff.session.removeMarker(marker));
    markers = [];
    lines.forEach(line => {
        markers.push(practiceDiff.session.addMarker(new Range(line.idx, 0, line.idx, 1), `marker_${line.match}`, "fullLine", false));
    });
}

$(() => {
    Range = ace.require('ace/range').Range;

    practiceDiff = ace.edit('practiceDiff');
    practiceDiff.setTheme("ace/theme/monokai");
    practiceDiff.getSession().setMode(`ace/mode/javascript`);
    practiceDiff.getSession().setUseWorker(false);
    practiceDiff.$blockScrolling = Infinity; // TODO: remove this line after they fix ACE not to throw warning to the console
    practiceDiff.setReadOnly(true);

    $('#practicePanel .description').html(practiceChall.description);
});