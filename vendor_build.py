#!/usr/bin/env python2

import ruamel.yaml as yaml
import glob
import shutil
import os

def mkdir_recursive(path):
    sub_path = os.path.dirname(path)
    if not os.path.exists(sub_path):
        mkdir_recursive(sub_path)
    if not os.path.exists(path):
        os.mkdir(path)

def recursive_overwrite(src, dest):
    #print '    recursive_overwrite %s, %s' % (src, dest)

    isDir = os.path.isdir(src)
    destDir = dest if isDir else os.path.dirname(dest)

    if not os.path.exists(destDir):
        os.makedirs(destDir)

    if isDir:
        for f in os.listdir(src):
            #print '       f: %s' % f
            recursive_overwrite(os.path.join(src, f), os.path.join(destDir, f))
    else:
        print '  copying %s to %s' % (src, destDir)
        shutil.copy(src, destDir)

with open('vendor.yaml','rt') as f: vendor = yaml.safe_load(f.read())

sortedLibs = sorted(vendor['libs'].iteritems(), key=lambda (k,v): v.get('priority'))
for (libName, lib) in sortedLibs:
    if 'npmDir' in lib and 'files' in lib:
        print 'Processing: %s' % libName
        distDir = './lib/_npm/%s/' % (lib['distDir'] if 'distDir' in lib else lib['npmDir'])
        for file in lib['files']:
            allFilesInDir = file.endswith('/*')
            if allFilesInDir:
                file = file.replace('/*', '')

            srcPattern = './node_modules/%s/%s' % (lib['npmDir'], file)
            if os.path.isdir(srcPattern) and not allFilesInDir:
                recursive_overwrite(srcPattern, distDir + file + '/')
            else:
                recursive_overwrite(srcPattern, distDir)

#print 'Processing lib_src...'
#recursive_overwrite('lib_src', 'lib')

import vendor_license

# Another build step that's totally unrelated to "vendor_build", but is
# still here because it gets called automatically on "npm install".

with open('src/Schema/ksy_schema.json', 'rt') as f:
    schema = f.read()

schema = """
define(function(){

return """ + schema + """

});"""

mkdir_recursive('./out/js')
with open('out/js/ksy_schema.js', 'wt') as f:
    f.write(schema)
