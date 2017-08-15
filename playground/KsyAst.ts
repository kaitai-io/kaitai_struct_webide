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
        row = -1;
        rowStartOffset = 0;
        errorCount = 0;

        constructor(public input: string) {
            this.lines = input.split("\n");
            this.nextLine();
        }

        getPosition(column = 0) { return new Position(this.rowStartOffset + column, this.row, column); }

        nextLine() {
            if (this.row === this.lines.length - 1)
                return false;

            this.row++;
            this.rowStartOffset += this.line.length + 1;
            this.line = this.lines[this.row];
            this.linePos = 0;

            this.skipWhitespaceInLine();
            this.linePadding = this.linePos;

            return true;
        }

        skipWhitespaceInLine() {
            for (; this.linePos < this.line.length; this.linePos++)
                if (this.line[this.linePos] !== " ")
                    break;
        }

        skipWhitespace() {
            while (this.isEofOrOnlyComment)
                if (!this.nextLine())
                    return false;

            return true;
        }

        get isEof() { return this.linePos >= this.line.length; }
        get isEofOrOnlyComment() { return this.isEof || this.line[this.linePos] === "#"; }
        get isInputEof() { return this.rowStartOffset + this.linePos >= this.input.length; }

        readKey(movePos = true) {
            const key = new Key();
            key.range.start = this.getPosition();

            const line = this.line;
            for (let i = this.linePos; i < line.length; i++) {
                if (this.line[i] === ":") {
                    const isLastChar = i === line.length -1;
                    if (isLastChar || line[i + 1] === " ") {
                        key.text = line.substring(this.linePos, i).trim();
                        key.range.end = this.getPosition();
                        if (movePos)
                            this.linePos = i + (isLastChar ? 1 : 2);
                        return key;
                    }
                }
            }

            return null;
        }

        error(text: string, range?: TextRange) {
            if (this.errorCount++ > 10)
                throw new Error("Fail safe!");

            const row = range ? range.start.row : this.row;
            const column = range ? range.start.column : this.linePos;
            console.log(`${text}. Affected line: '${this.lines[row]}' (row: ${row}, linePos: ${column}).`);
        }

        skipSequenceStart() {
            if (!this.line.startsWith("- ", this.linePos))
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

        readLiteral(parent: Node): LiteralNode {
            const remainingLine = this.remainingLine;
            this.nextLine();
            const literal = new LiteralNode(parent, remainingLine);
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
                    this.nextLine(); // probably invalid line?
                }
                else {
                    map.items.push(kvp);

                    this.skipWhitespaceInLine();
                    const inlineValue = !this.isEofOrOnlyComment;
                    if (inlineValue)
                        kvp.value = this.readLiteral(map);

                    const isEnd = !this.skipWhitespace();

                    if (!isEnd && this.linePos > map.padding) { // child level
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
            return this.readMap(null);
        }
    }
}
