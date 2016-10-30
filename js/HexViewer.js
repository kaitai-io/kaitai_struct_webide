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
        function cr(tag, className) {
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
class HexViewer {
    constructor(containerId, dataProvider) {
        this.dataProvider = dataProvider;
        this.rowHeight = 21;
        this.bytesPerLine = 16;
        this.rows = [];
        this.topRow = 0;
        this.maxLevel = 3;
        this.dataProvider = dataProvider;
        this.scrollbox = $('#' + containerId);
        this.scrollbox.addClass('hexViewer');
        this.heightbox = $('<div class="heightbox"></div>').appendTo(this.scrollbox);
        this.content = $('<div class="content"></div>').appendTo(this.scrollbox);
        this.intervals = [];
        this.scrollbox.on('scroll', e => {
            var scrollTop = this.scrollbox.scrollTop();
            this.content.css('top', scrollTop + 'px');
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
    resize() {
        if (!this.dataProvider)
            return false;
        var totalRowCount = Math.ceil(this.dataProvider.length / this.bytesPerLine);
        this.totalHeight = totalRowCount * this.rowHeight;
        this.heightbox.height(this.totalHeight);
        var boxHeight = this.scrollbox.outerHeight();
        this.content.height(boxHeight + 'px');
        this.content.html('');
        this.maxScrollHeight = this.totalHeight - boxHeight;
        this.rowCount = Math.ceil(boxHeight / this.rowHeight);
        this.maxRow = Math.ceil(this.dataProvider.length / this.bytesPerLine - this.rowCount + 1);
        this.rows = [];
        for (var i = 0; i < this.rowCount; i++) {
            var row = HexViewUtils.generateRow(this.bytesPerLine, this.maxLevel);
            this.rows[i] = row;
            this.content.append(row);
        }
        this.refresh();
    }
    refresh() {
        if (!this.dataProvider)
            return false;
        var startOffset = this.topRow * this.bytesPerLine;
        var intIdx;
        for (intIdx = 0; intIdx < this.intervals.length; intIdx++)
            if (this.intervals[intIdx].start <= startOffset && startOffset <= this.intervals[intIdx].end)
                break;
        var data = this.dataProvider.get(startOffset, Math.min(this.rowCount * this.bytesPerLine, this.dataProvider.length - startOffset));
        for (var iRow = 0; iRow < this.rowCount; iRow++) {
            var rowOffset = iRow * this.bytesPerLine;
            var row = this.rows[iRow];
            row.addrPart.innerText = rowOffset < data.length ? HexViewUtils.addrHex(startOffset + rowOffset) : '';
            for (var iCell = 0; iCell < this.bytesPerLine; iCell++) {
                var dataOffset = rowOffset + iCell;
                var cellOffset = startOffset + dataOffset;
                var hexCh, ch;
                if (dataOffset < data.length) {
                    var b = data[rowOffset + iCell];
                    hexCh = HexViewUtils.byteHex(b);
                    ch = HexViewUtils.byteAscii(b);
                }
                else {
                    hexCh = '\u00a0\u00a0';
                    ch = '\u00a0';
                }
                var hexCell = row.hexPart.childNodes[iCell];
                hexCell.cell.innerText = hexCh;
                row.asciiPart.childNodes[iCell].innerText = ch;
                var skipInt = 0;
                for (var level = 0; level < this.maxLevel; level++) {
                    var int = this.intervals[intIdx + level];
                    var intIn = int && int.start <= cellOffset && cellOffset <= int.end;
                    var intStart = intIn && int.start === cellOffset;
                    var intEnd = intIn && int.end === cellOffset;
                    hexCell.levels[level].className = `l${this.maxLevel - 1 - level}` +
                        (intIn ? ` m${level}` : "") + (intStart ? " start" : "") + (intEnd ? " end" : "");
                    if (intEnd)
                        skipInt++;
                }
                intIdx += skipInt;
            }
        }
    }
    setIntervals(intervals) {
        this.intervals = intervals;
        this.refresh();
    }
    setDataProvider(dataProvider) {
        this.dataProvider = dataProvider;
        this.resize();
    }
}
//# sourceMappingURL=HexViewer.js.map