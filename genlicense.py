#!/usr/bin/env python

import os
import glob
import yaml

with open('license-3rd-party.yaml') as f: licData = yaml.safe_load(f)

licResult = ''
wikiResult = '# 3rd-party libraries\n\n'
for libName in sorted(licData):
    libData = licData[libName]
    licFns = glob.glob('./lib/%s/license*' % libData['libDir'])
    if len(licFns) != 1:
        print "License not found: %s" % libData['libDir']
        continue

    licResult += '='*80 + '\n'
    licResult += ' '*((80 - len(libName)) / 2) + libName + '\n'
    licResult += '\n'
    licResult += 'License name: %s\n' % libData['licenseName']
    licResult += '  License URL: %s\n' % libData['licenseUrl']
    licResult += '  License applies to files under the folder lib/%s/\n' % libData['libDir']
    licResult += '\n'

    wikiResult += '## %s\n' % libName

    if 'website' in libData:
        licResult += 'Website: %s\n' % libData['website']
        wikiResult += 'Website: %s\n\n' % libData['website']

    if 'source' in libData:
        licResult += 'Source: %s\n' % libData['source']
        wikiResult += 'Source: %s\n\n' % libData['source']

    wikiResult += 'License: %s (%s)\n\n' % (libData['licenseName'], libData['licenseUrl'])

    licResult += '='*80 + '\n'
    with open(licFns[0],'rt') as f: licResult += f.read().strip() + '\n'
    licResult += '='*80 + '\n\n'

open('LICENSE-3RD-PARTY.txt', 'wt').write(licResult.strip())
open('docs/wiki/3rd-party-libraries.md', 'wt').write(wikiResult.strip())
