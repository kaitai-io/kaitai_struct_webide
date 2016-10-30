var lastMod = null;
function checkModifications() {
    $.getJSON('/status', status => {
        if(lastMod !== null && status.lastchange.modTime !== lastMod)
            location.reload(true);
        lastMod = status.lastchange.modTime;
        setTimeout(checkModifications, 750);
    });
}

checkModifications();