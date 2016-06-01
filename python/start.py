#!/usr/bin/python
import os
import subprocess
import re
from stretch import *
from BaseHTTPServer import BaseHTTPRequestHandler,HTTPServer

# This port is for python
PORT_NUMBER = 8090

# Kill old webserver before starting new server
popen = subprocess.Popen(['netstat', '-lpn'],
                         shell=False,
                         stdout=subprocess.PIPE)
(data, err) = popen.communicate()

pattern = "^tcp.*((?:{0})).* (?P<pid>[0-9]*)/.*$"
pattern = pattern.format(')|(?:' + str(PORT_NUMBER))
prog = re.compile(pattern)
for line in data.split('\n'):
    match = re.match(prog, line)
    if match:
        pid = match.group('pid')
        subprocess.Popen(['kill', '-9', pid])


#This class will handles any incoming request from
#the browser
class PythonWebHandler(BaseHTTPRequestHandler):

	#Handler for the GET requests
	def do_GET(self):
		self.send_response(200)
		self.send_header('Content-type','image/png')
		self.end_headers()
		# Get the result from WCPS query and return the stretched image to web
		stretchHandler = StretchHandler(None, "");
		try:
			uri = stretchHandler.parseURI(self.path);
			self.wfile.write(uri);
		except:
			print ""
		return

try:
	#Create a web server and define the handler to manage the
	#incoming request
	server = HTTPServer(('', PORT_NUMBER), PythonWebHandler)
	print 'Started httpserver on port ' , PORT_NUMBER

	#Wait forever for incoming htto requests
	server.serve_forever()

except KeyboardInterrupt:
	print '^C received, shutting down the web server'
	server.socket.close()
