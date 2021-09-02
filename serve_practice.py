#!/usr/bin/env python

import BaseHTTPServer
import SimpleHTTPServer
import json
import subprocess
import re

PORT = 8000

class CheckerHandler(SimpleHTTPServer.SimpleHTTPRequestHandler):
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
                    resp(400, {'status': 'error', 'error': 'badChallName'})
                    return

                with open('user.ksy', 'wt') as f: f.write(input['yaml'])
                checkRes = subprocess.check_output('node checker.js user.ksy practice\%s\input.bin practice\%s\check.json' % (challName, challName))
                print 'checkRes %r', checkRes
                resp(200, {'status': 'ok', 'check_res': json.loads(checkRes)})
            except Exception as e:
                print e
                resp(400, {'status': 'exception'})
        else:
            return SimpleHTTPServer.SimpleHTTPRequestHandler.do_POST(self)


if __name__ == "__main__":
    BaseHTTPServer.HTTPServer(("", PORT), CheckerHandler).serve_forever()
