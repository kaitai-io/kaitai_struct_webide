meta:
  id: {NAME}
  file-extension: {NAME}
  endian: le

seq:
  - id: file_header
    type: t_header

types:
  t_header:
    seq:
      - id: field1
        type: u4
      - id: field2
        type: s2