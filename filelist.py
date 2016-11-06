#!/usr/bin/env python

import os
import glob
import fnmatch

def recursive_glob(treeroot, pattern):
    results = []
    for base, dirs, files in os.walk(treeroot):
        goodfiles = fnmatch.filter(files, pattern)
        results.extend(os.path.join(base, f) for f in goodfiles)
    return results
    
print 'var files = [\n' + '\n'.join("    '"+x.replace('\\','/')+"'," for x in recursive_glob('formats/', '*.ksy') + recursive_glob('samples/', '*')) + '\n];';