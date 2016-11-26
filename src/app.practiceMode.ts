var practiceDiff: AceAjax.Editor, Range: any, markers = [];

interface ILine { start: number; end: number; idx: number; match: string; }

function practiceExportedChanged(exportedRoot: IExportedValue) {
    function numConv(num: number) {
        return num % 1 > 10e-9 ? Math.round(num * 1000000) / 1000000 : num;
    }

    function isUndef(obj) { return typeof obj === "undefined"; }

    function getObjectType(obj) {
        var objType;
        if (obj instanceof Uint8Array)
            objType = ObjectType.TypedArray;
        else if (typeof obj !== "object")
            objType = isUndef(obj) ? null : ObjectType.Primitive;
        else if (Array.isArray(obj))
            objType = ObjectType.Array;
        else if (obj === null)
            objType = null;
        else
            objType = ObjectType.Object;

        if (objType === ObjectType.Array && obj.length > 0 && typeof obj[0] === "number")
            return ObjectType.TypedArray;

        return objType;
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
            for (var i = 0; i < (obj.byteLength || obj.length); i++)
                result += (i == 0 ? "" : ", ") + obj[i];
            return result + "]";
        } else if (type === ObjectType.Primitive)
            return typeof obj === "number" ? numConv(obj) : `"${obj}"`;
        else if (type === ObjectType.Undefined)
            return null;
    }

    function union(a, b) { return [...new Set([...a, ...b])]; }

    var allMatch = true;
    function toJson(obj, solObj, fieldName = null, pad = 0) {
        var objPad = " ".repeat((pad + 0) * padLen);
        var childPad = " ".repeat((pad + 1) * padLen);
        var objType = getObjectType(obj);
        var solType = getObjectType(solObj);
        var type = objType || solType;

        //console.log('toJson', objType, solType, fieldName, pad, obj, solObj);

        var objMatch = objType === solType ? 'match' : solObj ? 'solution' : 'user';

        var prefix = objPad + (fieldName ? `"${fieldName}": ` : '');

        var isArray = type === ObjectType.Array;

        if (type === ObjectType.Object || isArray) {
            currLine.match = objMatch;
            json += prefix + (isArray ? '[' : '{');
            json += nl();

            var keys = union(solObj ? Object.keys(solObj) : [], obj ? Object.keys(obj) : []);

            keys.forEach((fieldName, i) => {
                toJson(obj ? obj[fieldName] : null, solObj ? solObj[fieldName] : null, isArray ? null : fieldName, pad + 1);
                json += (i == keys.length - 1 ? "" : ",");
                json += nl();
            });

            currLine.match = objMatch;
            json += objPad + (isArray ? ']' : '}');
            return true;
        }
        else {
            var objRepr = reprPrimitive(obj);
            var solRepr = reprPrimitive(solObj);

            allMatch = allMatch && objRepr === solRepr;

            if (objRepr === solRepr) {
                currLine.match = 'match';
                json += prefix + objRepr;
            }
            else
            {
                if (objRepr) {
                    currLine.match = 'user';
                    json += prefix + objRepr;
                }

                if (objRepr && solRepr)
                    json += nl();

                if (solRepr) {
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

    //console.log('exportedRoot', exportedRoot);
    var native = exportedToNative(exportedRoot);
    //console.log('native', native, 'practiceChall.solution', practiceChall.solution);
    toJson(native, practiceChall.solution);
    nl();

    practiceDiff.setValue(json, -1);
    //console.log(markers, lines);
    markers.forEach(marker => practiceDiff.session.removeMarker(marker));
    markers = [];
    lines.forEach(line => {
        markers.push(practiceDiff.session.addMarker(new Range(line.idx, 0, line.idx, 1), `marker_${line.match}`, "fullLine", false));
    });

    console.log('win?', allMatch);
}

$(() => {
    Range = ace.require('ace/range').Range;

    practiceDiff = ace.edit('practiceDiff');
    practiceDiff.setTheme("ace/theme/monokai");
    practiceDiff.getSession().setMode(`ace/mode/javascript`);
    practiceDiff.getSession().setUseWorker(false);
    practiceDiff.$blockScrolling = Infinity; // TODO: remove this line after they fix ACE not to throw warning to the console
    practiceDiff.setReadOnly(true);

    $('#practicePanel').css({ display: 'flex' });
    $('#practicePanel .description').html(practiceChall.description);
});