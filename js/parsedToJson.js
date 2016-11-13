function parsedToJson(parsed) {
    var intervals = [];
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
    function getLenComment(debug, addInterval = false) {
        if (debug) {
            var len = debug.end - debug.start + 1;
            if (len > 0)
                intervals.push(debug);
            lineInfo.lines[lineInfo.currLine] = debug;
            return `${debug.start}-${debug.end} (l:${len})`;
        }
        return null;
    }
    function toJson(obj, debug = null, pad = 0) {
        //debug = debug || obj._debug;
        if (typeof obj === "object") {
            var objPad = " ".repeat((pad + 0) * padLen);
            var childPad = " ".repeat((pad + 1) * padLen);
            if (obj instanceof Uint8Array) {
                json += "[";
                for (var i = 0; i < obj.length; i++) {
                    json += i == 0 ? "" : ", ";
                    if (i != 0 && (i % 8 == 0)) {
                        nl();
                        json += childPad;
                    }
                    json += obj[i];
                }
                json += "]";
            }
            else {
                var keys = Object.keys(obj).filter(x => x[0] != "_");
                var isArray = Array.isArray(obj);
                json += isArray ? `[` : `{`;
                if (!isArray) {
                    if (obj._debug)
                        json += ` // ${obj._debug.class}`;
                    if (debug)
                        comment(getLenComment(debug));
                }
                for (var i = 0; i < keys.length; i++) {
                    var key = keys[i];
                    nl();
                    json += childPad + (isArray ? "" : `"${key}": `);
                    var childDebug = isArray ? debug.arr[key] : obj._debug ? obj._debug[key] : null;
                    var isObject = toJson(obj[key], childDebug, pad + 1);
                    json += (i == keys.length - 1 ? "" : ",");
                    if (!isObject)
                        comment(' ' + getLenComment(childDebug, true));
                }
                nl();
                json += objPad + (isArray ? `]` : `}`);
                return true;
            }
        }
        else if (typeof obj === "number")
            json += `${obj}`;
        else
            json += `"${obj}"`;
        return false;
    }
    toJson(parsed);
    return { json, intervals, lineInfo };
}
// REMOVED CODE
//var lineInfo = null;
//ui.parsedDataViewer.getSession().selection.on('changeCursor', (e1, e2) => {
//    var lineIdx = e2.selectionLead.row;
//    var debug = lineInfo ? lineInfo.lines[lineIdx] : null;
//    if (debug && debug.start <= debug.end)
//        ui.hexViewer.setSelection(debug.start, debug.end);
//    else
//        ui.hexViewer.deselect();
//});
//var parsedJsonRes = parsedToJson(res);
//lineInfo = parsedJsonRes.lineInfo;
//console.log(lineInfo);
//ui.parsedDataViewer.setValue(parsedJsonRes.json);
//ui.hexViewer.setIntervals(parsedJsonRes.intervals);
//# sourceMappingURL=parsedToJson.js.map