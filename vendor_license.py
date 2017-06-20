#!/usr/bin/env python

import os
import glob
import yaml

with open('vendor.yaml') as f: libs = yaml.safe_load(f)['libs']

licResult = ''
wikiResult = '# 3rd-party libraries\n\n'
for libName in sorted(libs):
    print "Processing %s" % libName
    lib = libs[libName]
    distDir = lib['distDir'] if 'distDir' in lib else lib['npmDir']
    licFns = glob.glob('./lib/%s/license*' % distDir)
    if len(licFns) != 1:
        print "License not found: %s" % distDir
        continue

    licResult += '='*80 + '\n'
    licResult += ' '*((80 - len(libName)) / 2) + libName + '\n'
    licResult += '\n'
    licResult += 'License name: %s\n' % lib['licenseName']
    licResult += '  License URL: %s\n' % lib['licenseUrl']
    licResult += '  License applies to files under the folder lib/%s/\n' % distDir
    licResult += '\n'

    wikiResult += '## %s\n' % libName

    if 'website' in lib:
        licResult += 'Website: %s\n' % lib['website']
        wikiResult += 'Website: %s\n\n' % lib['website']

    if 'source' in lib:
        licResult += 'Source: %s\n' % lib['source']
        wikiResult += 'Source: %s\n\n' % lib['source']

    wikiResult += 'License: %s (%s)\n\n' % (lib['licenseName'], lib['licenseUrl'])

    licResult += '='*80 + '\n'
    with open(licFns[0],'rt') as f: licResult += f.read().strip() + '\n'
    licResult += '='*80 + '\n\n'

open('LICENSE-3RD-PARTY.txt', 'wt').write(licResult.strip())
open('docs/wiki/3rd-party-libraries.md', 'wt').write(wikiResult.strip())
