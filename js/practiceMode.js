var practiceMode = {
    chall: 'url',
    challs: {
        'chall1': {
            inputFn: 'practice/chall1/input.bin',
            starterKsy: `
meta:
  id: chall1
  endian: le
seq:
  - id: my_first_byte
    type: u1`,
            solution: {
                "myFirstByte": 42,
                "iLikeNegativeNumbers": -1337,
                "halfLife3Confirmed": 3.33,
                "onlyOne": 1,
                "message": "★★★ Congratulations! ★★★",
                "trailer": "EOFEOF"
            },
            description: `
<div style="font-size:20px; text-align:center; margin-bottom:18px; margin-top:3px">Welcome to practice mode!</div>
<p align="justify">
    Your goal is to create a <a href="https://github.com/kaitai-io/kaitai_struct/wiki/File-description" target="_blank">Kaitai format descriptor</a>
    which will parse the input binary (top-right corner) and generate the same output as in the editor below.
</p>
<p align="justify">The red lines are the parts which are not parsed correctly yet, while the green lines are there but they should not.</p>
<p align="justify">Recommended readings:</p>
<ul style="font-size:14px">
    <li>
        <a href="https://github.com/kaitai-io/kaitai_struct/wiki/Attribute-description" target="_blank">Attributes (id, type, size)</a><br/>
        (valid encodings: 'ascii', 'utf-8', etc)
    </li>
    <li><a href="https://github.com/kaitai-io/kaitai_struct/wiki/Primitive-data-types" target="_blank">Primitive data types</a></li>
</ul>
<p align="justify">Parse the fields as described here:</p>
<ul style="font-size:14px">
    <li>unsigned, 1 byte long, little-endian integer (byte) called 'myFirstByte'</li>
    <li>signed, 2 byte long, little-endian integer (short) called 'iLikeNegativeNumbers'</li>
    <li>unsigned, 4 byte long, little-endian float called 'halfLife3Confirmed'</li>
    <li>unsigned, 8 byte long, big-endian integer called 'onlyOne'</li>
    <li>null-terminated, utf-8 encoded string called 'message'</li>
    <li>fixed, 6 byte long, ascii string called 'trailer'</li>
</ul>
<p align="justify">Here is the expected output:</p>
`
        }
    }
};
//# sourceMappingURL=practiceMode.js.map