var refreshSelectionInput;
$(() => {
    var inputSizeElement = $("<span />").css({ display: 'none' }).appendTo(document.body);
    function resetInputWidth(target) {
        var value = $(target).val();
        inputSizeElement.text(value);
        var width = inputSizeElement.width();
        $(target).width(width + 2 + 'px');
        //console.log('resetInputWidth', $(target).val(), width);
    }
    function selectionInputChanged(e) {
        resetInputWidth(e.target);
        useHexAddr = !$(e.target).val() || $(e.target).val().startsWith('0x');
        var start = parseInt($selStart.val()), end = parseInt($selEnd.val());
        if (!isNaN(start)) {
            userChange = true;
            ui.hexViewer.setSelection(start, isNaN(end) || end < start ? start : end);
            userChange = false;
        }
    }
    var $selStart = $('#infoPanel .selStart');
    var $selEnd = $('#infoPanel .selEnd');
    var userChange = false;
    var useHexAddr = true;
    [$selStart, $selEnd].forEach(item => item.on('input', e => selectionInputChanged(e)));
    [$selStart, $selEnd].forEach(item => item.on('keydown', e => {
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            var target = $(e.target);
            setAddrInput(target, (parseInt(target.val() || $selStart.val()) || 0) + (e.key === 'ArrowDown' ? -1 : +1));
            selectionInputChanged(e);
            return false;
        }
    }));
    function setAddrInput(input, value) {
        if (value < 0)
            value = 0;
        if (dataProvider && value >= dataProvider.length)
            value = dataProvider.length - 1;
        input.val(value === null ? '' : useHexAddr ? `0x${value.toString(16)}` : value);
        resetInputWidth(input);
    }
    refreshSelectionInput = () => {
        var start = ui.hexViewer.selectionStart, end = ui.hexViewer.selectionEnd, hasSelection = start !== -1;
        if (!(userChange && $selStart.is(':focus')))
            setAddrInput($selStart, hasSelection ? start : null);
        if (!(userChange && $selEnd.is(':focus')))
            setAddrInput($selEnd, hasSelection && start !== end ? end : null);
    };
});
//# sourceMappingURL=app.selectionInput.js.map