#!/usr/bin/env python2
import os
import sys
import subprocess

GA_TEMPLATE = '''
    <!-- Google Analytics -->
    <script>
        (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
        (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
        m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
        })(window,document,'script','https://www.google-analytics.com/analytics.js','_ga');

        _ga('create', '#GA_ID#', 'auto');
        _ga('send', 'pageview');
    </script>
    <!-- End Google Analytics -->
'''

outDir = sys.argv[1] if len(sys.argv) > 1 else 'out'
gaId = os.environ.get('GA_ID')

def fileAction(fn, action):
    with open(fn, 'rt') as f: content = f.read()
    newContent = action(content)
    with open(fn, 'wt') as f: f.write(newContent)

def appendAfter(str, afterStr, appendStr):
    i = str.index(afterStr) + len(afterStr)
    return str[0:i] + appendStr + str[i:]

if gaId:
    fileAction(outDir + '/index.html', lambda html: appendAfter(html, '</title>', GA_TEMPLATE.rstrip().replace('#GA_ID#', gaId)))
 
commitId = subprocess.check_output(['git rev-parse HEAD'], shell=True).strip()
fileAction(outDir + '/js/app.js', lambda html: html.replace('kaitaiIde.commitId = "";', 'kaitaiIde.commitId = "%s";' % commitId))
