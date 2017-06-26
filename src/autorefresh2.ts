function checkModifications2() {
    fetch("/onchange").then(_ => location.reload(true), _ => setTimeout(checkModifications2, 750));
}

if(location.hostname === "127.0.0.1")
    checkModifications2();
