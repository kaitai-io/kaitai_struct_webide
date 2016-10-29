import SimpleHTTPServer
import SocketServer

PORT = 8000

Handler = SimpleHTTPServer.SimpleHTTPRequestHandler

httpd = SocketServer.TCPServer(("", PORT), Handler)

print "please use 127.0.0.1:%d on Windows (using localhost makes 1sec delay)" % PORT
httpd.serve_forever()