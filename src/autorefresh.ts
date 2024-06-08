function checkModifications() {
    $.getJSON("/onchange", () => location.reload(true))
        .fail(() => setTimeout(checkModifications, 750));
}

if(location.hostname === "127.0.0.1" || location.hostname === "localhost") {
    checkModifications();
}
