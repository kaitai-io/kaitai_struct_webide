$(() => {
    var ksyEditor = ace.edit("ksyEditor");
    ksyEditor.setTheme("ace/theme/monokai");
    ksyEditor.getSession().setMode("ace/mode/yaml");
    $.ajax({ url: '/formats/image/png.ksy' }).done(ksyContent => {
        ksyEditor.setValue(ksyContent);
        ksyEditor.gotoLine(0);
        console.log('ajax done, len: ', ksyContent.length);
    });
})

