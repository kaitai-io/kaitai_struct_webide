var practiceMode = {
    chall: 'url',
    serverCheckUrl: '/check',
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
        <a href="https://github.com/kaitai-io/kaitai_struct/wiki/Attribute-description" target="_blank">Wiki: Attributes (id, type, size)</a><br/>
        (valid encodings: 'ascii', 'utf-8', etc)
    </li>
    <li><a href="https://github.com/kaitai-io/kaitai_struct/wiki/Primitive-data-types" target="_blank">Wiki: Primitive data types</a></li>
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
    <li><a href="https://github.com/kaitai-io/kaitai_struct/wiki/Attribute-description" target="_blank">Wiki: Attributes (contents, repeat)</a><br/></li>
    <li><a href="https://github.com/kaitai-io/kaitai_struct/wiki/Type-description" target="_blank">Wiki: Type description</a></li>
    <li><a href="https://github.com/kaitai-io/kaitai_struct/wiki/Expressions" target="_blank">Wiki: Expressions (size)</a></li>

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
        },
        'chall3': {
            inputFn: 'practice/chall3/input.bin',
            starterKsy: `
meta:
  id: chall3
  endian: le
seq:
  - id: records
    type: record
    repeat: eos
types:
  record:
    seq:
      - id: type
        type: u4be
        enum: record_type
      - id: size
        type: u4
      - id: body
        type:
          switch-on: type
          cases:
            record_type::rol: rol_encrypted_record
        size: size
  rol_encrypted_record:
    seq:
      - id: shift_value
        type: u1
      - id: content_len
        type: u4
      - id: decrypted_content
        size: content_len
        process: rol(shift_value)
enums:
  record_type:
    0x524f4c5f: rol
`,
            solution: {
                "records": [
                    {
                        "type": 1380928607,
                        "body": {
                            "shiftValue": 4,
                            "contentLen": 33,
                            "decryptedContent": [106, 117, 115, 116, 32, 114, 111, 108, 108, 105, 110, 103, 44, 32, 114, 111, 108, 108, 105, 110, 103, 32, 97, 110, 100, 32, 114, 111, 108, 108, 105, 110, 103]
                        },
                        "size": 38
                    },
                    {
                        "type": 1313820767,
                        "body": {
                            "contentLen": 19,
                            "content": "unencrypted content"
                        },
                        "size": 23
                    },
                    {
                        "type": 1481593439,
                        "body": {
                            "xorKeyLen": 14,
                            "xorKey": [53, 85, 112, 51, 114, 115, 51, 99, 82, 51, 116, 75, 51, 121],
                            "contentLen": 37,
                            "decryptedContent": [120, 111, 114, 45, 101, 110, 99, 114, 121, 112, 116, 105, 111, 110, 32, 105, 115, 32, 116, 104, 101, 32, 98, 101, 115, 116, 32, 101, 110, 99, 114, 121, 112, 116, 105, 111, 110]
                        },
                        "size": 59
                    }
                ]
            },
            description: `
<div style="font-size:20px; text-align:center; margin-bottom:18px; margin-top:3px">Practice: process, type switch, enum</div>
<p align="justify">This file format supports multiple 'encryption' algorithms. We've implemented one of them.</p>
<p align="justify">Please use the input binary and expected output below to understand the other parts of the file format and extend the format descriptor.</p>
<p align="justify">Recommended readings:</p>
<ul style="font-size:14px">
    <li><a href="https://github.com/kaitai-io/kaitai_struct/wiki/Processing-binary-data" target="_blank">Wiki: Processing binary data</a><br/></li>
    <li><a href="https://github.com/kaitai-io/kaitai_struct/wiki/Enum-description" target="_blank">Wiki: Enum description</a></li>

</ul>
<p align="justify">Here is the expected output:</p>
`
        },
        'chall4': {
            inputFn: 'practice/chall4/input.bin',
            starterKsy: `
meta:
  id: chall4
  endian: le
`,
            solution: {
                "xmlData": "<WIM><TOTALBYTES>916</TOTALBYTES><IMAGE INDEX=\"1\"><NAME>1</NAME><DIRCOUNT>1</DIRCOUNT><FILECOUNT>2</FILECOUNT><TOTALBYTES>30</TOTALBYTES><CREATIONTIME><HIGHPART>0x01D249D6</HIGHPART><LOWPART>0x8D89A85F</LOWPART></CREATIONTIME><LASTMODIFICATIONTIME><HIGHPART>0x01D249D6</HIGHPART><LOWPART>0x8D89A85F</LOWPART></LASTMODIFICATIONTIME></IMAGE></WIM>",
                "lookupTable": {
                    "items": [
                        {
                            "metadataResource": null,
                            "hdr": {
                                "short": {
                                    "base": {
                                        "isFree": "false",
                                        "isSolid": "false",
                                        "isMetadata": "false",
                                        "isCompressed": "true",
                                        "isSpanned": "true",
                                        "flags": 12,
                                        "sizeBytes": [0, 0, 0, 0, 0, 0, 0],
                                        "offset": 208
                                    },
                                    "originalSize": 12
                                },
                                "partNumber": 1,
                                "refCount": 1,
                                "hash": [135, 117, 136, 113, 245, 152, 225, 163, 180, 103, 153, 83, 88, 154, 226, 245, 122, 11, 180, 60]
                            }
                        },
                        {
                            "metadataResource": null,
                            "hdr": {
                                "short": {
                                    "base": {
                                        "isFree": "false",
                                        "isSolid": "true",
                                        "isMetadata": "true",
                                        "isCompressed": "false",
                                        "isSpanned": "false",
                                        "flags": 18,
                                        "sizeBytes": [0, 0, 0, 0, 0, 0, 0],
                                        "offset": 220
                                    },
                                    "originalSize": 18
                                },
                                "partNumber": 1,
                                "refCount": 1,
                                "hash": [157, 36, 85, 224, 117, 128, 141, 175, 214, 107, 218, 108, 47, 147, 206, 205, 207, 6, 235, 2]
                            }
                        },
                        {
                            "metadataResource": {
                                "securityData": {
                                    "totalLength": 8,
                                    "numEntries": 0
                                },
                                "directoryData": {
                                    "length": 104,
                                    "body": {
                                        "subDirectories": [
                                            {
                                                "length": 128,
                                                "body": {
                                                    "subDirectories": null,
                                                    "attributes": 32,
                                                    "securityId": 4294967295,
                                                    "subdirOffset": 0,
                                                    "unused1": 0,
                                                    "unused2": 0,
                                                    "creationTime": 131248419946505280,
                                                    "lastAccessTime": 131248419946505280,
                                                    "lastWriteTime": 131222975960000000,
                                                    "hash": [135, 117, 136, 113, 245, 152, 225, 163, 180, 103, 153, 83, 88, 154, 226, 245, 122, 11, 180, 60],
                                                    "reparseTag": 0,
                                                    "reparseReserved": 0,
                                                    "hardLink": 0,
                                                    "streams": 0,
                                                    "shortNameLength": 0,
                                                    "fileNameLength": 16,
                                                    "fileName": "file.txt",
                                                    "alignment": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                                                }
                                            },
                                            {
                                                "length": 120,
                                                "body": {
                                                    "subDirectories": [
                                                        {
                                                            "length": 144,
                                                            "body": {
                                                                "subDirectories": null,
                                                                "attributes": 32,
                                                                "securityId": 4294967295,
                                                                "subdirOffset": 0,
                                                                "unused1": 0,
                                                                "unused2": 0,
                                                                "creationTime": 131248419946500300,
                                                                "lastAccessTime": 131248419946500300,
                                                                "lastWriteTime": 131248424789819280,
                                                                "hash": [157, 36, 85, 224, 117, 128, 141, 175, 214, 107, 218, 108, 47, 147, 206, 205, 207, 6, 235, 2],
                                                                "reparseTag": 0,
                                                                "reparseReserved": 0,
                                                                "hardLink": 0,
                                                                "streams": 0,
                                                                "shortNameLength": 0,
                                                                "fileNameLength": 32,
                                                                "fileName": "fileInFolder.txt",
                                                                "alignment": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                                                            }
                                                        },
                                                        {
                                                            "length": 0
                                                        }
                                                    ],
                                                    "attributes": 16,
                                                    "securityId": 4294967295,
                                                    "subdirOffset": 376,
                                                    "unused1": 0,
                                                    "unused2": 0,
                                                    "creationTime": 131248419946485280,
                                                    "lastAccessTime": 131248419946500300,
                                                    "lastWriteTime": 131248419946500300,
                                                    "hash": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                                                    "reparseTag": 0,
                                                    "reparseReserved": 0,
                                                    "hardLink": 0,
                                                    "streams": 0,
                                                    "shortNameLength": 0,
                                                    "fileNameLength": 12,
                                                    "fileName": "folder",
                                                    "alignment": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                                                }
                                            }
                                        ],
                                        "attributes": 16,
                                        "securityId": 4294967295,
                                        "subdirOffset": 120,
                                        "unused1": 0,
                                        "unused2": 0,
                                        "creationTime": 131248419897260750,
                                        "lastAccessTime": 131248509745277090,
                                        "lastWriteTime": 131248509745277090,
                                        "hash": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                                        "reparseTag": 0,
                                        "reparseReserved": 0,
                                        "hardLink": 0,
                                        "streams": 0,
                                        "shortNameLength": 0,
                                        "fileNameLength": 0,
                                        "fileName": "",
                                        "alignment": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                                    }
                                }
                            },
                            "hdr": {
                                "short": {
                                    "base": {
                                        "isFree": "false",
                                        "isSolid": "true",
                                        "isMetadata": "false",
                                        "isCompressed": "false",
                                        "isSpanned": "false",
                                        "flags": 16,
                                        "sizeBytes": [2, 0, 0, 0, 0, 0, 2],
                                        "offset": 238
                                    },
                                    "originalSize": 528
                                },
                                "partNumber": 1,
                                "refCount": 1,
                                "hash": [100, 175, 230, 150, 4, 252, 152, 46, 150, 150, 123, 142, 112, 189, 61, 25, 208, 153, 140, 9]
                            }
                        }
                    ]
                },
                "header": {
                    "imageTag": "MSWIM\x00\x00\x00",
                    "size": 208,
                    "version": 68864,
                    "flags": 128,
                    "compressionSize": 0,
                    "wimGuid": {
                        "data1": 1194815359,
                        "data2": 51355,
                        "data3": 53624,
                        "data4": [227, 246, 78, 187, 220, 36, 17, 72]
                    },
                    "partNumber": 1,
                    "totalParts": 1,
                    "imageCount": 1,
                    "offsetTableHdr": {
                        "base": {
                            "isFree": "false",
                            "isSolid": "true",
                            "isMetadata": "true",
                            "isCompressed": "true",
                            "isSpanned": "false",
                            "flags": 150,
                            "sizeBytes": [0, 0, 0, 0, 0, 0, 2],
                            "offset": 766
                        },
                        "originalSize": 150
                    },
                    "xmlDataHdr": {
                        "base": {
                            "isFree": "false",
                            "isSolid": "true",
                            "isMetadata": "false",
                            "isCompressed": "true",
                            "isSpanned": "false",
                            "flags": 180,
                            "sizeBytes": [2, 0, 0, 0, 0, 0, 2],
                            "offset": 916
                        },
                        "originalSize": 692
                    },
                    "bootMetadataHdr": {
                        "base": {
                            "isFree": "false",
                            "isSolid": "false",
                            "isMetadata": "false",
                            "isCompressed": "false",
                            "isSpanned": "false",
                            "flags": 0,
                            "sizeBytes": [0, 0, 0, 0, 0, 0, 0],
                            "offset": 0
                        },
                        "originalSize": 0
                    },
                    "bootIndex": 0,
                    "integrityHdr": {
                        "base": {
                            "isFree": "false",
                            "isSolid": "false",
                            "isMetadata": "false",
                            "isCompressed": "false",
                            "isSpanned": "false",
                            "flags": 0,
                            "sizeBytes": [0, 0, 0, 0, 0, 0, 0],
                            "offset": 0
                        },
                        "originalSize": 0
                    },
                    "unused": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                }
            },
            description: `
<div style="font-size:20px; text-align:center; margin-bottom:18px; margin-top:3px">Challenge: WIM</div>
<p align="justify">
    This task gives you some real challenge: parse a binary of an inadequately documented file format, 
    the <a href="https://en.wikipedia.org/wiki/Windows_Imaging_Format" target="_blank">Windows Imaging Format</a>.</p>
<p align="justify">Have fun solving this challenge :)</p>
<p align="justify">Recommended readings:</p>
<ul style="font-size:14px">
    <li><a href="https://github.com/kaitai-io/kaitai_struct/wiki/Instance-description" target="_blank">Wiki: Instances</a><br/></li>
    <li><a href="https://www.microsoft.com/en-us/download/details.aspx?id=13096" target="_blank">MSDN: Windows Imaging File Format (WIM)</a></li>

</ul>
<p align="justify">Here is the expected output:</p>
`
        }
    }
};
//# sourceMappingURL=practiceMode.js.map