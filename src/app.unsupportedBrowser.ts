/// <reference path="../lib/ts-types/other.d.ts"/>
/// <reference path="../lib/ts-types/jquery.d.ts"/>
import * as bowser from "bowser";

console.log(bowser);
if (localStorage.getItem('hideUnsupported') === 'true' || bowser.check({ chrome: "53", firefox: "49" }, true))
    $('#unsupportedBrowser').hide();

$('#unsupportedBrowser .closeBtn').on('click', () => {
    localStorage.setItem('hideUnsupported', 'true');
    $('#unsupportedBrowser').hide();
});