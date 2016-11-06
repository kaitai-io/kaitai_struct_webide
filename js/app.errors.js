var lastErrWndSize = 100; // 34
function showError(...args) {
    console.log.apply(window, args);
    var errMsg = args.filter(x => x.toString() !== {}.toString()).join(' ');
    var container = myLayout.root.contentItems[0];
    if (!ui.errorWindow) {
        container.addChild({ type: 'component', componentName: 'errorWindow', title: 'Errors' });
        ui.errorWindow.setSize(0, lastErrWndSize);
    }
    ui.errorWindow.on('resize', () => lastErrWndSize = ui.errorWindow.getElement().outerHeight());
    ui.errorWindow.on('close', () => ui.errorWindow = null);
    ui.errorWindow.getElement().children().text(errMsg);
}
function hideErrors() {
    if (ui.errorWindow) {
        ui.errorWindow.close();
        ui.errorWindow = null;
    }
}
function handleError(error) {
    if (error)
        showError('Parse error' + (error.name ? ` (${error.name})` : '') + `: ${error.message}\nCall stack: ${error.stack}`, error);
    else
        hideErrors();
}
//# sourceMappingURL=app.errors.js.map