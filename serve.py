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

PORT = 8000
watchDirs = ['index.html', 'js/*', 'css/*']
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


class MyHandler(SimpleHTTPServer.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/status':
            lastChange = getLastChange(watchDirs)
            self.wfile.write(json.dumps({'lastchange': lastChange}))
        else:
            return SimpleHTTPServer.SimpleHTTPRequestHandler.do_GET(self)

    def do_POST(self):
        def resp(statusCode, result):
            self.send_response(statusCode)
            self.end_headers()
            self.wfile.write(json.dumps(result))
    
        if self.path == '/check':
            try:
                input = json.loads(self.rfile.read(int(self.headers.getheader('content-length'))))
                challName = input['chall']
                if not re.match('^[a-zA-Z0-9_]+$', challName):
                    resp(400, {'status': 'error', 'error': 'badChallName'});
                    return
                    
                with open('user.ksy', 'wt') as f: f.write(input['yaml'])
                checkRes = json.loads(subprocess.check_output('node checker.js user.ksy practice\%s\input.bin practice\%s\check.json' % (challName, challName)));
                    
                resp(200, {'status': 'ok', 'check_res': checkRes});
            except Exception as e:
                print e
                resp(400, {'status': 'exception'});
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
httpd = SocketServer.TCPServer(("", PORT), MyHandler).serve_forever()
