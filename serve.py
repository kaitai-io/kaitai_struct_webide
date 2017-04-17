#!/usr/bin/env python

import SocketServer
import SimpleHTTPServer
import json
import glob
import os
import sys
import threading
import time
import subprocess
import re
import time
from SocketServer import ThreadingMixIn
from BaseHTTPServer import HTTPServer, BaseHTTPRequestHandler

PORT = 8000
watchDirs = ['*.html', 'js/*', 'css/*']
compileDirs = ['src/*.ts', 'lib/ts-types/*.ts']
compileCmd = r'tsc --outDir js/ --sourcemap --target ES6 --noEmitOnError %s'

compileInProgress = False

def getFiles(dirs):
    return [fn for pattern in dirs for fn in glob.glob(pattern)]

def getLastChange(dirs):
    if compileInProgress:
        return None
    files = [{'fn': fn, 'modTime': os.path.getmtime(fn)} for fn in getFiles(dirs)]
    files = sorted(files, key=lambda x: x['modTime'], reverse=True)
    return files[0] if len(files) > 0 else None

def bumpVersion():
    configFn = 'src/config.ts'
    packageJsonFn = 'package.json'
    with open(configFn, 'rt') as f: configJs = f.read()
    
    currVersion = re.search(r'kaitaiIde\.version\s*=\s*[\'"](\d+\.\d+\.\d+.\d+)', configJs).group(1)
    vp = currVersion.split('.')
    newVersion = '.'.join(vp[:-1] + [str(int(vp[-1]) + 1)])
    print "Changed, new version: %r" % (newVersion)
    configJs = configJs.replace(currVersion, newVersion)
    with open(configFn, 'wt') as f: f.write(configJs)

class MyHandler(SimpleHTTPServer.SimpleHTTPRequestHandler):
    def resp(self, statusCode, result):
        self.send_response(statusCode)
        self.end_headers()
        self.wfile.write(json.dumps(result))
        
    def close_request(self):
        print "Close"
        
    def do_GET(self):
        if self.path == '/onchange':
            lastChange = getLastChange(watchDirs)
            while True:
                time.sleep(0.5)
                currChange = getLastChange(watchDirs)
                if currChange and lastChange and currChange['modTime'] <> lastChange['modTime'] and not 'config.js' in currChange['fn']:
                    bumpVersion()
                    self.resp(200, { 'changed': True })
                    break
                lastChange = currChange
        else:
            return SimpleHTTPServer.SimpleHTTPRequestHandler.do_GET(self)

    def do_POST(self):
        if self.path == '/check':
            try:
                input = json.loads(self.rfile.read(int(self.headers.getheader('content-length'))))
                challName = input['chall']
                if not re.match('^[a-zA-Z0-9_]+$', challName):
                    self.resp(400, {'status': 'error', 'error': 'badChallName'});
                    return
                    
                with open('user.ksy', 'wt') as f: f.write(input['yaml'])
                checkRes = json.loads(subprocess.check_output('node checker.js user.ksy practice\%s\input.bin practice\%s\check.json' % (challName, challName)));
                    
                self.resp(200, {'status': 'ok', 'check_res': checkRes});
            except Exception as e:
                print e
                self.resp(400, {'status': 'exception'});
        else:
            return SimpleHTTPServer.SimpleHTTPRequestHandler.do_POST(self) 

def compileThread():
    lastModTime = 0
    while True:
        time.sleep(0.5)
        currChange = getLastChange(compileDirs)
        if currChange['modTime'] > lastModTime:
            lastModTime = currChange['modTime']
            print "Changed file: %s" % currChange['fn']
            try:
                compileInProgress = True
                cmd = compileCmd % ' '.join(['"' + x + '"' for x in getFiles(compileDirs)])
                subprocess.check_output(cmd, shell=True).strip()
                print "Compile success"
            except subprocess.CalledProcessError as e:
                print "Compile errors:%s" % ('\n' + e.output.strip()).replace('\n', '\n -  ')
            finally:
                compileInProgress = False

if '--compile' in sys.argv:
    t = threading.Thread(target=compileThread)
    t.setDaemon(True)
    t.start()
    print "auto compile started"

print "please use 127.0.0.1:%d on Windows (using localhost makes 1sec delay)" % PORT

class ThreadedHTTPServer(ThreadingMixIn, HTTPServer):
    daemon_threads = True
    """Handle requests in a separate thread."""

ThreadedHTTPServer(("", PORT), MyHandler).serve_forever()