#!/usr/bin/env python

import SocketServer
import BaseHTTPServer
import json
import glob
import os
import sys
import threading
import time
import subprocess
import re
import traceback

PORT = 8001
mappings = {
    'default': { 'path': 'files/' }
}
allowedOrigins = ['http://127.0.0.1:8000', 'ide.kaitai.io']

secretFn = '.serve_files_secret'
if os.path.isfile(secretFn):
    with open(secretFn, 'rt') as f: secret = f.read()
else:
    secret = os.urandom(16).encode('hex')
    with open(secretFn, 'wt') as f: f.write(secret)

print "Mappings:"
for mapping in mappings.values():
    if not 'secret' in mapping:
        mapping['secret'] = secret
    print " - %s (secret: %s)" % (mapping['path'], mapping['secret'])

class MyHandler(BaseHTTPServer.BaseHTTPRequestHandler):
    def handleCors(self):
        origin = self.headers.getheader('origin')
        if origin in allowedOrigins:
            self.send_header("Access-Control-Allow-Origin", origin)
            self.send_header("Access-Control-Allow-Methods", "OPTIONS, GET, PUT, DELETE")
            self.send_header("Access-Control-Allow-Headers", "Authorization, X-Requested-With")

    def respRaw(self, statusCode, contentType = None, result = None):
        self.send_response(statusCode)
        self.handleCors()
        if contentType:
            self.send_header("Content-Type", contentType)
        #self.send_header("Content-Disposition", "attachment")
        #self.send_header("X-Content-Type-Options", "nosniff")
        self.end_headers()
        if result:
            self.wfile.write(result)

    def resp(self, statusCode, result):
        self.respRaw(statusCode, 'application/json', json.dumps(result))

    def handleRequest(self):
        try:
            if '..' in self.path:
                raise "Nope"

            parts = self.path[1:].split('/')
            if len(parts) >= 2 and parts[0] == 'files':
                mappingData = mappings.get(parts[1])
                if self.headers.getheader('Authorization') != 'MappingSecret ' + mappingData['secret']:
                    self.respRaw(403)
                    return

                localBaseDir = mappingData['path']
                if not localBaseDir:
                    self.resp(200, {'errorCode': 'unknown_mapping'})
                    return
                else:
                    localFn = localBaseDir + '/'.join(parts[2:])
                    isFile = os.path.isfile(localFn)
                    isDir = os.path.isdir(localFn)
                    if self.command == "GET":
                        if isDir:
                            files = [{ "fn": fn, "isDir": os.path.isdir(localFn + fn) } for fn in os.listdir(localFn)]
                            self.resp(200, { 'files': files })
                        elif isFile:
                            with open(localFn, 'rb') as f: content = f.read()
                            self.respRaw(200, 'application/octet-stream', content)
                        else:
                            self.resp(404, {'errorCode': 'not_found'})
                        return
                    elif self.command == "DELETE" and isFile:
                        os.remove(localFn)
                        self.respRaw(204)
                        return
                    elif self.command == "PUT":
                        content = self.rfile.read(int(self.headers.getheader('content-length')))
                        with open(localFn, 'wb') as f: f.write(content)
                        self.respRaw(204)
                        return

                self.resp(404, {'errorCode': 'unknown_action'})
                return
        except Exception as e:
            traceback.print_exc()
            self.resp(500, {'errorCode': 'unknown_error'})

    def do_GET(self):
        self.handleRequest()

    def do_PUT(self):
        self.handleRequest()

    def do_DELETE(self):
        self.handleRequest()

    def do_OPTIONS(self):
        self.send_response(200)
        self.handleCors()
        self.end_headers()

print "please use 127.0.0.1:%d on Windows (using localhost makes 1sec delay)" % PORT
SocketServer.TCPServer(("", PORT), MyHandler).serve_forever()
