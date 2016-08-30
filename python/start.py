#!/usr/bin/python
import os
import subprocess
import re
from stretch import *
from BaseHTTPServer import BaseHTTPRequestHandler,HTTPServer

# Author: Bang Pham Huu, mailto: b.phamhuu@jacobs-university.de

# Require: python PIL, urllib2, gdal, numpy (version >= 1.8)

# This port is for python
PORT_NUMBER = 8090

# Kill old webserver before starting new server
print "Kill process on port {0}".format(PORT_NUMBER)
subprocess.call("fuser -k {0}/tcp".format(PORT_NUMBER), shell=True)
print "Start simpleHTTPServer for stretching WCPS query. Use Ctrl + C to stop server."

#This class will handles any incoming request from
#the browser
class PythonWebHandler(BaseHTTPRequestHandler):

	#Handler for the GET requests
	def do_GET(self):
		self.send_response(200)
		self.send_header('Content-type','image/png')
		self.send_header("Access-Control-Allow-Origin", "*")
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
	print 'Started httpserver on port', PORT_NUMBER

	#Wait forever for incoming htto requests
	server.serve_forever()

except KeyboardInterrupt:
	print '^C received, shutting down the web server'
	server.socket.close()
