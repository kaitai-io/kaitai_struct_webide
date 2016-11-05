class HexViewUtils {
    static zeroFill(str, padLen) {
        while (str.length < padLen)
            str = '0' + str;
        return str;
    }

    static addrHex(address) {
        //var addrHexLen = Math.ceil(Math.log(this.buffer.length) / Math.log(16));
        var addrHexLen = 8;
        return this.zeroFill(address.toString(16), addrHexLen);
    }

    static byteAscii(bt) {
        return bt == 32 ? '\u00a0' : bt < 32 || (0x7f <= bt && bt <= 0xa0) || bt == 0xad ? '.' : String.fromCharCode(bt);
    }

    static byteHex(bt) {
        return this.zeroFill(bt.toString(16), 2);
    }

    static generateRow(bytesPerLine, level) {
        level = level || 3;
        function cr(tag, className): any {
            var elem = document.createElement(tag);
            elem.className = className;
            return elem;
        }

        var hexRow = cr('div', 'hexRow');
        hexRow.addrPart = cr('span', 'addrPart');
        hexRow.hexPart = cr('span', 'hexPart');
        hexRow.asciiPart = cr('span', 'asciiPart');
        hexRow.appendChild(hexRow.addrPart);
        hexRow.appendChild(hexRow.hexPart);
        hexRow.appendChild(hexRow.asciiPart);

        for (var iChar = 0; iChar < bytesPerLine; iChar++) {
            hexRow.asciiPart.appendChild(cr('span', `asciicell cell${iChar}`));

            var cell = cr('span', `hexcell cell${iChar}`);

            var levels = [];
            var prevLevel = cell;
            for (var i = 0; i < level; i++) {
                var levelSpan = cr('span', `l${i}`);
                levelSpan.appendChild(prevLevel);
                levels[level - 1 - i] = prevLevel = levelSpan;
            }

            prevLevel.cell = cell;
            prevLevel.levels = levels;
            hexRow.hexPart.appendChild(prevLevel);
        }

        return hexRow;
    }
}

interface IDataProvider {
    length: number;
    get(offset: number, length: number);
}

class HexViewer {
    private rowHeight = 21;
    private bytesPerLine = 16;

    private intervals: any[];
    private rows = [];
    private topRow = 0;
    private maxLevel = 3;
    private rowCount: number;
    private maxScrollHeight: number;
    private maxRow: number;
    private totalHeight: number;
    private visibleOffsetStart: number;
    private visibleOffsetEnd: number;
    private scrollbox: JQuery;
    private heightbox: JQuery;
    private content: JQuery;
    private contentOuter: JQuery;

    private mouseDownOffset: number;
    private canDeselect: boolean;

    public selectionStart: number = -1;
    public selectionEnd: number = -1;
    public onSelectionChanged;

    private cellMouseAction(e) {
        if (e.type == "mouseup")
            this.content.unbind('mousemove');

        var cell = e.target;
        if (!('dataOffset' in cell)) {
            var cells = $(cell).find('.hexcell, .asciicell');
            if (cells.length == 1)
                cell = cells.get(0);
        }

        if ('dataOffset' in cell) {
            if (e.type == "mousedown") {
                this.canDeselect = this.selectionStart == cell.dataOffset && this.selectionEnd == cell.dataOffset;
                this.mouseDownOffset = cell.dataOffset;
                this.content.on('mousemove', e => this.cellMouseAction(e));
                this.setSelection(cell.dataOffset, cell.dataOffset);
            }
            else if (e.type == "mousemove") {
                this.setSelection(this.mouseDownOffset, cell.dataOffset);
                this.canDeselect = false;
            }
            else if (e.type == "mouseup" && this.canDeselect && this.mouseDownOffset == cell.dataOffset)
                this.deselect();

            e.preventDefault();
        }
    }

    constructor(containerId: string, public dataProvider?: IDataProvider) {
        this.dataProvider = dataProvider;

        this.scrollbox = $('#' + containerId).addClass('hexViewer');
        this.heightbox = $('<div class="heightbox"></div>').appendTo(this.scrollbox);
        this.contentOuter = $('<div class="contentOuter"></div>').appendTo(this.scrollbox);

        var charSpans = "0123456789ABCDEF".split('').map((x, i) => `<span class="c${i}">${x}</span>`).join('');
        this.contentOuter.append($(`<div class="header"><span class="hex">${charSpans}</span><span class="ascii">${charSpans}</span></div>`));

        this.content = $('<div class="content"></div>').appendTo(this.contentOuter).on('mousedown', e => this.cellMouseAction(e));
        $(document).mouseup(e => this.cellMouseAction(e));

        this.intervals = [];

        this.scrollbox.on('scroll', e => {
            var scrollTop = this.scrollbox.scrollTop();
            this.contentOuter.css('top', scrollTop + 'px');
            var percent = scrollTop / this.maxScrollHeight;
            var newTopRow = Math.round(this.maxRow * percent);
            if (this.topRow !== newTopRow) {
                this.topRow = newTopRow;
                this.refresh();
            }
        });

        $(window).on('resize', () => this.resize());
        this.resize();
    }

    public resize() {
        if (!this.dataProvider) return false;

        var totalRowCount = Math.ceil(this.dataProvider.length / this.bytesPerLine);
        this.totalHeight = totalRowCount * this.rowHeight;
        this.heightbox.height(this.totalHeight + 16);

        var boxHeight = this.contentOuter.innerHeight() - 16;
        this.content.html('');
        this.maxScrollHeight = this.totalHeight - boxHeight;
        this.rowCount = Math.ceil(boxHeight / this.rowHeight);
        console.log('boxHeight', boxHeight, 'rowCount', this.rowCount);
        this.maxRow = Math.ceil(this.dataProvider.length / this.bytesPerLine - this.rowCount + 1);

        this.rows = [];
        for (var i = 0; i < this.rowCount; i++) {
            var row = HexViewUtils.generateRow(this.bytesPerLine, this.maxLevel);
            this.rows[i] = row;
            this.content.append(row);
        }

        this.refresh();
    }

    public refresh() {
        if (!this.dataProvider) return false;

        this.visibleOffsetStart = this.topRow * this.bytesPerLine;
        this.visibleOffsetEnd = (this.topRow + this.rowCount - 1) * this.bytesPerLine - 1;

        var intIdx;
        for (intIdx = 0; intIdx < this.intervals.length; intIdx++)
            if (this.intervals[intIdx].start <= this.visibleOffsetStart && this.visibleOffsetStart <= this.intervals[intIdx].end)
                break;

        var viewData = this.dataProvider.get(this.visibleOffsetStart, Math.min(this.rowCount * this.bytesPerLine, this.dataProvider.length - this.visibleOffsetStart));
        for (var iRow = 0; iRow < this.rowCount; iRow++) {
            var rowOffset = iRow * this.bytesPerLine;
            var row = this.rows[iRow];
            row.addrPart.innerText = rowOffset < viewData.length ? HexViewUtils.addrHex(this.visibleOffsetStart + rowOffset) : '';

            for (var iCell = 0; iCell < this.bytesPerLine; iCell++) {
                var viewDataOffset = rowOffset + iCell;
                var dataOffset = this.visibleOffsetStart + viewDataOffset;
                var hexCh, ch;
                if (viewDataOffset < viewData.length) {
                    var b = viewData[rowOffset + iCell];
                    hexCh = HexViewUtils.byteHex(b);
                    ch = HexViewUtils.byteAscii(b);
                } else {
                    hexCh = '\u00a0\u00a0';
                    ch = '\u00a0';
                }

                var hexCell = row.hexPart.childNodes[iCell];
                var asciiCell = row.asciiPart.childNodes[iCell];

                hexCell.cell.innerText = hexCh;
                asciiCell.innerText = ch;

                hexCell.cell.dataOffset = asciiCell.dataOffset = dataOffset;

                var isSelected = this.selectionStart <= dataOffset && dataOffset <= this.selectionEnd;
                $(hexCell.cell).toggleClass('selected', isSelected);
                $(asciiCell).toggleClass('selected', isSelected);

                var skipInt = 0;
                for (var level = 0; level < this.maxLevel; level++) {
                    var int = this.intervals[intIdx + level];
                    var intIn = int && int.start <= dataOffset && dataOffset <= int.end;
                    var intStart = intIn && int.start === dataOffset;
                    var intEnd = intIn && int.end === dataOffset;
                    hexCell.levels[level].className = `l${this.maxLevel - 1 - level}` +
                        (intIn ? ` m${level}` : "") + (intStart ? " start" : "") + (intEnd ? " end" : "") + (isSelected ? " selected" : "");
                    if (intEnd)
                        skipInt++;
                }

                intIdx += skipInt;
            }
        }
    }

    public setIntervals(intervals) {
        //this.intervals = intervals.sort((a, b) => a.start != b.start ? a.start - b.start : a.end - b.end);
        this.intervals = [];
        for (var i = 0; i < intervals.length; i++) {
            var int = intervals[i];
            if (i == 0 || !(int.start == intervals[i - 1].start && int.end == intervals[i - 1].end))
                this.intervals.push(int);
        }
            
        console.log('setIntervals', this.intervals.map(i => `${i.start}-${i.end}`).join(' '));
        this.refresh();
    }

    public setDataProvider(dataProvider: IDataProvider) {
        this.dataProvider = dataProvider;
        this.resize();
    }

    public deselect() {
        this.setSelection(-1, -1);
    }

    public setSelection(start: number, end: number) {
        var oldStart = this.selectionStart, oldEnd = this.selectionEnd;
        this.selectionStart = start < end ? start : end;
        this.selectionEnd = Math.min(start < end ? end : start, this.dataProvider.length - 1);
        if (this.selectionStart != oldStart || this.selectionEnd != oldEnd) {
            if (this.onSelectionChanged)
                this.onSelectionChanged();

            if (this.selectionStart != -1) {
                if (this.selectionEnd > this.visibleOffsetEnd)
                    this.topRow = Math.max(Math.floor(this.selectionEnd / this.bytesPerLine) - this.rowCount + 2, 0);
                else if (this.selectionStart < this.visibleOffsetStart)
                    this.topRow = Math.floor(this.selectionStart / this.bytesPerLine);

                this.scrollbox.scrollTop(Math.round(this.topRow / this.maxRow * this.maxScrollHeight));
            }

            this.refresh();
        }
    }
}