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
        },
        'chall2': {
            inputFn: 'practice/chall2/input.bin',
            starterKsy: `
meta:
  id: chall2
  endian: be
seq:
  - id: magic
    contents: "C"
`,
            solution: {
                "magic": [67, 82, 89, 80, 84, 82, 79, 76, 79],
                "files": [
                    {
                        "filenameLen": 14,
                        "filename": "helloworld.txt",
                        "md5HashHex": [102, 99, 51, 102, 102, 57, 56, 101, 56, 99, 54, 97, 48, 100, 51, 48, 56, 55, 100, 53, 49, 53, 99, 48, 52, 55, 51, 102, 56, 54, 55, 55],
                        "contentLen": 12,
                        "content": [168, 213, 242, 253, 112, 32, 182, 141, 212, 117, 15, 38]
                    },
                    {
                        "filenameLen": 12,
                        "filename": "password.txt",
                        "md5HashHex": [98, 101, 99, 57, 50, 51, 57, 55, 54, 52, 54, 101, 56, 102, 101, 98, 57, 51, 54, 54, 55, 97, 101, 50, 101, 54, 98, 99, 57, 51, 49, 98],
                        "contentLen": 8,
                        "content": [45, 25, 181, 47, 135, 108, 249, 127]
                    },
                    {
                        "filenameLen": 4,
                        "filename": "flag",
                        "md5HashHex": [52, 97, 49, 50, 54, 102, 100, 98, 54, 55, 51, 52, 50, 56, 55, 49, 98, 50, 55, 101, 49, 102, 97, 102, 48, 102, 48, 100, 56, 49, 99, 102],
                        "contentLen": 20,
                        "content": [175, 85, 97, 230, 68, 68, 187, 144, 47, 231, 95, 101, 72, 188, 49, 89, 180, 65, 128, 227]
                    },
                    {
                        "filenameLen": 10,
                        "filename": "secret.txt",
                        "md5HashHex": [54, 53, 101, 53, 49, 102, 50, 102, 54, 99, 53, 50, 57, 51, 55, 49, 54, 100, 50, 53, 99, 55, 53, 50, 48, 101, 50, 100, 49, 98, 98, 54],
                        "contentLen": 24,
                        "content": [215, 206, 216, 68, 231, 112, 114, 139, 75, 95, 146, 236, 255, 50, 187, 226, 40, 224, 248, 168, 225, 221, 133, 111]
                    }
                ]
            },
            description: `
<div style="font-size:20px; text-align:center; margin-bottom:18px; margin-top:3px">Practice: types, sequences</div>
<p align="justify">
    Have you seen my <a href="https://platform.avatao.com/paths/d2176244-bd8b-48d1-b3e1-b63da2de4690/challenges/706bbbc9-bca4-49b2-9437-0b7ac3339b5c" target="_blank">Cryptrololololo challenge</a> on Avatao?
</p>
<p align="justify">Let's parse its file format!</p>
<p align="justify">Recommended readings:</p>
<ul style="font-size:14px">
    <li><a href="https://github.com/kaitai-io/kaitai_struct/wiki/Attribute-description" target="_blank">Attributes (contents, repeat)</a><br/></li>
    <li><a href="https://github.com/kaitai-io/kaitai_struct/wiki/Type-description" target="_blank">Type description</a></li>
    <li><a href="https://github.com/kaitai-io/kaitai_struct/wiki/Expressions" target="_blank">Expressions (size)</a></li>

</ul>
<p align="justify">
File format information:
<ul style="font-size:14px">
    <li><a href="https://platform.avatao.com/blob/706bbbc9-bca4-49b2-9437-0b7ac3339b5c/Cryptrololololo.zip" target="_blank">Source (see the encryptor.py)</a></li>
    <li>file starts with the "CRYPTROLO" magic string</li>
    <li>integers are 4-byte longs and use big-endian encoding</li>
    <li>the size of MD5 hash in hex is 32 bytes</li>
</ul>
</p>
<p align="justify">Here is the expected output:</p>
`
        }
    }
};
//# sourceMappingURL=practiceMode.js.map