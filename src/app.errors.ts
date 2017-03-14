import { ui, getLayoutNodeById, addEditorTab } from './app.layout';

var lastErrWndSize = 100; // 34
export function showError(...args) {
    console.log.apply(window, args);
    var errMsg = args.filter(x => x.toString() !== {}.toString()).join(' ');
    var container = getLayoutNodeById('mainArea');
    if (!ui.errorWindow) {
        container.addChild({ type: 'component', componentName: 'errorWindow', title: 'Errors' });
        ui.errorWindow.setSize(0, lastErrWndSize);
    }
    ui.errorWindow.on('resize', () => lastErrWndSize = ui.errorWindow.getElement().outerHeight());
    ui.errorWindow.on('close', () => ui.errorWindow = null);
    ui.errorWindow.getElement().children().html(htmlescape(errMsg).replace(/\n|\\n/g, '<br>'));
}

function hideErrors() {
    if (ui.errorWindow) {
        try { ui.errorWindow.close(); } catch(e){ }
        ui.errorWindow = null;
    }
}

export function handleError(error) {
    if (error)
        showError('Parse error' + (error.name ? ` (${error.name})` : '') + `: ${error.message}\nCall stack: ${error.stack}`, error);
    else
        hideErrors();
}