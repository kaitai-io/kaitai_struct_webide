#!/usr/bin/env python

import os
import glob
import fnmatch
import sys

def recursive_glob(treeroot, pattern):
    results = []
    for base, dirs, files in os.walk(treeroot):
        goodfiles = fnmatch.filter(files, pattern)
        results.extend(os.path.join(base, f) for f in goodfiles)
    return results

files = (recursive_glob('formats/', '*.ksy') + recursive_glob('samples/', '*'))
files.sort()
lines = ["    '" + x.replace('\\','/') + "'," for x in files]
js = 'var kaitaiFsFiles = [\n' + '\n'.join(lines) + '\n];';

outDir = sys.argv[1] + '/' if len(sys.argv) > 1 else ''
with open(outDir + 'js/kaitaiFsFiles.js', 'wt') as f:
    f.write(js)
#print js
