import SocketServer, SimpleHTTPServer, json, glob, os, sys, threading, time, subprocess

PORT = 8000
watchDirs = ['index.html', 'js/*', 'css/*']
compileDirs = ['src/*.ts', 'lib/ts-types/*.ts']
compileCmd = r'tsc --outDir js\ --sourcemap --target ES6 --noEmitOnError %s'

compileInProgress = False

def getFiles(dirs):
    return [fn for pattern in dirs for fn in glob.glob(pattern)];

def getLastChange(dirs):
    if compileInProgress:
        return None
    files = [{'fn':fn, 'modTime': os.path.getmtime(fn)} for fn in getFiles(dirs)]
    files = sorted(files, key=lambda x: x['modTime'], reverse=True)
    return files[0] if len(files) > 0 else None


class MyHandler(SimpleHTTPServer.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/status':
            lastChange = getLastChange(watchDirs)
            self.wfile.write(json.dumps({'lastchange':lastChange}))
        else:
            return SimpleHTTPServer.SimpleHTTPRequestHandler.do_GET(self)

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