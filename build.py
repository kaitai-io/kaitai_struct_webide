#!/usr/bin/env python2
import os
import sys
import subprocess
import datetime

GA_TEMPLATE = '''
    <!-- Google Analytics -->
    <script>
        (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
        (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
        m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
        })(window,document,'script','https://www.google-analytics.com/analytics.js','_ga');

        _ga('create', '{{GA_ID}}', 'auto');
        _ga('send', 'pageview');
    </script>
    <!-- End Google Analytics -->
'''

SENTRY_TEMPLATE = '''
    <script src="https://cdn.ravenjs.com/3.17.0/raven.min.js" crossorigin="anonymous"></script>
    <script>
        Raven.config('{{SENTRY_DSN}}', {
            environment: "{{SENTRY_ENV}}",
            release: "{{SENTRY_RELEASE}}",
        }).install();
    </script>
'''

outDir = sys.argv[1] if len(sys.argv) > 1 else 'out'

def fileAction(fn, action):
    with open(fn, 'rt') as f: content = f.read()
    newContent = action(content)
    with open(fn, 'wt') as f: f.write(newContent)
    
def envVarFill(template, envVarNames, allReq = True):
    result = template.rstrip()

    for name in envVarNames:
        value = os.environ.get(name)
        if allReq and not value:
            return ""
        result = result.replace("{{%s}}" % name, value)
    
    return result

def appendAfter(str, afterStr, appendStr):
    i = str.index(afterStr) + len(afterStr)
    return str[0:i] + appendStr + str[i:]
    
gitInfo = subprocess.check_output(['git log -1 --format=%H,%ct'], shell=True).strip().split(',')
commitId = gitInfo[0]
commitTs = int(gitInfo[1])
commitDate = datetime.datetime.fromtimestamp(commitTs).strftime('%Y-%m-%d %H:%M:%S')

scriptAppend = envVarFill(SENTRY_TEMPLATE, ['SENTRY_DSN', 'SENTRY_ENV']).replace("{{SENTRY_RELEASE}}", commitId) + envVarFill(GA_TEMPLATE, ['GA_ID'])
if scriptAppend:
    fileAction(outDir + '/index.html', lambda html: appendAfter(html, '<!-- SCRIPT_INJECTION_POINT -->', scriptAppend))

fileAction(outDir + '/js/v1/app.js', lambda html: html
    .replace('kaitaiIde.commitId = "";', 'kaitaiIde.commitId = "%s";' % (commitId))
    .replace('kaitaiIde.commitDate = "";', 'kaitaiIde.commitDate = "%s";' % (commitDate)))