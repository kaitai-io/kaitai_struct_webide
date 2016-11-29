module.exports = function convert(userObj, solObj) {
    class ObjectType { }
    ObjectType.Primitive = "Primitive";
    ObjectType.Array = "Array";
    ObjectType.TypedArray = "TypedArray";
    ObjectType.Object = "Object";
    ObjectType.Undefined = "Undefined";

    function numConv(num) {
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
    var lines = [];
    var currLine = { start: 0 };

    function nl() {
        currLine.idx = lines.length;
        currLine.end = json.length;
        lines.push(currLine);
        currLine = { start: json.length + 1 };
        return '\n';
    }

    function reprPrimitive(obj) {
        var type = getObjectType(obj);
        if (type === ObjectType.TypedArray) {
            var result = "[";
            for (var i = 0; i < (obj.byteLength || obj.length); i++)
                result += (i == 0 ? "" : ", ") + obj[i];
            return result + "]";
        } else if (type === ObjectType.Primitive){
            if(typeof obj === "number")
                return numConv(obj);
            else {
                var strRepr = `${obj}`;
                if(strRepr.length > 0 && strRepr.charCodeAt(0) === 0xFEFF) // removes BOM
                    strRepr = strRepr.substr(1);
                return `"${strRepr}"`;
            }
        }
        else
            return null;
    }

    function union(a, b) { return [...new Set([...a, ...b])]; }

    var allMatch = true;
    function toJson(obj, solObj, fieldName = null, pad = 0) {
        var objPad = " ".repeat((pad + 0) * padLen);
        var childPad = " ".repeat((pad + 1) * padLen);
        var objType = getObjectType(obj);
        var solType = getObjectType(solObj);
        var type = solType || objType;

        //console.log('toJson', objType, solType, fieldName, pad, obj, solObj);

        var objMatch = objType === solType ? 'match' : solObj ? 'solution' : 'user';

        var prefix = objPad + (fieldName ? `"${fieldName}": ` : '');

        var isArray = type === ObjectType.Array;

        if (type === ObjectType.Object || isArray) {
            currLine.match = objMatch;
            json += prefix + (isArray ? '[' : '{');
            json += nl();

            var keys = union(solObj ? Object.keys(solObj) : [], obj && objType === type ? Object.keys(obj).filter(x => x[0] != '_') : []);

            keys.forEach((fieldName, i) => {
                toJson(obj && fieldName in obj ? obj[fieldName] : null, solObj && fieldName in solObj ? solObj[fieldName] : null, isArray ? null : fieldName, pad + 1);
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

            //if(objRepr !== solRepr)
            //    console.log('diff', objRepr, solRepr);
            allMatch = allMatch && objRepr === solRepr;

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

    toJson(userObj, solObj);
    return { json, lines, allMatch };
}