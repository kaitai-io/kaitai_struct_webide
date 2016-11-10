var lastMod = null;
function checkModifications() {
    $.getJSON('status', function(status) {
        if(lastMod !== null && status.lastchange.modTime !== lastMod)
            location.reload(true);
        lastMod = status.lastchange.modTime;
        setTimeout(checkModifications, 750);
    });
}

if(location.hostname === '127.0.0.1')
    checkModifications();