# Kaitai Struct WebIDE

Online editor / visualizer for Kaitai Struct .ksy files

[![Build Status](https://travis-ci.org/kaitai-io/kaitai_struct_webide.svg?branch=master)](https://travis-ci.org/kaitai-io/kaitai_struct_webide)
[![Known Vulnerabilities](https://snyk.io/test/github/kaitai-io/kaitai_struct_webide/badge.svg)](https://snyk.io/test/github/kaitai-io/kaitai_struct_webide)

## features

[See the Features wiki page](https://github.com/kaitai-io/kaitai_struct_webide/wiki/Features)

## community

[Visit us on Gitter](https://gitter.im/kaitai_struct/Lobby)

## demo

[ide.kaitai.io](https://ide.kaitai.io/)

## run locally (without compiling / modifying the source code)

- Clone deploy version: `git clone https://github.com/kaitai-io/ide-kaitai-io.github.io`
    - stable release: `/`, devel release: `/devel/`,
- Serve on a webserver (e.g. `python3 -m http.server 8000`)
- Go to [http://localhost:8000/](http://localhost:8000/)

## compile and run locally

- `git clone --recursive https://github.com/kaitai-io/kaitai_struct_webide`
- `npm install`
- `node serve.js --compile`
- Go to [http://127.0.0.1:8000/](http://127.0.0.1:8000/)

## screenshots

![Example screenshot of a .zip file](docs/zip_example.png)
![Example screenshot of a .png file](docs/png_example.png)

For more screenshots [visit the Features wiki page](https://github.com/kaitai-io/kaitai_struct_webide/wiki/Features)
