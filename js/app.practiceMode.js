var practiceDiff;
function practiceExportedChanged(exportedRoot) {
    function exportedToJson(exported) {
        var padLen = 2;
        var commentOffset = 60;
        function commentPad(str) { return str.length < commentOffset ? str + ' '.repeat(commentOffset - str.length) : str; }
        var lineInfo = { currLine: 0, lineStart: 0, lines: {} };
        var json = "";
        function nl() {
            json += "\n";
            lineInfo.currLine++;
            lineInfo.lineStart = json.length;
        }
        function comment(str) {
            var padLen = commentOffset - (json.length - lineInfo.lineStart);
            if (padLen > 0)
                json += ' '.repeat(padLen);
            json += ` // ${str}`;
        }
        function getLenComment(obj) {
            var len = obj.end - obj.start + 1;
            lineInfo.lines[lineInfo.currLine] = obj;
            return `${obj.start}-${obj.end} (l:${len})`;
        }
        function numConv(num) {
            return num % 1 > 10e-9 ? Math.round(num * 1000000) / 1000000 : num;
        }
        function toJson(obj, pad = 0) {
            //debug = debug || obj._debug;
            var objPad = " ".repeat((pad + 0) * padLen);
            var childPad = " ".repeat((pad + 1) * padLen);
            var isArray = obj.type === ObjectType.Array;
            var isObject = obj.type === ObjectType.Object;
            if (obj.type === ObjectType.TypedArray) {
                json += "[";
                for (var i = 0; i < obj.bytes.byteOffset; i++) {
                    json += i == 0 ? "" : ", ";
                    if (i != 0 && (i % 8 == 0)) {
                        nl();
                        json += childPad;
                    }
                    json += obj.bytes[i];
                }
                json += "]";
            }
            else if (obj.type === ObjectType.Object) {
                json += `{`;
                //json += ` // ${obj.object.class}`;
                //comment(getLenComment(obj));
                var keys = Object.keys(obj.object.fields);
                keys.forEach((fieldName, i) => {
                    nl();
                    json += childPad + `"${fieldName}": `;
                    var isObject = toJson(obj.object.fields[fieldName], pad + 1);
                    json += (i == keys.length - 1 ? "" : ",");
                });
                nl();
                json += objPad + '}';
                return true;
            }
            else if (obj.type === ObjectType.Array) {
                json += `[`;
                obj.arrayItems.forEach((item, i) => {
                    nl();
                    json += childPad;
                    var isObject = toJson(item, pad + 1);
                    json += (i == obj.arrayItems.length - 1 ? "" : ",");
                    //comment(' ' + getLenComment(item));
                });
                nl();
                json += objPad + ']';
                return true;
            }
            else if (obj.type === ObjectType.Primitive) {
                if (typeof obj.primitiveValue === "number")
                    json += numConv(obj.primitiveValue);
                else
                    json += `"${obj.primitiveValue}"`;
            }
            return false;
        }
        toJson(exported);
        return { json, lineInfo };
    }
    practiceDiff.setValue(exportedToJson(exportedRoot).json, -1);
}
$(() => {
    practiceDiff = ace.edit('practiceDiff');
    practiceDiff.setTheme("ace/theme/monokai");
    practiceDiff.getSession().setMode(`ace/mode/javascript`);
    practiceDiff.$blockScrolling = Infinity; // TODO: remove this line after they fix ACE not to throw warning to the console
    practiceDiff.setReadOnly(true);
});
//# sourceMappingURL=app.practiceMode.js.map