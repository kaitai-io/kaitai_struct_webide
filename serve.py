import SocketServer, SimpleHTTPServer, json, glob, os

watch = ['index.html', 'js/*', 'css/*']
PORT = 8000

class MyHandler(SimpleHTTPServer.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/status':
            files = [{'fn':fn, 'modTime': os.path.getmtime(fn)} for pattern in watch for fn in glob.glob(pattern)]
            files = sorted(files, key=lambda x: x['modTime'], reverse=True)
            self.wfile.write(json.dumps({'lastchange':files[0] if len(files) > 0 else None}))
        else:
            return SimpleHTTPServer.SimpleHTTPRequestHandler.do_GET(self)

print "please use 127.0.0.1:%d on Windows (using localhost makes 1sec delay)" % PORT
httpd = SocketServer.TCPServer(("", PORT), MyHandler).serve_forever()