import * as bowser from "bowser";

if (localStorage.getItem("hideUnsupported") === "true" || bowser.check({ chrome: "55", firefox: "52", safari: "10.1", opera: "50" }, true))
    document.getElementById("unsupportedBrowser").style.display = "none";

document.querySelector("#unsupportedBrowser .closeBtn").addEventListener("click", () => {
    localStorage.setItem("hideUnsupported", "true");
    document.getElementById("unsupportedBrowser").style.display = "none";
});
