#!/usr/bin/env python

import SimpleHTTPServer
import json
import fnmatch
import os
import sys
import threading
import time
import subprocess
import re
from SocketServer import ThreadingMixIn
from BaseHTTPServer import HTTPServer, BaseHTTPRequestHandler

PORT = 8000
watchDirs = ['*.html', 'js/*', 'css/*', 'src/*.html']
compileCmd = r'node node_modules/typescript/bin/tsc -w'

def recursive_glob(treeroot, pattern):
    if treeroot == '.':
        walkResult = [('.', None, os.listdir('.'),)]
    else:
        walkResult = list(os.walk(treeroot))

    results = []
    for base, dirs, files in walkResult:
        goodfiles = fnmatch.filter(files, pattern)
        results.extend(os.path.join(base, f) for f in goodfiles)
    return results

def getFiles(dirs):
    return [fn for pattern in dirs for fn in recursive_glob(*(os.path.join('./', pattern).rsplit('/', 1)))]

def getLastChange(dirs):
    files = [{'fn': fn, 'modTime': os.path.getmtime(fn)} for fn in getFiles(dirs)]
    files = sorted(files, key=lambda x: x['modTime'], reverse=True)
    return files[0] if len(files) > 0 else None

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

    extensions_map = {
        '.manifest': 'text/cache-manifest',
        '.html': 'text/html',
        '.png': 'image/png',
        '.jpg': 'image/jpg',
        '.svg': 'image/svg+xml',
        '.css': 'text/css',
        '.js': 'application/javascript',
        '.json': 'application/json',
        '.xml': 'application/xml',
        '': 'application/octet-stream', # Default
    }

if '--compile' in sys.argv:
    print "Starting typescript compiler..."
    compileProcess = subprocess.Popen(compileCmd, shell=True)

sys.dont_write_bytecode = True
import genKaitaiFsFiles
genKaitaiFsFiles.generate('')

print "Please use 127.0.0.1:%d on Windows (using localhost makes 1sec delay)" % PORT

class ThreadedHTTPServer(ThreadingMixIn, HTTPServer):
    daemon_threads = True
    """Handle requests in a separate thread."""

print "Press Ctrl+C to exit."

try:
    ThreadedHTTPServer(("", PORT), MyHandler).serve_forever()
except KeyboardInterrupt:
    pass

if compileProcess:
    print "Waiting for compiler to stop..."
    compileProcess.wait()
