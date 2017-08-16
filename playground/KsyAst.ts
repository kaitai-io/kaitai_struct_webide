export namespace KsyAst {
    class Position {
        constructor(public pos: number, public row: number, public column: number) { }
    }

    class TextRange {
        constructor(public start?: Position, public end?: Position) { }
    }

    enum NodeKind { Map, Sequence, Key }

    class Node {
        // kind: NodeKind;
        padding: number;

        constructor(public parent: Node) { }
    }

    class Key {
        range: TextRange = new TextRange();
        text: string;
    }

    class KeyValuePair {
        constructor(public key?: Key, public value?: Node) { }
    }

    class Map extends Node {
        range: TextRange = new TextRange();
        items: KeyValuePair[] = [];
        invalidKeys: string[] = [];
    }

    class Sequence extends Node {
        items: Node[] = [];
    }

    class LiteralNode extends Node {
        constructor(parent: Node, public value: any) { super(parent); }
    }

    export class Converter {
        static astToRaw(ast: Node): any {
            if (ast instanceof Map) {
                if (ast.items.length === 0 && ast.invalidKeys.length !== 0)
                    return ast.invalidKeys.join(" ");

                const result = {};
                for (const item of ast.items)
                    result[item.key.text] = this.astToRaw(item.value);
                return result;
            } else if (ast instanceof LiteralNode) {
                return ast.value;
            } else if (ast instanceof Sequence) {
                return ast.items.map(x => this.astToRaw(x));
            }
        }
    }

    export class Parser {
        lines: string[];
        line: string = "";
        linePadding: number;
        linePos: number;
        lineLen: number;
        row = -1;
        rowStartOffset = 0;
        errorCount = 0;

        constructor(public input: string) {
            this.lines = input.split("\n");
            this.nextLine();
        }

        getPosition() { return new Position(this.rowStartOffset + this.linePos, this.row, this.linePos); }

        nextLine() {
            if (this.row === this.lines.length - 1) {
                this.linePos = this.lineLen - 1;
                return false;
            }

            this.row++;
            this.rowStartOffset += this.line.length + 1;
            this.line = this.lines[this.row];
            this.lineLen = this.line.length;
            if (this.line[this.lineLen - 1] === "\r")
                this.lineLen--;

            this.linePos = 0;

            this.skipWhitespaceInLine();
            this.linePadding = this.linePos;

            return true;
        }

        skipWhitespaceInLine() {
            for (; this.linePos < this.lineLen; this.linePos++)
                if (this.line[this.linePos] !== " ")
                    break;
        }

        skipWhitespace() {
            while (this.isEofOrOnlyComment)
                if (!this.nextLine())
                    return false;

            return true;
        }

        get isEof() { return this.linePos >= this.lineLen; }
        get isEofOrOnlyComment() { return this.isEof || this.line[this.linePos] === "#"; }
        get isInputEof() { return this.rowStartOffset + this.linePos >= this.input.length; }

        readKey(movePos = true) {
            const key = new Key();
            key.range.start = this.getPosition();

            const tryToFinishKey = () => {
                if (this.line[this.linePos] !== ":")
                    return false;

                const isLastChar = this.linePos === this.lineLen -1;
                if (isLastChar || this.line[this.linePos + 1] === " ") {
                    key.range.end = this.getPosition();
                    this.linePos += isLastChar ? 1 : 2;
                    return true;
                }

                return false;
            };

            key.text = this.readQuotedString();

            if (key.text) {
                this.skipWhitespaceInLine();
                if (!tryToFinishKey()) {
                    this.error("Invalid character after quoted key!");
                    key.text = null;
                }
            } else {
                for (; this.linePos < this.lineLen; this.linePos++) {
                    if (tryToFinishKey()) {
                        key.text = this.line.substring(key.range.start.column, key.range.end.column).trim();

                        const keyAsInt = parseInt(key.text); // convert hex key to dec key
                        if (!Number.isNaN(keyAsInt))
                            key.text = keyAsInt.toString();

                        break;
                    }
                }
            }

            if (key.text === null || !movePos)
                this.linePos = key.range.start.column;

            return key.text === null ? null : key;
        }

        error(text: string, range?: TextRange) {
            if (this.errorCount++ > 100)
                throw new Error("Fail safe!");

            const row = range ? range.start.row : this.row;
            const column = range ? range.start.column : this.linePos;
            console.log(`${text}. Affected line: '${this.lines[row]}' (row: ${row}, linePos: ${column}).`);
        }

        isSequenceStart() {
            return this.line.startsWith("- ", this.linePos);
        }

        skipSequenceStart() {
            if (!this.isSequenceStart())
                return false;

            this.linePos += 2;
            return true;
        }

        tryToReadSequence(parent: Node): Sequence {
            if (!this.skipSequenceStart())
                return null;

            const seq = new Sequence(parent);
            seq.padding = this.linePadding;

            while (true) {
                if (!this.skipWhitespace()) break;

                let item: Node;
                if (this.readKey(false) !== null)
                    item = this.readMap(seq);
                else
                    item = this.readLiteral(seq);

                seq.items.push(item);

                if (!this.skipWhitespace()) break;
                if (this.linePadding !== seq.padding) break;
                if (!this.skipSequenceStart()) break;
            }

            return seq;
        }

        get remainingLine() { return this.line.substr(this.linePos); }

        readQuotedString() {
            const strStartTag = this.line[this.linePos];
            if (!(strStartTag === "'" || strStartTag === "\""))
                return null;

            this.linePos++;

            let prevC = null, str = "";
            for (; this.linePos < this.lineLen; this.linePos++) {
                const c = this.line[this.linePos];
                if (c === strStartTag) {
                    this.linePos++;
                    break;
                } else if (c === "\\") {
                    if (this.linePos === this.lineLen - 1) {
                        this.error(`Non-closed quoted string: "${str}".`);
                        break;
                    }

                    this.linePos++;
                    const quotedChar = this.line[this.linePos];
                    if (quotedChar === "0") {
                        str += "\0";
                    } else if (quotedChar === "n") {
                        str += "\n";
                    } else if (quotedChar === "u") {
                        str += String.fromCharCode(parseInt(this.line.substr(this.linePos + 1, 4), 16));
                        this.linePos += 4;
                    } else if (quotedChar === "x") {
                        str += String.fromCharCode(parseInt(this.line.substr(this.linePos + 1, 2), 16));
                        this.linePos += 2;
                    } else
                        str += quotedChar;
                }
                else
                    str += c;
            }

            return str;
        }

        strToLiteral(str: string) {
            let value: any = str;

            if (str === "true") value = true;
            else if (str === "false") value = false;
            else if (/^[-+]?0[xX][0-9a-fA-F]+\s*$/.exec(str)) value = parseInt(str, 16);
            else if (/^[-+]?(\d+\.)?\d+(e\d+)?\s*$/.exec(str)) value = parseFloat(str);

            return value;
        }

        readArray() {
            if (this.line[this.linePos] !== "[") return null;
            this.linePos++;

            const result = [];
            while (true) {
                this.skipWhitespaceInLine();
                const c2 = this.line[this.linePos];
                const isEnd = c2 === "]";

                if (isEnd || c2 === ",") {
                    this.linePos++;
                    if (isEnd)
                        break;
                }
                this.skipWhitespaceInLine();

                const quotedStr = this.readQuotedString();
                if (quotedStr)
                    result.push(quotedStr);
                else {
                    const origLinePos = this.linePos;
                    let endPos = this.lineLen;

                    for (; this.linePos < this.lineLen; this.linePos++) {
                        const c = this.line[this.linePos];
                        const isSeparator = c === ",";
                        if (isSeparator || c === "]") {
                            endPos = this.linePos;
                            break;
                        }
                    }

                    if (this.isEof)
                        this.error("Could not find array end!");

                    const str = this.line.substring(origLinePos, endPos);
                    const value = this.strToLiteral(str);
                    result.push(value);
                }
            }

            return result;
        }

        readLineWithoutComment() {
            const commentStart = this.line.indexOf("#", this.linePos);
            const str = commentStart === -1 ? this.line.substr(this.linePos) :
                this.line.substring(this.linePos, commentStart).trim();
            this.nextLine();
            return str;
        }

        readBlockString() {
            const startChar = this.line[this.linePos];
            const foldedStyle = startChar === ">";
            if (!(startChar === "|" || foldedStyle)) return null;
            this.linePos++;

            const modChar = this.line[this.linePos];
            if (modChar === "-" || modChar === "+")
                this.linePos++;
            this.nextLine();

            const basePadding = this.linePadding;

            let result = "";
            while (true) {
                const pad = this.linePadding - basePadding;
                if (pad > 0)
                    result += " ".repeat(pad);

                const line = this.remainingLine;
                result += line;

                this.nextLine();
                const currPad = this.linePadding - basePadding;
                if (!this.isEof && this.linePadding < basePadding)
                    break;
                result += foldedStyle && !this.isEof && currPad === 0 ? (line.length === 0 ? "" : " ") : "\n";
            }

            if (modChar !== "-")
                result += "\n";

            return result;
        }

        readLiteral(parent: Node): LiteralNode {
            this.skipWhitespaceInLine();

            let value: any = this.readQuotedString() || this.readArray();
            if (value)
                this.nextLine();
            else
                value = this.readBlockString() || this.strToLiteral(this.readLineWithoutComment().trim());

            const literal = new LiteralNode(parent, value);
            return literal;
        }

        readMap(parent: Node): Map {
            const map = new Map(parent);
            map.padding = this.linePos;
            map.range.start = this.getPosition();

            const expectedPadding = !parent ? 0 : parent.padding + 2;
            if (map.padding !== expectedPadding)
                this.error(`Invalid padding while parsing mapping (expected: ${expectedPadding}, actual: ${map.padding}.`);

            while (true) {
                const kvp = new KeyValuePair(this.readKey());
                if (kvp.key === null) {
                    this.error(`Mapping key not found!`);
                    map.invalidKeys.push(this.remainingLine);
                    if (!this.nextLine()) // probably invalid line?
                        break;
                }
                else {
                    map.items.push(kvp);

                    this.skipWhitespaceInLine();
                    const inlineValue = !this.isEofOrOnlyComment;
                    if (inlineValue)
                        kvp.value = this.readLiteral(map);

                    const isEnd = !this.skipWhitespace();
                    const invalidSeqIndent = this.linePos === map.padding && this.isSequenceStart();
                    if (invalidSeqIndent)
                        this.error("Sequence is not indented properly!");

                    if (!isEnd && this.linePos > map.padding || invalidSeqIndent) { // child level
                        if (inlineValue)
                            this.error("Found inline value and intended value too!");
                        kvp.value = this.tryToReadSequence(map) || this.readMap(map);
                    } else { // parent or same level
                        if (!inlineValue) {
                            this.error("No value was supplied!", kvp.key.range);
                            kvp.value = new LiteralNode(map, null);
                        }
                    }
                }

                if (this.linePos < map.padding) break;  // parent level, this map is finished
                if (this.isInputEof) break;
            }

            map.range.end = this.getPosition();
            return map;
        }

        parse(): Map {
            this.skipWhitespace();
            return this.readMap(null);
        }
    }
}
