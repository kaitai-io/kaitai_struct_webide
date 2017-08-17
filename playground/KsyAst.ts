export namespace KsyAst {
    class Position {
        constructor(public pos: number, public row: number, public column: number) { }
    }

    class TextRange {
        constructor(public start?: Position, public end?: Position) { }
    }

    enum NodeKind { Map, Sequence, Key }

    class Node {
        padding: number;
        range: TextRange = new TextRange();

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
        items: KeyValuePair[] = [];
        invalidKeys: string[] = [];
    }

    class Sequence extends Node {
        items: Node[] = [];
    }

    class LiteralNode extends Node {
        constructor(parent: Node, public value: any = null) { super(parent); }
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

    export class Reader {
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

        getPosition(diff = 0) { return new Position(this.rowStartOffset + this.linePos + diff, this.row, this.linePos + diff); }

        nextLine() {
            if (this.row === this.lines.length - 1) {
                this.linePos = this.lineLen;
                return false;
            }

            this.row++;
            this.rowStartOffset += this.row === 0 ? 0 : this.line.length + 1;
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

        error(text: string, range?: TextRange) {
            if (this.errorCount++ > 100)
                throw new Error("Fail safe!");

            const row = range ? range.start.row : this.row;
            const column = range ? range.start.column : this.linePos;
            console.log(`${text}. Affected line: '${this.lines[row]}' (row: ${row}, linePos: ${column}).`);
        }

        readN(len: number) {
            const result = this.line.substr(this.linePos, len);
            this.linePos += len;
            return result;
        }

        get remainingLine() { return this.line.substr(this.linePos); }

        readUntilSeparator(itemSep, endSep) {
            const origLinePos = this.linePos;
            for (; this.linePos < this.lineLen; this.linePos++) {
                const c = this.line[this.linePos];
                if (c === itemSep || c === endSep) {
                    const value = this.line.substring(origLinePos, this.linePos);
                    if (c === itemSep)
                        this.linePos++;
                    return value;
                }
            }

            this.error(`Could not find end separator (${endSep})!`);
            return null;
        }

        tryReadToken(token: string) {
            if (this.line.startsWith(token, this.linePos)) {
                this.linePos += token.length;
                return token;
            }

            return null;
        }
    }

    export class Parser extends Reader {
        readKey(movePos = true) {
            const key = new Key();
            key.range.start = this.getPosition();

            const tryToFinishKey = () => {
                if (!this.tryReadToken(":")) return false;
                key.range.end = this.getPosition(-1);
                return this.isEof || this.tryReadToken(" ");
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

            if (key.text === null || !movePos) // operation failed, restore state
                this.linePos = key.range.start.column;

            return key.text === null ? null : key;
        }

        isSequenceStart() {
            return this.line.startsWith("- ", this.linePos);
        }

        tryToReadSequence(parent: Node): Sequence {
            if (!this.isSequenceStart()) return null;

            const seq = this.start(new Sequence(parent));

            while (true) {
                this.linePos += 2;
                if (!this.skipWhitespace()) break;

                let item: Node = this.readInlineMap(parent) ||
                    (this.readKey(false) !== null && this.readMap(seq)) ||
                    this.readLiteral(seq);

                seq.items.push(item);

                if (!this.skipWhitespace() || this.linePadding !== seq.padding ||
                    !this.isSequenceStart()) break;
            }

            return this.end(seq);
        }

        readQuotedString() {
            const strStartTag = this.tryReadToken("'") || this.tryReadToken("\"");
            if (!strStartTag) return null;

            let str = "";
            while (this.linePos < this.lineLen && !this.tryReadToken(strStartTag)) {
                if      (this.tryReadToken("\\0"))  str += "\0";
                else if (this.tryReadToken("\\n"))  str += "\n";
                else if (this.tryReadToken("\\\"")) str += "\"";
                else if (this.tryReadToken("\\'"))  str += "'";
                else if (this.tryReadToken("\\\\")) str += "\\";
                else if (this.tryReadToken("\\u"))
                    str += String.fromCharCode(parseInt(this.readN(4), 16));
                else if (this.tryReadToken("\\x"))
                    str += String.fromCharCode(parseInt(this.readN(2), 16));
                else
                    str += this.readN(1);
            }
            return str;
        }

        strToLiteral(str: string): string|boolean|number {
            let value: any = str;

            if (str === "true") value = true;
            else if (str === "false") value = false;
            else if (/^[-+]?0[xX][0-9a-fA-F]+\s*$/.exec(str)) value = parseInt(str, 16);
            else if (/^[-+]?(\d+\.)?\d+(e\d+)?\s*$/.exec(str)) value = parseFloat(str);
            else value = value.trim();

            return value;
        }

        readArray() {
            if (!this.tryReadToken("[")) return null;

            const result = [];
            while (true) {
                this.skipWhitespaceInLine();
                if (this.tryReadToken("]"))
                    break;

                const quotedStr = this.readQuotedString();
                if (quotedStr)
                    result.push(quotedStr);

                const str = this.readUntilSeparator(",", "]");
                if (quotedStr && str.trim().length !== 0)
                    this.error("Found data after quoted string in array!");
                else if (!quotedStr) {
                    const value = this.strToLiteral(str);
                    result.push(value);
                }
            }

            return result;
        }

        readBlockString() {
            const startChar = this.tryReadToken(">") || this.tryReadToken("|");
            if (!startChar) return null;

            const modChar = this.tryReadToken("+") || this.tryReadToken("-");
            this.nextLine();

            const foldedStyle = startChar === ">";
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

        readInlineMap(parent: Node): Map {
            if (!this.tryReadToken("{")) return null;

            const map = this.start(new Map(parent));

            while (true) {
                this.skipWhitespaceInLine();
                if (this.tryReadToken("}"))
                    break;

                const kvp = new KeyValuePair(this.readKey());
                if (kvp.key === null) {
                    this.error(`Mapping key not found!`);
                    break; // TODO
                } else {
                    map.items.push(kvp);

                    const value = kvp.value = this.start(new LiteralNode(map));
                    value.value = this.readQuotedString() || this.readArray() || this.readInlineMap(parent);
                    if (!value) {
                        const str = this.readUntilSeparator(",", "}");
                        value.value = this.strToLiteral(str);
                    }

                    this.end(value);
                }
            }

            return this.end(map);
        }

        readLiteral(parent: Node): LiteralNode {
            this.skipWhitespaceInLine();

            const result = this.start(new LiteralNode(parent));

            result.value = this.readQuotedString() || this.readArray();
            if (result.value) {
                result.range.end = this.getPosition();
                this.nextLine();
            } else {
                result.value = this.readBlockString();
                if (!result.value) {
                    const commentStart = this.line.indexOf("#", this.linePos);
                    const str = commentStart === -1 ? this.line.substr(this.linePos) :
                        this.line.substring(this.linePos, commentStart).trim();
                    this.linePos = this.lineLen;
                    result.range.end = this.getPosition();
                    this.nextLine();
                    result.value = this.strToLiteral(str.trim());
                } else
                    result.range.end = this.getPosition();
            }

            return result;
        }

        start<T extends Node>(node: T): T {
            node.padding = this.linePadding;
            node.range.start = this.getPosition();
            return node;
        }

        end<T extends Node>(node: T): T {
            node.range.end = this.getPosition();
            return node;
        }

        readMap(parent: Node): Map {
            const map = this.start(new Map(parent));
            map.padding = this.linePos;

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
                        kvp.value = this.readInlineMap(map) || this.readLiteral(map);

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

            return this.end(map);
        }

        parse(): Map {
            this.skipWhitespace();
            return this.readMap(null);
        }
    }
}
