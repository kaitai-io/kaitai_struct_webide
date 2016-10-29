var lastMod = null;
function checkModifications() {
    $.ajax({ type: "HEAD", url: location.href, cache: false }).done(function (message, text, jqXHR) {
        console.log('checkmod');
        var currMod = jqXHR.getResponseHeader('Last-Modified');
        if(lastMod !== null && currMod !== lastMod)
            location.reload(true);
        lastMod = currMod;
        setTimeout(checkModifications, 750);
    });
}

checkModifications();